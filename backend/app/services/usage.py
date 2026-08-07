from fastapi import HTTPException

from app.config import get_settings
from app.services.auth import get_supabase

settings = get_settings()


def check_and_increment_usage(account: dict) -> dict | None:
    """
    Called on every billable lookup. Enforces the free tier's 500-lifetime
    cap (with a warning at 480) and increments usage counters in Supabase.
    Paid tiers are metered but never hard-blocked — overage just bills.

    Returns a warning dict to attach to the response if the account is
    approaching or has hit its free-tier cap, otherwise None.
    """
    supabase = get_supabase()
    tier = account.get("tier", "free")
    used = account.get("lookups_used", 0)

    if tier == "free":
        if used >= settings.FREE_TIER_LIFETIME_CAP:
            raise HTTPException(
                status_code=402,
                detail=(
                    f"Free tier limit of {settings.FREE_TIER_LIFETIME_CAP} lookups reached. "
                    "Upgrade to a paid plan to continue."
                ),
            )

    supabase.table("accounts").update({"lookups_used": used + 1}).eq("id", account["id"]).execute()

    if tier == "free" and used + 1 >= settings.FREE_TIER_WARNING_THRESHOLD:
        remaining = settings.FREE_TIER_LIFETIME_CAP - (used + 1)
        return {
            "warning": (
                f"{remaining} free lookups remaining out of "
                f"{settings.FREE_TIER_LIFETIME_CAP}. Upgrade to keep this running "
                "without interruption."
            )
        }
    return None
