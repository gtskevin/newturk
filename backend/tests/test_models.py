"""
Tests for database models
"""
import json
from datetime import datetime

import pytest
from sqlalchemy.orm import Session


@pytest.fixture
def db_session():
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


def test_experiment_model_creation(db_session: Session):
    """Test creating an experiment"""
    from app.models import Experiment

    experiment = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
        sample_config={"sample_size": 100},
        experiment_config={"questions": ["q1", "q2"]},
        execution_settings={"parallel": True},
        meta_data={"researcher": "Test User"},
    )

    db_session.add(experiment)
    db_session.commit()
    db_session.refresh(experiment)

    assert experiment.id is not None
    assert experiment.name == "Test Experiment"
    assert experiment.status == "draft"
    assert experiment.sample_config == {"sample_size": 100}
    assert experiment.meta_data == {"researcher": "Test User"}
    assert experiment.created_at is not None
    assert experiment.updated_at is not None


def test_participant_model_creation(db_session: Session):
    """Test creating a participant"""
    from app.models import Experiment, Participant

    # Create experiment first
    experiment = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
    )
    db_session.add(experiment)
    db_session.commit()

    # Create participant
    participant = Participant(
        experiment_id=experiment.id,
        participant_number=1,
        profile={"age": 25, "gender": "other"},
        validation_flags={"is_valid": True},
    )

    db_session.add(participant)
    db_session.commit()
    db_session.refresh(participant)

    assert participant.id is not None
    assert participant.experiment_id == experiment.id
    assert participant.participant_number == 1
    assert participant.profile == {"age": 25, "gender": "other"}
    assert participant.created_at is not None


def test_response_model_creation(db_session: Session):
    """Test creating a response"""
    from app.models import Experiment, Participant, Response

    # Create experiment
    experiment = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
    )
    db_session.add(experiment)
    db_session.commit()

    # Create participant
    participant = Participant(
        experiment_id=experiment.id,
        participant_number=1,
    )
    db_session.add(participant)
    db_session.commit()

    # Create response
    response = Response(
        experiment_id=experiment.id,
        participant_id=participant.id,
        question_id="q1",
        raw_response="This is a test response",
        coded_response={"category": "test", "sentiment": "neutral"},
        meta_data={"duration": 5.2},
        quality_flags={"is_complete": True},
    )

    db_session.add(response)
    db_session.commit()
    db_session.refresh(response)

    assert response.id is not None
    assert response.experiment_id == experiment.id
    assert response.participant_id == participant.id
    assert response.question_id == "q1"
    assert response.raw_response == "This is a test response"
    assert response.coded_response == {"category": "test", "sentiment": "neutral"}
    assert response.created_at is not None


def test_experiment_participant_relationship(db_session: Session):
    """Test relationship between experiment and participants"""
    from app.models import Experiment, Participant

    # Create experiment
    experiment = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
    )
    db_session.add(experiment)
    db_session.commit()

    # Create multiple participants
    for i in range(3):
        participant = Participant(
            experiment_id=experiment.id,
            participant_number=i + 1,
        )
        db_session.add(participant)
    db_session.commit()

    # Check relationship
    db_session.refresh(experiment)
    assert len(experiment.participants) == 3
    assert all(p.experiment_id == experiment.id for p in experiment.participants)


def test_participant_response_relationship(db_session: Session):
    """Test relationship between participant and responses"""
    from app.models import Experiment, Participant, Response

    # Create experiment
    experiment = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
    )
    db_session.add(experiment)
    db_session.commit()

    # Create participant
    participant = Participant(
        experiment_id=experiment.id,
        participant_number=1,
    )
    db_session.add(participant)
    db_session.commit()

    # Create multiple responses
    for i in range(3):
        response = Response(
            experiment_id=experiment.id,
            participant_id=participant.id,
            question_id=f"q{i+1}",
            raw_response=f"Response {i+1}",
        )
        db_session.add(response)
    db_session.commit()

    # Check relationship
    db_session.refresh(participant)
    assert len(participant.responses) == 3
    assert all(r.participant_id == participant.id for r in participant.responses)


def test_experiment_timestamps(db_session: Session):
    """Test that timestamps are automatically set"""
    from app.models import Experiment

    experiment = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
    )

    db_session.add(experiment)
    db_session.commit()
    db_session.refresh(experiment)

    assert isinstance(experiment.created_at, datetime)
    assert isinstance(experiment.updated_at, datetime)

    # Update and check that updated_at changes
    old_updated_at = experiment.updated_at
    experiment.name = "Updated Experiment"
    db_session.commit()
    db_session.refresh(experiment)

    assert experiment.updated_at > old_updated_at


def test_json_fields_default_to_empty_dict(db_session: Session):
    """Test that JSON fields default to empty dict"""
    from app.models import Experiment

    experiment = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
    )

    db_session.add(experiment)
    db_session.commit()
    db_session.refresh(experiment)

    assert experiment.sample_config == {}
    assert experiment.experiment_config == {}
    assert experiment.execution_settings == {}
    assert experiment.meta_data == {}
