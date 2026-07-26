import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

# ─── Modelos Originales (preservados sin cambios) ──────────────────────────────

class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: Optional[str] = Field(default=None, index=True, unique=True)
    title: str
    subtitle: Optional[str] = ""
    location: Optional[str] = ""
    date: str
    time: str
    countdown_date: Optional[str] = ""
    price: float = Field(default=0.0)
    image_url: Optional[str] = ""
    description: Optional[str] = ""
    status: str = Field(default="active")
    is_featured: bool = Field(default=False)
    position: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Receipt(SQLModel, table=True):
    __tablename__ = "receipts"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: uuid.UUID = Field(index=True)
    first_name: str
    last_name: str
    phone_hash: str = Field(index=True)
    phone_encrypted: str
    email_hash: Optional[str] = Field(default=None, index=True)
    email_encrypted: Optional[str] = None
    document_hash: Optional[str] = None
    document_encrypted: Optional[str] = None
    quantity: int = Field(default=1)
    payment_method: str
    reference_number: Optional[str] = ""
    file_path: str
    original_file_name: str
    file_size: int
    mime_type: str
    status: str = Field(default="pendiente")
    ocr_result_json: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    ticket_design: Optional[str] = "0"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Ticket(SQLModel, table=True):
    __tablename__ = "tickets"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: str = Field(index=True)
    receipt_id: Optional[uuid.UUID] = Field(default=None, index=True)
    first_name: str
    last_name: str
    phone_hash: str = Field(index=True)
    phone_encrypted: str
    email_hash: str = Field(index=True)
    email_encrypted: str
    document_hash: str = Field(index=True)
    document_encrypted: str
    amount: float = Field(default=0.0)
    status: str = Field(default="pending")
    processor: str = Field(default="payphone")
    payment_token_hash: Optional[str] = None
    processor_ticket_number: Optional[str] = None
    processor_response_json: Optional[str] = None
    decline_reason: Optional[str] = None
    serial_number: Optional[str] = Field(default=None, index=True, unique=True)
    qr_payload_encrypted: Optional[str] = None
    ip_hash: Optional[str] = None
    user_agent_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    activated_at: Optional[datetime] = None


class PartyPass(SQLModel, table=True):
    __tablename__ = "party_passes"

    serial_number: str = Field(primary_key=True)
    code_hash: str = Field(index=True)
    event_id: str = Field(index=True)
    participant_id: uuid.UUID = Field(index=True)
    used: bool = Field(default=False)
    expires_at: datetime
    qr_payload_encrypted: str
    pass_type: str = Field(default="FOUNDING_DAWG")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    scanned_at: Optional[datetime] = None
    scanned_by: Optional[str] = None
    scan_ip_hash: Optional[str] = None
    scan_user_agent_hash: Optional[str] = None


class AdminLog(SQLModel, table=True):
    __tablename__ = "admin_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    action: str
    metadata_json: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RecoveryOtp(SQLModel, table=True):
    __tablename__ = "ticket_recovery_otps"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email_hash: str = Field(index=True)
    event_id: str = Field(index=True)
    ticket_id: str = Field(index=True)
    ticket_source: str
    code_hash: str
    expires_at: datetime
    attempts: int = Field(default=0)
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RecoveryLog(SQLModel, table=True):
    __tablename__ = "ticket_recovery_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email_hash: str = Field(index=True)
    event_id: str = Field(index=True)
    action: str
    ip_hash: Optional[str] = None
    user_agent_hash: Optional[str] = None
    metadata_json: Optional[str] = "{}"
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Modelos Multi-Tenant (Nuevos) ─────────────────────────────────────────────

class Organizer(SQLModel, table=True):
    """
    Cuenta de un organizador de eventos.
    Se registran libremente — no requieren aprobación del super admin.
    """
    __tablename__ = "organizers"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    # Datos públicos
    org_name: str = Field(index=True, max_length=120)
    display_name: str = Field(max_length=120)
    city: Optional[str] = Field(default="Loja", max_length=80)
    bio: Optional[str] = Field(default=None, max_length=1000)
    logo_url: Optional[str] = Field(default=None, max_length=500)
    instagram: Optional[str] = Field(default=None, max_length=120)
    website: Optional[str] = Field(default=None, max_length=300)

    # Credenciales (datos sensibles cifrados / hasheados)
    email_hash: str = Field(index=True, unique=True)
    email_encrypted: str
    password_hash: str

    # Estado — siempre activo al registrarse
    is_active: bool = Field(default=True)

    # Metadata
    ip_hash: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OrganizerEvent(SQLModel, table=True):
    """
    Evento creado por un organizador via la plataforma pública.
    """
    __tablename__ = "organizer_events"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    organizer_id: uuid.UUID = Field(index=True, foreign_key="organizers.id")

    # Identidad
    slug: str = Field(index=True, unique=True, max_length=120)
    title: str = Field(max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=300)
    description: Optional[str] = Field(default=None, max_length=8000)
    category: Optional[str] = Field(default=None, max_length=80)
    tags: Optional[str] = Field(default=None, max_length=500)  # JSON array

    # Lugar y tiempo
    city: str = Field(default="Loja", max_length=80)
    venue: Optional[str] = Field(default=None, max_length=200)
    address: Optional[str] = Field(default=None, max_length=400)
    event_date: str = Field(max_length=30)
    starts_at: Optional[str] = Field(default=None, max_length=50)
    ends_at: Optional[str] = Field(default=None, max_length=50)
    age_restriction: Optional[str] = Field(default=None, max_length=20)

    # Imágenes
    poster_url: Optional[str] = Field(default=None, max_length=500)
    banner_url: Optional[str] = Field(default=None, max_length=500)

    # Aforo
    capacity: Optional[int] = Field(default=None)
    tickets_sold: int = Field(default=0)
    base_price: float = Field(default=0.0)

    # Line-up como JSON
    lineup_json: Optional[str] = Field(default=None)

    # Estado
    status: str = Field(default="draft")  # draft | published | cancelled | finished
    is_featured: bool = Field(default=False)
    published_at: Optional[datetime] = Field(default=None)

    # Info de pago del organizador (instrucciones de transferencia en JSON)
    payment_info_json: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TicketType(SQLModel, table=True):
    """
    Tipo de entrada para un OrganizerEvent.
    Ej: General $10, VIP $25, Early Bird $8
    """
    __tablename__ = "ticket_types"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: uuid.UUID = Field(index=True, foreign_key="organizer_events.id")
    name: str = Field(max_length=80)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(default=0.0)
    capacity: Optional[int] = Field(default=None)
    sold: int = Field(default=0)
    available_from: Optional[str] = Field(default=None, max_length=50)
    available_until: Optional[str] = Field(default=None, max_length=50)
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EventStaffRole(SQLModel, table=True):
    """
    Rol de un miembro del equipo en un OrganizerEvent.
    El organizador asigna bar admins, taquilla y staff de scanner.
    """
    __tablename__ = "event_staff_roles"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: uuid.UUID = Field(index=True, foreign_key="organizer_events.id")
    organizer_id: uuid.UUID = Field(index=True, foreign_key="organizers.id")
    name: str = Field(max_length=120)
    role: str = Field(max_length=40)  # bar | taquilla | scanner | owner
    password_hash: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class OrganizerReceipt(SQLModel, table=True):
    """
    Comprobante de pago subido por un comprador para un OrganizerEvent.
    El organizador lo revisa y aprueba (igual que el flujo actual de Access Drop).
    """
    __tablename__ = "organizer_receipts"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: uuid.UUID = Field(index=True, foreign_key="organizer_events.id")
    ticket_type_id: Optional[uuid.UUID] = Field(default=None, foreign_key="ticket_types.id")

    # Datos del comprador (cifrados)
    first_name: str
    last_name: str
    phone_hash: str = Field(index=True)
    phone_encrypted: str
    email_hash: str = Field(index=True)
    email_encrypted: str
    document_hash: Optional[str] = None
    document_encrypted: Optional[str] = None

    quantity: int = Field(default=1)
    total_amount: float = Field(default=0.0)
    payment_method: str = Field(default="transferencia")
    reference_number: Optional[str] = Field(default=None, max_length=100)

    # Comprobante
    file_path: str
    original_file_name: str
    file_size: int
    mime_type: str

    status: str = Field(default="pendiente")  # pendiente | aprobado | rechazado
    reviewed_by: Optional[str] = Field(default=None)
    reviewed_at: Optional[datetime] = Field(default=None)
    rejection_reason: Optional[str] = Field(default=None, max_length=500)

    serial_number: Optional[str] = Field(default=None, index=True, unique=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
