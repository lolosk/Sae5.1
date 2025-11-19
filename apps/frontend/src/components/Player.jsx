// apps/frontend/src/components/Player.jsx
export default function Player({ item, type = "video", onClose }) {
  const hasSrc = !!item?.src;

  return (
    <div className="player">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div>
          <strong>{item?.title || item?.artist || "Lecture"}</strong>
          {item?.year && <span style={{opacity:.7, marginLeft:8}}>• {item.year}</span>}
        </div>
        <button className="btn" onClick={onClose}>✕ Close</button>
      </div>

      {!hasSrc && (
        <div style={{padding:12, border:"1px dashed #334155", borderRadius:8, opacity:.8}}>
          Source manquante. (Démo) — renseigne <code>item.src</code>.
        </div>
      )}

      {hasSrc && (
        type === "audio" ? (
          <audio src={item.src} controls style={{width:"100%"}} />
        ) : (
          <video
            src={item.src}
            poster={item.cover}
            controls
            style={{width:"100%", borderRadius:8}}
          />
        )
      )}
    </div>
  );
}
