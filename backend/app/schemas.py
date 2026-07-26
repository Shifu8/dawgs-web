"""
Schemas Pydantic (DTOs) para validación y serialización de entrada y salida de API.
Ninguna entidad de base de datos se expone directamente; siempre pasa por estos schemas.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
import re


# ─── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=100)
    role: str = Field(default="admin", pattern="^(admin|staff)$")


class LoginResponse(BaseModel):
    ok: bool
    role: str
    csrf_token: str


# ─── Events ────────────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    subtitle: Optional[str] = Field(default="", max_length=200)
    slug: Optional[str] = Field(default=None, max_length=60)
    location: Optional[str] = Field(default="", max_length=200)
    date: str = Field(..., max_length=30)
    time: str = Field(..., max_length=20)
    countdown_date: Optional[str] = Field(default="", max_length=50)
    price: float = Field(default=0.0, ge=0)
    image_url: Optional[str] = Field(default="", max_length=500)
    description: Optional[str] = Field(default="", max_length=5000)
    status: str = Field(default="active", pattern="^(active|inactive)$")
    is_featured: bool = Field(default=False)
    position: int = Field(default=0)


class EventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=120)
    subtitle: Optional[str] = Field(default=None, max_length=200)
    slug: Optional[str] = Field(default=None, max_length=60)
    location: Optional[str] = Field(default=None, max_length=200)
    date: Optional[str] = Field(default=None, max_length=30)
    time: Optional[str] = Field(default=None, max_length=20)
    countdown_date: Optional[str] = Field(default=None, max_length=50)
    price: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    status: Optional[str] = Field(default=None, pattern="^(active|inactive)$")
    is_featured: Optional[bool] = None
    position: Optional[int] = None


class EventResponse(BaseModel):
    id: str
    slug: Optional[str]
    title: str
    subtitle: Optional[str]
    location: Optional[str]
    date: str
    time: str
    countdown_date: Optional[str]
    price: float
    image_url: Optional[str]
    description: Optional[str]
    status: str
    is_featured: bool
    position: int
    created_at: datetime
    updated_at: datetime


# ─── Receipts ──────────────────────────────────────────────────────────────────

class ReceiptResponse(BaseModel):
    id: str
    event_id: str
    first_name: str
    last_name: str
    quantity: int
    payment_method: str
    reference_number: Optional[str]
    file_path: str
    original_file_name: str
    file_size: int
    mime_type: str
    status: str
    rejection_reason: Optional[str]
    ticket_design: Optional[str]
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    # Decrypted fields only for admin
    phone: Optional[str] = None
    email: Optional[str] = None


class ReceiptListResponse(BaseModel):
    receipts: List[ReceiptResponse]
    total: int
    page: int
    per_page: int


class ReceiptReviewRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")
    rejection_reason: Optional[str] = Field(default=None, max_length=500)
    ticket_design: Optional[str] = Field(default=None, max_length=10)


class ReceiptReviewResponse(BaseModel):
    ok: bool
    receipt_id: str
    status: str
    serial_number: Optional[str] = None
    message: str


# ─── Passes ───────────────────────────────────────────────────────────────────

class PassValidateRequest(BaseModel):
    qr_payload: str = Field(..., max_length=2048)


class PassValidateResponse(BaseModel):
    valid: bool
    serial_number: str
    event_id: str
    used: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    pass_type: Optional[str] = None
    scanned_at: Optional[datetime] = None


class PassConfirmRequest(BaseModel):
    serial_number: str = Field(..., max_length=80)
    scanned_by: str = Field(default="staff", max_length=80)


class PassConfirmResponse(BaseModel):
    ok: bool
    serial_number: str
    message: str


# ─── Ticket Generation (Admin) ────────────────────────────────────────────────

class GenerateTicketRequest(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=40)
    last_name: str = Field(..., min_length=2, max_length=40)
    phone: str = Field(..., min_length=10, max_length=15)
    email: str = Field(..., max_length=120)
    event_id: str = Field(..., max_length=60)
    quantity: int = Field(default=1, ge=1, le=5)
    ticket_design: str = Field(default="0", max_length=10)
    send_whatsapp: bool = Field(default=False)
    send_email: bool = Field(default=True)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v)
        if not re.match(r"^09\d{8}$", cleaned):
            raise ValueError("Numero invalido. Ecuador: 09XXXXXXXX")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Email invalido.")
        return v


class GenerateTicketResponse(BaseModel):
    ok: bool
    serial_number: str
    ticket_id: str
    message: str


# ─── Organizer Auth ────────────────────────────────────────────────────────────

class OrganizerRegisterRequest(BaseModel):
    org_name: str = Field(..., min_length=2, max_length=120)
    display_name: str = Field(..., min_length=2, max_length=120)
    city: Optional[str] = Field(default="Loja", max_length=80)
    email: str = Field(..., max_length=120)
    password: str = Field(..., min_length=8, max_length=128)
    bio: Optional[str] = Field(default=None, max_length=1000)
    instagram: Optional[str] = Field(default=None, max_length=120)
    website: Optional[str] = Field(default=None, max_length=300)
    turnstile_token: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Email inválido.")
        return v


class OrganizerLoginRequest(BaseModel):
    email: str = Field(..., max_length=120)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class OrganizerProfileResponse(BaseModel):
    id: str
    org_name: str
    display_name: str
    city: Optional[str]
    bio: Optional[str]
    logo_url: Optional[str]
    instagram: Optional[str]
    website: Optional[str]
    is_active: bool
    created_at: datetime


class OrganizerAuthResponse(BaseModel):
    ok: bool
    access_token: str
    refresh_token: str
    organizer: OrganizerProfileResponse


class OrganizerUpdateRequest(BaseModel):
    org_name: Optional[str] = Field(default=None, max_length=120)
    display_name: Optional[str] = Field(default=None, max_length=120)
    city: Optional[str] = Field(default=None, max_length=80)
    bio: Optional[str] = Field(default=None, max_length=1000)
    logo_url: Optional[str] = Field(default=None, max_length=500)
    instagram: Optional[str] = Field(default=None, max_length=120)
    website: Optional[str] = Field(default=None, max_length=300)


# ─── Organizer Events ─────────────────────────────────────────────────────────

class OrganizerEventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=300)
    description: Optional[str] = Field(default=None, max_length=8000)
    category: Optional[str] = Field(default=None, max_length=80)
    city: Optional[str] = Field(default="Loja", max_length=80)
    venue: Optional[str] = Field(default=None, max_length=200)
    address: Optional[str] = Field(default=None, max_length=400)
    event_date: str = Field(..., max_length=30)
    starts_at: Optional[str] = Field(default=None, max_length=50)
    ends_at: Optional[str] = Field(default=None, max_length=50)
    age_restriction: Optional[str] = Field(default=None, max_length=20)
    base_price: Optional[float] = Field(default=0.0, ge=0)
    capacity: Optional[int] = Field(default=None, ge=1)
    lineup_json: Optional[str] = None
    payment_info_json: Optional[str] = None


class OrganizerEventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=300)
    description: Optional[str] = Field(default=None, max_length=8000)
    category: Optional[str] = Field(default=None, max_length=80)
    city: Optional[str] = Field(default=None, max_length=80)
    venue: Optional[str] = Field(default=None, max_length=200)
    address: Optional[str] = Field(default=None, max_length=400)
    event_date: Optional[str] = Field(default=None, max_length=30)
    starts_at: Optional[str] = Field(default=None, max_length=50)
    ends_at: Optional[str] = Field(default=None, max_length=50)
    age_restriction: Optional[str] = Field(default=None, max_length=20)
    base_price: Optional[float] = Field(default=None, ge=0)
    capacity: Optional[int] = Field(default=None, ge=1)
    poster_url: Optional[str] = Field(default=None, max_length=500)
    banner_url: Optional[str] = Field(default=None, max_length=500)
    lineup_json: Optional[str] = None
    payment_info_json: Optional[str] = None
    tags: Optional[str] = None


class OrganizerEventResponse(BaseModel):
    id: str
    organizer_id: str
    slug: str
    title: str
    subtitle: Optional[str]
    description: Optional[str]
    category: Optional[str]
    city: str
    venue: Optional[str]
    address: Optional[str]
    event_date: str
    starts_at: Optional[str]
    ends_at: Optional[str]
    age_restriction: Optional[str]
    poster_url: Optional[str]
    banner_url: Optional[str]
    base_price: float
    capacity: Optional[int]
    tickets_sold: int
    lineup_json: Optional[str]
    status: str
    is_featured: bool
    published_at: Optional[str]
    created_at: str
    updated_at: str


# ─── Ticket Types ─────────────────────────────────────────────────────────────

class TicketTypeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(..., ge=0)
    capacity: Optional[int] = Field(default=None, ge=1)
    available_from: Optional[str] = None
    available_until: Optional[str] = None
    sort_order: Optional[int] = Field(default=0)


class TicketTypeUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=80)
    description: Optional[str] = Field(default=None, max_length=500)
    price: Optional[float] = Field(default=None, ge=0)
    capacity: Optional[int] = Field(default=None, ge=1)
    available_from: Optional[str] = None
    available_until: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class TicketTypeResponse(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    name: str
    description: Optional[str]
    price: float
    capacity: Optional[int]
    sold: int
    available_from: Optional[str]
    available_until: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime


# ─── Event Staff ──────────────────────────────────────────────────────────────

class EventStaffCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    role: str = Field(..., pattern="^(bar|taquilla|scanner|owner)$")
    password: str = Field(..., min_length=6, max_length=100)


class EventStaffResponse(BaseModel):
    id: str
    event_id: str
    name: str
    role: str
    is_active: bool
    created_at: str


# ─── Organizer Receipts ───────────────────────────────────────────────────────

class OrganizerReceiptResponse(BaseModel):
    id: str
    event_id: str
    ticket_type_id: Optional[str]
    first_name: str
    last_name: str
    quantity: int
    total_amount: float
    payment_method: str
    reference_number: Optional[str]
    file_path: str
    original_file_name: str
    status: str
    rejection_reason: Optional[str]
    serial_number: Optional[str]
    reviewed_at: Optional[str]
    created_at: str
