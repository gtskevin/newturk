"""
Tests for configuration module
"""
import os
from pathlib import Path
from typing import Generator

import pytest


@pytest.fixture
def clean_env() -> Generator[None, None, None]:
    """Fixture to clean environment before and after tests"""
    # Save original env
    original_env = os.environ.copy()

    # Clear relevant env vars
    for key in list(os.environ.keys()):
        if key.startswith(("POSTGRES_", "DATABASE_", "OPENAI_", "APP_")):
            del os.environ[key]

    yield

    # Restore original env
    os.environ.clear()
    os.environ.update(original_env)

    # Clear the settings cache
    from app.config import get_settings

    get_settings.cache_clear()


def test_config_with_env_vars(clean_env, tmp_path: Path):
    """Test that configuration loads from environment variables"""
    # Import and clear cache first
    from app.config import Settings

    # Set test environment variables
    os.environ["POSTGRES_USER"] = "testuser"
    os.environ["POSTGRES_PASSWORD"] = "testpass"
    os.environ["POSTGRES_DB"] = "testdb"
    os.environ["POSTGRES_HOST"] = "localhost"
    os.environ["POSTGRES_PORT"] = "5432"
    os.environ["OPENAI_API_KEY"] = "sk-test-key"
    os.environ["APP_ENVIRONMENT"] = "development"

    # Create new settings instance
    settings = Settings()

    assert settings.postgres_user == "testuser"
    assert settings.postgres_password == "testpass"
    assert settings.postgres_db == "testdb"
    assert settings.postgres_host == "localhost"
    assert settings.postgres_port == 5432
    assert settings.openai_api_key == "sk-test-key"
    assert settings.app_environment == "development"


def test_database_url_construction(clean_env):
    """Test that database URL is constructed correctly"""
    from app.config import Settings

    os.environ["POSTGRES_USER"] = "dbuser"
    os.environ["POSTGRES_PASSWORD"] = "dbpass"
    os.environ["POSTGRES_DB"] = "dbname"
    os.environ["POSTGRES_HOST"] = "dbhost"
    os.environ["POSTGRES_PORT"] = "5432"

    settings = Settings()

    expected_url = "postgresql+psycopg://dbuser:dbpass@dbhost:5432/dbname"
    assert settings.database_url == expected_url


def test_config_defaults(clean_env):
    """Test that configuration has sensible defaults"""
    from app.config import Settings

    # Set only required fields
    os.environ["POSTGRES_DB"] = "testdb"

    settings = Settings()

    # Check defaults
    assert settings.postgres_host == "localhost"
    assert settings.postgres_port == 5432
    assert settings.app_environment == "development"
