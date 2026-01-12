const fsp = require("fs/promises");
const path = require("path");

const MEDIA_VIDEOS = process.env.MEDIA_VIDEOS || "/media/videos";
const MEDIA_PHOTOS = process.env.MEDIA_PHOTOS || "/media/photos";

const VIDEO_EXT = new Set([".mp4", ".mkv", ".webm", ".mov", ".m4v", ".avi"]);
const PHOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

async function walk(rootDir, allowedExt) {
  const root = path.resolve(rootDir);
  const out = [];

  async function rec(dir) {
    let entries = [];
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const e of entries) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) await rec(abs);
      else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (!allowedExt.has(ext)) continue;
        const st = await fsp.stat(abs);
        const rel = path.relative(root, abs).split(path.sep).join("/");
        out.push({ name: e.name, path: rel, size: st.size, mtime: st.mtimeMs });
      }
    }
  }

  await rec(root);
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

let cache = { videos: [], photos: [], lastScan: null };

async function scan() {
  const [videos, photos] = await Promise.all([
    walk(MEDIA_VIDEOS, VIDEO_EXT),
    walk(MEDIA_PHOTOS, PHOTO_EXT)
  ]);
  cache = { videos, photos, lastScan: new Date().toISOString() };
  return cache;
}

function getCache() {
  return cache;
}

module.exports = {
  MEDIA_VIDEOS,
  MEDIA_PHOTOS,
  scan,
  getCache
};