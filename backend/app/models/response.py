"""
Response model
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.participant import Participant


class Response(Base):
    """
    Response model representing a participant's response to a question
    """

    __tablename__ = "responses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    experiment_id: Mapped[int] = mapped_column(
        ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False
    )
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id", ondelete="CASCADE"), nullable=False
    )
    question_id: Mapped[str] = mapped_column(String(255), nullable=False)

    # Response data
    raw_response: Mapped[str] = mapped_column(Text, nullable=False)
    coded_response: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Metadata and quality flags
    meta_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    quality_flags: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    # Relationships
    participant: Mapped["Participant"] = relationship(
        "Participant", back_populates="responses"
    )

    def __repr__(self) -> str:
        return f"<Response(id={self.id}, participant_id={self.participant_id}, question_id='{self.question_id}')>"
