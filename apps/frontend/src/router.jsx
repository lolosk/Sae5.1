// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Library from "./pages/Library";
import Photos from "./pages/Photos";

export const router = createBrowserRouter([
  { path: "/", element: <App/>, children: [
      { index: true, element: <Login/> },
      { path: "library", element: <Library/> },
      { path: "photos", element: <Photos/> },
  ] }
]);
