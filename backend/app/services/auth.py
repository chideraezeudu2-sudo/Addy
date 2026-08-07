from fastapi import Header, HTTPException
from supabase import create_client, Client

from app.config import get_settings

settings = get_settings()
_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _supabase


async def require_api_key(x_api_key: str = Header(...)) -> dict:
    """
    Validates the API key against Supabase and returns the account row
    (id, tier, lookups_used, lifetime_free_used, etc). Raises 401 if
    invalid, 403 if the account is over its cap with no valid card on file.
    """
    supabase = get_supabase()
    result = supabase.table("accounts").select("*").eq("api_key", x_api_key).single().execute()
    account = result.data
    if not account:
        raise HTTPException(status_code=401, detail="Invalid API key")
    if account.get("suspended"):
        raise HTTPException(status_code=403, detail="Account suspended — check billing status")
    return account
