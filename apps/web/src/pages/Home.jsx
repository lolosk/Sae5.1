import React, { useEffect, useMemo, useState } from "react";
import { apiLibrary, apiMe, apiLogout, apiScan } from "../lib/api.js";
import TreeView from "../components/TreeView.jsx";

function findDirNode(tree, dirPath) {
  if (!tree) return null;
  if (!dirPath) return tree;

  const parts = dirPath.split("/").filter(Boolean);
  let node = tree;

  for (const part of parts) {
    const next = (node.children || []).find((c) => c.type === "dir" && c.name === part);
    if (!next) return null;
    node = next;
  }
  return node;
}

function listFilesInDir(tree, dirPath) {
  const dir = findDirNode(tree, dirPath);
  if (!dir) return [];
  return (dir.children || []).filter((c) => c.type === "file");
}

export default function Home() {
  const [me, setMe] = useState(null);
  const [lib, setLib] = useState({ videos: [], photos: [], videoTree: null, photoTree: null, lastScan: null });

  const [tab, setTab] = useState("videos");

  const [videoDir, setVideoDir] = useState("");
  const [photoDir, setPhotoDir] = useState("");

  const [expandedVideos, setExpandedVideos] = useState(new Set([""]));
  const [expandedPhotos, setExpandedPhotos] = useState(new Set([""]));

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [msg, setMsg] = useState("");

  async function refresh() {
    setMsg("");
    const m = await apiMe();
    if (!m.ok) {
      setMe(null);
      setLib({ videos: [], photos: [], videoTree: null, photoTree: null, lastScan: null });
      return;
    }
    setMe(m.data);

    const l = await apiLibrary();
    if (l.ok) setLib(l.data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function doScan() {
    setMsg("");
    const r = await apiScan();
    if (!r.ok) return setMsg(r.error || "scan_failed");
    setLib(r.data);
  }

  async function doLogout() {
    await apiLogout();
    setMe(null);
    setLib({ videos: [], photos: [], videoTree: null, photoTree: null, lastScan: null });
  }

  const videoFiles = useMemo(() => listFilesInDir(lib.videoTree, videoDir), [lib.videoTree, videoDir]);
  const photoFiles = useMemo(() => listFilesInDir(lib.photoTree, photoDir), [lib.photoTree, photoDir]);

  if (!me) {
    return (
      <div>
        <h2>Accueil</h2>
        <p>Tu dois être connecté pour voir les bibliothèques.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Accueil</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <div>Connecté : <b>{me.email}</b></div>
        <button onClick={doLogout}>Déconnexion</button>
        <button onClick={doScan}>Rescan</button>
        {lib.lastScan && <span style={{ color: "#666" }}>Dernier scan: {new Date(lib.lastScan).toLocaleString()}</span>}
      </div>

      {msg && <div style={{ color: "crimson" }}>{msg}</div>}

      <div style={{ display: "flex", gap: 10, margin: "12px 0" }}>
        <button onClick={() => setTab("videos")} disabled={tab === "videos"}>Vidéos</button>
        <button onClick={() => setTab("photos")} disabled={tab === "photos"}>Photos</button>
      </div>

      {tab === "videos" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8, maxHeight: 620, overflow: "auto" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Dossiers</div>
            {lib.videoTree ? (
              <TreeView
                tree={lib.videoTree}
                selectedPath={videoDir}
                onSelectDir={(p) => { setVideoDir(p); setSelectedVideo(null); }}
                onSelectFile={(fileNode) => setSelectedVideo(fileNode)}
                expanded={expandedVideos}
                setExpanded={setExpandedVideos}
              />
            ) : (
              <div style={{ color: "#666" }}>Clique “Rescan”</div>
            )}
          </div>

          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontWeight: 800 }}>Contenu</div>
              <div style={{ color: "#666" }}>{videoDir ? `/${videoDir}` : "/"} </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
              <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, maxHeight: 420, overflow: "auto" }}>
                {videoFiles.length === 0 && <div style={{ color: "#666" }}>Aucune vidéo dans ce dossier.</div>}
                {videoFiles.map((v) => (
                  <div
                    key={v.path}
                    onClick={() => setSelectedVideo(v)}
                    style={{ padding: 6, cursor: "pointer", borderBottom: "1px solid #f1f1f1" }}
                  >
                    {v.name}
                  </div>
                ))}
              </div>

              <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
                {!selectedVideo ? (
                  <div style={{ color: "#666" }}>Choisis une vidéo.</div>
                ) : (
                  <>
                    <div style={{ marginBottom: 8 }}><b>{selectedVideo.path}</b></div>
                    <video
                      controls
                      style={{ width: "100%", maxHeight: 360 }}
                      src={`/stream?path=${encodeURIComponent(selectedVideo.path)}`}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "photos" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8, maxHeight: 620, overflow: "auto" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Dossiers</div>
            {lib.photoTree ? (
              <TreeView
                tree={lib.photoTree}
                selectedPath={photoDir}
                onSelectDir={(p) => setPhotoDir(p)}
                expanded={expandedPhotos}
                setExpanded={setExpandedPhotos}
              />
            ) : (
              <div style={{ color: "#666" }}>Clique “Rescan”</div>
            )}
          </div>

          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontWeight: 800 }}>Contenu</div>
              <div style={{ color: "#666" }}>{photoDir ? `/${photoDir}` : "/"} </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginTop: 10 }}>
              {photoFiles.length === 0 && <div style={{ color: "#666" }}>Aucune photo dans ce dossier.</div>}
              {photoFiles.map((p) => (
                <div key={p.path} style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
                  <img
                    alt={p.name}
                    style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                    src={`/image?path=${encodeURIComponent(p.path)}`}
                    loading="lazy"
                  />
                  <div style={{ fontSize: 12, padding: 6, color: "#555" }}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
