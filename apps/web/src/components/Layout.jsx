import { NavLink } from "react-router-dom";

export default function Layout({ user, onLogout, onRescan, children }) {
  return (
    <>
      <header className="topbar">
        <div className="topbarInner">
          <div className="brand">MediaDock</div>

          <nav className="nav">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")}
            >
              Accueil
            </NavLink>

            {!user && (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")}
                >
                  Connexion
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")}
                >
                  Inscription
                </NavLink>
              </>
            )}
          </nav>

          <div className="spacer" />

          {user ? (
            <>
              <span className="badge">
                Connecté : <b>{user.name || user.email}</b>
              </span>
              <button className="btn" onClick={onLogout}>
                Déconnexion
              </button>
              <button className="btn btnPrimary" onClick={onRescan}>
                Rescan
              </button>
            </>
          ) : (
            <span className="badge">Non connecté</span>
          )}
        </div>
      </header>

      <main className="container">{children}</main>
    </>
  );
}
