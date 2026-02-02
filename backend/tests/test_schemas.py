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


def test_single_choice_question_schema():
    """Test single choice question structure"""
    from app.schemas.experiment import SingleChoiceQuestion

    question = {
        "id": "Q_001",
        "type": "single",
        "title": "What is your age?",
        "description": "Please select one",
        "required": True,
        "order": 0,
        "options": [
            {"id": "OPT_1", "label": "18-25", "value": "18-25", "order": 0},
            {"id": "OPT_2", "label": "26-35", "value": "26-35", "order": 1},
        ],
        "layout": "vertical",
        "randomize": False
    }

    validated = SingleChoiceQuestion(**question)
    assert validated.title == "What is your age?"
    assert len(validated.options) == 2


def test_matrix_question_schema():
    """Test matrix question with scale configuration"""
    from app.schemas.experiment import MatrixQuestion, ScaleConfig

    question = {
        "id": "Q_002",
        "type": "matrix",
        "title": "Rate these aspects",
        "required": True,
        "order": 1,
        "items": [
            {"id": "ITEM_1", "label": "Quality", "order": 0},
            {"id": "ITEM_2", "label": "Price", "order": 1},
        ],
        "scale": {
            "type": "preset",
            "presetName": "7点Likert量表",
            "points": [
                {"value": 1, "label": "非常不同意"},
                {"value": 2, "label": "不同意"},
                {"value": 3, "label": "有点不同意"},
                {"value": 4, "label": "中立"},
                {"value": 5, "label": "有点同意"},
                {"value": 6, "label": "同意"},
                {"value": 7, "label": "非常同意"},
            ],
            "showValue": True,
            "showLabel": True
        },
        "layout": "horizontal"
    }

    validated = MatrixQuestion(**question)
    assert len(validated.items) == 2
    assert len(validated.scale.points) == 7
