const API = import.meta.env.VITE_API_URL || "";
const API_BASE = ""; // important: same origin in Docker


export async function apiRegister({ email, password, name }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, name })
  });
  return res.json();
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function apiMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
  return res.json();
}
