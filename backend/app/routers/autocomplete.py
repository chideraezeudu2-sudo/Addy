from fastapi import APIRouter, Depends

from app.models.schemas import AutocompleteQuery, AutocompleteResponse, AutocompleteSuggestion
from app.services.auth import require_api_key
from app.services.cache import cache_get, cache_set
from app.services.normalize import cache_key, normalize_address
from app.services.providers import geocode_with_local_first as geocode
from app.services.usage import check_and_increment_usage

router = APIRouter()


@router.post("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete(payload: AutocompleteQuery, account: dict = Depends(require_api_key)):
    warning = check_and_increment_usage(account)

    key = cache_key(payload.query)
    cached = await cache_get(key)
    if cached:
        return AutocompleteResponse(suggestions=cached["suggestions"], cached=True)

    # MVP: single best geocode result surfaced as a suggestion.
    # A production autocomplete endpoint should call a dedicated
    # autocomplete-capable provider mode rather than full geocode per
    # keystroke — flagged for the agent to expand during build.
    result = await geocode(payload.query)
    suggestions = []
    if result:
        suggestions.append(
            AutocompleteSuggestion(label=result.formatted, normalized=normalize_address(payload.query))
        )

    await cache_set(key, {"suggestions": [s.model_dump() for s in suggestions]})
    response = AutocompleteResponse(suggestions=suggestions, cached=False)
    if warning:
        response = response.model_copy(update={})  # warning surfaced via response headers, see main.py
    return response
