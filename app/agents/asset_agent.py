import os
import requests
import uuid

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

HEADERS = {
    "Authorization": PEXELS_API_KEY
}

def fetch_stock_video_with_fallback(keywords: list, save_path: str):
    url = "https://api.pexels.com/videos/search"

    for keyword in keywords:
        params = {
            "query": keyword.strip(),
            "per_page": 1,
            "orientation": "portrait"
        }

        response = requests.get(url, headers=HEADERS, params=params)

        if response.status_code != 200:
            continue

        data = response.json()
        if not data.get("videos"):
            continue

        video_files = data["videos"][0]["video_files"]
        best_video = sorted(
            video_files,
            key=lambda x: x.get("width", 0),
            reverse=True
        )[0]

        with requests.get(best_video["link"], stream=True) as r:
            r.raise_for_status()
            with open(save_path, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)

        return save_path

    raise Exception("No stock video found for any keyword")
