import os
import subprocess
import asyncio
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.project import Project
from app.models.scene import Scene

from app.agents.asset_agent import fetch_stock_video_with_fallback
from app.agents.voice_agent import generate_voice

from app.utils.audio import get_audio_duration
from app.utils.ffmpeg import merge_audio_video

from app.routers.ws import manager

# =========================
# CONFIG
# =========================
MAX_RETRIES_PER_SCENE = 3

def generate_thumbnail(video_path: str, thumb_path: str):
    import subprocess
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-ss", "00:00:01",
            "-vframes", "1",
            thumb_path,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )

# =========================
# PROGRESS HELPER
# =========================
def update_progress(project: Project, db: Session, value: int):
    project.progress = min(100, value)
    db.commit()

    # WebSocket update (safe)
    try:
        asyncio.run(
            manager.broadcast(
                project.id,
                {
                    "status": project.status,
                    "progress": project.progress,
                    "retry_count": project.retry_count,
                },
            )
        )
    except RuntimeError:
        pass


# =========================
# MAIN BACKGROUND JOB
# =========================
def run_video_job(project_id: str):
    db: Session = SessionLocal()
    project: Project | None = None

    try:
        # =========================
        # LOAD PROJECT
        # =========================
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        project.status = "processing"
        project.progress = 0
        db.commit()
        update_progress(project, db, 0)

        # =========================
        # LOAD SCENES
        # =========================
        scenes = (
            db.query(Scene)
            .filter(Scene.project_id == project.id)
            .order_by(Scene.scene_order)
            .all()
        )

        if not scenes:
            raise Exception("No scenes found")

        total_scenes = len(scenes)

        # =========================
        # STEP 1️⃣ FETCH STOCK VIDEOS (0–25%)
        # =========================
        video_dir = f"assets/videos/{project.id}"
        os.makedirs(video_dir, exist_ok=True)

        for index, scene in enumerate(scenes, start=1):
            keywords = [k.strip() for k in scene.keywords.split(",")]
            video_path = f"{video_dir}/scene_{scene.scene_order}.mp4"

            for attempt in range(1, MAX_RETRIES_PER_SCENE + 1):
                try:
                    fetch_stock_video_with_fallback(keywords, video_path)
                    break
                except Exception:
                    project.retry_count += 1
                    db.commit()
                    if attempt == MAX_RETRIES_PER_SCENE:
                        raise

            progress = int((index / total_scenes) * 25)
            update_progress(project, db, progress)

        # =========================
        # STEP 2️⃣ VOICE GENERATION (25–50%)
        # =========================
        audio_dir = f"assets/audio/{project.id}"
        os.makedirs(audio_dir, exist_ok=True)

        scene_durations = {}

        for index, scene in enumerate(scenes, start=1):
            audio_path = f"{audio_dir}/scene_{scene.scene_order}.wav"
            generate_voice(scene.narration, audio_path)

            duration = get_audio_duration(audio_path)
            scene_durations[scene.scene_order] = duration

            progress = 25 + int((index / total_scenes) * 25)
            update_progress(project, db, progress)

        # =========================
        # STEP 3️⃣ MERGE AUDIO + VIDEO (50–75%)
        # =========================
        rendered_dir = f"assets/rendered/{project.id}"
        os.makedirs(rendered_dir, exist_ok=True)

        rendered_scenes = []

        for index, scene in enumerate(scenes, start=1):
            video_path = f"{video_dir}/scene_{scene.scene_order}.mp4"
            audio_path = f"{audio_dir}/scene_{scene.scene_order}.wav"
            output_path = f"{rendered_dir}/scene_{scene.scene_order}.mp4"

            merge_audio_video(
                video_path=video_path,
                audio_path=audio_path,
                output_path=output_path,
                duration=scene_durations[scene.scene_order],
            )

            rendered_scenes.append(output_path)

            # ✅ GENERATE THUMBNAIL
            thumb_dir = f"assets/thumbnails/{project.id}"
            thumb_path = f"{thumb_dir}/scene_{scene.scene_order}.jpg"

            generate_thumbnail(
                video_path=output_path,
                thumb_path=thumb_path
            )


            progress = 50 + int((index / total_scenes) * 25)
            update_progress(project, db, progress)

        # =========================
        # STEP 4️⃣ CONCAT FINAL VIDEO (75–100%)
        # =========================
        concat_file = f"{rendered_dir}/concat.txt"
        with open(concat_file, "w", encoding="utf-8") as f:
            for path in rendered_scenes:
                f.write(f"file '{os.path.abspath(path)}'\n")

        final_dir = "assets/final"
        os.makedirs(final_dir, exist_ok=True)
        final_output = f"{final_dir}/{project.id}.mp4"

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file,
                "-c", "copy",
                final_output,
            ],
            check=True,
        )

        project.final_video_path = final_output
        project.status = "completed"
        project.progress = 100
        db.commit()
        update_progress(project, db, 100)

    except Exception as e:
        if project:
            project.status = "failed"
            db.commit()
            update_progress(project, db, project.progress)
        print("❌ VIDEO JOB FAILED:", e)

    finally:
        db.close()
