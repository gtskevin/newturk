"""
Analysis API endpoints
"""
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.experiment import Experiment as ExperimentModel
from app.models.response import Response as ResponseModel
from app.schemas.analysis import (
    AnalysisRequest,
    ExperimentAnalysis,
    RawResultsResponse,
)
from app.services.analyzer import Analyzer

router = APIRouter()


@router.post("/analyze", response_model=ExperimentAnalysis, status_code=status.HTTP_200_OK)
def analyze_experiment(
    request: AnalysisRequest, db: Session = Depends(get_db)
) -> ExperimentAnalysis:
    """
    Generate statistical analysis for an experiment

    Args:
        request: Analysis request containing experiment_id
        db: Database session

    Returns:
        Experiment analysis with descriptive statistics and frequency tables

    Raises:
        HTTPException: If experiment not found
    """
    try:
        analysis = Analyzer.summarize_experiment(db, request.experiment_id)
        return analysis
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/experiments/{experiment_id}/results",
    response_model=RawResultsResponse,
    status_code=status.HTTP_200_OK,
)
def get_experiment_results(
    experiment_id: int, db: Session = Depends(get_db)
) -> RawResultsResponse:
    """
    Get raw results for an experiment

    Args:
        experiment_id: Experiment ID
        db: Database session

    Returns:
        Raw response data for the experiment

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
            detail=f"Experiment with id {experiment_id} not found",
        )

    # Get all responses
    responses = (
        db.query(ResponseModel)
        .filter(ResponseModel.experiment_id == experiment_id)
        .all()
    )

    # Convert to list of dicts
    response_data: List[Dict[str, Any]] = []
    for response in responses:
        response_data.append(
            {
                "id": response.id,
                "participant_id": response.participant_id,
                "question_id": response.question_id,
                "raw_response": response.raw_response,
                "coded_response": response.coded_response,
                "meta_data": response.meta_data,
                "quality_flags": response.quality_flags,
                "created_at": response.created_at.isoformat(),
            }
        )

    return RawResultsResponse(
        experiment_id=experiment_id,
        total_responses=len(response_data),
        responses=response_data,
    )
