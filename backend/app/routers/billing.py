import stripe
from fastapi import APIRouter, Request, HTTPException, Header

from app.config import get_settings
from app.services.auth import get_supabase

router = APIRouter()
settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY

# Stripe price IDs - these should be replaced with actual Stripe product/price IDs
STRIPE_PRICE_IDS = {
    "starter": "price_starter",  # Replace with actual Stripe price ID
    "pro": "price_pro",  # Replace with actual Stripe price ID
    "business": "price_business",  # Replace with actual Stripe price ID
    "enterprise_lite": "price_enterprise_lite",  # Replace with actual Stripe price ID
}

# Map tier names to internal tier names
TIER_MAPPING = {
    "price_starter": "starter",
    "price_pro": "pro",
    "price_business": "business",
    "price_enterprise_lite": "enterprise_lite",
}


@router.post("/v1/checkout")
async def create_checkout_session(
    tier: str,
    x_api_key: str = Header(...),
    success_url: str = "https://appy.io/dashboard/billing?success=true",
    cancel_url: str = "https://appy.io/dashboard/billing?canceled=true"
):
    """
    Create a Stripe Checkout session for upgrading to a paid plan.
    """
    if tier not in STRIPE_PRICE_IDS:
        raise HTTPException(status_code=400, detail="Invalid tier specified")
    
    price_id = STRIPE_PRICE_IDS[tier]
    
    supabase = get_supabase()
    
    # Get account from API key
    account = supabase.table("accounts").select("*").eq("api_key", x_api_key).single().execute()
    if not account.data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    account_data = account.data
    customer_id = account_data.get("stripe_customer_id")
    
    # Create or get Stripe customer
    if not customer_id:
        try:
            customer = stripe.Customer.create(
                email=account_data["email"],
                metadata={"supabase_user_id": account_data["id"]}
            )
            customer_id = customer.id
            supabase.table("accounts").update({"stripe_customer_id": customer_id}).eq(
                "id", account_data["id"]
            ).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create customer: {str(e)}")
    
    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"tier": tier, "account_id": account_data["id"]}
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


@router.get("/v1/invoices")
async def get_invoices(x_api_key: str = Header(...)):
    """
    Get billing invoices for the authenticated account.
    """
    supabase = get_supabase()
    
    # Get account from API key
    account = supabase.table("accounts").select("*").eq("api_key", x_api_key).single().execute()
    if not account.data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    account_data = account.data
    customer_id = account_data.get("stripe_customer_id")
    
    if not customer_id:
        return {"invoices": []}
    
    try:
        invoices = stripe.Invoice.list(customer=customer_id, limit=10)
        return {
            "invoices": [
                {
                    "id": inv.id,
                    "date": inv.created,
                    "amount": inv.amount_paid / 100,  # Convert from cents
                    "planName": inv.description or "Subscription",
                    "status": "Paid" if inv.paid else ("Failed" if not inv.open else "Pending"),
                    "invoiceUrl": inv.invoice_pdf or "#"
                }
                for inv in invoices.data
            ]
        }
    except Exception as e:
        # Return empty list if Stripe API fails
        return {"invoices": [], "error": str(e)}


@router.get("/v1/payment-method")
async def get_payment_method(x_api_key: str = Header(...)):
    """
    Get the current payment method for the account.
    """
    supabase = get_supabase()
    
    # Get account from API key
    account = supabase.table("accounts").select("*").eq("api_key", x_api_key).single().execute()
    if not account.data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    account_data = account.data
    customer_id = account_data.get("stripe_customer_id")
    
    if not customer_id:
        return {"paymentMethod": None}
    
    try:
        customer = stripe.Customer.retrieve(customer_id)
        default_pm = customer.get("invoice_settings", {}).get("default_payment_method")
        
        if default_pm:
            pm = stripe.PaymentMethod.retrieve(default_pm)
            return {
                "paymentMethod": {
                    "brand": pm.card.brand,
                    "last4": pm.card.last4,
                    "expMonth": pm.card.exp_month,
                    "expYear": pm.card.exp_year
                }
            }
        return {"paymentMethod": None}
    except Exception:
        return {"paymentMethod": None}


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    supabase = get_supabase()
    event_type = event["type"]

    if event_type == "customer.subscription.created":
        sub = event["data"]["object"]
        tier = TIERS.get(sub.get("items", {}).get("data", [{}])[0].get("price", {}).get("id"))
        if tier:
            supabase.table("accounts").update({"tier": tier}).eq(
                "stripe_customer_id", sub["customer"]
            ).execute()
    elif event_type == "customer.subscription.deleted":
        sub = event["data"]["object"]
        supabase.table("accounts").update({"tier": "free"}).eq(
            "stripe_customer_id", sub["customer"]
        ).execute()
    elif event_type == "invoice.payment_failed":
        invoice = event["data"]["object"]
        supabase.table("accounts").update({"suspended": True}).eq(
            "stripe_customer_id", invoice["customer"]
        ).execute()
    elif event_type == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        # Clear suspension on successful payment
        supabase.table("accounts").update({"suspended": False}).eq(
            "stripe_customer_id", invoice["customer"]
        ).execute()

    return {"received": True}


# Placeholder TIERS mapping for webhook (used above)
TIERS = {v: k for k, v in TIER_MAPPING.items()}
