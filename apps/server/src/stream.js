const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { MEDIA_VIDEOS } = require("./library");

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

async function handleStream(req, res) {
  try {
    const rel = String(req.query.path || "");
    const filePath = safeResolve(MEDIA_VIDEOS, rel);
    const stat = await fsp.stat(filePath);
    const size = stat.size;

    const range = req.headers.range;
    const contentType = "video/mp4"; // simple (OK pour démo)

    if (!range) {
      res.writeHead(200, {
        "Content-Length": size,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes"
      });
      return fs.createReadStream(filePath).pipe(res);
    }

    const m = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!m) return res.status(416).end();

    const start = Number(m[1]);
    const end = m[2] ? Number(m[2]) : size - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= size) {
      return res.status(416).end();
    }

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": contentType
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } catch (e) {
    if (e.code === "INVALID_PATH") return res.status(400).send("invalid_path");
    return res.status(404).send("not_found");
  }
}

module.exports = { handleStream };