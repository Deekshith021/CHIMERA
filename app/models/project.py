import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    prompt = Column(String, nullable=False)
    status = Column(String, default="pending")

    # 🔁 Retry & Progress Tracking
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    progress = Column(Integer, default=0)

    # 🎬 Final Video
    final_video_path = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔗 Relationships
    user = relationship("User", backref="projects")
