"""
Tests for database module
"""
from unittest.mock import Mock, patch

import pytest


def test_engine_creation():
    """Test that database engine is created correctly"""
    from app.database import engine
    from app.config import settings

    # Check that engine exists
    assert engine is not None

    # Check that engine URL matches config (password will be masked)
    assert str(engine.url).startswith("postgresql+psycopg://")
    assert settings.postgres_db in str(engine.url)


def test_session_factory():
    """Test that session factory exists and can create sessions"""
    from app.database import SessionLocal

    # Check that SessionLocal exists
    assert SessionLocal is not None

    # Check that we can create a session
    session = SessionLocal()
    assert session is not None

    # Clean up
    session.close()


def test_base_exists():
    """Test that SQLAlchemy declarative base exists"""
    from app.database import Base

    # Check that Base exists
    assert Base is not None

    # Check that Base has metadata
    assert Base.metadata is not None


def test_get_db():
    """Test that get_db generator function works"""
    from app.database import get_db

    # Get a database session
    db_gen = get_db()
    db = next(db_gen)

    # Check that we got a session
    assert db is not None

    # Clean up
    db.close()
    try:
        next(db_gen)
    except StopIteration:
        pass


@patch("app.database.Base")
def test_init_db_calls_create_all(mock_base):
    """Test that init_db creates all tables"""
    from app.database import init_db

    # Call init_db
    init_db()

    # Check that create_all was called
    mock_base.metadata.create_all.assert_called_once()
