from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()

@router.websocket("/ws/projects/{project_id}")
async def project_ws(websocket: WebSocket, project_id: str):
    await manager.connect(project_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(project_id, websocket)
