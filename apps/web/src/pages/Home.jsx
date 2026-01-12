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
  const [lib, setLib] = useState({
    videos: [],
    photos: [],
    videoTree: null,
    photoTree: null,
    lastScan: null
  });

  const [tab, setTab] = useState("videos");

  const [videoDir, setVideoDir] = useState("");
  const [photoDir, setPhotoDir] = useState("");

  const [expandedVideos, setExpandedVideos] = useState(new Set([""]));
  const [expandedPhotos, setExpandedPhotos] = useState(new Set([""]));

  const [selectedVideo, setSelectedVideo] = useState(null);

  // lightbox photos
  const [photoIndex, setPhotoIndex] = useState(-1);

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

  // si on change de dossier photos, on ferme la modale
  useEffect(() => {
    setPhotoIndex(-1);
  }, [photoDir]);

  if (!me) {
    return (
      <div>
        <h2>Accueil</h2>
        <p>Tu dois être connecté pour voir les bibliothèques.</p>
        <p style={{ color: "#666" }}>Va sur “Connexion” ou “Inscription”.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Accueil</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <div>
          Connecté : <b>{me.email}</b>
        </div>
        <button onClick={doLogout}>Déconnexion</button>
        <button onClick={doScan}>Rescan</button>
        {lib.lastScan && (
          <span style={{ color: "#666" }}>Dernier scan: {new Date(lib.lastScan).toLocaleString()}</span>
        )}
      </div>

      {msg && <div style={{ color: "crimson", marginBottom: 10 }}>{msg}</div>}

      <div style={{ display: "flex", gap: 10, margin: "12px 0" }}>
        <button onClick={() => setTab("videos")} disabled={tab === "videos"}>
          Vidéos
        </button>
        <button onClick={() => setTab("photos")} disabled={tab === "photos"}>
          Photos
        </button>
      </div>

      {tab === "videos" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
          {/* Arbo */}
          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8, maxHeight: 620, overflow: "auto" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Dossiers</div>
            {lib.videoTree ? (
              <TreeView
                tree={lib.videoTree}
                selectedPath={videoDir}
                onSelectDir={(p) => {
                  setVideoDir(p);
                  setSelectedVideo(null);
                }}
                onSelectFile={(fileNode) => setSelectedVideo(fileNode)}
                expanded={expandedVideos}
                setExpanded={setExpandedVideos}
              />
            ) : (
              <div style={{ color: "#666" }}>Clique “Rescan”</div>
            )}
          </div>

          {/* Contenu */}
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
                    style={{
                      padding: 8,
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f1f1",
                      background: selectedVideo?.path === v.path ? "#eef2ff" : "transparent",
                      borderRadius: 6
                    }}
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
                    <div style={{ marginBottom: 8 }}>
                      <b>{selectedVideo.path}</b>
                    </div>
                    <video
                      controls
                      style={{ width: "100%", maxHeight: 360, background: "#000", borderRadius: 8 }}
                      src={`/stream?path=${encodeURIComponent(selectedVideo.path)}`}
                    />
                    <div style={{ marginTop: 6, color: "#666", fontSize: 12 }}>
                      Astuce : les MKV peuvent ne pas avoir de son si le codec audio n’est pas supporté par le navigateur.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "photos" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
          {/* Arbo */}
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

          {/* Contenu */}
          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontWeight: 800 }}>Contenu</div>
              <div style={{ color: "#666" }}>{photoDir ? `/${photoDir}` : "/"} </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 10,
                marginTop: 10
              }}
            >
              {photoFiles.length === 0 && <div style={{ color: "#666" }}>Aucune photo dans ce dossier.</div>}

              {photoFiles.map((p, idx) => (
                <div
                  key={p.path}
                  style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden", cursor: "pointer" }}
                  onClick={() => setPhotoIndex(idx)}
                  title="Clique pour agrandir"
                >
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

            {photoIndex >= 0 && (
              <PhotoModal
                files={photoFiles}
                index={photoIndex}
                onClose={() => setPhotoIndex(-1)}
                onPrev={() => setPhotoIndex((i) => (i > 0 ? i - 1 : i))}
                onNext={() => setPhotoIndex((i) => (i < photoFiles.length - 1 ? i + 1 : i))}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoModal({ files, index, onClose, onPrev, onNext }) {
  const file = files[index];

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!file) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 9999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          borderRadius: 12,
          maxWidth: "96vw",
          maxHeight: "92vh",
          width: "min(1100px, 96vw)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "10px 12px",
            color: "white",
            background: "rgba(0,0,0,0.35)"
          }}
        >
          <div
            style={{
              fontSize: 13,
              opacity: 0.9,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
            title={file.path}
          >
            {file.path}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={onPrev} disabled={index === 0}>
              ←
            </button>
            <button onClick={onNext} disabled={index === files.length - 1}>
              →
            </button>
            <button onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
          <img
            alt={file.name}
            src={`/image?path=${encodeURIComponent(file.path)}`}
            style={{
              maxWidth: "100%",
              maxHeight: "78vh",
              objectFit: "contain",
              borderRadius: 8
            }}
          />
        </div>
      </div>
    </div>
  );
}
