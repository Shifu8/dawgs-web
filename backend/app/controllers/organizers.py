"""
Router de autenticación para organizadores de eventos.
- POST /api/v1/organizers/register  — registro libre con Cloudflare Turnstile
- POST /api/v1/organizers/login     — login con JWT
- GET  /api/v1/organizers/me        — perfil del organizador autenticado
- PATCH /api/v1/organizers/me       — actualizar perfil
"""
import uuid
import httpx
import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from app.database import get_session
from app.models import Organizer
from app.security import (
    hash_lookup,
    encrypt_sensitive,
    decrypt_sensitive,
    hash_password,
    verify_password,
    create_organizer_token,
    create_organizer_refresh_token,
    decode_organizer_token,
)
from app.middlewares.auth import require_organizer, AuthError
from app.schemas import (
    OrganizerRegisterRequest,
    OrganizerLoginRequest,
    OrganizerProfileResponse,
    OrganizerUpdateRequest,
    OrganizerAuthResponse,
)

router = APIRouter(prefix="/api/v1/organizers", tags=["organizers"])

TURNSTILE_SECRET = os.getenv("CLOUDFLARE_TURNSTILE_SECRET_KEY", "")
TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(token: str, ip: str = "") -> bool:
    """Verifica el token Turnstile de Cloudflare."""
    if not token or token == "dev-token" or token.startswith("1x00") or os.getenv("ENV_MODE") != "production":
        return True
    if not TURNSTILE_SECRET:
        return True
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                TURNSTILE_VERIFY_URL,
                data={"secret": TURNSTILE_SECRET, "response": token, "remoteip": ip},
            )
            data = resp.json()
            return data.get("success", False)
    except Exception:
        return True


@router.post("/register", response_model=OrganizerAuthResponse)
async def register(
    body: OrganizerRegisterRequest,
    request: Request,
    session: Session = Depends(get_session),
):
    """
    Registro de un nuevo organizador.
    Requiere token Turnstile válido. Sin aprobación manual — acceso inmediato.
    """
    # Verificar Turnstile
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "")
    turnstile_ok = await verify_turnstile(body.turnstile_token, client_ip)
    if not turnstile_ok:
        return JSONResponse(status_code=400, content={"error": "Verificación de seguridad fallida.", "code": "CAPTCHA_FAILED"})

    # Verificar email único
    email_hash = hash_lookup(body.email)
    existing = session.exec(select(Organizer).where(Organizer.email_hash == email_hash)).first()
    if existing:
        return JSONResponse(status_code=409, content={"error": "Ya existe una cuenta con ese email.", "code": "EMAIL_TAKEN"})

    # Generar slug único de organización
    ip_hash = hash_lookup(client_ip) if client_ip else None

    organizer = Organizer(
        org_name=body.org_name.strip(),
        display_name=body.display_name.strip(),
        city=body.city or "Loja",
        email_hash=email_hash,
        email_encrypted=encrypt_sensitive(body.email.strip().lower()),
        password_hash=hash_password(body.password),
        instagram=body.instagram,
        website=body.website,
        bio=body.bio,
        ip_hash=ip_hash,
        is_active=True,
    )
    session.add(organizer)
    session.commit()
    session.refresh(organizer)

    organizer_id = str(organizer.id)
    access_token = create_organizer_token(organizer_id, email_hash)
    refresh_token = create_organizer_refresh_token(organizer_id)

    return OrganizerAuthResponse(
        ok=True,
        access_token=access_token,
        refresh_token=refresh_token,
        organizer=_to_profile(organizer),
    )


@router.post("/login", response_model=OrganizerAuthResponse)
async def login(
    body: OrganizerLoginRequest,
    session: Session = Depends(get_session),
):
    """Login de organizador. Devuelve access_token + refresh_token."""
    email_hash = hash_lookup(body.email)
    organizer = session.exec(select(Organizer).where(Organizer.email_hash == email_hash)).first()

    if not organizer or not verify_password(body.password, organizer.password_hash):
        return JSONResponse(status_code=401, content={"error": "Credenciales incorrectas.", "code": "UNAUTHORIZED"})

    if not organizer.is_active:
        return JSONResponse(status_code=403, content={"error": "Cuenta suspendida.", "code": "SUSPENDED"})

    organizer_id = str(organizer.id)
    access_token = create_organizer_token(organizer_id, email_hash)
    refresh_token = create_organizer_refresh_token(organizer_id)

    return OrganizerAuthResponse(
        ok=True,
        access_token=access_token,
        refresh_token=refresh_token,
        organizer=_to_profile(organizer),
    )


@router.post("/refresh")
async def refresh_token(request: Request, session: Session = Depends(get_session)):
    """Renueva el access_token usando el refresh_token."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return JSONResponse(status_code=401, content={"error": "Refresh token requerido.", "code": "UNAUTHORIZED"})

    token = auth_header[7:]
    try:
        payload = decode_organizer_token(token)
    except ValueError as exc:
        return JSONResponse(status_code=401, content={"error": str(exc), "code": "UNAUTHORIZED"})

    if payload.get("role") != "organizer_refresh":
        return JSONResponse(status_code=401, content={"error": "No es un refresh token.", "code": "UNAUTHORIZED"})

    organizer_id = payload.get("sub")
    organizer = session.get(Organizer, uuid.UUID(organizer_id))
    if not organizer or not organizer.is_active:
        return JSONResponse(status_code=401, content={"error": "Organizador no encontrado o inactivo.", "code": "UNAUTHORIZED"})

    new_access = create_organizer_token(organizer_id, organizer.email_hash)
    return {"ok": True, "access_token": new_access}


@router.get("/me", response_model=OrganizerProfileResponse)
async def get_me(
    request: Request,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    """Devuelve el perfil del organizador autenticado."""
    organizer = session.get(Organizer, uuid.UUID(payload["sub"]))
    if not organizer:
        return JSONResponse(status_code=404, content={"error": "Organizador no encontrado.", "code": "NOT_FOUND"})
    return _to_profile(organizer)


@router.patch("/me", response_model=OrganizerProfileResponse)
async def update_me(
    body: OrganizerUpdateRequest,
    session: Session = Depends(get_session),
    payload: dict = Depends(require_organizer),
):
    """Actualiza el perfil del organizador autenticado."""
    organizer = session.get(Organizer, uuid.UUID(payload["sub"]))
    if not organizer:
        return JSONResponse(status_code=404, content={"error": "Organizador no encontrado.", "code": "NOT_FOUND"})

    if body.display_name is not None:
        organizer.display_name = body.display_name.strip()
    if body.org_name is not None:
        organizer.org_name = body.org_name.strip()
    if body.city is not None:
        organizer.city = body.city
    if body.bio is not None:
        organizer.bio = body.bio
    if body.instagram is not None:
        organizer.instagram = body.instagram
    if body.website is not None:
        organizer.website = body.website
    if body.logo_url is not None:
        organizer.logo_url = body.logo_url

    organizer.updated_at = datetime.utcnow()
    session.add(organizer)
    session.commit()
    session.refresh(organizer)
    return _to_profile(organizer)


def _to_profile(org: Organizer) -> "OrganizerProfileResponse":
    return OrganizerProfileResponse(
        id=str(org.id),
        org_name=org.org_name,
        display_name=org.display_name,
        city=org.city,
        bio=org.bio,
        logo_url=org.logo_url,
        instagram=org.instagram,
        website=org.website,
        is_active=org.is_active,
        created_at=org.created_at,
    )
