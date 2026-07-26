"""
Endpoints públicos para búsqueda y visualización de eventos.
No requieren autenticación.

GET /api/v1/public/events        — listado público con filtros y búsqueda
GET /api/v1/public/events/{slug} — detalle de un evento publicado
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlmodel import Session, select, or_

from app.database import get_session
from app.models import OrganizerEvent, Organizer, TicketType

router = APIRouter(prefix="/api/v1/public", tags=["public-events"])


@router.get("/events")
async def list_public_events(
    q: Optional[str] = Query(default=None, max_length=100, description="Buscar por nombre de evento u organización"),
    city: Optional[str] = Query(default=None, max_length=80),
    category: Optional[str] = Query(default=None, max_length=80),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=50),
    session: Session = Depends(get_session),
):
    """
    Listado público de eventos publicados con búsqueda y filtros.
    Búsqueda por título de evento o nombre de organización.
    """
    query = (
        select(OrganizerEvent, Organizer)
        .join(Organizer, OrganizerEvent.organizer_id == Organizer.id)
        .where(OrganizerEvent.status == "published")
        .where(Organizer.is_active == True)
    )

    if q:
        search = f"%{q.lower()}%"
        query = query.where(
            or_(
                OrganizerEvent.title.ilike(search),
                OrganizerEvent.subtitle.ilike(search),
                Organizer.org_name.ilike(search),
                Organizer.display_name.ilike(search),
            )
        )

    if city:
        query = query.where(OrganizerEvent.city.ilike(f"%{city}%"))

    if category:
        query = query.where(OrganizerEvent.category.ilike(f"%{category}%"))

    query = query.order_by(OrganizerEvent.is_featured.desc(), OrganizerEvent.published_at.desc())

    offset = (page - 1) * per_page
    results = session.exec(query.offset(offset).limit(per_page)).all()

    events = []
    for event, organizer in results:
        ticket_types = session.exec(
            select(TicketType)
            .where(TicketType.event_id == event.id, TicketType.is_active == True)
            .order_by(TicketType.sort_order)
        ).all()

        events.append({
            "id": str(event.id),
            "slug": event.slug,
            "title": event.title,
            "subtitle": event.subtitle,
            "category": event.category,
            "city": event.city,
            "venue": event.venue,
            "event_date": event.event_date,
            "starts_at": event.starts_at,
            "age_restriction": event.age_restriction,
            "poster_url": event.poster_url,
            "base_price": event.base_price,
            "is_featured": event.is_featured,
            "organizer": {
                "id": str(organizer.id),
                "org_name": organizer.org_name,
                "display_name": organizer.display_name,
                "city": organizer.city,
                "logo_url": organizer.logo_url,
                "instagram": organizer.instagram,
            },
            "ticket_types": [
                {
                    "id": str(tt.id),
                    "name": tt.name,
                    "price": tt.price,
                    "capacity": tt.capacity,
                    "sold": tt.sold,
                    "available": (tt.capacity is None or tt.sold < tt.capacity),
                }
                for tt in ticket_types
            ],
        })

    return {"events": events, "page": page, "per_page": per_page, "count": len(events)}


@router.get("/events/{slug}")
async def get_public_event(slug: str, session: Session = Depends(get_session)):
    """Detalle público de un evento publicado por su slug."""
    result = session.exec(
        select(OrganizerEvent, Organizer)
        .join(Organizer, OrganizerEvent.organizer_id == Organizer.id)
        .where(OrganizerEvent.slug == slug, OrganizerEvent.status == "published")
    ).first()

    if not result:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    event, organizer = result

    ticket_types = session.exec(
        select(TicketType)
        .where(TicketType.event_id == event.id, TicketType.is_active == True)
        .order_by(TicketType.sort_order)
    ).all()

    return {
        "id": str(event.id),
        "slug": event.slug,
        "title": event.title,
        "subtitle": event.subtitle,
        "description": event.description,
        "category": event.category,
        "tags": event.tags,
        "city": event.city,
        "venue": event.venue,
        "address": event.address,
        "event_date": event.event_date,
        "starts_at": event.starts_at,
        "ends_at": event.ends_at,
        "age_restriction": event.age_restriction,
        "poster_url": event.poster_url,
        "banner_url": event.banner_url,
        "base_price": event.base_price,
        "capacity": event.capacity,
        "tickets_sold": event.tickets_sold,
        "lineup_json": event.lineup_json,
        "payment_info_json": event.payment_info_json,
        "is_featured": event.is_featured,
        "published_at": event.published_at.isoformat() if event.published_at else None,
        "organizer": {
            "id": str(organizer.id),
            "org_name": organizer.org_name,
            "display_name": organizer.display_name,
            "city": organizer.city,
            "bio": organizer.bio,
            "logo_url": organizer.logo_url,
            "instagram": organizer.instagram,
            "website": organizer.website,
        },
        "ticket_types": [
            {
                "id": str(tt.id),
                "name": tt.name,
                "description": tt.description,
                "price": tt.price,
                "capacity": tt.capacity,
                "sold": tt.sold,
                "available": (tt.capacity is None or tt.sold < tt.capacity),
                "available_from": tt.available_from,
                "available_until": tt.available_until,
            }
            for tt in ticket_types
        ],
    }


from app.security import hash_lookup, encrypt_sensitive
from app.models import OrganizerReceipt
from pydantic import BaseModel, EmailStr

class PublicReceiptSubmit(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    document: Optional[str] = None
    ticket_type_id: Optional[str] = None
    quantity: int = 1
    payment_method: str = "transferencia"
    reference_number: Optional[str] = None
    file_path: Optional[str] = "upload/placeholder.png"
    original_file_name: Optional[str] = "comprobante.png"
    file_size: Optional[int] = 1024
    mime_type: Optional[str] = "image/png"


@router.post("/events/{slug}/receipt")
async def submit_public_receipt(
    slug: str,
    body: PublicReceiptSubmit,
    session: Session = Depends(get_session),
):
    """Envía un comprobante de pago para un evento publicado."""
    event = session.exec(
        select(OrganizerEvent).where(OrganizerEvent.slug == slug, OrganizerEvent.status == "published")
    ).first()

    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    ticket_type = None
    unit_price = event.base_price
    if body.ticket_type_id:
        ticket_type = session.get(TicketType, uuid.UUID(body.ticket_type_id))
        if ticket_type:
            unit_price = ticket_type.price

    total_amount = unit_price * body.quantity

    receipt = OrganizerReceipt(
        event_id=event.id,
        ticket_type_id=ticket_type.id if ticket_type else None,
        first_name=body.first_name.strip(),
        last_name=body.last_name.strip(),
        phone_hash=hash_lookup(body.phone),
        phone_encrypted=encrypt_sensitive(body.phone.strip()),
        email_hash=hash_lookup(body.email),
        email_encrypted=encrypt_sensitive(body.email.strip().lower()),
        document_hash=hash_lookup(body.document) if body.document else None,
        document_encrypted=encrypt_sensitive(body.document.strip()) if body.document else None,
        quantity=body.quantity,
        total_amount=total_amount,
        payment_method=body.payment_method,
        reference_number=body.reference_number,
        file_path=body.file_path or "uploads/default.png",
        original_file_name=body.original_file_name or "comprobante.png",
        file_size=body.file_size or 0,
        mime_type=body.mime_type or "image/png",
        status="pendiente",
    )
    session.add(receipt)
    session.commit()
    session.refresh(receipt)

    return {
        "ok": True,
        "receipt_id": str(receipt.id),
        "status": "pendiente",
        "message": "Comprobante enviado exitosamente. El organizador lo revisará pronto.",
    }

