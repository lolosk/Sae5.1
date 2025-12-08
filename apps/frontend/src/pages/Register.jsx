import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRegister } from "../lib/api";

export default function Register(){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pwd,setPwd]=useState("");
  const [err,setErr]=useState(""); const [ok,setOk]=useState(false);
  const nav=useNavigate();

  const onRegister = async (e)=>{
    e.preventDefault(); setErr(""); setOk(false);
    const r = await apiRegister({ name, email, password: pwd });
    if (r?.ok){ setOk(true); setTimeout(()=>nav("/login"), 600); }
    else setErr(r?.error ?? "Inscription impossible");
  };

  return (
    <div className="card-center">
      <div className="card-pad">
        <h1 className="h1">Créer un compte</h1>
        <div className="muted" style={{marginBottom:14}}>Rejoins la plateforme.</div>
        {err && <div className="err">{err}</div>}
        {ok  && <div className="badge" style={{display:"inline-block",marginBottom:8}}>Compte créé ✅</div>}
        <form onSubmit={onRegister} style={{display:"grid",gap:10}}>
          <input className="input" placeholder="Nom (optionnel)" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Mot de passe" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <div className="actions">
            <button className="btn" type="submit">S’inscrire</button>
            <Link className="link" to="/login">J’ai déjà un compte</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
