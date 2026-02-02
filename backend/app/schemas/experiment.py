"""
Pydantic schemas for Experiment model
"""
from datetime import datetime
from typing import Any, List, Literal, Union, Optional, Dict

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


# Choice Option
class ChoiceOption(BaseModel):
    id: str
    label: str
    value: str
    order: int


# Scale Point for Matrix Questions
class ScalePoint(BaseModel):
    value: Union[int, str]
    label: str


class ScaleConfig(BaseModel):
    type: Literal['preset', 'custom']
    presetName: Optional[str] = None
    points: List[ScalePoint]
    showValue: bool = True
    showLabel: bool = True


# Base Question
class BaseQuestion(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    required: bool = True
    order: int
    metadata: Optional[Dict[str, Any]] = None


# Single Choice Question
class SingleChoiceQuestion(BaseQuestion):
    type: Literal['single'] = 'single'
    options: List[ChoiceOption] = []
    layout: Literal['vertical', 'horizontal', 'two-column'] = 'vertical'
    randomize: bool = False


# Multiple Choice Question
class MultipleChoiceQuestion(BaseQuestion):
    type: Literal['multiple'] = 'multiple'
    options: List[ChoiceOption] = []
    layout: Literal['vertical', 'horizontal', 'two-column'] = 'vertical'
    randomize: bool = False


# Text Input Question
class TextInputQuestion(BaseModel):
    id: str
    type: Literal['text'] = 'text'
    title: str
    description: Optional[str] = None
    required: bool = True
    order: int
    inputType: Literal['text', 'textarea', 'number'] = 'text'
    maxLength: Optional[int] = None
    placeholder: Optional[str] = None
    validation: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


# Matrix Item
class MatrixItem(BaseModel):
    id: str
    label: str
    order: int


# Matrix Question
class MatrixQuestion(BaseModel):
    id: str
    type: Literal['matrix'] = 'matrix'
    title: str
    description: Optional[str] = None
    required: bool = True
    order: int
    items: List[MatrixItem] = []
    scale: ScaleConfig
    layout: Literal['horizontal', 'vertical'] = 'horizontal'
    metadata: Optional[Dict[str, Any]] = None


# Union type for all questions
Question = Union[SingleChoiceQuestion, MultipleChoiceQuestion, TextInputQuestion, MatrixQuestion]
