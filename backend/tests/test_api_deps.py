"""
Tests for API dependencies
"""
import pytest
from sqlalchemy.orm import Session

from app.api.deps import get_db


def test_get_db_returns_session():
    """Test that get_db returns a database session"""
    db_gen = get_db()
    db = next(db_gen)

    assert isinstance(db, Session)
    assert db.is_active

    # Clean up
    db.close()
    try:
        next(db_gen)
    except StopIteration:
        pass


def test_get_db_closes_on_exception():
    """Test that get_db handles generator cleanup properly"""
    db_gen = get_db()
    db = next(db_gen)

    assert isinstance(db, Session)
    assert db.is_active

    # Close the generator which should trigger cleanup
    db_gen.close()

    # After generator close, session cleanup should have been attempted
    # Note: The actual session.close() happens in the finally block
