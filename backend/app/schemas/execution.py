"""
Pydantic schemas for Experiment Execution
"""
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ExecutionBase(BaseModel):
    """Base execution request schema"""

    api_key: str = Field(..., description="OpenAI API key (not stored)")
    model: str = Field(default="gpt-4o", description="OpenAI model to use")
    temperature: float = Field(default=0.8, ge=0, le=2, description="Sampling temperature")
    max_tokens: int = Field(
        default=2000, ge=1, le=128000, description="Maximum tokens per response"
    )


class ExecutionRequest(ExecutionBase):
    """Schema for execution request"""

    pass


class ParticipantExecutionResult(BaseModel):
    """Schema for individual participant execution result"""

    participant_id: int = Field(..., description="Participant ID")
    participant_number: int = Field(..., description="Participant sequential number")
    profile: dict[str, Any] = Field(..., description="Participant profile")
    responses: dict[str, Any] = Field(..., description="Parsed responses")
    raw_response: str | None = Field(None, description="Raw LLM response")
    cost: float = Field(..., description="Cost in USD")
    prompt_tokens: int = Field(..., description="Input tokens used")
    completion_tokens: int = Field(..., description="Output tokens used")
    total_tokens: int = Field(..., description="Total tokens used")
    success: bool = Field(..., description="Whether execution succeeded")
    error: str | None = Field(None, description="Error message if failed")


class ExecutionResult(BaseModel):
    """Schema for execution result"""

    experiment_id: int = Field(..., description="Experiment ID")
    status: str = Field(..., description="Execution status")
    participants_executed: int = Field(..., description="Number of participants executed")
    participants_succeeded: int = Field(..., description="Number of successful executions")
    participants_failed: int = Field(..., description="Number of failed executions")
    total_cost: float = Field(..., description="Total cost in USD")
    total_tokens: int = Field(..., description="Total tokens used")
    results: list[ParticipantExecutionResult] = Field(
        default_factory=list, description="Individual participant results"
    )
    error: str | None = Field(None, description="Overall error message if failed")


class ExecutionStatus(BaseModel):
    """Schema for execution status check"""

    experiment_id: int = Field(..., description="Experiment ID")
    status: str = Field(..., description="Experiment status")
    total_participants: int = Field(..., description="Total participants")
    completed_participants: int = Field(..., description="Completed participants")
    total_cost: float = Field(..., description="Total cost so far")
    total_tokens: int = Field(..., description="Total tokens used")
