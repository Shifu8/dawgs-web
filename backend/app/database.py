"""
Configuración de la base de datos PostgreSQL (AWS RDS / Supabase / Railway) o SQLite/MySQL con motor SQLModel.
"""
import os
from sqlmodel import SQLModel, Session, create_engine


def get_database_url() -> str:
    url = os.getenv(
        "DATABASE_URL",
        os.getenv(
            "POSTGRES_URL",
            os.getenv("MYSQL_URL", "sqlite:///./dawgs_local.db")
        )
    )
    # Convert AWS RDS / Heroku / Supabase 'postgres://' URI to SQLAlchemy compliant 'postgresql://'
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


db_url = get_database_url()
is_sqlite = db_url.startswith("sqlite")

connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    db_url,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
    connect_args=connect_args,
    pool_pre_ping=not is_sqlite,
    pool_recycle=3600 if not is_sqlite else -1,
)


def init_db() -> None:
    """Crear todas las tablas en la base de datos (PostgreSQL AWS / MySQL / SQLite)."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency para inyectar sesiones de base de datos en cada request."""
    with Session(engine) as session:
        yield session
