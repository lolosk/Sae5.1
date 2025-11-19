import { Outlet, useLocation, Link } from "react-router-dom";
import TopBar from "./components/TopBar";
import "./styles.css";
export default function App(){
  const loc = useLocation();
  return (
    <>
      <TopBar />
      <Outlet />
      {loc.pathname === "/" && (
        <div className="container" style={{opacity:.8}}>
          <p>Astuce : Connecte-toi (fake) pour arriver sur <Link to="/library">Library</Link>.</p>
        </div>
      )}
    </>
  );
}
