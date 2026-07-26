"""
Super Admin — Dashboard de solo lectura.
Usa las credenciales de admin existentes (cookie JWT de staff/admin).
Solo puede VER estadísticas, eventos y organizadores. No puede modificar nada.
"""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import OrganizerEvent, Organizer, OrganizerReceipt, TicketType
from app.middlewares.auth import require_admin

router = APIRouter(prefix="/api/v1/superadmin", tags=["superadmin"])


@router.get("/stats")
async def global_stats(
    session: Session = Depends(get_session),
    _admin: dict = Depends(require_admin),
):
    """Métricas globales de la plataforma."""
    total_organizers = session.exec(select(func.count(Organizer.id))).one()
    active_organizers = session.exec(
        select(func.count(Organizer.id)).where(Organizer.is_active == True)
    ).one()

    total_events = session.exec(select(func.count(OrganizerEvent.id))).one()
    published_events = session.exec(
        select(func.count(OrganizerEvent.id)).where(OrganizerEvent.status == "published")
    ).one()
    draft_events = session.exec(
        select(func.count(OrganizerEvent.id)).where(OrganizerEvent.status == "draft")
    ).one()

    total_receipts = session.exec(select(func.count(OrganizerReceipt.id))).one()
    approved_receipts = session.exec(
        select(func.count(OrganizerReceipt.id)).where(OrganizerReceipt.status == "aprobado")
    ).one()
    total_revenue = session.exec(
        select(func.coalesce(func.sum(OrganizerReceipt.total_amount), 0)).where(
            OrganizerReceipt.status == "aprobado"
        )
    ).one()

    # Ciudades activas
    cities = session.exec(
        select(OrganizerEvent.city, func.count(OrganizerEvent.id))
        .where(OrganizerEvent.status == "published")
        .group_by(OrganizerEvent.city)
        .order_by(func.count(OrganizerEvent.id).desc())
    ).all()

    return {
        "organizers": {
            "total": total_organizers,
            "active": active_organizers,
        },
        "events": {
            "total": total_events,
            "published": published_events,
            "draft": draft_events,
        },
        "receipts": {
            "total": total_receipts,
            "approved": approved_receipts,
        },
        "revenue_total": float(total_revenue),
        "cities": [{"city": city, "events": count} for city, count in cities],
    }


@router.get("/organizers")
async def list_all_organizers(
    page: int = 1,
    per_page: int = 50,
    session: Session = Depends(get_session),
    _admin: dict = Depends(require_admin),
):
    """Lista todos los organizadores registrados en la plataforma."""
    offset = (page - 1) * per_page
    organizers = session.exec(
        select(Organizer)
        .order_by(Organizer.created_at.desc())
        .offset(offset)
        .limit(per_page)
    ).all()

    return {
        "organizers": [
            {
                "id": str(org.id),
                "org_name": org.org_name,
                "display_name": org.display_name,
                "city": org.city,
                "is_active": org.is_active,
                "created_at": org.created_at.isoformat(),
            }
            for org in organizers
        ],
        "page": page,
        "per_page": per_page,
        "count": len(organizers),
    }


@router.get("/events")
async def list_all_events(
    status: str = None,
    page: int = 1,
    per_page: int = 50,
    session: Session = Depends(get_session),
    _admin: dict = Depends(require_admin),
):
    """Lista todos los eventos de todos los organizadores."""
    offset = (page - 1) * per_page
    query = (
        select(OrganizerEvent, Organizer)
        .join(Organizer, OrganizerEvent.organizer_id == Organizer.id)
        .order_by(OrganizerEvent.created_at.desc())
    )
    if status:
        query = query.where(OrganizerEvent.status == status)

    results = session.exec(query.offset(offset).limit(per_page)).all()

    return {
        "events": [
            {
                "id": str(event.id),
                "slug": event.slug,
                "title": event.title,
                "city": event.city,
                "event_date": event.event_date,
                "status": event.status,
                "tickets_sold": event.tickets_sold,
                "base_price": event.base_price,
                "is_featured": event.is_featured,
                "organizer": {
                    "id": str(org.id),
                    "org_name": org.org_name,
                    "display_name": org.display_name,
                },
                "created_at": event.created_at.isoformat(),
                "published_at": event.published_at.isoformat() if event.published_at else None,
            }
            for event, org in results
        ],
        "page": page,
        "per_page": per_page,
        "count": len(results),
    }
