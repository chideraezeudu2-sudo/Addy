import os
from functools import lru_cache


class Settings:
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    SUPABASE_DB_URL: str = os.getenv("SUPABASE_DB_URL", "")  # direct Postgres connection string, for PostGIS queries

    # Redis cache
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    CACHE_TTL_SECONDS: int = 60 * 60 * 24 * 30  # 30 days

    # Upstream geocoding providers (in failover order)
    POSITIONSTACK_API_KEY: str = os.getenv("POSITIONSTACK_API_KEY", "")
    LOCATIONIQ_API_KEY: str = os.getenv("LOCATIONIQ_API_KEY", "")
    OPENCAGE_API_KEY: str = os.getenv("OPENCAGE_API_KEY", "")

    # Deliverability (USPS Web Tools or Smarty free tier)
    SMARTY_AUTH_ID: str = os.getenv("SMARTY_AUTH_ID", "")
    SMARTY_AUTH_TOKEN: str = os.getenv("SMARTY_AUTH_TOKEN", "")

    # Stripe billing
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # Free tier
    FREE_TIER_LIFETIME_CAP: int = 500
    FREE_TIER_WARNING_THRESHOLD: int = 480

    # Paid tiers: name -> (monthly_price_cents, included_lookups, overage_rate_cents_per_lookup)
    TIERS = {
        "starter": {"price_cents": 2900, "included": 10_000, "overage_cents": 0.08},
        "pro": {"price_cents": 9900, "included": 50_000, "overage_cents": 0.07},
        "business": {"price_cents": 29900, "included": 250_000, "overage_cents": 0.06},
        "enterprise_lite": {"price_cents": 99900, "included": 1_000_000, "overage_cents": 0.05},
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
