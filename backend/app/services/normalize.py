"""
Address normalization — the single highest-leverage piece of this system.
Two differently-typed addresses must resolve to the same cache key, or
the cache hit rate (and therefore the margin story) collapses.

Uses libpostal (https://github.com/openvenues/libpostal) via the
`postal` Python bindings. libpostal must be installed on the host
(brew install libpostal / apt install libpostal, then pip install postal).
"""
import hashlib
import re

try:
    from postal.parser import parse_address
    from postal.expand import expand_address
    LIBPOSTAL_AVAILABLE = True
except ImportError:
    # Falls back to a naive normalizer until libpostal is installed on the
    # deploy target. Cache hit rate will be materially worse until this
    # dependency is actually present — do not ship to production without it.
    LIBPOSTAL_AVAILABLE = False


def _naive_normalize(raw: str) -> str:
    text = raw.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    replacements = {
        r"\bstreet\b": "st",
        r"\bavenue\b": "ave",
        r"\bparkway\b": "pkwy",
        r"\bboulevard\b": "blvd",
        r"\bdrive\b": "dr",
        r"\broad\b": "rd",
        r"\bsuite\b": "ste",
        r"\bapartment\b": "apt",
    }
    for pattern, repl in replacements.items():
        text = re.sub(pattern, repl, text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_address(raw: str) -> str:
    """Return a canonical string representation used to build cache keys."""
    if LIBPOSTAL_AVAILABLE:
        try:
            expansions = expand_address(raw)
            # expand_address returns multiple valid expansions; use the
            # shortest normalized-looking one as canonical.
            candidate = min(expansions, key=len) if expansions else raw
            return candidate.lower().strip()
        except Exception:
            return _naive_normalize(raw)
    return _naive_normalize(raw)


def cache_key(raw_address: str) -> str:
    normalized = normalize_address(raw_address)
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:24]
    return f"addr:{digest}"
