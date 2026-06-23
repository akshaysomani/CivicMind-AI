from datetime import datetime
from pydantic import BaseModel, ConfigDict

class FeedPostOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    author_name: str
    author_role: str
    likes_count: int
    comments_count: int
    created_at: datetime
    is_liked: bool = False
    is_bookmarked: bool = False

    model_config = ConfigDict(from_attributes=True)
