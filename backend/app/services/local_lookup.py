"""
Primary address lookup against a self-hosted OpenAddresses dataset,
stored in Postgres with the PostGIS extension enabled (spatial index)
and pg_trgm enabled (fuzzy text matching on street/city names).

This is the PRIMARY lookup path. providers.py (Positionstack/LocationIQ/
OpenCage) is the FALLBACK, used only when the local database has no
match — e.g. an address in a region not yet loaded, or a genuinely new
address not yet in any government dataset.

Table expected (created via migration, not here):

    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    CREATE TABLE local_addresses (
        id BIGSERIAL PRIMARY KEY,
        number TEXT,
        street TEXT,
        city TEXT,
        region TEXT,   -- state/province
        postcode TEXT,
        geom GEOMETRY(Point, 4326),
        source TEXT    -- which OpenAddresses source file this came from
    );
    CREATE INDEX idx_local_addresses_geom ON local_addresses USING GIST (geom);
    CREATE INDEX idx_local_addresses_street_trgm ON local_addresses USING GIN (street gin_trgm_ops);
"""
import asyncpg

from app.config import get_settings
from app.services.providers import GeocodeResult

settings = get_settings()
_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(dsn=settings.SUPABASE_DB_URL, min_size=1, max_size=10)
    return _pool


async def lookup_local(address: str, similarity_threshold: float = 0.4) -> GeocodeResult | None:
    """
    Fuzzy-match the given address string against the local dataset using
    pg_trgm similarity, ordered by best match. Returns None if nothing
    clears the similarity threshold, so the caller can fall back to the
    paid provider chain.
    """
    pool = await get_pool()
    query = """
        SELECT number, street, city, region, postcode,
               ST_Y(geom) AS lat, ST_X(geom) AS lng,
               similarity(street || ' ' || number, $1) AS score
        FROM local_addresses
        WHERE (street || ' ' || number) % $1
        ORDER BY score DESC
        LIMIT 1
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, address)

    if row is None or row["score"] < similarity_threshold:
        return None

    formatted = f"{row['number']} {row['street']}, {row['city']}, {row['region']} {row['postcode']}"
    return GeocodeResult(
        lat=row["lat"], lng=row["lng"], formatted=formatted,
        confidence=int(row["score"] * 100), provider="local_openaddresses",
    )
