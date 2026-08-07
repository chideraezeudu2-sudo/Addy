from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import GeocodeQuery, FullAddressResponse
from app.services.auth import require_api_key
from app.services.cache import cache_get, cache_set
from app.services.normalize import cache_key, normalize_address
from app.services.providers import geocode_with_local_first as geocode_provider
from app.services.enrichment import check_deliverability, lookup_tax, lookup_timezone
from app.services.usage import check_and_increment_usage

router = APIRouter()


@router.post("/geocode", response_model=FullAddressResponse)
async def geocode_address(payload: GeocodeQuery, account: dict = Depends(require_api_key)):
    check_and_increment_usage(account)

    key = cache_key(payload.address)
    cached = await cache_get(key)
    if cached:
        return FullAddressResponse(**cached, cached=True)

    result = await geocode_provider(payload.address)
    if result is None:
        raise HTTPException(status_code=404, detail="Address could not be geocoded")

    # zip extraction is naive here — production version should pull the
    # postal code from the provider's structured response fields, not
    # regex the formatted string.
    import re
    zip_match = re.search(r"\b(\d{5})\b", result.formatted)
    zip_code = zip_match.group(1) if zip_match else ""

    deliverability = await check_deliverability(payload.address)
    tax = lookup_tax(zip_code)
    timezone = lookup_timezone(result.lat, result.lng)

    body = {
        "address": payload.address,
        "normalized": normalize_address(payload.address),
        "coordinates": {"lat": result.lat, "lng": result.lng},
        "deliverability": deliverability.model_dump(),
        "tax": tax.model_dump(),
        "timezone": timezone.model_dump(),
        "confidence": result.confidence,
    }
    await cache_set(key, body)
    return FullAddressResponse(**body, cached=False)
