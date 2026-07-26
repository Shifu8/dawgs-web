"""
Router de gestión de eventos para organizadores.
Cada organizador solo puede ver y editar sus propios eventos.

Endpoints:
  GET    /api/v1/organizer/events              — listar mis eventos
  POST   /api/v1/organizer/events              — crear evento
  GET    /api/v1/organizer/events/{id}         — ver evento
  PATCH  /api/v1/organizer/events/{id}         — editar evento
  DELETE /api/v1/organizer/events/{id}         — eliminar evento (solo draft)
  POST   /api/v1/organizer/events/{id}/publish — publicar evento
  GET    /api/v1/organizer/events/{id}/stats   — estadísticas de ventas
  GET    /api/v1/organizer/events/{id}/tickets — lista de comprobantes
  PATCH  /api/v1/organizer/events/{id}/tickets/{tid}/review — aprobar/rechazar comprobante

  -- Tipos de entrada --
  GET    /api/v1/organizer/events/{id}/ticket-types
  POST   /api/v1/organizer/events/{id}/ticket-types
  PATCH  /api/v1/organizer/events/{id}/ticket-types/{ttid}
  DELETE /api/v1/organizer/events/{id}/ticket-types/{ttid}

  -- Staff --
  GET    /api/v1/organizer/events/{id}/staff
  POST   /api/v1/organizer/events/{id}/staff
  DELETE /api/v1/organizer/events/{id}/staff/{sid}
"""
import uuid
import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import OrganizerEvent, TicketType, EventStaffRole, OrganizerReceipt, Organizer
from app.security import hash_password
from app.middlewares.auth import require_organizer
from app.schemas import (
    OrganizerEventCreate,
    OrganizerEventUpdate,
    OrganizerEventResponse,
    TicketTypeCreate,
    TicketTypeUpdate,
    TicketTypeResponse,
    EventStaffCreate,
    EventStaffResponse,
    OrganizerReceiptResponse,
    ReceiptReviewRequest,
)

router = APIRouter(prefix="/api/v1/organizer", tags=["organizer-events"])


def _get_own_event(event_id: str, organizer_id: str, session: Session) -> OrganizerEvent | None:
    """Fetch event only if it belongs to this organizer."""
    return session.exec(
        select(OrganizerEvent).where(
            OrganizerEvent.id == uuid.UUID(event_id),
            OrganizerEvent.organizer_id == uuid.UUID(organizer_id),
        )
    ).first()


def _slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r"[áàäâ]", "a", slug)
    slug = re.sub(r"[éèëê]", "e", slug)
    slug = re.sub(r"[íìïî]", "i", slug)
    slug = re.sub(r"[óòöô]", "o", slug)
    slug = re.sub(r"[úùüû]", "u", slug)
    slug = re.sub(r"[ñ]", "n", slug)
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug[:100]


# ─── Events CRUD ──────────────────────────────────────────────────────────────

@router.get("/events", response_model=List[OrganizerEventResponse])
async def list_my_events(
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    organizer_id = payload["sub"]
    events = session.exec(
        select(OrganizerEvent)
        .where(OrganizerEvent.organizer_id == uuid.UUID(organizer_id))
        .order_by(OrganizerEvent.created_at.desc())
    ).all()
    return [_event_to_response(e) for e in events]


@router.post("/events", response_model=OrganizerEventResponse)
async def create_event(
    body: OrganizerEventCreate,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    organizer_id = payload["sub"]

    # Generate unique slug
    base_slug = _slugify(body.title)
    slug = base_slug
    counter = 1
    while session.exec(select(OrganizerEvent).where(OrganizerEvent.slug == slug)).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    event = OrganizerEvent(
        organizer_id=uuid.UUID(organizer_id),
        slug=slug,
        title=body.title.strip(),
        subtitle=body.subtitle,
        description=body.description,
        category=body.category,
        city=body.city or "Loja",
        venue=body.venue,
        address=body.address,
        event_date=body.event_date,
        starts_at=body.starts_at,
        ends_at=body.ends_at,
        age_restriction=body.age_restriction,
        base_price=body.base_price or 0.0,
        capacity=body.capacity,
        lineup_json=body.lineup_json,
        payment_info_json=body.payment_info_json,
        status="draft",
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return _event_to_response(event)


@router.get("/events/{event_id}", response_model=OrganizerEventResponse)
async def get_event(
    event_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})
    return _event_to_response(event)


@router.patch("/events/{event_id}", response_model=OrganizerEventResponse)
async def update_event(
    event_id: str,
    body: OrganizerEventUpdate,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(event, field, value)
    event.updated_at = datetime.utcnow()

    session.add(event)
    session.commit()
    session.refresh(event)
    return _event_to_response(event)


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})
    if event.status != "draft":
        return JSONResponse(status_code=409, content={"error": "Solo se pueden eliminar eventos en borrador.", "code": "CONFLICT"})

    session.delete(event)
    session.commit()
    return {"ok": True, "message": "Evento eliminado."}


@router.post("/events/{event_id}/publish")
async def publish_event(
    event_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    if event.status == "published":
        return JSONResponse(status_code=409, content={"error": "El evento ya está publicado.", "code": "ALREADY_PUBLISHED"})

    event.status = "published"
    event.published_at = datetime.utcnow()
    event.updated_at = datetime.utcnow()
    session.add(event)
    session.commit()
    return {"ok": True, "message": "Evento publicado.", "slug": event.slug}


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/events/{event_id}/stats")
async def get_event_stats(
    event_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    total_receipts = session.exec(
        select(func.count(OrganizerReceipt.id)).where(OrganizerReceipt.event_id == event.id)
    ).one()
    approved = session.exec(
        select(func.count(OrganizerReceipt.id)).where(
            OrganizerReceipt.event_id == event.id,
            OrganizerReceipt.status == "aprobado",
        )
    ).one()
    pending = session.exec(
        select(func.count(OrganizerReceipt.id)).where(
            OrganizerReceipt.event_id == event.id,
            OrganizerReceipt.status == "pendiente",
        )
    ).one()
    rejected = session.exec(
        select(func.count(OrganizerReceipt.id)).where(
            OrganizerReceipt.event_id == event.id,
            OrganizerReceipt.status == "rechazado",
        )
    ).one()
    total_revenue = session.exec(
        select(func.coalesce(func.sum(OrganizerReceipt.total_amount), 0)).where(
            OrganizerReceipt.event_id == event.id,
            OrganizerReceipt.status == "aprobado",
        )
    ).one()

    # Tickets por tipo
    ticket_types = session.exec(
        select(TicketType).where(TicketType.event_id == event.id)
    ).all()

    return {
        "event_id": str(event.id),
        "event_title": event.title,
        "status": event.status,
        "capacity": event.capacity,
        "tickets_sold": event.tickets_sold,
        "receipts": {
            "total": total_receipts,
            "approved": approved,
            "pending": pending,
            "rejected": rejected,
        },
        "revenue": float(total_revenue),
        "ticket_types": [
            {"name": tt.name, "price": tt.price, "sold": tt.sold, "capacity": tt.capacity}
            for tt in ticket_types
        ],
    }


# ─── Ticket Types ─────────────────────────────────────────────────────────────

@router.get("/events/{event_id}/ticket-types", response_model=List[TicketTypeResponse])
async def list_ticket_types(
    event_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    types = session.exec(
        select(TicketType)
        .where(TicketType.event_id == event.id)
        .order_by(TicketType.sort_order)
    ).all()
    return types


@router.post("/events/{event_id}/ticket-types", response_model=TicketTypeResponse)
async def create_ticket_type(
    event_id: str,
    body: TicketTypeCreate,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    tt = TicketType(
        event_id=event.id,
        name=body.name,
        description=body.description,
        price=body.price,
        capacity=body.capacity,
        available_from=body.available_from,
        available_until=body.available_until,
        sort_order=body.sort_order or 0,
    )
    session.add(tt)
    session.commit()
    session.refresh(tt)
    return tt


@router.patch("/events/{event_id}/ticket-types/{tt_id}", response_model=TicketTypeResponse)
async def update_ticket_type(
    event_id: str,
    tt_id: str,
    body: TicketTypeUpdate,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    tt = session.exec(
        select(TicketType).where(TicketType.id == uuid.UUID(tt_id), TicketType.event_id == event.id)
    ).first()
    if not tt:
        return JSONResponse(status_code=404, content={"error": "Tipo de entrada no encontrado.", "code": "NOT_FOUND"})

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(tt, field, value)
    session.add(tt)
    session.commit()
    session.refresh(tt)
    return tt


@router.delete("/events/{event_id}/ticket-types/{tt_id}")
async def delete_ticket_type(
    event_id: str,
    tt_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    tt = session.exec(
        select(TicketType).where(TicketType.id == uuid.UUID(tt_id), TicketType.event_id == event.id)
    ).first()
    if not tt:
        return JSONResponse(status_code=404, content={"error": "Tipo de entrada no encontrado.", "code": "NOT_FOUND"})

    session.delete(tt)
    session.commit()
    return {"ok": True}


# ─── Staff Roles ──────────────────────────────────────────────────────────────

@router.get("/events/{event_id}/staff", response_model=List[EventStaffResponse])
async def list_staff(
    event_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    staff = session.exec(
        select(EventStaffRole).where(EventStaffRole.event_id == event.id)
    ).all()
    return [_staff_to_response(s) for s in staff]


@router.post("/events/{event_id}/staff", response_model=EventStaffResponse)
async def create_staff(
    event_id: str,
    body: EventStaffCreate,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    staff = EventStaffRole(
        event_id=event.id,
        organizer_id=uuid.UUID(payload["sub"]),
        name=body.name,
        role=body.role,
        password_hash=hash_password(body.password),
    )
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return _staff_to_response(staff)


@router.delete("/events/{event_id}/staff/{staff_id}")
async def delete_staff(
    event_id: str,
    staff_id: str,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    staff = session.exec(
        select(EventStaffRole).where(
            EventStaffRole.id == uuid.UUID(staff_id),
            EventStaffRole.event_id == event.id,
        )
    ).first()
    if not staff:
        return JSONResponse(status_code=404, content={"error": "Staff no encontrado.", "code": "NOT_FOUND"})

    session.delete(staff)
    session.commit()
    return {"ok": True}


# ─── Receipts (Taquilla) ──────────────────────────────────────────────────────

@router.get("/events/{event_id}/tickets", response_model=List[OrganizerReceiptResponse])
async def list_receipts(
    event_id: str,
    status: Optional[str] = None,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    query = select(OrganizerReceipt).where(OrganizerReceipt.event_id == event.id)
    if status:
        query = query.where(OrganizerReceipt.status == status)
    receipts = session.exec(query.order_by(OrganizerReceipt.created_at.desc())).all()
    return [_receipt_to_response(r) for r in receipts]


@router.patch("/events/{event_id}/tickets/{receipt_id}/review")
async def review_receipt(
    event_id: str,
    receipt_id: str,
    body: ReceiptReviewRequest,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    event = _get_own_event(event_id, payload["sub"], session)
    if not event:
        return JSONResponse(status_code=404, content={"error": "Evento no encontrado.", "code": "NOT_FOUND"})

    receipt = session.exec(
        select(OrganizerReceipt).where(
            OrganizerReceipt.id == uuid.UUID(receipt_id),
            OrganizerReceipt.event_id == event.id,
        )
    ).first()
    if not receipt:
        return JSONResponse(status_code=404, content={"error": "Comprobante no encontrado.", "code": "NOT_FOUND"})

    if receipt.status != "pendiente":
        return JSONResponse(status_code=409, content={"error": "Comprobante ya revisado.", "code": "ALREADY_REVIEWED"})

    if body.action == "approve":
        receipt.status = "aprobado"
        # Increment sold count
        event.tickets_sold += receipt.quantity
    else:
        receipt.status = "rechazado"
        receipt.rejection_reason = body.rejection_reason

    receipt.reviewed_by = payload["sub"]
    receipt.reviewed_at = datetime.utcnow()
    receipt.updated_at = datetime.utcnow()
    session.add(receipt)
    session.add(event)
    session.commit()

    return {"ok": True, "status": receipt.status}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _event_to_response(e: OrganizerEvent) -> dict:
    return {
        "id": str(e.id),
        "organizer_id": str(e.organizer_id),
        "slug": e.slug,
        "title": e.title,
        "subtitle": e.subtitle,
        "description": e.description,
        "category": e.category,
        "city": e.city,
        "venue": e.venue,
        "address": e.address,
        "event_date": e.event_date,
        "starts_at": e.starts_at,
        "ends_at": e.ends_at,
        "age_restriction": e.age_restriction,
        "poster_url": e.poster_url,
        "banner_url": e.banner_url,
        "base_price": e.base_price,
        "capacity": e.capacity,
        "tickets_sold": e.tickets_sold,
        "lineup_json": e.lineup_json,
        "status": e.status,
        "is_featured": e.is_featured,
        "published_at": e.published_at.isoformat() if e.published_at else None,
        "created_at": e.created_at.isoformat(),
        "updated_at": e.updated_at.isoformat(),
    }


def _staff_to_response(s: EventStaffRole) -> dict:
    return {
        "id": str(s.id),
        "event_id": str(s.event_id),
        "name": s.name,
        "role": s.role,
        "is_active": s.is_active,
        "created_at": s.created_at.isoformat(),
    }


def _receipt_to_response(r: OrganizerReceipt) -> dict:
    return {
        "id": str(r.id),
        "event_id": str(r.event_id),
        "ticket_type_id": str(r.ticket_type_id) if r.ticket_type_id else None,
        "first_name": r.first_name,
        "last_name": r.last_name,
        "quantity": r.quantity,
        "total_amount": r.total_amount,
        "payment_method": r.payment_method,
        "reference_number": r.reference_number,
        "file_path": r.file_path,
        "original_file_name": r.original_file_name,
        "status": r.status,
        "rejection_reason": r.rejection_reason,
        "serial_number": r.serial_number,
        "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
        "created_at": r.created_at.isoformat(),
    }
