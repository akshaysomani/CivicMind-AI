from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

liked_feed_posts = Table(
    "liked_feed_posts",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("post_id", Integer, ForeignKey("feed_posts.id", ondelete="CASCADE"), primary_key=True)
)

bookmarked_feed_posts = Table(
    "bookmarked_feed_posts",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("post_id", Integer, ForeignKey("feed_posts.id", ondelete="CASCADE"), primary_key=True)
)

class FeedPost(Base):
    __tablename__ = "feed_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    content: Mapped[str] = mapped_column(String(2000), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # Community Issue, Trending, Gov Announcement, Event, Environmental, Emergency
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    author_role: Mapped[str] = mapped_column(String(50), default="Citizen", nullable=False)
    likes_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comments_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    liked_by_users = relationship("User", secondary=liked_feed_posts, backref="liked_posts")
    bookmarked_by_users = relationship("User", secondary=bookmarked_feed_posts, backref="bookmarked_posts")
