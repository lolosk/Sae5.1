const fs = require("fs");
const path = require("path");
const { MEDIA_PHOTOS } = require("./library");

function safeResolve(rootDir, relPath) {
  const root = path.resolve(rootDir);
  const target = path.resolve(rootDir, relPath || "");
  if (!target.startsWith(root + path.sep) && target !== root) {
    const err = new Error("invalid_path");
    err.code = "INVALID_PATH";
    throw err;
  }
  return target;
}

function mimeFromExt(ext) {
  ext = String(ext).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

async function handleImage(req, res) {
  try {
    const rel = String(req.query.path || "");
    const filePath = safeResolve(MEDIA_PHOTOS, rel);
    res.setHeader("Content-Type", mimeFromExt(path.extname(filePath)));
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    if (e.code === "INVALID_PATH") return res.status(400).send("invalid_path");
    return res.status(404).send("not_found");
  }
}

module.exports = { handleImage };
