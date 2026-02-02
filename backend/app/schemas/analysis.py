"""
Pydantic schemas for Analysis results
"""
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field


class DescriptiveStatistics(BaseModel):
    """Descriptive statistics for numeric data"""

    count: int = Field(..., description="Number of observations")
    mean: Optional[float] = Field(None, description="Mean value")
    median: Optional[float] = Field(None, description="Median value")
    std: Optional[float] = Field(None, description="Standard deviation")
    min: Optional[float] = Field(None, description="Minimum value")
    max: Optional[float] = Field(None, description="Maximum value")
    q25: Optional[float] = Field(None, description="25th percentile")
    q75: Optional[float] = Field(None, description="75th percentile")


class FrequencyValue(BaseModel):
    """Frequency information for a single value"""

    count: int = Field(..., description="Number of occurrences")
    percentage: float = Field(..., description="Percentage of total")


class QuestionAnalysis(BaseModel):
    """Analysis results for a single question"""

    type: str = Field(..., description="Data type: 'numeric' or 'categorical'")
    descriptive: Optional[DescriptiveStatistics] = Field(
        None, description="Descriptive statistics (for numeric data)"
    )
    frequency: Optional[Dict[Any, FrequencyValue]] = Field(
        None, description="Frequency table (for categorical data)"
    )


class ExperimentAnalysis(BaseModel):
    """Complete analysis for an experiment"""

    experiment_id: int = Field(..., description="Experiment ID")
    questions: Dict[str, QuestionAnalysis] = Field(
        ..., description="Analysis per question"
    )


class AnalysisRequest(BaseModel):
    """Request schema for analysis generation"""

    experiment_id: int = Field(..., description="Experiment ID to analyze")


class RawResultsResponse(BaseModel):
    """Response schema for raw experiment results"""

    experiment_id: int = Field(..., description="Experiment ID")
    total_responses: int = Field(..., description="Total number of responses")
    responses: List[Dict[str, Any]] = Field(
        ..., description="List of response data"
    )
