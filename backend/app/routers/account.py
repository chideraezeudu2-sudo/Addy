from fastapi import APIRouter, Depends

from app.config import get_settings
from app.models.schemas import UsageStatus
from app.services.auth import require_api_key

router = APIRouter()
settings = get_settings()


@router.get("/account/usage", response_model=UsageStatus)
async def get_usage(account: dict = Depends(require_api_key)):
    tier = account.get("tier", "free")
    used = account.get("lookups_used", 0)

    if tier == "free":
        remaining = settings.FREE_TIER_LIFETIME_CAP - used
        warning = None
        if remaining <= (settings.FREE_TIER_LIFETIME_CAP - settings.FREE_TIER_WARNING_THRESHOLD):
            warning = f"{remaining} free lookups remaining."
        return UsageStatus(
            tier=tier, lookups_used=used, lookups_included=settings.FREE_TIER_LIFETIME_CAP,
            lifetime_cap=settings.FREE_TIER_LIFETIME_CAP, warning=warning,
        )

    tier_config = settings.TIERS.get(tier, {})
    return UsageStatus(
        tier=tier, lookups_used=used, lookups_included=tier_config.get("included", 0),
    )
