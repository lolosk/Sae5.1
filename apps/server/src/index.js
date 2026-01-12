const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const { authRouter, requireAuth } = require("./auth");
const { scan, getCache } = require("./library");
const { handleStream } = require("./stream");
const { handleImage } = require("./image");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// --- API ---
app.use("/api/auth", authRouter);

app.get("/api/library", requireAuth, (req, res) => {
  res.json({ ok: true, data: getCache() });
});

app.post("/api/scan", requireAuth, async (req, res) => {
  try {
    const data = await scan();
    res.json({ ok: true, data });
  } catch {
    res.status(500).json({ ok: false, error: "scan_failed" });
  }
});

app.get("/stream", requireAuth, handleStream);
app.get("/image", requireAuth, handleImage);

// --- FRONT static (prod) ---
const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/stream") || req.path.startsWith("/image")) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// scan au démarrage (best effort)
scan().catch(() => {});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ MediaDock up on http://0.0.0.0:${PORT}`);
});
