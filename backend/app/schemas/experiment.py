"""
Pydantic schemas for Experiment model
"""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ExperimentBase(BaseModel):
    """Base experiment schema"""

    name: str = Field(..., description="Experiment name", min_length=1, max_length=255)
    description: str | None = Field(None, description="Experiment description")
    status: str = Field(default="draft", description="Experiment status")
    sample_config: dict[str, Any] = Field(default_factory=dict, description="Sample configuration")
    experiment_config: dict[str, Any] = Field(
        default_factory=dict, description="Experiment configuration"
    )
    execution_settings: dict[str, Any] = Field(
        default_factory=dict, description="Execution settings"
    )
    meta_data: dict[str, Any] = Field(default_factory=dict, description="Experiment metadata")


class ExperimentCreate(ExperimentBase):
    """Schema for creating an experiment"""

    pass


class ExperimentUpdate(BaseModel):
    """Schema for updating an experiment"""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    status: str | None = None
    sample_config: dict[str, Any] | None = None
    experiment_config: dict[str, Any] | None = None
    execution_settings: dict[str, Any] | None = None
    meta_data: dict[str, Any] | None = None


class ExperimentInDB(ExperimentBase):
    """Schema for experiment in database"""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Experiment(ExperimentInDB):
    """Schema for experiment responses"""

    pass
