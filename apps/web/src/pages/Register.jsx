import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRegister } from "../lib/api.js";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    const r = await apiRegister({ name, email, password });
    if (!r.ok) return setMsg(r.error || "register_failed");
    nav("/login");
  }

  return (
    <div className="card formCard">
      <div className="cardHeader">
        <div className="cardTitle">Inscription</div>
      </div>

      <div className="cardBody">
        {msg && <div className="empty" style={{ marginBottom: 12 }}>Erreur : {msg}</div>}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <div>
            <label>Nom (optionnel)</label>
            <input className="input" placeholder="Nom (optionnel)" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

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

          <button className="btn btnPrimary">Créer le compte</button>
        </form>
      </div>
    </div>
  );
}
