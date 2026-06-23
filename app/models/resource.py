from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # staff, vehicles, equipment, budget
    value: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    float_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=True) # for budget, etc.
    status: Mapped[str] = mapped_column(String(50), default="Optimal", nullable=False) # Optimal, Critical, Warning
