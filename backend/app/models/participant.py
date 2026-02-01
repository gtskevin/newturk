"""
Participant model
"""
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.experiment import Experiment
    from app.models.response import Response


class Participant(Base):
    """
    Participant model representing a participant in an experiment
    """

    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    experiment_id: Mapped[int] = mapped_column(
        ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False
    )
    participant_number: Mapped[int] = mapped_column(Integer, nullable=False)

    # Profile and validation data stored as JSON
    profile: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    validation_flags: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    # Relationships
    experiment: Mapped["Experiment"] = relationship(
        "Experiment", back_populates="participants"
    )
    responses: Mapped[List["Response"]] = relationship(
        "Response", back_populates="participant", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Participant(id={self.id}, experiment_id={self.experiment_id}, number={self.participant_number})>"
