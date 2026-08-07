"""
Enrichment layer: deliverability (free-tier USPS/Smarty CASS check),
tax jurisdiction (open zip-rate dataset), timezone (IANA tzdata, no
vendor at all). All chosen specifically to be free/near-free so the
full feature set can ship without paid-vendor cost per lookup — see
the v1 vendor decisions.
"""
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx
from timezonefinder import TimezoneFinder

from app.config import get_settings
from app.models.schemas import DeliverabilityInfo, TaxInfo, TimezoneInfo

settings = get_settings()
_tf = TimezoneFinder()

# Loaded once at startup from a static zip->rate dataset (e.g. Avalara's
# free public sales tax table, or a similar open dataset). Placeholder
# structure shown; real deploy should load a full zip->rate table into
# memory or a lightweight lookup table in Postgres.
_TAX_TABLE: dict[str, TaxInfo] = {}


def load_tax_table(path: str) -> None:
    """Populate _TAX_TABLE from a local CSV of zip,jurisdiction,rate."""
    import csv
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            _TAX_TABLE[row["zip"]] = TaxInfo(
                jurisdiction=row["jurisdiction"],
                rate=float(row["rate"]),
                tax_type="sales_tax",
            )


async def check_deliverability(address: str) -> DeliverabilityInfo:
    """
    Free-tier deliverability check via Smarty's US Address Verification
    free tier (CASS-certified). Falls back to an unverified pass-through
    if no credentials are configured yet.
    """
    if not settings.SMARTY_AUTH_ID or not settings.SMARTY_AUTH_TOKEN:
        return DeliverabilityInfo(score=0, verified=False, issues=["deliverability_not_configured"])

    url = "https://us-street.api.smarty.com/street-address"
    params = {
        "auth-id": settings.SMARTY_AUTH_ID,
        "auth-token": settings.SMARTY_AUTH_TOKEN,
        "street": address,
    }
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            return DeliverabilityInfo(score=0, verified=False, issues=["provider_error"])
        results = resp.json()
        if not results:
            return DeliverabilityInfo(score=10, verified=False, issues=["no_match"])
        top = results[0]
        analysis = top.get("analysis", {})
        dpv_match = analysis.get("dpv_match_code", "")
        verified = dpv_match in ("Y", "S", "D")
        score = 98 if dpv_match == "Y" else 70 if verified else 20
        return DeliverabilityInfo(
            score=score,
            verified=verified,
            issues=[] if verified else ["undeliverable_or_unconfirmed"],
            carrier="USPS",
        )


def lookup_tax(zip_code: str) -> TaxInfo:
    return _TAX_TABLE.get(zip_code, TaxInfo())


def lookup_timezone(lat: float, lng: float) -> TimezoneInfo:
    tz_name = _tf.timezone_at(lat=lat, lng=lng) or "UTC"
    tz = ZoneInfo(tz_name)
    now = datetime.now(tz)
    offset = now.utcoffset().total_seconds() / 3600 if now.utcoffset() else 0
    is_business_hours = 9 <= now.hour < 17 and now.weekday() < 5
    return TimezoneInfo(
        name=tz_name,
        offset_hours=offset,
        current_time=now.isoformat(),
        is_business_hours=is_business_hours,
    )
