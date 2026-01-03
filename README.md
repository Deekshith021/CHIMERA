# 🧬 CHIMERA

**CHIMERA** is an AI-powered, end-to-end **automated video generation platform** that converts a simple text prompt into a fully rendered video using stock footage, AI voice-over, and FFmpeg-based stitching.

---

## 🚀 Features

- 🔐 User Authentication (JWT-based)
- 🧠 AI Script & Scene Generation (OpenAI)
- 🎞️ Free Stock Video Fetching (keyword fallback)
- 🔊 AI Voice Generation (TTS)
- 🎬 FFmpeg Video Stitching
- 📊 Real-time Progress Tracking (WebSocket)
- 🧩 Scene-level Progress & Retry Logic
- 📥 Final Video Download
- 🎨 Modern UI with Tailwind CSS
- 📱 Mobile-friendly responsive frontend


## 🏗️ Architecture

Frontend (React + Tailwind)
|
| REST + WebSocket
|
Backend (FastAPI)
|
├── PostgreSQL (users, projects, scenes)
├── OpenAI (script generation)
├── Stock Video APIs (free)
├── TTS Engine
└── FFmpeg (video rendering)



## 🛠️ Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- OpenAI API
- FFmpeg
- WebSockets
- JWT Authentication

### Frontend
- React
- Tailwind CSS
- Vite
- WebSocket Client

---

## 📂 Project Structure

chimera/
├── app/
│ ├── agents/ # AI + asset logic
│ ├── jobs/ # Video pipeline jobs
│ ├── models/ # DB models
│ ├── routers/ # API routes
│ ├── services/ # Business logic
│ ├── utils/ # Helpers
│ └── main.py
├── frontend/
│ ├── src/
│ └── package.json
├── assets/ # Generated (gitignored)
├── .gitignore
├── README.md
└── requirements.txt



## ▶️ How to Run Locally


 1️⃣ Backend

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
Backend runs on:
http://127.0.0.1:8000


2️⃣ Frontend
cd frontend
npm install
npm run dev
Frontend runs on:
arduino


http://localhost:5173



📌 Status
✅ Core pipeline complete

✅ Real-time progress tracking

✅ Scene previews & retries

👨‍💻 Author
Deekshith K V

GitHub: https://github.com/Deekshith021
