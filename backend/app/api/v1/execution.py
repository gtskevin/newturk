"""
Experiment Execution API endpoints
"""
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.experiment import Experiment as ExperimentModel
from app.models.participant import Participant as ParticipantModel
from app.models.response import Response as ResponseModel
from app.schemas.execution import (
    ExecutionRequest,
    ExecutionResult,
    ParticipantExecutionResult,
)
from app.services.llm_executor import LLMExecutor
from app.services.participant_generator import ParticipantGenerator

router = APIRouter()


def execute_experiment_task(
    experiment_id: int,
    api_key: str,
    model: str,
    temperature: float,
    max_tokens: int,
    db: Session,
):
    """
    Background task to execute experiment for all participants

    Args:
        experiment_id: Experiment ID
        api_key: OpenAI API key
        model: OpenAI model name
        temperature: Sampling temperature
        max_tokens: Maximum tokens
        db: Database session
    """
    # Get experiment
    experiment = (
        db.query(ExperimentModel)
        .filter(ExperimentModel.id == experiment_id)
        .first()
    )

    if not experiment:
        return

    try:
        # Extract configuration
        sample_config = experiment.sample_config
        experiment_config = experiment.experiment_config

        # Get questions from experiment config
        questions = experiment_config.get("questions", [])

        if not questions:
            experiment.status = "failed"
            db.commit()
            return

        # Generate participants using ParticipantGenerator
        generator = ParticipantGenerator(
            age_min=sample_config.get("age_min", 18),
            age_max=sample_config.get("age_max", 100),
            genders=sample_config.get("genders"),
            gender_weights=sample_config.get("gender_weights"),
            countries=sample_config.get("countries"),
            education_levels=sample_config.get("education_levels"),
        )

        sample_size = sample_config.get("sample_size", 10)
        profiles = generator.generate(count=sample_size)

        # Initialize LLM executor
        executor = LLMExecutor(
            api_key=api_key,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        # Track execution statistics
        total_cost = 0.0
        total_tokens = 0
        succeeded = 0
        failed = 0

        # Execute each participant
        for profile in profiles:
            participant_number = profile["participant_number"]

            try:
                # Execute participant
                result = executor.execute_participant(profile, questions)

                # Create participant record
                participant = ParticipantModel(
                    experiment_id=experiment_id,
                    participant_number=participant_number,
                    profile=profile,
                    validation_flags={},
                )
                db.add(participant)
                db.flush()  # Get participant ID

                # Store responses
                for question_id, response_data in result["responses"].items():
                    response = ResponseModel(
                        experiment_id=experiment_id,
                        participant_id=participant.id,
                        question_id=question_id,
                        raw_response=str(response_data),
                        coded_response=response_data,
                        meta_data={
                            "model": model,
                            "temperature": temperature,
                        },
                        quality_flags={},
                    )
                    db.add(response)

                # Update statistics
                total_cost += result["cost"]
                total_tokens += result["total_tokens"]
                succeeded += 1

            except Exception as e:
                # Create failed participant record
                participant = ParticipantModel(
                    experiment_id=experiment_id,
                    participant_number=participant_number,
                    profile=profile,
                    validation_flags={"execution_failed": True, "error": str(e)},
                )
                db.add(participant)

                failed += 1

        # Update experiment status
        experiment.status = "completed"
        experiment.meta_data = {
            **experiment.meta_data,
            "execution": {
                "total_participants": len(profiles),
                "succeeded": succeeded,
                "failed": failed,
                "total_cost": total_cost,
                "total_tokens": total_tokens,
                "model": model,
                "temperature": temperature,
            },
        }

        db.commit()

    except Exception as e:
        # Update experiment status to failed
        experiment.status = "failed"
        experiment.meta_data = {
            **experiment.meta_data,
            "execution_error": str(e),
        }
        db.commit()


@router.post("/execute", response_model=ExecutionResult, status_code=status.HTTP_202_ACCEPTED)
def execute_experiment(
    execution_request: ExecutionRequest,
    experiment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ExecutionResult:
    """
    Execute an experiment by generating participants and collecting responses via LLM

    Args:
        execution_request: Execution configuration including API key
        experiment_id: Experiment ID to execute
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Execution result with status and initial information

    Raises:
        HTTPException: If experiment not found or already executed
    """
    # Get experiment
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

    # Check if experiment can be executed
    if experiment.status in ["completed", "active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Experiment with id {experiment_id} is {experiment.status} and cannot be executed"
        )

    # Check if experiment has questions
    questions = experiment.experiment_config.get("questions", [])
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experiment must have questions to execute"
        )

    # Update experiment status to active
    experiment.status = "active"
    db.commit()

    # Add background task to execute experiment
    background_tasks.add_task(
        execute_experiment_task,
        experiment_id=experiment_id,
        api_key=execution_request.api_key,
        model=execution_request.model,
        temperature=execution_request.temperature,
        max_tokens=execution_request.max_tokens,
        db=db,
    )

    # Get sample size
    sample_size = experiment.sample_config.get("sample_size", 10)

    return ExecutionResult(
        experiment_id=experiment_id,
        status="active",
        participants_executed=0,
        participants_succeeded=0,
        participants_failed=0,
        total_cost=0.0,
        total_tokens=0,
        results=[],
    )


@router.get("/{experiment_id}/status", response_model=dict)
def get_execution_status(
    experiment_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Get execution status for an experiment

    Args:
        experiment_id: Experiment ID
        db: Database session

    Returns:
        Execution status information

    Raises:
        HTTPException: If experiment not found
    """
    # Get experiment
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

    # Get participant counts
    total_participants = (
        db.query(ParticipantModel)
        .filter(ParticipantModel.experiment_id == experiment_id)
        .count()
    )

    # Get execution metadata
    execution_meta = experiment.meta_data.get("execution", {})

    return {
        "experiment_id": experiment_id,
        "status": experiment.status,
        "total_participants": total_participants,
        "completed_participants": total_participants,
        "total_cost": execution_meta.get("total_cost", 0.0),
        "total_tokens": execution_meta.get("total_tokens", 0),
        "succeeded": execution_meta.get("succeeded", 0),
        "failed": execution_meta.get("failed", 0),
    }


@router.get("/{experiment_id}/results", response_model=List[dict])
def get_execution_results(
    experiment_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[dict]:
    """
    Get execution results for an experiment

    Args:
        experiment_id: Experiment ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of participants with their responses

    Raises:
        HTTPException: If experiment not found
    """
    # Verify experiment exists
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

    # Get participants with responses
    participants = (
        db.query(ParticipantModel)
        .filter(ParticipantModel.experiment_id == experiment_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for participant in participants:
        # Get responses for this participant
        responses = (
            db.query(ResponseModel)
            .filter(ResponseModel.participant_id == participant.id)
            .all()
        )

        participant_data = {
            "participant_id": participant.id,
            "participant_number": participant.participant_number,
            "profile": participant.profile,
            "validation_flags": participant.validation_flags,
            "responses": [
                {
                    "question_id": r.question_id,
                    "raw_response": r.raw_response,
                    "coded_response": r.coded_response,
                    "meta_data": r.meta_data,
                    "quality_flags": r.quality_flags,
                }
                for r in responses
            ],
        }
        results.append(participant_data)

    return results
