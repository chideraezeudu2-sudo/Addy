from typing import Optional, List
from pydantic import BaseModel


class AutocompleteQuery(BaseModel):
    query: str
    country: Optional[str] = None
    limit: int = 5


class AutocompleteSuggestion(BaseModel):
    label: str
    normalized: str
    place_id: Optional[str] = None


class AutocompleteResponse(BaseModel):
    suggestions: List[AutocompleteSuggestion]
    cached: bool


class GeocodeQuery(BaseModel):
    address: str


class ReverseGeocodeQuery(BaseModel):
    lat: float
    lng: float


class DeliverabilityInfo(BaseModel):
    score: int
    verified: bool
    issues: List[str] = []
    carrier: Optional[str] = None


class TaxInfo(BaseModel):
    jurisdiction: Optional[str] = None
    rate: Optional[float] = None
    tax_type: Optional[str] = None


class TimezoneInfo(BaseModel):
    name: str
    offset_hours: float
    current_time: str
    is_business_hours: bool


class FullAddressResponse(BaseModel):
    address: str
    normalized: str
    coordinates: dict
    deliverability: DeliverabilityInfo
    tax: TaxInfo
    timezone: TimezoneInfo
    confidence: int
    cached: bool


class UsageStatus(BaseModel):
    tier: str
    lookups_used: int
    lookups_included: int
    lifetime_cap: Optional[int] = None
    warning: Optional[str] = None
