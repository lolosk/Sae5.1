const fs = require("fs");
const fsp = require("fs/promises");
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

async function handleDoc(req, res) {
  try {
    const rel = String(req.query.path || "");
    const filePath = safeResolve(MEDIA_PHOTOS, rel);

    // On limite aux PDF (pour éviter de devenir un "file server" global)
    if (path.extname(filePath).toLowerCase() !== ".pdf") {
      return res.status(400).send("not_a_pdf");
    }

    const stat = await fsp.stat(filePath);
    const size = stat.size;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Accept-Ranges", "bytes");

    const range = req.headers.range;

    // Beaucoup de viewers PDF utilisent Range
    if (!range) {
      res.writeHead(200, { "Content-Length": size });
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
      "Content-Length": end - start + 1
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } catch (e) {
    if (e.code === "INVALID_PATH") return res.status(400).send("invalid_path");
    return res.status(404).send("not_found");
  }
}

module.exports = { handleDoc };
