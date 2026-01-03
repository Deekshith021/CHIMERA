import subprocess
import os

def merge_audio_video(video_path, audio_path, output_path, duration):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-i", video_path,
        "-i", audio_path,
        "-t", str(duration),
        "-vf", "scale=1080:1920",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-shortest",
        output_path
    ]

    subprocess.run(cmd, check=True)
