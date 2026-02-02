"""
Pytest configuration and shared fixtures
"""
from typing import Generator

import pytest
from sqlalchemy.orm import Session


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Create a test database session"""
    from app.database import Base, engine, SessionLocal

    # Import all models to ensure they're registered with Base
    from app.models import Experiment, Participant, Response  # noqa: F401

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create session
    session = SessionLocal()

    yield session

    # Cleanup - rollback and close session
    session.rollback()
    session.close()

    # Drop all tables
    Base.metadata.drop_all(bind=engine)
