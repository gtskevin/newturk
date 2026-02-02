"""
API dependencies
"""
from typing import Generator

from app.database import get_db as database_get_db


def get_db() -> Generator:
    """
    Dependency function to get database session for API endpoints

    Yields:
        Database session
    """
    yield from database_get_db()
