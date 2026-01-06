const API = import.meta.env.VITE_API_URL || "";
const API_BASE = ""; // important: same origin in Docker


export async function apiLogin(data) {
  return fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  }).then(r => r.json());
}

export async function apiRegister(data) {
  return fetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  }).then(r => r.json());
}

export async function apiMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
  return res.json();
}
