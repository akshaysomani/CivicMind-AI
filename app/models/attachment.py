from datetime import datetime, timezone
from sqlalchemy import String, Integer, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class Attachment(Base):
    """Stores media files (images, videos, documents) attached to issue reports."""
    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)  # image, video, document
    mime_type: Mapped[str] = mapped_column(String(100), nullable=True)
    file_size: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)  # bytes

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    report = relationship("Report", back_populates="attachments")
