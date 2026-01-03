from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, project_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(project_id, []).append(websocket)

    def disconnect(self, project_id: str, websocket: WebSocket):
        self.active_connections[project_id].remove(websocket)
        if not self.active_connections[project_id]:
            del self.active_connections[project_id]

    async def broadcast(self, project_id: str, message: dict):
        for ws in self.active_connections.get(project_id, []):
            await ws.send_json(message)
