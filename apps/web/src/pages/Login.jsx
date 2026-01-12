import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../lib/api.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    const r = await apiLogin({ email, password });
    if (!r.ok) return setMsg(r.error || "login_failed");
    nav("/");
  }

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button>Se connecter</button>
        {msg && <div style={{ color: "crimson" }}>{msg}</div>}
      </form>
    </div>
  );
}
