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
import psycopg2
from psycopg2 import pool

from app.config import get_settings
from app.services.providers import GeocodeResult

settings = get_settings()
_pool = None


def get_pool():
    global _pool
    if _pool is None:
        # For Supabase, we need to use the connection string
        conn_str = settings.SUPABASE_DB_URL or f"postgresql://postgres:@db.{settings.SUPABASE_URL.split('//')[1]}:5432/postgres"
        _pool = pool.ThreadedConnectionPool(minconn=1, maxconn=10, dsn=conn_str)
    return _pool


async def lookup_local(address: str, similarity_threshold: float = 0.4) -> GeocodeResult | None:
    """
    Fuzzy-match the given address string against the local dataset using
    pg_trgm similarity, ordered by best match. Returns None if nothing
    clears the similarity threshold, so the caller can fall back to the
    paid provider chain.
    """
    try:
        pg_pool = get_pool()
        conn = pg_pool.getconn()
        try:
            query = """
                SELECT number, street, city, region, postcode,
                       ST_Y(geom) AS lat, ST_X(geom) AS lng,
                       similarity(street || ' ' || number, %s) AS score
                FROM local_addresses
                WHERE (street || ' ' || number) %% %s
                ORDER BY score DESC
                LIMIT 1
            """
            with conn.cursor() as cur:
                cur.execute(query, (address, address))
                row = cur.fetchone()
        finally:
            pg_pool.putconn(conn)
    except psycopg2.Error:
        return None

    if row is None or row[6] < similarity_threshold:
        return None

    formatted = f"{row[0]} {row[1]}, {row[2]}, {row[3]} {row[4]}"
    return GeocodeResult(
        lat=row[5], lng=row[6] if len(row) > 6 else row[6], formatted=formatted,
        confidence=int(row[6] * 100) if row[6] else 0, provider="local_openaddresses",
    )
