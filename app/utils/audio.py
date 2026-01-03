import wave
import contextlib

def get_audio_duration(audio_path: str) -> float:
    with contextlib.closing(wave.open(audio_path, "r")) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        return frames / float(rate)
