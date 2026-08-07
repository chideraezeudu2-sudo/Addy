from fastapi import APIRouter, Depends

from app.models.schemas import ReverseGeocodeQuery
from app.services.auth import require_api_key
from app.services.enrichment import lookup_timezone
from app.services.usage import check_and_increment_usage

router = APIRouter()


@router.post("/reverse")
async def reverse_geocode(payload: ReverseGeocodeQuery, account: dict = Depends(require_api_key)):
    check_and_increment_usage(account)
    # Reverse geocoding routed through the same provider chain in the
    # full implementation — stubbed here as timezone-only pending the
    # agent wiring reverse calls into providers.py's failover chain.
    timezone = lookup_timezone(payload.lat, payload.lng)
    return {"lat": payload.lat, "lng": payload.lng, "timezone": timezone.model_dump()}
