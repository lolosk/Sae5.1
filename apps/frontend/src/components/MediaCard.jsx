// apps/frontend/src/components/MediaCard.jsx
export default function MediaCard({ item, onPlay, subtitle }) {
  return (
    <div className="card">
      {/* image d’aperçu */}
      <img alt={item.title} src={item.cover} />

      <div className="body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>{item.title}</strong>
          {subtitle && <span className="badge">{subtitle}</span>}
        </div>

        <div className="controls">
          {onPlay && (
            <button className="btn" onClick={() => onPlay(item)}>
              ▶ Play
            </button>
          )}
        </div> 
      </div>
    </div>
  );
}
