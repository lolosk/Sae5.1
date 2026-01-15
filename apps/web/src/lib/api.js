async function fetchJson(url, opts = {}) {
  const r = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts
  });

  const data = await r.json().catch(() => null);

  if (!r.ok) {
    const err = new Error(data?.error || `HTTP_${r.status}`);
    err.status = r.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function apiRegister(payload) {
  return fetchJson("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function apiLogin(payload) {
  return fetchJson("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function apiMe() {
  return fetchJson("/api/auth/me");
}

export function apiLogout() {
  return fetchJson("/api/auth/logout", { method: "POST" });
}

export function apiLibrary() {
  return fetchJson("/api/library");
}

export function apiScan() {
  return fetchJson("/api/scan", { method: "POST" });
}
