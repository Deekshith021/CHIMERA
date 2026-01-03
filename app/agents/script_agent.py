import os
import json
import re
from openai import OpenAI

# =========================
# OPENAI CLIENT
# =========================
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# =========================
# SYSTEM PROMPT
# =========================
SYSTEM_PROMPT = """
You are a STRICT JSON generator.

Rules:
- Output ONLY valid JSON
- No markdown
- No explanations
- Numbers must be numbers, not strings
- No trailing commas

Return ONLY a JSON array of objects with EXACT keys:
scene_order (number)
narration (string)
keywords (string)
duration (number)
"""

# =========================
# SAFE JSON PARSER
# =========================
def safe_json_loads(text: str):
    """
    Safely parse JSON returned by LLMs.
    Fixes common formatting mistakes.
    """
    if not text:
        raise ValueError("Empty response from OpenAI")

    # Remove markdown fences
    text = re.sub(r"```json|```", "", text).strip()

    # Fix numeric quote issues: 5" → 5
    text = re.sub(r'(\d+)"', r'\1', text)

    # Remove trailing commas
    text = re.sub(r",\s*}", "}", text)
    text = re.sub(r",\s*]", "]", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Invalid JSON returned by OpenAI\n\nERROR: {e}\n\nRAW:\n{text}"
        )

# =========================
# SCENE GENERATOR
# =========================
def generate_scenes(prompt: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""
Create a 60 second video plan.

Return ONLY a JSON array.

Each object must contain:
- scene_order (int)
- narration (string)
- keywords (comma separated string)
- duration (seconds)

Topic: {prompt}
"""
            }
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content

    print("🔴 RAW OPENAI OUTPUT:")
    print(repr(content))

    return safe_json_loads(content)
