import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function SceneThumbnail({ projectId, sceneOrder }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadThumbnail() {
      try {
        const res = await fetch(
          `${API_BASE}/projects/${projectId}/scenes/${sceneOrder}/thumbnail`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) throw new Error("Not ready");

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (active) {
          setUrl(objectUrl);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    }

    loadThumbnail();

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [projectId, sceneOrder]);

  if (loading) {
    return (
      <div className="h-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
        Loading preview…
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
        Preview pending
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`Scene ${sceneOrder}`}
      className="h-24 w-full object-cover rounded"
    />
  );
}
