import { useEffect, useState } from "react";
import MediaCard from "../components/MediaCard";
import Player from "../components/Player";

const TABS = ["Films", "Séries", "Musiques"];

export default function Library() {
  const [tab, setTab] = useState("Films");
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({
    movies: [],
    series: [],
    audios: [], // si le backend expose "audios" (optionnel)
  });

  // charge la bibliothèque (scan à la demande si rescan=true)
  const load = async (rescan = false) => {
    try {
      setErr("");
      setLoading(true);
      const url = rescan ? "/api/scan" : "/api/library";
      const resp = await fetch(url, { method: rescan ? "POST" : "GET" });
      const json = await resp.json();

      const lib = json?.data || {};
      const mapVideo = (it) => ({
        id: it.id,
        title: it.title,
        // fallback vignette: on pointe l'image (si c’est une vidéo, ce sera l’icône par défaut côté carte)
        cover: `/image?root=${it.root}&path=${encodeURIComponent(it.rel)}`,
        src: `/stream?root=${it.root}&path=${encodeURIComponent(it.rel)}`,
        genre: it.genre,
      });
      const mapAudio = (it) => ({
        id: it.id,
        title: it.title,
        src: `/stream?root=${it.root}&path=${encodeURIComponent(it.rel)}`,
        artist: it.artist,
      });

      setData({
        movies: (lib.movies || []).map(mapVideo),
        series: (lib.series || []).map(mapVideo),
        audios: (lib.audios || []).map(mapAudio), // restera [] si non fourni
      });
    } catch (e) {
      console.error(e);
      setErr("Impossible de charger la bibliothèque.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
  }, []);

  const items =
    tab === "Films" ? data.movies : tab === "Séries" ? data.series : data.audios;

  return (
    <div className="container">
      <div
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 16 }}
      >
        <h2>Library</h2>
        <div className="row" style={{ gap: 8 }}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`btn ${t === tab ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          <button className="btn" onClick={() => load(true)} title="Re-scanner les dossiers">
            🔄 Rescanner
          </button>
        </div>
      </div>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}
      {loading && <div className="muted">Chargement…</div>}

      {current && (
        <div style={{ marginBottom: 16 }}>
          <Player
            item={current}
            type={tab === "Musiques" ? "audio" : "video"}
            onClose={() => setCurrent(null)}
          />
        </div>
      )}

      <div className="grid">
        {items.map((m) => (
          <MediaCard
            key={m.id}
            item={m}
            onPlay={setCurrent}
            // MediaCard peut afficher "cover" si dispo, sinon un pictogramme
            subtitle={m.genre || m.artist}
          />
        ))}
      </div>

      <footer className="muted" style={{ marginTop: 18 }}>
        API: <code>/api/library</code> • Lecture: <code>/stream?root=&amp;path=</code> • Scan: <code>/api/scan</code>
      </footer>
    </div>
  );
}
