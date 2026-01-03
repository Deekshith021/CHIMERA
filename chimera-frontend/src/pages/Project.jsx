import { useEffect, useRef, useState, useMemo } from "react";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import SceneThumbnail from "../components/SceneThumbnail";

const API_BASE = "http://127.0.0.1:8000";
const AVG_SCENE_TIME = 6;

export default function Project({ projectId, goBack }) {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [wsError, setWsError] = useState(false);
  const [rawScenes, setRawScenes] = useState([]);

  const scenesFetchedRef = useRef(false);
  const prevActiveSceneRef = useRef(null);

  /* Smooth progress animation */
  useEffect(() => {
    const t = setInterval(() => {
      setSmoothProgress((p) => (p < progress ? p + 1 : p));
    }, 20);
    return () => clearInterval(t);
  }, [progress]);

  async function fetchStatus() {
    const res = await fetch(
      `${API_BASE}/projects/${projectId}/status`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    const d = await res.json();
    setStatus(d.status);
    setProgress(d.progress ?? 0);
    setRetryCount(d.retry_count ?? 0);
  }

  async function loadScenesOnce() {
    if (scenesFetchedRef.current) return;
    scenesFetchedRef.current = true;

    const res = await fetch(
      `${API_BASE}/projects/${projectId}/scenes`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    const data = await res.json();
    const map = new Map();
    data.forEach((s) => map.set(s.scene_order, s));
    setRawScenes(
      Array.from(map.values()).sort((a, b) => a.scene_order - b.scene_order)
    );
  }

  useEffect(() => {
    loadScenesOnce();
    fetchStatus();

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/projects/${projectId}`
    );

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setStatus(d.status);
      setProgress(d.progress ?? 0);
      setRetryCount(d.retry_count ?? 0);
    };

    ws.onerror = () => status === "processing" && setWsError(true);
    ws.onclose = () => status === "processing" && setWsError(true);

    return () => ws.close();
  }, [projectId]);

  async function generateScenes() {
    scenesFetchedRef.current = false;
    setRawScenes([]);

    await fetch(
      `${API_BASE}/projects/${projectId}/generate-scenes`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    loadScenesOnce();
    fetchStatus();
  }

  async function generateVideo() {
    setStatus("processing");
    setProgress(0);
    setWsError(false);

    await fetch(
      `${API_BASE}/projects/${projectId}/generate-video`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  }

  async function downloadVideo() {
    const res = await fetch(
      `${API_BASE}/projects/${projectId}/download`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const scenes = useMemo(() => rawScenes, [rawScenes]);

  const sceneFloat = (smoothProgress / 100) * scenes.length;
  const activeSceneIndex = Math.floor(sceneFloat);

  function sceneProgress(i) {
    if (i < activeSceneIndex) return 100;
    if (i === activeSceneIndex)
      return Math.floor((sceneFloat - i) * 100);
    return 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Project</h2>
        <Button variant="secondary" onClick={goBack}>← Back</Button>
      </div>

      <ProgressBar value={smoothProgress} />

      <div className="space-y-3">
        {scenes.map((scene, i) => {
          const active = i === activeSceneIndex && status === "processing";
          const pulse =
            prevActiveSceneRef.current !== activeSceneIndex && active;

          if (active) prevActiveSceneRef.current = activeSceneIndex;

          return (
            <div
              key={`${scene.scene_order}-${scene.project_id}`}
              className={`p-3 border rounded transition-all
                ${active ? "border-blue-500 bg-blue-50" : ""}
                ${pulse ? "ring-2 ring-blue-300" : ""}`}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">
                  Scene {scene.scene_order}
                </p>
                {active && (
                  <div className="h-4 w-4 animate-spin border-2 border-blue-500 border-t-transparent rounded-full" />
                )}
              </div>

              <SceneThumbnail
                projectId={projectId}
                sceneOrder={scene.scene_order}
              />

              <p className="text-xs mt-2 text-gray-600">
                {scene.narration}
              </p>

              {status === "processing" && (
                <>
                  <ProgressBar value={sceneProgress(i)} />
                  <p className="text-xs text-gray-500">
                    {sceneProgress(i)}%
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={generateScenes} disabled={status !== "idle"}>
          Generate Scenes
        </Button>

        <Button
          onClick={generateVideo}
          disabled={status !== "scenes_generated"}
        >
          Generate Video
        </Button>

        {status === "completed" && (
          <Button variant="secondary" onClick={downloadVideo}>
            Download Video
          </Button>
        )}
      </div>

      {wsError && (
        <p className="text-sm text-red-500">
          Live updates disconnected — job still running
        </p>
      )}
    </div>
  );
}
