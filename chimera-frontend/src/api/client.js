const API_BASE = "http://127.0.0.1:8000";

export function logoutUser() {
  localStorage.removeItem("token");
  window.location.reload();
}

export async function apiRequest(path, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (res.status === 401) {
    logoutUser();
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "API error");
  }

  return res.json();
}
