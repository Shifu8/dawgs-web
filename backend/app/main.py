import os
import fastapi
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import init_db
from app.middlewares.auth import AuthError

# Importar todos los routers
from app.controllers.auth import router as auth_router
from app.controllers.events import router as events_router
from app.controllers.admin_receipts import router as admin_receipts_router
from app.controllers.passes import router as passes_router
from app.controllers.organizers import router as organizers_router
from app.controllers.organizer_events import router as organizer_events_router
from app.controllers.public_events import router as public_events_router
from app.controllers.superadmin import router as superadmin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar la base de datos (crear tablas si no existen)
    try:
        init_db()
    except Exception as e:
        print(f"[WARN] Error inicializando base de datos: {e}")
    yield


app = FastAPI(
    title="Dawgs Web API Core",
    description="Backend asíncrono en Python para Dawgs Web (Nenez Web)",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENV_MODE") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENV_MODE") != "production" else None,
    lifespan=lifespan,
)

# CORS Setup
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handlers
@app.exception_handler(AuthError)
async def auth_error_handler(request: Request, exc: AuthError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "code": exc.code}
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": str(exc), "code": "VALIDATION_ERROR"}
    )

@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": str(exc), "code": "INTERNAL_ERROR"}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": f"Error interno en el servidor: {str(exc)}", "code": "INTERNAL_ERROR"}
    )

# Incluir routers
app.include_router(auth_router)
app.include_router(events_router)
app.include_router(admin_receipts_router)
app.include_router(passes_router)
# Multi-tenant platform routers
app.include_router(organizers_router)
app.include_router(organizer_events_router)
app.include_router(public_events_router)
app.include_router(superadmin_router)

@app.get("/health")
async def health_check():
    return {"ok": True, "service": "dawgs-api-core", "version": "1.0.0"}
