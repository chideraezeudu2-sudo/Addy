import json
from typing import Optional

import redis.asyncio as redis

from app.config import get_settings

settings = get_settings()
_redis_client: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


async def cache_get(key: str) -> Optional[dict]:
    client = get_redis()
    raw = await client.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def cache_set(key: str, value: dict) -> None:
    client = get_redis()
    await client.set(key, json.dumps(value), ex=settings.CACHE_TTL_SECONDS)
