from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Scene(Base):
    __tablename__ = "scenes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    scene_order = Column(Integer, nullable=False)
    narration = Column(String, nullable=False)
    keywords = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)

    project = relationship("Project", backref="scenes")
