const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function apiLogin(data) {
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function apiRegister(data) {
  const r = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function apiMe() {
  const r = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
  return r.json();
}
