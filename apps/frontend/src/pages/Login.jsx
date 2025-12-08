import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiLogin } from "../lib/api";

export default function Login(){
  const [email,setEmail]=useState("");
  const [pwd,setPwd]=useState("");
  const [err,setErr]=useState("");
  const nav=useNavigate();

  const onLogin = async (e)=>{
    e.preventDefault(); setErr("");
    const r = await apiLogin({ email, password: pwd });
    if (r?.ok) nav("/library");
    else setErr(r?.error ?? "Échec de connexion");
  };

  return (
    <div className="card-center">
      <div className="card-pad">
        <h1 className="h1">Connexion</h1>
        <div className="muted" style={{marginBottom:14}}>Accède à ta médiathèque.</div>
        {err && <div className="err">{err}</div>}
        <form onSubmit={onLogin} style={{display:"grid",gap:10}}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Mot de passe" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <div className="actions">
            <button className="btn" type="submit">Se connecter</button>
            <Link className="link" to="/register">Créer un compte</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
