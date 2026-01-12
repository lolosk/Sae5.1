const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { loadUsers, saveUsers } = require("./storage");

const router = express.Router();

// sessions en mémoire : sid -> userId
const sessions = new Map();

function getSid(req) {
  return req.cookies?.sid || null;
}

async function getUserFromReq(req) {
  const sid = getSid(req);
  if (!sid) return null;
  const userId = sessions.get(sid);
  if (!userId) return null;

  const users = await loadUsers();
  return users.find(u => u.id === userId) || null;
}

async function requireAuth(req, res, next) {
  const u = await getUserFromReq(req);
  if (!u) return res.status(401).json({ ok: false, error: "not_authenticated" });
  req.user = u;
  next();
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: "missing_fields" });

  const users = await loadUsers();
  const exists = users.some(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) return res.status(409).json({ ok: false, error: "email_exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    email: String(email),
    name: String(name || ""),
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  await saveUsers(users);

  res.json({ ok: true });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: "missing_fields" });

  const users = await loadUsers();
  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(401).json({ ok: false, error: "invalid_credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: "invalid_credentials" });

  const sid = crypto.randomUUID();
  sessions.set(sid, user.id);

  res.cookie("sid", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // http en LAN/WAN
    path: "/"
  });

  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const { id, email, name } = req.user;
  res.json({ ok: true, data: { id, email, name } });
});

router.post("/logout", (req, res) => {
  const sid = getSid(req);
  if (sid) sessions.delete(sid);
  res.clearCookie("sid", { path: "/" });
  res.json({ ok: true });
});

module.exports = { authRouter: router, requireAuth };