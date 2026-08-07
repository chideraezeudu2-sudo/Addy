from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import autocomplete, geocode, reverse, account, billing, auth
from app.services.enrichment import load_tax_table

app = FastAPI(title="The Address API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to specific customer domains once launched
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(autocomplete.router, prefix="/v1", tags=["autocomplete"])
app.include_router(geocode.router, prefix="/v1", tags=["geocode"])
app.include_router(reverse.router, prefix="/v1", tags=["reverse"])
app.include_router(account.router, prefix="/v1", tags=["account"])
app.include_router(billing.router, tags=["billing"])
app.include_router(auth.router, tags=["auth"])


@app.on_event("startup")
async def startup():
    try:
        load_tax_table("data/zip_tax_rates.csv")
    except FileNotFoundError:
        pass  # dataset not yet placed — tax lookups return empty until it is


@app.get("/health")
async def health():
    return {"status": "ok"}
