import React, { useEffect, useState } from "react";
import { apiLibrary, apiMe, apiLogout, apiScan } from "../lib/api.js";

export default function Home() {
  const [me, setMe] = useState(null);
  const [lib, setLib] = useState({ videos: [], photos: [], lastScan: null });
  const [tab, setTab] = useState("videos");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [msg, setMsg] = useState("");

  async function refresh() {
    setMsg("");
    const m = await apiMe();
    if (!m.ok) {
      setMe(null);
      setLib({ videos: [], photos: [], lastScan: null });
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
    const r = await apiScan();
    if (!r.ok) return setMsg(r.error || "scan_failed");
    setLib(r.data);
  }

  async function doLogout() {
    await apiLogout();
    setMe(null);
    setLib({ videos: [], photos: [], lastScan: null });
  }

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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8, maxHeight: 520, overflow: "auto" }}>
            {lib.videos.length === 0 && <div style={{ color: "#666" }}>Aucune vidéo trouvée.</div>}
            {lib.videos.map(v => (
              <div key={v.path} style={{ padding: 6, cursor: "pointer", borderBottom: "1px solid #eee" }}
                   onClick={() => setSelectedVideo(v)}>
                {v.path}
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
            {!selectedVideo ? (
              <div style={{ color: "#666" }}>Choisis une vidéo à gauche.</div>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}><b>{selectedVideo.path}</b></div>
                <video
                  controls
                  style={{ width: "100%", maxHeight: 480 }}
                  src={`/stream?path=${encodeURIComponent(selectedVideo.path)}`}
                />
              </>
            )}
          </div>
        </div>
      )}

      {tab === "photos" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {lib.photos.length === 0 && <div style={{ color: "#666" }}>Aucune photo trouvée.</div>}
          {lib.photos.map(p => (
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
      )}
    </div>
  );
}
