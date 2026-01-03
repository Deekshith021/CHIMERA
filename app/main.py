from fastapi import FastAPI
from app.routers import auth, project
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ws


app = FastAPI()

app.include_router(auth.router)
app.include_router(project.router)

from app.routers import ws
app.include_router(ws.router)

@app.get("/")
def root():
    return {"status": "Chimera backend running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
