from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import autocomplete, geocode, reverse, account, billing, auth

app = FastAPI(title="The Address API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(autocomplete.router, prefix="/v1", tags=["autocomplete"])
app.include_router(geocode.router, prefix="/v1", tags=["geocode"])
app.include_router(reverse.router, prefix="/v1", tags=["reverse"])
app.include_router(account.router, prefix="/v1", tags=["account"])
app.include_router(billing.router, tags=["billing"])
app.include_router(auth.router, tags=["auth"])


@app.get("/")
async def root():
    return {"status": "ok", "message": "Welcome to Addy API"}


@app.get("/health")
async def health():
    return {"status": "ok", "message": "Addy API is running"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "10000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
