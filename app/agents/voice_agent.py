from TTS.api import TTS
import os

# Load once (important for performance)
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")

def generate_voice(narration: str, output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    tts.tts_to_file(text=narration, file_path=output_path)
    return output_path
