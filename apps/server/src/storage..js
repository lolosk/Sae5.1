const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureDataDir() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    await fsp.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2), "utf-8");
  }
}

async function loadUsers() {
  await ensureDataDir();
  const raw = await fsp.readFile(USERS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

async function saveUsers(users) {
  await ensureDataDir();
  await fsp.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2), "utf-8");
}

module.exports = {
  DATA_DIR,
  USERS_FILE,
  loadUsers,
  saveUsers
};
