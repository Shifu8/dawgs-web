"""
Tests para endpoints y flujos de organizadores en FastAPI backend.
"""
import os
import pytest

os.environ.setdefault("QR_HASH_SECRET", "test-hash-secret-only")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-minimum-32-bytes-long")

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


class TestOrganizerAuth:
    def test_register_organizer_success(self, client: TestClient):
        response = client.post(
            "/api/v1/organizers/register",
            json={
                "org_name": "Productora Guayaquil",
                "display_name": "Guayaquil Fest",
                "city": "Guayaquil",
                "email": "org@guayaquilfest.com",
                "password": "Password123!",
                "turnstile_token": "test-token",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert "access_token" in data
        assert data["organizer"]["org_name"] == "Productora Guayaquil"

    def test_register_duplicate_email(self, client: TestClient):
        payload = {
            "org_name": "Org Quito",
            "display_name": "Quito Fest",
            "city": "Quito",
            "email": "dupe@quito.com",
            "password": "Password123!",
            "turnstile_token": "test-token",
        }
        r1 = client.post("/api/v1/organizers/register", json=payload)
        assert r1.status_code == 200

        r2 = client.post("/api/v1/organizers/register", json=payload)
        assert r2.status_code == 409
        assert r2.json()["code"] == "EMAIL_TAKEN"

    def test_login_organizer(self, client: TestClient):
        client.post(
            "/api/v1/organizers/register",
            json={
                "org_name": "Org Cuenca",
                "display_name": "Cuenca Events",
                "city": "Cuenca",
                "email": "contact@cuenca.com",
                "password": "SecretPassword123!",
                "turnstile_token": "test-token",
            },
        )

        login_resp = client.post(
            "/api/v1/organizers/login",
            json={
                "email": "contact@cuenca.com",
                "password": "SecretPassword123!",
            },
        )
        assert login_resp.status_code == 200
        assert "access_token" in login_resp.json()
