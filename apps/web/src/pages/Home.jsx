import React, { useEffect, useMemo, useState } from "react";
import { apiLibrary, apiScan } from "../lib/api.js";
import TreeView from "../components/TreeView.jsx";

function findDirNode(tree, dirPath) {
  if (!tree) return null;
  if (!dirPath) return tree;

  const parts = dirPath.split("/").filter(Boolean);
  let node = tree;

  for (const part of parts) {
    const next = (node.children || []).find((c) => c.type === "dir" && c.name === part);
    if (!next) return null;
    node = next;
  }
  return node;
}

function listFilesInDir(tree, dirPath) {
  const dir = findDirNode(tree, dirPath);
  if (!dir) return [];
  return (dir.children || []).filter((c) => c.type === "file");
}

function lastFolderName(dirPath) {
  if (!dirPath) return "Racine";
  const last = dirPath.split("/").filter(Boolean).pop();
  return last || "Racine";
}

function bytesToHuman(n) {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = num;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const fixed = v >= 10 || i === 0 ? 0 : 1;
  return `${v.toFixed(fixed)} ${units[i]}`;
}

function formatDate(ms) {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function sortFileNodes(nodes, mode) {
  const arr = [...nodes];
  const meta = (n) => n?.meta || {};
  const name = (n) => String(n?.name || "");
  const mtime = (n) => Number(meta(n).mtime || 0);
  const size = (n) => Number(meta(n).size || 0);

  switch (mode) {
    case "name_asc":
      arr.sort((a, b) => name(a).localeCompare(name(b)));
      break;
    case "name_desc":
      arr.sort((a, b) => name(b).localeCompare(name(a)));
      break;
    case "oldest":
      arr.sort((a, b) => mtime(a) - mtime(b));
      break;
    case "newest":
      arr.sort((a, b) => mtime(b) - mtime(a));
      break;
    case "size_asc":
      arr.sort((a, b) => size(a) - size(b));
      break;
    case "size_desc":
      arr.sort((a, b) => size(b) - size(a));
      break;
    default:
      break;
  }
  return arr;
}

function filterByQuery(nodes, q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return nodes;
  return nodes.filter((n) => String(n?.name || "").toLowerCase().includes(query));
}

function countText(n) {
  if (n === 0) return "0 élément";
  if (n === 1) return "1 élément";
  return `${n} éléments`;
}

export default function Home({ me }) {
  const [lib, setLib] = useState({
    videos: [],
    photos: [],
    videoTree: null,
    photoTree: null,
    lastScan: null
  });

  const [tab, setTab] = useState("videos");

  const [videoDir, setVideoDir] = useState("");
  const [photoDir, setPhotoDir] = useState("");

  const [expandedVideos, setExpandedVideos] = useState(new Set([""]));
  const [expandedPhotos, setExpandedPhotos] = useState(new Set([""]));

  const [selectedVideo, setSelectedVideo] = useState(null);

  const [photoIndex, setPhotoIndex] = useState(-1);

  // tri
  const [photoSort, setPhotoSort] = useState("newest");
  const [videoSort, setVideoSort] = useState("newest");

  // recherche
  const [photoQuery, setPhotoQuery] = useState("");
  const [videoQuery, setVideoQuery] = useState("");

  // NEW: vue vidéos (grid/list)
  const [videoView, setVideoView] = useState("grid"); // "grid" | "list"

  const [msg, setMsg] = useState("");

  async function loadLibrary() {
    setMsg("");
    const l = await apiLibrary();
    if (!l.ok) return setMsg(l.error || "library_failed");
    setLib(l.data);
  }

  useEffect(() => {
    if (!me) {
      setLib({ videos: [], photos: [], videoTree: null, photoTree: null, lastScan: null });
      return;
    }
    loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  async function doScan() {
    setMsg("");
    const r = await apiScan();
    if (!r.ok) return setMsg(r.error || "scan_failed");
    setLib(r.data);
  }

  const rawVideoFiles = useMemo(() => listFilesInDir(lib.videoTree, videoDir), [lib.videoTree, videoDir]);
  const sortedVideoFiles = useMemo(() => sortFileNodes(rawVideoFiles, videoSort), [rawVideoFiles, videoSort]);
  const videoFiles = useMemo(() => filterByQuery(sortedVideoFiles, videoQuery), [sortedVideoFiles, videoQuery]);

  const rawPhotoFiles = useMemo(() => listFilesInDir(lib.photoTree, photoDir), [lib.photoTree, photoDir]);
  const sortedPhotoFiles = useMemo(() => sortFileNodes(rawPhotoFiles, photoSort), [rawPhotoFiles, photoSort]);
  const photoFiles = useMemo(() => filterByQuery(sortedPhotoFiles, photoQuery), [sortedPhotoFiles, photoQuery]);

  useEffect(() => {
    setPhotoIndex(-1);
  }, [photoDir, photoSort]);

  useEffect(() => {
    setSelectedVideo(null);
  }, [videoDir]);

  if (!me) {
    return (
      <div>
        <h1>Accueil</h1>
        <div className="empty">
          Tu dois être connecté pour voir les bibliothèques.
          <div className="muted" style={{ marginTop: 6 }}>
            Va sur “Connexion” ou “Inscription”.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h1>Accueil</h1>
          <div className="pageMeta">Dernier scan : {lib.lastScan ? new Date(lib.lastScan).toLocaleString() : "—"}</div>
        </div>

        <div className="pageHeaderRight">
          <button className="btn btnPrimary" onClick={doScan}>
            Rescan
          </button>

          <div className="segmented">
            <button className={tab === "videos" ? "segBtn segBtnActive" : "segBtn"} onClick={() => setTab("videos")}>
              Vidéos
            </button>
            <button className={tab === "photos" ? "segBtn segBtnActive" : "segBtn"} onClick={() => setTab("photos")}>
              Photos
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="empty" style={{ minHeight: 0, padding: 12, marginBottom: 14 }}>
          Erreur : {msg}
        </div>
      )}

      {/* ===================== VIDEOS ===================== */}
      {tab === "videos" && (
        <div className="grid3">
          {/* Dossiers */}
          <section className="card cardFull">
            <div className="cardHeader">
              <div className="cardTitle">Dossiers</div>
            </div>
            <div className="cardBody">
              {lib.videoTree ? (
                <TreeView
                  tree={lib.videoTree}
                  selectedPath={videoDir}
                  onSelectDir={(p) => setVideoDir(p)}
                  onSelectFile={(fileNode) => setSelectedVideo(fileNode)}
                  expanded={expandedVideos}
                  setExpanded={setExpandedVideos}
                />
              ) : (
                <div className="empty">Clique “Rescan”.</div>
              )}
            </div>
          </section>

          {/* Contenu */}
          <section className="card cardFull">
            <div className="cardHeader">
              <div className="cardTitle">Contenu</div>

              <div className="contentTools">
                <div className="muted" title={videoDir || "Racine"}>
                  Dossier : {lastFolderName(videoDir)}
                </div>
                <span className="pill">{countText(videoFiles.length)}</span>
              </div>
            </div>

            <div className="cardBody">
              <div className="toolbar">
                <div className="search">
                  <span className="searchIcon">🔎</span>
                  <input
                    className="searchInput"
                    placeholder="Rechercher une vidéo…"
                    value={videoQuery}
                    onChange={(e) => setVideoQuery(e.target.value)}
                  />
                </div>

                <div className="toolbarRight">
                  <div className="viewToggle">
                    <button
                      className={videoView === "grid" ? "viewBtn viewBtnActive" : "viewBtn"}
                      onClick={() => setVideoView("grid")}
                      title="Vue grille"
                      type="button"
                    >
                      ▦
                    </button>
                    <button
                      className={videoView === "list" ? "viewBtn viewBtnActive" : "viewBtn"}
                      onClick={() => setVideoView("list")}
                      title="Vue liste"
                      type="button"
                    >
                      ≡
                    </button>
                  </div>

                  <select className="select" value={videoSort} onChange={(e) => setVideoSort(e.target.value)}>
                    <option value="newest">Date : plus récent</option>
                    <option value="oldest">Date : plus ancien</option>
                    <option value="name_asc">Nom : A → Z</option>
                    <option value="name_desc">Nom : Z → A</option>
                    <option value="size_desc">Taille : grande → petite</option>
                    <option value="size_asc">Taille : petite → grande</option>
                  </select>
                </div>
              </div>

              {videoFiles.length === 0 ? (
                <div className="empty">
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>Aucune vidéo</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      Change de dossier ou clique “Rescan”.
                    </div>
                  </div>
                </div>
              ) : videoView === "grid" ? (
                <div className="videoGrid">
                  {videoFiles.map((v) => (
                    <div
                      key={v.path}
                      className={selectedVideo?.path === v.path ? "videoCard videoCardActive" : "videoCard"}
                      onClick={() => setSelectedVideo(v)}
                      title={v.path}
                    >
                      <div className="videoPoster">
                        <div className="videoPlay">▶</div>
                        <div className="videoExt">{String(v.name).split(".").pop()?.toUpperCase() || "VID"}</div>
                      </div>

                      <div className="videoInfo">
                        <div className="videoName">{v.name}</div>
                        <div className="videoMeta">
                          <span>{bytesToHuman(v.meta?.size)}</span>
                          <span>•</span>
                          <span>{formatDate(v.meta?.mtime)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="list">
                  {videoFiles.map((v) => (
                    <div
                      key={v.path}
                      className={selectedVideo?.path === v.path ? "item itemActive" : "item"}
                      onClick={() => setSelectedVideo(v)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div>
                          🎬 <b>{v.name}</b>
                        </div>
                        <div className="muted">{bytesToHuman(v.meta?.size)}</div>
                      </div>
                      <div className="metaRow">
                        <span className="muted" title={v.path}>
                          {v.path}
                        </span>
                        <span className="muted">{formatDate(v.meta?.mtime)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Lecteur */}
          <section className="card cardFull">
            <div className="cardHeader">
              <div className="cardTitle">Lecteur</div>
              {selectedVideo ? <span className="pill">Lecture</span> : null}
            </div>
            <div className="cardBody">
              {!selectedVideo ? (
                <div className="empty">
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>Choisis une vidéo</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      Clique sur un fichier dans “Contenu”.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="muted" style={{ marginBottom: 10 }} title={selectedVideo.path}>
                    <b>{selectedVideo.path}</b>
                  </div>
                  <video
                    controls
                    className="previewMedia"
                    style={{ maxHeight: 360, background: "#000" }}
                    src={`/stream?path=${encodeURIComponent(selectedVideo.path)}`}
                  />
                  <div className="helper">
                    Astuce : certains MKV n’ont pas de son si le codec audio n’est pas supporté par le navigateur.
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ===================== PHOTOS ===================== */}
      {tab === "photos" && (
        <div className="grid2">
          {/* Dossiers */}
          <section className="card cardFull">
            <div className="cardHeader">
              <div className="cardTitle">Dossiers</div>
            </div>
            <div className="cardBody">
              {lib.photoTree ? (
                <TreeView
                  tree={lib.photoTree}
                  selectedPath={photoDir}
                  onSelectDir={(p) => setPhotoDir(p)}
                  expanded={expandedPhotos}
                  setExpanded={setExpandedPhotos}
                />
              ) : (
                <div className="empty">Clique “Rescan”.</div>
              )}
            </div>
          </section>

          {/* Contenu */}
          <section className="card cardFull">
            <div className="cardHeader">
              <div className="cardTitle">Contenu</div>

              <div className="contentTools">
                <div className="muted" title={photoDir || "Racine"}>
                  Dossier : {lastFolderName(photoDir)}
                </div>
                <span className="pill">{countText(photoFiles.length)}</span>
              </div>
            </div>

            <div className="cardBody">
              <div className="toolbar">
                <div className="search">
                  <span className="searchIcon">🔎</span>
                  <input
                    className="searchInput"
                    placeholder="Rechercher une photo…"
                    value={photoQuery}
                    onChange={(e) => setPhotoQuery(e.target.value)}
                  />
                </div>

                <select className="select" value={photoSort} onChange={(e) => setPhotoSort(e.target.value)}>
                  <option value="newest">Date : plus récent</option>
                  <option value="oldest">Date : plus ancien</option>
                  <option value="name_asc">Nom : A → Z</option>
                  <option value="name_desc">Nom : Z → A</option>
                  <option value="size_desc">Taille : grande → petite</option>
                  <option value="size_asc">Taille : petite → grande</option>
                </select>
              </div>

              {photoFiles.length === 0 ? (
                <div className="empty">
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>Aucune photo</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      Change de dossier ou clique “Rescan”.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="thumbGrid">
                  {photoFiles.map((p, idx) => (
                    <div key={p.path} className="thumbCard" onClick={() => setPhotoIndex(idx)} title="Clique pour agrandir">
                      <img
                        alt={p.name}
                        className="thumbImg"
                        src={`/image?path=${encodeURIComponent(p.path)}`}
                        loading="lazy"
                      />
                      <div className="thumbName">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                          <span className="muted" style={{ fontSize: 12 }}>
                            {bytesToHuman(p.meta?.size)}
                          </span>
                        </div>
                        <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
                          {formatDate(p.meta?.mtime)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {photoIndex >= 0 && (
                <PhotoModal
                  files={photoFiles}
                  index={photoIndex}
                  onClose={() => setPhotoIndex(-1)}
                  onPrev={() => setPhotoIndex((i) => (i > 0 ? i - 1 : i))}
                  onNext={() => setPhotoIndex((i) => (i < photoFiles.length - 1 ? i + 1 : i))}
                />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function PhotoModal({ files, index, onClose, onPrev, onNext }) {
  const file = files[index];

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!file) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalTop">
          <div className="modalPath" title={file.path}>
            {file.path}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn" onClick={onPrev} disabled={index === 0}>
              ←
            </button>
            <button className="btn" onClick={onNext} disabled={index === files.length - 1}>
              →
            </button>
            <button className="btn btnPrimary" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modalBody">
          <img alt={file.name} src={`/image?path=${encodeURIComponent(file.path)}`} className="modalImg" />
        </div>
      </div>
    </div>
  );
}
