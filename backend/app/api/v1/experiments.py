"""
Experiment CRUD API endpoints
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.experiment import Experiment as ExperimentModel
from app.schemas.experiment import Experiment, ExperimentCreate, ExperimentUpdate

router = APIRouter()


@router.post("/", response_model=Experiment, status_code=status.HTTP_201_CREATED)
def create_experiment(
    experiment: ExperimentCreate, db: Session = Depends(get_db)
) -> Experiment:
    """
    Create a new experiment

    Args:
        experiment: Experiment data to create
        db: Database session

    Returns:
        Created experiment
    """
    db_experiment = ExperimentModel(**experiment.model_dump())
    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)
    return db_experiment


@router.get("/", response_model=List[Experiment])
def list_experiments(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[Experiment]:
    """
    List all experiments

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of experiments
    """
    experiments = db.query(ExperimentModel).offset(skip).limit(limit).all()
    return experiments


@router.get("/{experiment_id}", response_model=Experiment)
def get_experiment(
    experiment_id: int, db: Session = Depends(get_db)
) -> Experiment:
    """
    Get a specific experiment by ID

    Args:
        experiment_id: Experiment ID
        db: Database session

    Returns:
        Experiment data

    Raises:
        HTTPException: If experiment not found
    """
    experiment = (
        db.query(ExperimentModel)
        .filter(ExperimentModel.id == experiment_id)
        .first()
    )

    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment with id {experiment_id} not found"
        )

    return experiment


@router.get("/{experiment_id}/questions")
def get_experiment_questions(
    experiment_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Get questions for an experiment

    Args:
        experiment_id: Experiment ID
        db: Database session

    Returns:
        Dictionary containing questions list

    Raises:
        HTTPException: If experiment not found
    """
    experiment = (
        db.query(ExperimentModel)
        .filter(ExperimentModel.id == experiment_id)
        .first()
    )

    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment with id {experiment_id} not found"
        )

    # Extract questions from experiment_config
    questions = []
    if experiment.experiment_config and "questions" in experiment.experiment_config:
        questions = experiment.experiment_config["questions"]

    return {
        "experiment_id": experiment_id,
        "questions": questions,
        "total": len(questions)
    }


@router.put("/{experiment_id}", response_model=Experiment)
def update_experiment(
    experiment_id: int,
    experiment_update: ExperimentUpdate,
    db: Session = Depends(get_db),
) -> Experiment:
    """
    Update an experiment

    Args:
        experiment_id: Experiment ID
        experiment_update: Experiment data to update
        db: Database session

    Returns:
        Updated experiment

    Raises:
        HTTPException: If experiment not found
    """
    db_experiment = (
        db.query(ExperimentModel)
        .filter(ExperimentModel.id == experiment_id)
        .first()
    )

    if not db_experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment with id {experiment_id} not found"
        )

    # Update only provided fields
    update_data = experiment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_experiment, field, value)

    db.commit()
    db.refresh(db_experiment)
    return db_experiment


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(experiment_id: int, db: Session = Depends(get_db)) -> None:
    """
    Delete an experiment

    Args:
        experiment_id: Experiment ID
        db: Database session

    Raises:
        HTTPException: If experiment not found
    """
    db_experiment = (
        db.query(ExperimentModel)
        .filter(ExperimentModel.id == experiment_id)
        .first()
    )

    if not db_experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment with id {experiment_id} not found"
        )

    db.delete(db_experiment)
    db.commit()
