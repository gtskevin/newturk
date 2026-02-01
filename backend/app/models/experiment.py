"""
Experiment model
"""
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.participant import Participant


class Experiment(Base):
    """
    Experiment model representing a psychology research experiment
    """

    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="draft"
    )  # draft, active, completed, archived

    # Configuration stored as JSON
    sample_config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    experiment_config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    execution_settings: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    meta_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    participants: Mapped[List["Participant"]] = relationship(
        "Participant", back_populates="experiment", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Experiment(id={self.id}, name='{self.name}', status='{self.status}')>"
