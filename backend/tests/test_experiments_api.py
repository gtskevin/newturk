"""
Tests for experiments API endpoints
"""
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app
from app.models.experiment import Experiment as ExperimentModel
from app.schemas.experiment import ExperimentCreate, ExperimentUpdate


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def test_db_session(db_session):
    """Use database session fixture"""
    return db_session


def test_create_experiment(client, test_db_session):
    """Test creating a new experiment via POST /api/v1/experiments"""
    experiment_data = {
        "name": "Test Experiment",
        "description": "A test experiment",
        "status": "draft",
        "sample_config": {"target_n": 100},
        "experiment_config": {"duration": 30},
        "execution_settings": {"parallel": True},
        "meta_data": {"researcher": "Test User"}
    }

    response = client.post("/api/v1/experiments", json=experiment_data)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Experiment"
    assert data["description"] == "A test experiment"
    assert data["status"] == "draft"
    assert data["sample_config"] == {"target_n": 100}
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_list_experiments_empty(client, test_db_session):
    """Test listing experiments when none exist via GET /api/v1/experiments"""
    response = client.get("/api/v1/experiments")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data == []


def test_list_experiments(client, test_db_session):
    """Test listing multiple experiments via GET /api/v1/experiments"""
    # Create two experiments
    exp1 = ExperimentModel(
        name="Experiment 1",
        description="First experiment",
        status="draft"
    )
    exp2 = ExperimentModel(
        name="Experiment 2",
        description="Second experiment",
        status="active"
    )
    test_db_session.add(exp1)
    test_db_session.add(exp2)
    test_db_session.commit()

    response = client.get("/api/v1/experiments")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Experiment 1"
    assert data[1]["name"] == "Experiment 2"


def test_get_experiment(client, test_db_session):
    """Test getting a single experiment via GET /api/v1/experiments/{id}"""
    experiment = ExperimentModel(
        name="Test Experiment",
        description="A test experiment",
        status="draft"
    )
    test_db_session.add(experiment)
    test_db_session.commit()
    test_db_session.refresh(experiment)

    response = client.get(f"/api/v1/experiments/{experiment.id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == experiment.id
    assert data["name"] == "Test Experiment"
    assert data["description"] == "A test experiment"


def test_get_experiment_not_found(client, test_db_session):
    """Test getting a non-existent experiment via GET /api/v1/experiments/{id}"""
    response = client.get("/api/v1/experiments/99999")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert "detail" in data


def test_update_experiment(client, test_db_session):
    """Test updating an experiment via PUT /api/v1/experiments/{id}"""
    experiment = ExperimentModel(
        name="Original Name",
        description="Original description",
        status="draft"
    )
    test_db_session.add(experiment)
    test_db_session.commit()
    test_db_session.refresh(experiment)

    update_data = {
        "name": "Updated Name",
        "description": "Updated description",
        "status": "active"
    }

    response = client.put(f"/api/v1/experiments/{experiment.id}", json=update_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == experiment.id
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated description"
    assert data["status"] == "active"


def test_update_experiment_not_found(client, test_db_session):
    """Test updating a non-existent experiment via PUT /api/v1/experiments/{id}"""
    update_data = {"name": "Updated Name"}

    response = client.put("/api/v1/experiments/99999", json=update_data)

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_experiment(client, test_db_session):
    """Test deleting an experiment via DELETE /api/v1/experiments/{id}"""
    experiment = ExperimentModel(
        name="To Delete",
        description="This will be deleted",
        status="draft"
    )
    test_db_session.add(experiment)
    test_db_session.commit()
    test_db_session.refresh(experiment)

    response = client.delete(f"/api/v1/experiments/{experiment.id}")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify it's actually deleted
    get_response = client.get(f"/api/v1/experiments/{experiment.id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_experiment_not_found(client, test_db_session):
    """Test deleting a non-existent experiment via DELETE /api/v1/experiments/{id}"""
    response = client.delete("/api/v1/experiments/99999")

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_experiment_questions_empty(client, test_db_session):
    """Test getting questions from experiment with no questions via GET /api/v1/experiments/{id}/questions"""
    experiment = ExperimentModel(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
        experiment_config={}
    )
    test_db_session.add(experiment)
    test_db_session.commit()
    test_db_session.refresh(experiment)

    response = client.get(f"/api/v1/experiments/{experiment.id}/questions")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["experiment_id"] == experiment.id
    assert data["questions"] == []
    assert data["total"] == 0


def test_get_experiment_questions(client, test_db_session):
    """Test getting questions from experiment via GET /api/v1/experiments/{id}/questions"""
    questions = [
        {
            "id": "q1",
            "type": "single",
            "title": "Question 1",
            "required": True,
            "order": 0,
            "options": [
                {"id": "opt1", "label": "Option 1", "value": "opt1", "order": 0}
            ]
        },
        {
            "id": "q2",
            "type": "text",
            "title": "Question 2",
            "required": False,
            "order": 1
        }
    ]

    experiment = ExperimentModel(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
        experiment_config={"questions": questions}
    )
    test_db_session.add(experiment)
    test_db_session.commit()
    test_db_session.refresh(experiment)

    response = client.get(f"/api/v1/experiments/{experiment.id}/questions")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["experiment_id"] == experiment.id
    assert data["total"] == 2
    assert len(data["questions"]) == 2
    assert data["questions"][0]["title"] == "Question 1"
    assert data["questions"][1]["title"] == "Question 2"


def test_get_experiment_questions_not_found(client, test_db_session):
    """Test getting questions from non-existent experiment via GET /api/v1/experiments/{id}/questions"""
    response = client.get("/api/v1/experiments/99999/questions")

    assert response.status_code == status.HTTP_404_NOT_FOUND
