// apps/frontend/src/pages/Local.jsx
import { useEffect, useRef, useState } from "react";

const VIDEO_EXT = [".mp4", ".webm", ".ogg", ".m4v", ".mov"];
const AUDIO_EXT = [".mp3", ".m4a", ".ogg", ".flac", ".wav", ".aac"];
const SUB_EXT   = [".vtt"]; // Sous-titres HTML5

const isVideo = (name) => VIDEO_EXT.some(e => name.toLowerCase().endsWith(e));
const isAudio = (name) => AUDIO_EXT.some(e => name.toLowerCase().endsWith(e));
const isSub   = (name) => SUB_EXT.some(e => name.toLowerCase().endsWith(e));
const stem    = (name) => name.replace(/\.[^.]+$/, "");

export default function Local() {
  const [items, setItems] = useState([]);   // [{id,title,type:'video'|'audio',src,subs:[{label,src,default}]}]
  const [current, setCurrent] = useState(null);
  const fileInputRef = useRef(null);

  // Utilitaire: construit la liste d'items à partir d'un FileList / Array<File>
  const buildItems = (filesArr) => {
    const files = Array.from(filesArr);
    const videos = files.filter(f => isVideo(f.name));
    const audios = files.filter(f => isAudio(f.name));
    const subs   = files.filter(f => isSub(f.name));

    const makeItem = (f, type) => {
      const url = URL.createObjectURL(f);
      const matches = subs
        .filter(s => stem(s.name) === stem(f.name))
        .map(s => ({ label: "Subtitles", src: URL.createObjectURL(s), default: true }));
      return { id: crypto.randomUUID(), title: f.name, type, src: url, subs: matches };
    };

    const list = [
      ...videos.map(v => makeItem(v, "video")),
      ...audios.map(a => makeItem(a, "audio")),
    ].sort((a, b) => a.title.localeCompare(b.title));

    return list;
  };

  // A) Sélection d’un dossier (Chromium/Edge)
  const pickDirectory = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker(); // nécessite HTTPS ou localhost
      const files = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind !== "file") continue;
        files.push(await entry.getFile());
      }
      const list = buildItems(files);
      setItems(list);
    } catch {
      // annulé par l’utilisateur → on ignore
    }
  };

  // B) Fallback: sélection de fichiers multiples
  const pickFiles = (fileList) => {
    const list = buildItems(fileList);
    setItems(list);
  };

  // Drag & Drop pratique
  useEffect(() => {
    const onDrop = (e) => {
      e.preventDefault();
      if (e.dataTransfer?.files?.length) pickFiles(e.dataTransfer.files);
    };
    const onDragOver = (e) => e.preventDefault();
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragover", onDragOver);
    return () => {
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragover", onDragOver);
    };
  }, []);

  // Nettoyage des Object URLs quand la liste change/supprime
  useEffect(() => {
    return () => {
      items.forEach(i => {
        URL.revokeObjectURL(i.src);
        i.subs?.forEach(t => URL.revokeObjectURL(t.src));
      });
    };
  }, [items]);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Médias locaux (HTML5)</h2>
        <div className="row">
          {"showDirectoryPicker" in window && (
            <button className="btn" onClick={pickDirectory}>📁 Choisir un dossier</button>
          )}
          <button className="btn" onClick={() => fileInputRef.current?.click()}>➕ Fichiers</button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*,.vtt"
            style={{ display: "none" }}
            onChange={(e) => pickFiles(e.target.files)}
          />
        </div>
      </div>

      {current && (
        <div className="player" style={{ marginBottom: 16 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <strong>{current.title}</strong>
            <button className="btn" onClick={() => setCurrent(null)}>✕ Close</button>
          </div>

          {/* Video */}
          {current.type === "video" && (
            <video
              key={current.id}
              src={current.src}
              controls
              playsInline
              style={{ width: "100%", borderRadius: 8 }}
            >
              {(current.subs || []).map((t, i) => (
                <track key={i} kind="subtitles" src={t.src} label={t.label} default={t.default} />
              ))}
            </video>
          )}

          {/* Audio */}
          {current.type === "audio" && (
            <audio key={current.id} src={current.src} controls style={{ width: "100%" }} />
          )}

          <div className="muted" style={{ marginTop: 6 }}>
            Astuces: barre espace (play/pause) • ← → (seek) • ↑ ↓ (volume) • F (plein écran vidéo).
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="muted">
          Choisis un dossier ou dépose des fichiers ici (drag & drop).<br />
          Pour la meilleure compatibilité : <b>MP4 (H.264 + AAC)</b> et sous-titres <b>.vtt</b>.
        </div>
      ) : (
        <div className="grid">
          {items.map(m => (
            <div
              key={m.id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => setCurrent(m)}
              title={m.title}
            >
              <div
                style={{
                  height: 180,
                  display: "grid",
                  placeItems: "center",
                  background: "#0c1322",
                  borderBottom: "1px solid #1f2937",
                }}
              >
                <div style={{ fontSize: 42 }}>{m.type === "audio" ? "🎵" : "🎬"}</div>
              </div>
              <div className="body">
                <strong style={{ wordBreak: "break-word" }}>{m.title}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
