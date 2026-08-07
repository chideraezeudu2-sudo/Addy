# The Address API — Backend

FastAPI backend for cheap address autocomplete/geocoding with bundled
deliverability, tax, and timezone enrichment.

## Setup

1. `pip install -r requirements.txt`
   - **libpostal is a system dependency**, not just a Python package.
     Install it first: `apt-get install -y libpostal-dev` (Linux) or
     `brew install libpostal` (Mac), *then* `pip install postal`.
     Without it, normalization silently falls back to a naive regex
     normalizer with materially worse cache hit rate — do not deploy
     to production without confirming libpostal is actually installed
     and `LIBPOSTAL_AVAILABLE` is True.
2. Set environment variables (see `app/config.py` for the full list):
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `REDIS_URL`,
   `POSITIONSTACK_API_KEY`, `LOCATIONIQ_API_KEY`, `OPENCAGE_API_KEY`,
   `SMARTY_AUTH_ID`, `SMARTY_AUTH_TOKEN`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`.
3. Place a zip -> tax rate CSV at `data/zip_tax_rates.csv` with columns
   `zip,jurisdiction,rate`. An open dataset (not a paid tax engine) is
   the intended source for v1.
4. Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

## Required Supabase schema

Table `accounts`:
- `id` (uuid, pk)
- `api_key` (text, unique)
- `tier` (text, default 'free')
- `lookups_used` (int, default 0)
- `stripe_customer_id` (text, nullable)
- `suspended` (bool, default false)

## Build order — do these in this exact sequence

**Step 0 — test before committing to anything.** Before doing any of
the steps below, attempt to download ONE small OpenAddresses regional
file (pick the smallest US state you can find on openaddresses.io) to
confirm this environment can actually reach that site and has disk
space to store the result. Report back immediately if this fails —
if it does, skip straight to "Fallback-only mode" below and do not
attempt the rest of this section.

**Step 1 — do NOT download the global 35GB OpenAddresses file.** Only
download data for 1-2 specific US states to start (whichever states
the first target customers are in). Expand to more states later, one
at a time, as the business grows into new regions. The global file is
unnecessary disk space and bandwidth for a launch.

**Step 2 — set up Postgres with the PostGIS and pg_trgm extensions**
enabled on the Supabase Postgres instance (`CREATE EXTENSION postgis;`
`CREATE EXTENSION pg_trgm;`), then create the `local_addresses` table
and indexes as documented at the top of `app/services/local_lookup.py`.

**Step 3 — load the downloaded state-level OpenAddresses file(s)**
into that `local_addresses` table.

**Step 4 — set `SUPABASE_DB_URL`** (direct Postgres connection string,
not the Supabase REST URL) so `local_lookup.py` can query it directly.

**Step 5 — sign up for free-tier API keys** at Positionstack,
LocationIQ, and OpenCage (at minimum, get one — Positionstack first)
and set them as environment variables. These are the fallback for any
address not found in the local database.

**Fallback-only mode:** if Step 0 fails, or there isn't time/budget to
stand up the local database yet, the app runs fine using only the
free-tier provider APIs (Step 5) as the sole geocoding source — just
skip the local-database steps and the app falls back to them
automatically (`geocode_with_local_first` in `providers.py` calls the
provider chain whenever there's no local match, including when there's
no local database at all).

## What's stubbed and needs finishing

- `/v1/reverse` only returns timezone — needs the reverse-geocode call
  wired into `providers.py`'s failover chain the same way `/v1/geocode` uses it.
- `billing.py`'s Stripe price-ID -> tier mapping is a placeholder —
  needs the actual Stripe product/price IDs once they're created.
- `/v1/autocomplete` calls full geocode per request as an MVP — a real
  autocomplete UX needs a provider's dedicated autocomplete mode (fewer
  fields, faster response) rather than a full geocode per keystroke.
- Tax dataset (`data/zip_tax_rates.csv`) needs to be sourced and placed.
- Rate limiting / API gateway layer (NGINX or Kong) sits in front of
  this app in production — not included here, this is the app layer only.

## Endpoints (for frontend integration)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/v1/autocomplete` | `x-api-key` header | Address suggestions as user types |
| POST | `/v1/geocode` | `x-api-key` header | Full address -> coordinates + deliverability + tax + timezone |
| POST | `/v1/reverse` | `x-api-key` header | Coordinates -> timezone (geocode portion pending) |
| GET | `/v1/account/usage` | `x-api-key` header | Current tier, lookups used/included, warning if near free cap |
| POST | `/webhooks/stripe` | Stripe signature | Billing events (subscription changes, payment failures) |
| GET | `/health` | none | Health check |
