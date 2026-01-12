export async function apiRegister(payload) {
  const r = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });
  return r.json();
}

export async function apiLogin(payload) {
  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });
  return r.json();
}

export async function apiMe() {
  const r = await fetch("/api/auth/me", { credentials: "include" });
  return r.json();
}

export async function apiLogout() {
  const r = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  return r.json();
}

export async function apiLibrary() {
  const r = await fetch("/api/library", { credentials: "include" });
  return r.json();
}

export async function apiScan() {
  const r = await fetch("/api/scan", { method: "POST", credentials: "include" });
  return r.json();
}
