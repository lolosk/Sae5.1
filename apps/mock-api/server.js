const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// (Optionnel) si tu passes par le proxy Vite, tu peux carrément retirer cors.
app.use(cors({ origin: true, credentials: true }));

const users = new Map();
let autoId = 1;

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
  if (!u || u.password !== password) return res.status(401).json({ ok: false, error: "invalid_credentials" });

  res.cookie("sid", String(u.id), { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json({ ok: true, data: { userId: u.id } });
});

app.get("/api/auth/me", (req, res) => {
  const sid = req.cookies?.sid;
  const u = [...users.values()].find((x) => String(x.id) === String(sid));
  if (!u) return res.status(401).json({ ok: false, error: "not_authenticated" });
  res.json({ ok: true, data: { id: u.id, email: u.email, name: u.name } });
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Mock API on :${PORT}`));
