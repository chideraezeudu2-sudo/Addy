-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/gmqvkoxigpktauqtcuut/sql/new

-- Enable pg_trgm extension for fuzzy text search
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

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_accounts_api_key ON accounts(api_key);
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer ON accounts(stripe_customer_id);

-- Insert a test account
INSERT INTO accounts (api_key, tier, lookups_used) 
VALUES ('ak_test_123456789', 'free', 0)
ON CONFLICT (api_key) DO NOTHING;

-- Verify
SELECT * FROM accounts LIMIT 5;
