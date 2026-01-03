import json
import re

def safe_json_loads(text: str):
    """
    Attempts to safely parse JSON returned by LLMs.
    Fixes common issues like trailing quotes, markdown, etc.
    """
    # Remove markdown fences
    text = re.sub(r"```json|```", "", text).strip()

    # Fix common numeric quote issue: 5" -> 5
    text = re.sub(r'(\d+)"', r'\1', text)

    # Attempt parse
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from LLM: {e}\n\nRAW:\n{text}")
