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
    <div>
      <h2>Inscription</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input placeholder="Nom (optionnel)" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button>Créer le compte</button>
        {msg && <div style={{ color: "crimson" }}>{msg}</div>}
      </form>
    </div>
  );
}
