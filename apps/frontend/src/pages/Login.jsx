import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const nav = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    // Pas d'API pour la démo : on redirige directement
    nav("/library");
  };

  return (
    <div className="hero">
      <div style={{ maxWidth: 480 }}>
        <h1>Connexion</h1>
        <p style={{ opacity: .8, marginBottom: 18 }}>
          Démo rapide — aucune API, tout est mocké.
        </p>
        <form onSubmit={submit} className="row" style={{ flexDirection: "column", gap: 12 }}>
          <input className="input" placeholder="Email"
                 value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Mot de passe"
                 value={pwd} onChange={(e) => setPwd(e.target.value)} />
          <button className="btn" type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
