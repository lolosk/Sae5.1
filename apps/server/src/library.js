import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ROOTS } from "./config.js";

const videoExt = [".mp4",".webm",".ogg",".m4v",".mov",".mkv"];
const photoExt = [".jpg",".jpeg",".png",".webp",".gif",".bmp"];

const isVideo = p => videoExt.some(e => p.toLowerCase().endsWith(e));
const isPhoto = p => photoExt.some(e => p.toLowerCase().endsWith(e));

export function safeJoin(rootKey, rel="") {
  const base = ROOTS[rootKey];
  const abs = path.resolve(base, rel);
  if (!base || !abs.startsWith(base)) throw new Error("path_outside_root");
  return abs;
}

async function walk(dir, filter) {
  const out = [];
  const ents = await fsp.readdir(dir, { withFileTypes: true }).catch(()=>[]);
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

export async function buildLibrary() {
  const res = { movies: [], series: [], photos: [] };
  const push = async (rootKey, filter, bucket, type) => {
    const base = ROOTS[rootKey];
    if (!base) return;
    const files = await walk(base, filter);
    for (const abs of files) {
      const rel = path.relative(base, abs);
      const st = await fsp.stat(abs);
      const id = crypto.createHash("md5").update(`${rootKey}:${rel}`).digest("hex");
      const title = path.basename(abs).replace(/\.[^.]+$/,"");
      bucket.push({ id, title, rel, root: rootKey, size: st.size, mtime: st.mtimeMs, type });
    }
    bucket.sort((a,b)=>a.title.localeCompare(b.title));
  };
  await push("movies", isVideo, res.movies, "video");
  await push("series", isVideo, res.series, "video");
  await push("photos", isPhoto, res.photos, "photo");
  return res;
}
