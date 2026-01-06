import "dotenv/config";
import express from "express";
import morgan from "morgan";
import compression from "compression";
import fs from "node:fs";
import path from "node:path";
import mime from "mime-types";
import { PORT, ROOTS } from "./config.js";
import { buildLibrary, safeJoin } from "./library.js";

const app = express();
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());

// cache simple (scan à la demande)
let cache = null;
app.get("/api/library", async (_req,res)=>{ if(!cache) cache = await buildLibrary(); res.json({ok:true,data:cache}); });
app.post("/api/scan",  async (_req,res)=>{ cache = await buildLibrary(); res.json({ok:true,data:cache}); });

// streaming vidéo avec HTTP Range
app.get("/stream", (req,res)=>{
  const { root, path: rel } = req.query;
  if (!ROOTS[root] || !rel) return res.status(400).json({ok:false,error:"bad_params"});
  const abs = safeJoin(root, rel);
  if (!fs.existsSync(abs)) return res.status(404).end();

  const stat = fs.statSync(abs);
  const ctype = mime.lookup(abs) || "application/octet-stream";
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {"Content-Type": ctype, "Content-Length": stat.size});
    return fs.createReadStream(abs).pipe(res);
  }
  const m = range.match(/bytes=(\d+)-(\d+)?/);
  const start = parseInt(m[1],10);
  const end = m[2] ? parseInt(m[2],10) : stat.size-1;
  if (start >= stat.size || end >= stat.size) {
    res.writeHead(416, {"Content-Range": `bytes */${stat.size}`}); return res.end();
  }
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end-start+1,
    "Content-Type": ctype
  });
  fs.createReadStream(abs, {start, end}).pipe(res);
});

// images (photos)
app.get("/image", (req,res)=>{
  const { root, path: rel } = req.query;
  if (!ROOTS[root] || !rel) return res.status(400).json({ok:false,error:"bad_params"});
  const abs = safeJoin(root, rel);
  if (!fs.existsSync(abs)) return res.status(404).end();
  res.type(mime.lookup(abs) || "image/jpeg");
  fs.createReadStream(abs).pipe(res);
});

// front (build Vite copié en /app/public)
const PUBLIC_DIR = path.resolve("/app/public");
app.use(express.static(PUBLIC_DIR));
app.get("*", (_req,res)=>res.sendFile(path.join(PUBLIC_DIR,"index.html")));

app.listen(PORT, ()=> {
  console.log(`Media server up http://0.0.0.0:${PORT}`);
  console.log("Roots:", ROOTS);
});
