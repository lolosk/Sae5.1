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
      if (e.isDirectory()) {
        await rec(abs);
      } else if (e.isFile()) {
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

function toTree(items) {
  // root virtual
  const root = { type: "dir", name: "", path: "", children: {} };

  for (const it of items) {
    const parts = it.path.split("/").filter(Boolean);
    let node = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        node.children[part] = { type: "file", name: part, path: it.path, meta: it };
      } else {
        node.children[part] ||= {
          type: "dir",
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          children: {}
        };
        node = node.children[part];
      }
    }
  }

  function normalize(dir) {
    const arr = Object.values(dir.children);
    // dirs first, then files, alpha
    arr.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    dir.children = arr;
    for (const c of arr) if (c.type === "dir") normalize(c);
  }

  normalize(root);
  return root;
}

let cache = {
  videos: [],
  photos: [],
  videoTree: { type: "dir", name: "", path: "", children: [] },
  photoTree: { type: "dir", name: "", path: "", children: [] },
  lastScan: null
};

async function scan() {
  const [videos, photos] = await Promise.all([
    walk(MEDIA_VIDEOS, VIDEO_EXT),
    walk(MEDIA_PHOTOS, PHOTO_EXT)
  ]);

  cache = {
    videos,
    photos,
    videoTree: toTree(videos),
    photoTree: toTree(photos),
    lastScan: new Date().toISOString()
  };

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