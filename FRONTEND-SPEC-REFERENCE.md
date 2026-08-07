# The Address API — User Flow & Frontend Specification

This document describes the complete user journey and every page, tab,
button, and piece of copy in the frontend — content and behavior only.
No colors, spacing, dimensions, or visual design decisions are included;
those are yours to make.

---

## 1. User Flow Overview

**Step 1 — Landing page.** A visitor arrives (from Google search, HN/PH
launch, or a "cheaper than Google Places" SEO search) and lands on the
homepage. They read the hero pitch, see the price comparison, and either
click "Get your free API key" (primary path) or scroll to compare
pricing tiers first.

**Step 2 — Signup.** Clicking "Get your free API key" opens the signup
form. Email + password only — no credit card required for the free tier.
On submit, an account is created, an API key is generated immediately,
and the user is redirected straight into the dashboard with their key
already visible (no email verification gate blocking first access, but
a verification email is sent in the background — see Section 4).

**Step 3 — Dashboard, first visit.** The user lands on the Overview tab
with their API key front and center, a "Quick Start" code snippet ready
to copy, and their usage meter reading "0 / 500 free lookups used."

**Step 4 — Integration.** The user copies their key and code snippet
into their own project (this happens outside the product, on their own
site/app).

**Step 5 — Usage grows, warning appears.** Once the account crosses 480
lookups, a persistent (but dismissible per-session) banner appears
across the dashboard: "You've used 480 of 500 free lookups. Upgrade to
keep this running without interruption." A link goes straight to the
Billing tab.

**Step 6 — Hits the cap.** At 500 lookups, further API calls return an
HTTP 402 with a clear error message (not a silent failure). The
dashboard's Overview tab now shows a full-width notice: "You've reached
your free tier limit. Choose a plan to continue." with tier buttons
inline.

**Step 7 — Upgrade.** The user picks a tier on the Billing tab, enters
payment via Stripe's hosted checkout, and is returned to the dashboard
with the new tier reflected immediately and the usage cap lifted.

**Step 8 — Ongoing use.** The user checks the dashboard periodically for
usage/billing, but day-to-day their integration runs unattended against
the API.

---

## 2. Landing Page

### Header (persistent nav bar)

Left: logotype/wordmark (text only — no icon direction given here).

Center/right nav links, in order:
- **Pricing** → jumps to the pricing section on the same page
- **Docs** → opens the documentation page
- **Sign in** → opens the login form
- **Get free API key** (styled as the standout action) → opens signup

### Hero Section

**Headline:**
> "Address autocomplete and geocoding, 80% cheaper than Google — with deliverability, tax, and timezone data built in."

**Subheadline:**
> "Drop-in autocomplete for your checkout or signup form. One API call returns verified coordinates, a deliverability score, the local tax rate, and timezone — all in one response, all cheaper than Google Places."

**Primary button:** "Get your free API key" → signup
**Secondary button (text link style):** "See pricing" → jumps to pricing section

**Below the buttons, a small reassurance line:**
> "500 free lookups. No credit card required."

### Live Demo Block

An embedded, functional autocomplete input right on the landing page so
a visitor can try it before signing up.

**Label above the input:** "Try it — type an address"
**Placeholder text in the input:** "Start typing an address..."

Below the input, once a result is selected, show the actual JSON
response object (deliverability score, tax rate, timezone) so visitors
see the real enrichment data, not just a suggestion dropdown.

**Caption under the demo:**
> "This is the real API response. No mockups."

### Price Comparison Section

**Section heading:** "Why pay Google's prices?"

A simple side-by-side comparison table (not a widget — a straightforward
in-page table):

| | Google Places | Us |
|---|---|---|
| Cost per 50,000 lookups/mo | ~$250 | ~$99 |
| Deliverability scoring | Not included | Included |
| Tax jurisdiction data | Not included | Included |
| Timezone data | Not included | Included |

**Caption below the table:**
> "Same coverage. Fewer surprises on your bill."

### Feature Section (three or four short blocks)

**Block 1 — heading:** "Built for checkout forms"
**Body:** "Drop-in autocomplete that reduces failed deliveries and abandoned checkouts — works with Shopify, Webflow, WordPress, and any custom site."

**Block 2 — heading:** "More than coordinates"
**Body:** "Every lookup includes a deliverability score, the local tax rate, and timezone context — not just a lat/lng pair."

**Block 3 — heading:** "Predictable pricing"
**Body:** "Flat monthly tiers with clear overage rates. No per-keystroke billing surprises."

**Block 4 — heading:** "Fast, cached, reliable"
**Body:** "Repeated address lookups are served from cache in milliseconds. Multi-provider failover means no single point of failure."

### Pricing Section

**Section heading:** "Simple, predictable pricing"

Five pricing cards, left to right: Free, Starter, Pro, Business,
Enterprise Lite. Each card contains:

- Tier name
- Price ("$0", "$29/mo", "$99/mo", "$299/mo", "$999/mo")
- Included lookups ("500 lookups, forever", "10,000/mo", "50,000/mo", "250,000/mo", "1,000,000/mo")
- Overage rate ("—", "$0.0008/lookup", "$0.0007/lookup", "$0.0006/lookup", "$0.0005/lookup")
- A single button: "Start free" (Free tier) or "Choose [tier name]" (all paid tiers) → signup or straight to Stripe checkout if already signed in

A sixth, visually distinct card for **Enterprise**: "Custom volume, custom SLA. **Talk to us**" button → opens a simple contact form (name, email, company, message).

### FAQ Section

**Section heading:** "Questions"

- **"Do I need a credit card for the free tier?"** — "No. Sign up with just an email and get 500 free lookups, no card required."
- **"What happens when I use all 500 free lookups?"** — "Your integration keeps running — you'll get a warning well before you run out, and a clear message if you hit the limit, so nothing breaks silently in production."
- **"Can I switch plans later?"** — "Yes, upgrade or downgrade anytime from your dashboard's Billing tab."
- **"What data sources power the enrichment?"** — "Deliverability data is CASS-certified through USPS-authorized providers. Tax rates and timezone data are sourced from public datasets."

### Footer

Columns:
- **Product** — Pricing, Docs, Status page
- **Company** — About, Contact
- **Legal** — Terms of Service, Privacy Policy

Bottom line: "© [year] The Address API. All rights reserved."

---

## 3. Signup Page

**Heading:** "Get your free API key"
**Subheading:** "500 free lookups. No credit card required."

**Fields:**
- Email address
- Password
- Checkbox: "I agree to the [Terms of Service] and [Privacy Policy]" (links open those pages in new tabs) — required to submit

**Primary button:** "Create account"

**Below the button:** "Already have an account? **Sign in**" (link to login)

**Error states** (shown inline under the relevant field):
- Invalid email: "Enter a valid email address."
- Weak password: "Password must be at least 8 characters."
- Email already registered: "An account with this email already exists. **Sign in instead?**"

On successful submit: redirect immediately to Dashboard → Overview tab.
A verification email is sent in the background with the subject
"Confirm your email" and a single button inside: "Confirm email address."
Unverified accounts are not blocked from using the API or dashboard —
verification only gates password-reset requests.

---

## 4. Login Page

**Heading:** "Sign in"

**Fields:** Email, Password

**Primary button:** "Sign in"
**Link below:** "Forgot your password?" → password reset flow (email
field → "Send reset link" button → confirmation message: "If an account
exists for that email, a reset link has been sent.")

**Link below that:** "Don't have an account? **Get a free API key**"

---

## 5. Dashboard

Persistent left-hand (or top, your call) tab navigation, present on
every dashboard page:

1. Overview
2. API Keys
3. Usage & Billing
4. Docs
5. Settings

### Tab 1 — Overview

**Purpose:** first-glance status — is everything working, and what's my
current usage.

**Contents:**
- Welcome message: "Welcome back" (returning) or "Welcome — here's your API key" (first visit)
- API key displayed in a copyable field, with a **"Copy"** button next to it
- A "Quick Start" code block showing a minimal example request using the displayed key, with its own **"Copy code"** button
- Usage meter: a simple bar or number showing "X / 500 free lookups used" (free tier) or "X / [included] this month" (paid tiers)
- If usage ≥ 480/500 on free tier: a warning banner, as described in Section 1, Step 5, with a **"View plans"** button linking to the Usage & Billing tab
- If usage = 500/500 on free tier: the warning banner is replaced by a blocking notice with tier buttons inline, same copy as the pricing section cards

### Tab 2 — API Keys

**Purpose:** manage keys (most accounts will only ever have one, but
support multiple for key-rotation and staging/production separation).

**Contents:**
- List of all keys: label (user-assigned name, e.g. "Production"), the key itself (partially masked, e.g. `ak_live_••••••3f2a`, with a **"Reveal"** toggle and a **"Copy"** button)
- **"Generate new key"** button → opens a small form: label field, **"Create"** button
- Each key row has a **"Revoke"** button → clicking opens a confirmation: "Revoking this key will immediately stop any integration using it. Continue?" with **"Revoke key"** (destructive) and **"Cancel"**

### Tab 3 — Usage & Billing

**Purpose:** everything money-related.

**Contents:**
- Current plan name and price, prominently at top
- Usage graph/number for the current billing period (paid tiers) or lifetime (free tier)
- **"Change plan"** button → opens the same five/six-tier card layout as the landing page pricing section; selecting a tier routes to Stripe's hosted checkout (upgrade) or an immediate confirmation (downgrade: "Your plan will change to [tier] at the end of your current billing period. **Confirm downgrade**")
- Billing history table: date, amount, status (Paid/Failed), each row with a **"Download invoice"** link
- **"Update payment method"** button → opens Stripe's hosted payment update flow
- **"Cancel subscription"** link (styled quietly, not as a primary action) → confirmation: "Your account will move to the free tier at the end of the billing period. Cancel subscription?" with **"Confirm cancellation"** and **"Never mind"**

### Tab 4 — Docs

**Purpose:** in-product reference so users don't have to leave the
dashboard to integrate.

**Contents:**
- Endpoint reference matching the backend README table: `/v1/autocomplete`, `/v1/geocode`, `/v1/reverse`, `/v1/account/usage` — each with a short description, example request, and example response
- A **"Copy"** button on every code sample
- A note at the top: "All requests require your API key in the `x-api-key` header."

### Tab 5 — Settings

**Purpose:** account-level, non-billing settings.

**Contents:**
- Email address (editable, with **"Save"** button; changing email re-triggers verification)
- **"Change password"** button → current password, new password, confirm new password fields, **"Update password"** button
- **"Delete account"** — styled quietly, at the bottom, separated from everything else → confirmation: "This permanently deletes your account, API keys, and usage history. This cannot be undone. Type DELETE to confirm." (text input must match "DELETE" before the **"Delete my account"** button becomes active)

---

## 6. Terms of Service

**Effective Date:** [insert launch date]

**1. Acceptance of Terms**
By creating an account or using The Address API ("the Service"), you
agree to be bound by these Terms of Service. If you do not agree, do
not use the Service.

**2. Description of Service**
The Service provides address autocomplete, geocoding, reverse
geocoding, deliverability scoring, tax jurisdiction lookup, and
timezone data via a REST API, accessed using an API key issued to your
account.

**3. Accounts**
You are responsible for maintaining the confidentiality of your API
keys and for all activity that occurs under your account. You must
notify us promptly of any unauthorized use of your account or keys.

**4. Acceptable Use**
You agree not to: (a) use the Service to violate any law; (b) attempt
to reverse-engineer, scrape, or resell the Service's underlying data as
a standalone product; (c) exceed reasonable request rates in a manner
that degrades the Service for other users; (d) use the Service to
process data you do not have the right to process.

**5. Fees and Billing**
Paid tiers are billed monthly in advance, with usage overage billed in
arrears at the rates published on our pricing page. Failure to pay may
result in suspension of your account until payment is resolved.

**6. Free Tier**
The free tier provides a lifetime total of 500 lookups per account and
is offered at our discretion. We reserve the right to modify or
discontinue the free tier with notice.

**7. Data Accuracy**
Address, deliverability, tax, and timezone data are provided "as is."
While we strive for accuracy, the Service does not guarantee that any
address is deliverable, that any tax rate is current or complete, or
that any geocoding result is precise. You are responsible for
independently verifying data where accuracy is critical (e.g., legal or
tax compliance).

**8. Limitation of Liability**
To the maximum extent permitted by law, we are not liable for indirect,
incidental, or consequential damages arising from your use of the
Service, including but not limited to lost revenue, failed deliveries,
or incorrect tax calculations.

**9. Termination**
We may suspend or terminate your account for violation of these Terms.
You may cancel your account at any time from your dashboard.

**10. Changes to These Terms**
We may update these Terms from time to time. Continued use of the
Service after changes take effect constitutes acceptance of the
updated Terms.

**11. Contact**
Questions about these Terms can be sent to [insert contact email].

---

## 7. Privacy Policy

**Effective Date:** [insert launch date]

**1. Information We Collect**
- **Account information:** email address, password (hashed), billing information (processed by Stripe; we do not store full card numbers).
- **API usage data:** the addresses and coordinates you submit for lookups, timestamps, and request counts, used to provide the Service and calculate billing.
- **Technical data:** IP address, browser/user-agent, for security and abuse prevention.

**2. How We Use Information**
We use collected information to: provide and bill for the Service;
monitor for abuse or unusual usage patterns; communicate with you about
your account, billing, or Service updates; improve the accuracy and
reliability of the Service.

**3. Address Data Handling**
Addresses submitted through the API are cached temporarily (up to 30
days) to improve performance and reduce cost, and may be used in
aggregate, de-identified form to improve deliverability scoring over
time. We do not sell submitted address data to third parties.

**4. Third-Party Providers**
We rely on third-party providers to deliver parts of the Service,
including geocoding providers, a deliverability verification provider,
and Stripe for payment processing. These providers receive only the
data necessary to perform their function.

**5. Data Retention**
Account data is retained for as long as your account is active. Cached
address lookup data expires automatically after 30 days. You may
request deletion of your account and associated data at any time via
your dashboard's Settings tab or by contacting us.

**6. Your Rights**
Depending on your location, you may have the right to access, correct,
or delete your personal data, or to object to certain processing.
Contact us at [insert contact email] to exercise these rights.

**7. Security**
We use industry-standard measures, including encryption in transit, to
protect your data. No system is completely secure, and we cannot
guarantee absolute security.

**8. Children's Privacy**
The Service is not directed to individuals under 18, and we do not
knowingly collect information from them.

**9. Changes to This Policy**
We may update this Privacy Policy from time to time. Material changes
will be communicated via email or a notice within the dashboard.

**10. Contact**
Questions about this Privacy Policy can be sent to [insert contact
email].
