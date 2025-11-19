// apps/frontend/src/components/TopBar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function TopBar() {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      {/* Marque / logo cliquable */}
      <div className="brand" onClick={() => navigate("/")}>
        <span className="dot" />
        <span>MediaDock</span>
      </div>

      {/* Navigation */}
      <div className="nav">
        <NavLink
          to="/library"
          className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
        >
          Library
        </NavLink>
        <NavLink
          to="/photos"
          className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
        >
          Photos
        </NavLink>
      </div>
    </div>
  );
}
