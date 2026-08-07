"""
Provider-agnostic geocoding interface. Endpoint code should only ever call
`geocode()` / `reverse_geocode()` — never a specific provider directly — so
swapping or reordering upstream providers never touches endpoint logic.

Failover order: Positionstack -> LocationIQ -> OpenCage
"""
import httpx

from app.config import get_settings

settings = get_settings()


class GeocodeResult:
    def __init__(self, lat: float, lng: float, formatted: str, confidence: int, provider: str):
        self.lat = lat
        self.lng = lng
        self.formatted = formatted
        self.confidence = confidence
        self.provider = provider


async def _try_positionstack(address: str) -> GeocodeResult | None:
    if not settings.POSITIONSTACK_API_KEY:
        return None
    url = "http://api.positionstack.com/v1/forward"
    params = {"access_key": settings.POSITIONSTACK_API_KEY, "query": address, "limit": 1}
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            return None
        data = resp.json().get("data", [])
        if not data:
            return None
        top = data[0]
        return GeocodeResult(
            lat=top["latitude"], lng=top["longitude"],
            formatted=top.get("label", address),
            confidence=int(top.get("confidence", 0.8) * 100),
            provider="positionstack",
        )


async def _try_locationiq(address: str) -> GeocodeResult | None:
    if not settings.LOCATIONIQ_API_KEY:
        return None
    url = "https://us1.locationiq.com/v1/search"
    params = {"key": settings.LOCATIONIQ_API_KEY, "q": address, "format": "json", "limit": 1}
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if not data:
            return None
        top = data[0]
        return GeocodeResult(
            lat=float(top["lat"]), lng=float(top["lon"]),
            formatted=top.get("display_name", address),
            confidence=85,
            provider="locationiq",
        )


async def _try_opencage(address: str) -> GeocodeResult | None:
    if not settings.OPENCAGE_API_KEY:
        return None
    url = "https://api.opencagedata.com/geocode/v1/json"
    params = {"key": settings.OPENCAGE_API_KEY, "q": address, "limit": 1}
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            return None
        results = resp.json().get("results", [])
        if not results:
            return None
        top = results[0]
        geom = top["geometry"]
        return GeocodeResult(
            lat=geom["lat"], lng=geom["lng"],
            formatted=top.get("formatted", address),
            confidence=int(top.get("confidence", 8) * 10),
            provider="opencage",
        )


PROVIDER_CHAIN = [_try_positionstack, _try_locationiq, _try_opencage]


async def geocode(address: str) -> GeocodeResult | None:
    """
    Fallback-only chain. This is deliberately NOT the first thing called
    for a geocode request — see app/services/local_lookup.py, which
    checks the self-hosted OpenAddresses/PostGIS database first. This
    function only runs when the local database has no match (a region
    not yet loaded, or a genuinely new address).
    """
    for provider_fn in PROVIDER_CHAIN:
        try:
            result = await provider_fn(address)
            if result is not None:
                return result
        except Exception:
            continue
    return None


async def geocode_with_local_first(address: str) -> GeocodeResult | None:
    """
    The actual entry point endpoints should call. Tries the local
    self-hosted database first (free, fast, no vendor cost), and only
    falls back to paid providers if there's no local match.
    """
    from app.services.local_lookup import lookup_local

    local_result = await lookup_local(address)
    if local_result is not None:
        return local_result
    return await geocode(address)
