from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id: Mapped[int] = mapped_column(Integer, nullable=False)
    scheme_title: Mapped[str] = mapped_column(String(200), nullable=False)
    scheme_category: Mapped[str] = mapped_column(String(100), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User")
