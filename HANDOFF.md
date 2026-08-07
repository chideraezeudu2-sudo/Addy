# Addy — OpenHands Handoff

This is the complete, ordered task list to take this project from "code
on disk" to "live on the internet, fully working." Follow the steps in
order — later steps depend on earlier ones being done correctly.

Project layout:
- `/backend` — FastAPI service (see `/backend/README.md` for backend-specific detail)
- `/frontend` — React/Vite app (currently using mock/localStorage data — see Task 3)

---

## Task 0 — Environment check (do this first, before anything else)

1. Confirm outbound internet access to: openaddresses.io, api.positionstack.com,
   locationiq.com, opencagedata.com, api.stripe.com, and whatever host
   Supabase is on.
2. Attempt to download ONE small OpenAddresses regional file (pick the
   smallest US state available). If this fails, **stop and report it**
   — do not proceed to Task 1's local-database steps. Skip to the
   "Fallback-only mode" note in `/backend/README.md` and continue with
   Tasks 2–7 using only the paid provider APIs.
3. Confirm the deploy target (Render, or wherever this is going) has at
   least a few GB of free disk — do not provision for the full 35GB
   global OpenAddresses dataset, only 1–2 states' worth.

## Task 1 — Backend: address data setup

1. Enable `postgis` and `pg_trgm` extensions on the Supabase Postgres instance.
2. Create the `local_addresses` table and indexes exactly as documented
   in `/backend/app/services/local_lookup.py`'s module docstring.
3. Download OpenAddresses data for 1–2 US states only (not the global
   file) and load it into `local_addresses`.
4. Create the `accounts` table as documented in `/backend/README.md`
   (`id`, `api_key`, `tier`, `lookups_used`, `stripe_customer_id`, `suspended`).
5. Source a zip → tax-rate CSV (columns: `zip,jurisdiction,rate`) from
   an open/public dataset and place it at `/backend/data/zip_tax_rates.csv`.

## Task 2 — Backend: credentials and config

1. Sign up for free-tier API keys: Positionstack (priority — get this
   one at minimum), LocationIQ, OpenCage.
2. Sign up for a Smarty free-tier account (US address verification /
   CASS deliverability check).
3. Set all environment variables listed in `/backend/README.md` and
   `/backend/app/config.py`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
   `SUPABASE_DB_URL`, `REDIS_URL`, `POSITIONSTACK_API_KEY`,
   `LOCATIONIQ_API_KEY`, `OPENCAGE_API_KEY`, `SMARTY_AUTH_ID`,
   `SMARTY_AUTH_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
4. Set up a Redis instance (managed Redis add-on on the deploy platform
   is fine) and point `REDIS_URL` at it.
5. Install libpostal on the deploy target BEFORE installing Python deps
   (`apt-get install -y libpostal-dev`, then `pip install -r requirements.txt`).
   Confirm `LIBPOSTAL_AVAILABLE` is `True` at runtime — if it's `False`,
   normalization is silently degraded and cache hit rate will suffer.
6. Deploy the backend. Confirm `GET /health` returns `{"status": "ok"}`.
7. Manually test each endpoint against the live deployment:
   `POST /v1/autocomplete`, `POST /v1/geocode`, `POST /v1/reverse`,
   `GET /v1/account/usage` (you'll need a test row in `accounts` with a
   real `api_key` to do this).

## Task 3 — Frontend: replace the mock backend with real API calls

**This is the most important task in this whole document.** The
frontend currently works entirely against `frontend/src/mockBackend.ts`,
which simulates everything using the browser's `localStorage` — fake
signup, fake login (any email succeeds), fake billing (instant "Paid"
invoice, fake Visa card), and address lookups matched against 7
hardcoded sample addresses. None of it talks to the real backend yet.

Concretely:

1. Create a real API client module (e.g. `frontend/src/api.ts`) that
   reads `VITE_API_BASE_URL` from the environment and makes real
   `fetch` calls to the backend's endpoints, sending the user's API
   key in the `x-api-key` header.
2. Replace every import of `backend` from `./mockBackend` (currently in
   `AuthModal.tsx`, `ApiKeysTab.tsx`, `OverviewTab.tsx`,
   `DashboardLayout.tsx`, `DocsTab.tsx`, `BillingTab.tsx`,
   `LandingPage.tsx`, `App.tsx`) with calls to the new real API client.
3. **Auth (`AuthModal.tsx`):** replace the fake register/login with
   real Supabase auth — signup should call the backend (or Supabase
   directly) to create a real account row and return a real API key,
   not a `Date.now()`-based fake one.
4. **Billing (`BillingTab.tsx`):** replace the instant fake invoice
   generation with a real redirect to Stripe Checkout using the
   backend's price IDs. Replace the fake payment method / invoice list
   with real data pulled from Stripe (via the backend) after checkout
   completes.
5. **Address lookups (`LandingPage.tsx`'s live demo, `DocsTab.tsx`
   examples):** replace `SAMPLE_ADDRESS_DATABASE` matching with real
   calls to `POST /v1/geocode` and `POST /v1/autocomplete`.
6. **Usage data (`OverviewTab.tsx`):** replace the localStorage usage
   counter with real data from `GET /v1/account/usage`, including
   surfacing its `warning` field as the 480/500 free-tier banner.
7. Once this is done, `mockBackend.ts` should be deleted entirely — if
   it's still imported anywhere after this task, the migration isn't finished.

## Task 4 — Frontend: cleanup and deploy

1. `frontend/package.json` and `.env.example` have already been
   cleaned of unused Google AI Studio scaffolding (`@google/genai`,
   `express`, `GEMINI_API_KEY`) — confirm nothing in the codebase still
   references them before deploying.
2. Set `VITE_API_BASE_URL` to the real deployed backend URL from Task 2.
3. `npm install && npm run build`, then deploy the built static site
   (Vercel is the standard target here).
4. Confirm the deployed frontend can actually reach the deployed
   backend — test signup, an address lookup, and the billing flow
   end-to-end against the live backend, not mock data.

## Task 5 — Final verification checklist

Before calling this "done," confirm all of the following against the
live, deployed system (not local dev):

- [ ] Signing up creates a real account with a real API key (check the `accounts` table)
- [ ] `POST /v1/geocode` on the live backend returns a real address match, not a hardcoded sample
- [ ] Free tier correctly blocks at 500 lookups with a 402 error, and the 480-lookup warning banner appears in the dashboard
- [ ] Choosing a paid plan actually redirects to Stripe Checkout and, after payment, the account's tier updates in the database
- [ ] The Stripe webhook correctly handles a failed payment (suspends account) and a cancelled subscription (reverts to free)
- [ ] `local_lookup.py`'s local-database path returns results for addresses in the loaded state(s), and correctly falls back to the paid provider chain for addresses outside them
- [ ] ToS and Privacy Policy pages load the real text (not placeholder Lorem ipsum)
- [ ] The whole flow works on a fresh browser with no existing localStorage state

## Known open items (not blockers, but flag if skipped)

- Reverse geocoding (`/v1/reverse`) only returns timezone data currently — full reverse-geocode-to-address needs wiring into the provider failover chain.
- Stripe price ID → internal tier name mapping in `billing.py` is a placeholder and needs the real Stripe product/price IDs.
- Autocomplete calls a full geocode per request as an MVP shortcut — fine for launch, but not optimized for per-keystroke typing latency.
