from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.models.project import Project
from app.models.scene import Scene
from app.schemas.project import ProjectCreate
from app.utils.db import get_db
from app.utils.deps import get_current_user
from app.agents.script_agent import generate_scenes
from app.services.scene_service import store_scenes
from app.jobs.video_job import run_video_job
from fastapi.responses import FileResponse
import os

router = APIRouter(prefix="/projects", tags=["projects"])

# =========================
# CREATE PROJECT
# =========================
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = Project(
        user_id=current_user.id,
        prompt=data.prompt,
        status="idle",
        progress=0,
        retry_count=0,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "prompt": project.prompt,
        "status": project.status,
    }


# =========================
# LIST PROJECTS
# =========================
@router.get("/")
def list_projects(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )


# =========================
# GENERATE SCENES
# =========================
@router.post("/{project_id}/generate-scenes")
def generate_project_scenes(
    project_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.status = "processing"
    project.progress = 0
    db.commit()

    try:
        scenes = generate_scenes(project.prompt)
        store_scenes(db, project.id, scenes)

        project.status = "scenes_generated"
        project.progress = 0
        db.commit()

        return {"message": "Scenes generated"}

    except Exception:
        project.status = "failed"
        project.retry_count += 1
        db.commit()
        raise HTTPException(500, "Scene generation failed")


# =========================
# LIST SCENES
# =========================
@router.get("/{project_id}/scenes")
def list_scenes(
    project_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Scene)
        .filter(Scene.project_id == project_id)
        .order_by(Scene.scene_order)
        .all()
    )


# =========================
# GENERATE VIDEO (FIXED)
# =========================
@router.post("/{project_id}/generate-video")
def generate_video(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(404, "Project not found")

    if project.status != "scenes_generated":
        raise HTTPException(400, "Generate scenes first")

    # IMPORTANT: update status BEFORE starting background task
    project.status = "processing"
    project.progress = 0
    project.retry_count += 1
    db.commit()

    # ✅ CORRECT BACKGROUND TASK CALL
    background_tasks.add_task(run_video_job, project.id)

    return {
        "message": "Video generation started",
        "status": "processing",
    }


# =========================
# PROJECT STATUS
# =========================
@router.get("/{project_id}/status")
def project_status(
    project_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(404, "Project not found")

    return {
        "status": project.status,
        "progress": project.progress,
        "retry_count": project.retry_count,
    }


# =========================
# DOWNLOAD VIDEO
# =========================
@router.get("/{project_id}/download")
def download_video(
    project_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
        .first()
    )

    if not project or not project.final_video_path:
        raise HTTPException(400, "Video not ready")

    return FileResponse(
        project.final_video_path,
        media_type="video/mp4",
        filename=f"{project.id}.mp4",
    )

@router.get("/{project_id}/scenes/{scene_order}/thumbnail")
def get_scene_thumbnail(
    project_id: str,
    scene_order: int,
    current_user=Depends(get_current_user),
):
    path = f"assets/thumbnails/{project_id}/scene_{scene_order}.jpg"

    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Thumbnail not ready")

    return FileResponse(path, media_type="image/jpeg")
