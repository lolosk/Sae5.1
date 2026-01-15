import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import { apiMe, apiLogout } from "./lib/api.js";

export default function App() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const r = await apiMe();
      setMe(r.ok ? r.data : null);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  async function doLogout() {
    try {
      await apiLogout();
    } finally {
      setMe(null);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbarInner">
          <div className="brand">MediaDock</div>

          <nav className="nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")}>
              Accueil
            </NavLink>

            {!me && (
              <>
                <NavLink to="/login" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")}>
                  Connexion
                </NavLink>
                <NavLink to="/register" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")}>
                  Inscription
                </NavLink>
              </>
            )}
          </nav>

          <div className="spacer" />

        {me ? (
          <>
            <span className="badge">
              Connecté : <b>{me.email}</b>
            </span>
            <button className="btn" onClick={doLogout}>
              Déconnexion
            </button>
          </>
        ) : null}

        </div>
      </header>

      <main className="container">
        {loading ? (
          <div className="empty">Chargement…</div>
        ) : (
          <Routes>
            <Route path="/" element={<Home me={me} />} />
            <Route path="/login" element={<Login onDone={refreshMe} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </>
  );
}
