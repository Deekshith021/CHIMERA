from sqlalchemy.orm import Session
from app.models.scene import Scene

def store_scenes(db: Session, project_id: str, scenes: list):
    stored = []

    for scene in scenes:
        s = Scene(
            project_id=project_id,
            scene_order=scene["scene_order"],
            narration=scene["narration"],
            keywords=scene["keywords"],
            duration=scene["duration"]
        )
        db.add(s)
        stored.append(s)

    db.commit()
    return stored
