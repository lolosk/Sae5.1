import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, apiRegister } from "../lib/api";

export default function Login(){
  const [email,setEmail]=useState(""); const [pwd,setPwd]=useState("");
  const [name,setName]=useState("");
  const nav=useNavigate();

  const onLogin = async (e)=>{
    e.preventDefault();
    const r = await apiLogin({ email, password: pwd });
    if (r.ok) nav("/library"); else alert("Échec de connexion");
  };

  const onRegister = async (e)=>{
    e.preventDefault();
    const r = await apiRegister({ email, password: pwd, name });
    if (r.ok) alert("Compte créé, connecte-toi !"); else alert(r.error||"Echec");
  };

  return (
    <div className="hero">
      <div style={{maxWidth:480}}>
        <h1>Connexion</h1>
        <form onSubmit={onLogin} className="row" style={{flexDirection:"column",gap:12}}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Mot de passe" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <button className="btn" type="submit">Se connecter</button>
        </form>

        <h3 style={{marginTop:24}}>Inscription</h3>
        <form onSubmit={onRegister} className="row" style={{flexDirection:"column",gap:12}}>
          <input className="input" placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Mot de passe" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <button className="btn" type="submit">Créer mon compte</button>
        </form>
      </div>
    </div>
  );
}
