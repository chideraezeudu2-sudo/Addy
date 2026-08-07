-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key TEXT UNIQUE NOT NULL,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'business', 'enterprise_lite')),
    lookups_used INT DEFAULT 0,
    stripe_customer_id TEXT,
    suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on api_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_accounts_api_key ON accounts(api_key);

-- Create index on stripe_customer_id for billing webhooks
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer ON accounts(stripe_customer_id);

-- Create local_addresses table for cached geocoding data (optional - can be populated later)
CREATE TABLE IF NOT EXISTS local_addresses (
    id SERIAL PRIMARY KEY,
    formatted_address TEXT NOT NULL,
    street_number TEXT,
    street_name TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location GEOMETRY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GIST index for spatial queries
CREATE INDEX IF NOT EXISTS idx_local_addresses_location ON local_addresses USING GIST(location);

-- Create trgm indexes for fuzzy text search
CREATE INDEX IF NOT EXISTS idx_local_addresses_formatted ON local_addresses USING GIN(formatted_address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_local_addresses_street ON local_addresses USING GIN(street_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_local_addresses_city ON local_addresses USING GIN(city gin_trgm_ops);

-- Create index on postal_code for tax lookup
CREATE INDEX IF NOT EXISTS idx_local_addresses_postal ON local_addresses(postal_code);

-- Note: For production, enable Row Level Security and configure policies
-- ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE local_addresses ENABLE ROW LEVEL SECURITY;
