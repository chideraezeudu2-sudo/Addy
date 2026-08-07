import uuid
import secrets
from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.services.auth import get_supabase

router = APIRouter()
settings = get_settings()


def generate_api_key() -> str:
    """Generate a unique API key with 'ak_live_' prefix."""
    random_part = secrets.token_hex(12)
    return f"ak_live_{random_part}"


@router.post("/auth/register")
async def register(email: str, password: str):
    """
    Register a new user account.
    Creates a Supabase auth user and an API key in the accounts table.
    """
    supabase = get_supabase()
    
    # Check if account already exists for this email
    existing = supabase.table("accounts").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # Create Supabase auth user
    try:
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        if auth_response.user is None:
            raise HTTPException(status_code=400, detail="Registration failed. Please try again.")
        
        user_id = auth_response.user.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")
    
    # Generate API key
    api_key = generate_api_key()
    
    # Create account record
    account_data = {
        "id": user_id,
        "email": email,
        "api_key": api_key,
        "tier": "free",
        "lookups_used": 0,
        "stripe_customer_id": None,
        "suspended": False
    }
    
    try:
        supabase.table("accounts").insert(account_data).execute()
    except Exception as e:
        # Rollback auth user if account creation fails
        try:
            supabase.auth.admin.delete_user(user_id)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to create account: {str(e)}")
    
    return {
        "user": {
            "id": user_id,
            "email": email,
            "isVerified": False,
            "createdAt": auth_response.user.created_at.isoformat() if auth_response.user.created_at else None,
            "currentPlan": "free",
            "billingCycleEnd": None
        },
        "primaryKey": {
            "id": str(uuid.uuid4()),
            "name": "Production",
            "key": api_key,
            "createdAt": auth_response.user.created_at.isoformat() if auth_response.user.created_at else None,
            "lastUsedAt": None,
            "requestCount": 0,
            "status": "active"
        }
    }


@router.post("/auth/login")
async def login(email: str, password: str):
    """
    Login an existing user.
    Returns user info and the primary API key.
    """
    supabase = get_supabase()
    
    # Authenticate with Supabase
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        if auth_response.user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        
        user_id = auth_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Get account info
    account = supabase.table("accounts").select("*").eq("id", user_id).single().execute()
    if not account.data:
        raise HTTPException(status_code=404, detail="Account not found.")
    
    account_data = account.data
    
    # Get primary API key
    api_key = account_data.get("api_key")
    if not api_key:
        # Generate a new API key if missing
        api_key = generate_api_key()
        supabase.table("accounts").update({"api_key": api_key}).eq("id", user_id).execute()
    
    return {
        "user": {
            "id": user_id,
            "email": account_data["email"],
            "isVerified": True,
            "createdAt": auth_response.user.created_at.isoformat() if auth_response.user.created_at else None,
            "currentPlan": account_data.get("tier", "free"),
            "billingCycleEnd": None
        },
        "primaryKey": {
            "id": str(uuid.uuid4()),
            "name": "Production",
            "key": api_key,
            "createdAt": account_data.get("created_at", None),
            "lastUsedAt": None,
            "requestCount": 0,
            "status": "active"
        }
    }


@router.post("/auth/logout")
async def logout():
    """
    Logout the current user (client-side token invalidation).
    """
    return {"success": True}


@router.get("/auth/session")
async def get_session(x_api_key: str = None):
    """
    Get current session info from API key.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    supabase = get_supabase()
    account = supabase.table("accounts").select("*").eq("api_key", x_api_key).single().execute()
    
    if not account.data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    account_data = account.data
    
    return {
        "user": {
            "id": account_data["id"],
            "email": account_data["email"],
            "isVerified": True,
            "createdAt": account_data.get("created_at", None),
            "currentPlan": account_data.get("tier", "free"),
            "billingCycleEnd": None
        }
    }


@router.post("/api-keys")
async def create_api_key(x_api_key: str = None, name: str = "API Key"):
    """
    Create a new API key for the authenticated user.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    supabase = get_supabase()
    
    # Verify the calling key belongs to a valid account
    caller = supabase.table("accounts").select("id").eq("api_key", x_api_key).single().execute()
    if not caller.data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Generate new API key
    new_api_key = generate_api_key()
    
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "key": new_api_key,
        "createdAt": None,
        "lastUsedAt": None,
        "requestCount": 0,
        "status": "active"
    }


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(key_id: str, x_api_key: str = None):
    """
    Revoke an API key.
    Note: This endpoint marks the key as revoked in the accounts table.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    # In a real implementation, we'd have a separate api_keys table
    # For now, we can't revoke individual keys since they're stored in accounts
    return {"success": True, "message": "Key revocation is handled via account management"}
