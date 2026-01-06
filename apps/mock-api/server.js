const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// DEV seulement (vite)
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
}

const users = new Map();
let autoId = 1;

// --- API AUTH ---
app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: "missing_fields" });
  if (users.has(email)) return res.status(409).json({ ok: false, error: "email_exists" });

  users.set(email, { id: autoId++, email, password, name: name || "" });
  res.json({ ok: true, data: { email, name: name || "" } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const u = users.get(email);

  if (!u || u.password !== password) {
    return res.status(401).json({ ok: false, error: "invalid_credentials" });
  }

  res.cookie("sid", String(u.id), {
    httpOnly: true,
    sameSite: "lax",
  });

  res.json({ ok: true, data: { userId: u.id } });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("sid");
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  const sid = req.cookies?.sid;
  const u = [...users.values()].find((x) => String(x.id) === sid);

  if (!u) return res.status(401).json({ ok: false, error: "not_authenticated" });
  res.json({ ok: true, data: { id: u.id, email: u.email, name: u.name } });
});

// --- ensuite seulement : servir le front ---
// app.use(express.static("/app/public"));
// app.get("*", (req, res) => res.sendFile("/app/public/index.html"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ API on http://0.0.0.0:${PORT}`));
