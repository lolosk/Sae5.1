import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../lib/api.js";

export default function Login({ onDone }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    const r = await apiLogin({ email, password });
    if (!r.ok) return setMsg(r.error || "login_failed");

    await onDone?.(); // refresh me dans App
    nav("/");
  }

  return (
    <div className="card formCard">
      <div className="cardHeader">
        <div className="cardTitle">Connexion</div>
      </div>

      <div className="cardBody">
        {msg && <div className="empty" style={{ minHeight: 0, padding: 12, marginBottom: 12 }}>Erreur : {msg}</div>}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <div>
            <label>Email</label>
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label>Mot de passe</label>
            <input
              className="input"
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btnPrimary">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
