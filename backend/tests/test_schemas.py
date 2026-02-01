"""
Tests for Pydantic schemas
"""
from datetime import datetime
from unittest.mock import Mock

import pytest
from pydantic import ValidationError


def test_experiment_create_schema():
    """Test ExperimentCreate schema"""
    from app.schemas.experiment import ExperimentCreate

    experiment = ExperimentCreate(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
        sample_config={"sample_size": 100},
        experiment_config={"questions": ["q1", "q2"]},
    )

    assert experiment.name == "Test Experiment"
    assert experiment.description == "A test experiment"
    assert experiment.status == "draft"
    assert experiment.sample_config == {"sample_size": 100}
    assert experiment.experiment_config == {"questions": ["q1", "q2"]}
    assert experiment.execution_settings == {}
    assert experiment.meta_data == {}


def test_experiment_create_with_defaults():
    """Test ExperimentCreate with default values"""
    from app.schemas.experiment import ExperimentCreate

    experiment = ExperimentCreate(name="Test Experiment")

    assert experiment.name == "Test Experiment"
    assert experiment.description is None
    assert experiment.status == "draft"
    assert experiment.sample_config == {}
    assert experiment.experiment_config == {}
    assert experiment.execution_settings == {}
    assert experiment.meta_data == {}


def test_experiment_create_validation():
    """Test ExperimentCreate validation"""
    from app.schemas.experiment import ExperimentCreate

    # Name cannot be empty
    with pytest.raises(ValidationError):
        ExperimentCreate(name="")

    # Name too long
    with pytest.raises(ValidationError):
        ExperimentCreate(name="x" * 256)


def test_experiment_update_schema():
    """Test ExperimentUpdate schema"""
    from app.schemas.experiment import ExperimentUpdate

    # Update with partial data
    update = ExperimentUpdate(name="Updated Name")

    assert update.name == "Updated Name"
    assert update.description is None
    assert update.status is None

    # Update with all fields
    update_full = ExperimentUpdate(
        name="New Name",
        description="New description",
        status="active",
        sample_config={"new": "config"},
    )

    assert update_full.name == "New Name"
    assert update_full.description == "New description"
    assert update_full.status == "active"


def test_experiment_in_db_schema():
    """Test ExperimentInDB schema"""
    from app.schemas.experiment import ExperimentInDB

    now = datetime.utcnow()
    experiment_data = {
        "id": 1,
        "name": "Test Experiment",
        "description": "A test experiment",
        "status": "draft",
        "sample_config": {},
        "experiment_config": {},
        "execution_settings": {},
        "meta_data": {},
        "created_at": now,
        "updated_at": now,
    }

    experiment = ExperimentInDB(**experiment_data)

    assert experiment.id == 1
    assert experiment.name == "Test Experiment"
    assert experiment.created_at == now
    assert experiment.updated_at == now


def test_experiment_schema_from_model():
    """Test creating schema from ORM model"""
    from app.schemas.experiment import Experiment
    from app.models.experiment import Experiment as ExperimentModel

    # Create a mock model instance
    now = datetime.utcnow()
    mock_model = Mock(spec=ExperimentModel)
    mock_model.id = 1
    mock_model.name = "Test Experiment"
    mock_model.description = "A test experiment"
    mock_model.status = "draft"
    mock_model.sample_config = {}
    mock_model.experiment_config = {}
    mock_model.execution_settings = {}
    mock_model.meta_data = {}
    mock_model.created_at = now
    mock_model.updated_at = now

    # Create schema from model
    experiment = Experiment.model_validate(mock_model)

    assert experiment.id == 1
    assert experiment.name == "Test Experiment"
    assert experiment.status == "draft"
