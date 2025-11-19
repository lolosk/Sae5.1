import { useState } from "react";
import { films, series, musiques } from "../mock/data";
import MediaCard from "../components/MediaCard";
import Player from "../components/Player";

const TABS = ["Films", "Séries", "Musiques"];

export default function Library() {
  const [tab, setTab] = useState("Films");
  const [current, setCurrent] = useState(null);

  const items = tab === "Films" ? films : tab === "Séries" ? series : musiques;

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Library</h2>
        <div className="row">
          {TABS.map((t) => (
            <button key={t} className={`btn ${t === tab ? "active" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
</div>

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
            subtitle={m.genre || m.artist}
          />
        ))}
      </div>

      <footer>Démo mock — prêt pour branchement API (VITE_API_URL).</footer>
    </div>
  );
}
