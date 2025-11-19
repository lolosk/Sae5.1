import { photos } from "../mock/data";

export default function Photos() {
  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Photos</h2>
        <div style={{ opacity: .7 }}>Tri démo : Date & Lieu</div>
      </div>

      <div className="photos">
        {photos.map((p) => (
          <img key={p.id} alt={p.place} src={p.src} title={`${p.date} • ${p.place}`} />
        ))}
      </div>
    </div>
  );
}
