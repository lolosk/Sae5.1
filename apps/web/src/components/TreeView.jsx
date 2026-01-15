import React from "react";

export default function TreeView({
  tree,
  selectedPath,
  onSelectDir,
  onSelectFile,
  expanded,
  setExpanded
}) {
  const children = tree?.children || [];

  function toggleDir(p) {
    const next = new Set(expanded);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setExpanded(next);
  }

  function Row({ node, depth }) {
    const isDir = node.type === "dir";
    const p = node.path || "";
    const isExpanded = expanded.has(p);
    const isSelected = selectedPath === p;

    return (
      <div>
        <div
          onClick={() => {
            if (isDir) {
              toggleDir(p);
              onSelectDir?.(p);
            } else {
              onSelectFile?.(node);
            }
          }}
          style={{
            cursor: "pointer",
            padding: "10px 10px",
            marginLeft: depth * 12,
            borderRadius: 14,
            background: isSelected ? "linear-gradient(135deg, rgba(37,99,235,.14), rgba(124,58,237,.10))" : "transparent",
            border: isSelected ? "1px solid rgba(37,99,235,.16)" : "1px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          {isDir ? (
            <>
              <span style={{ width: 18, display: "inline-block", opacity: 0.75 }}>
                {isExpanded ? "▾" : "▸"}
              </span>
              <span style={{ width: 18, display: "inline-block" }}>📁</span>
              <span style={{ fontWeight: 950 }}>{node.name}</span>
            </>
          ) : (
            <>
              <span style={{ width: 18, display: "inline-block", opacity: 0.55 }}>•</span>
              <span style={{ width: 18, display: "inline-block" }}>📄</span>
              <span style={{ fontWeight: 800 }}>{node.name}</span>
            </>
          )}
        </div>

        {isDir && isExpanded && (node.children || []).map((c) => (
          <Row key={c.path || c.name} node={c} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (!children.length) {
    return <div className="empty">Aucun dossier.</div>;
  }

  return (
    <div>
      {children.map((n) => (
        <Row key={n.path || n.name} node={n} depth={0} />
      ))}
    </div>
  );
}
