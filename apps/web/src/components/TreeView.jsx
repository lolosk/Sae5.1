import React from "react";

function joinPath(parent, name) {
  return parent ? `${parent}/${name}` : name;
}

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
            padding: "6px 8px",
            marginLeft: depth * 10,
            borderRadius: 6,
            background: isSelected ? "#eef2ff" : "transparent",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {isDir ? (
            <span style={{ width: 18, display: "inline-block" }}>{isExpanded ? "▼" : "▶"}</span>
          ) : (
            <span style={{ width: 18, display: "inline-block" }}>•</span>
          )}

          <span style={{ fontWeight: isDir ? 600 : 400 }}>{node.name}</span>
        </div>

        {isDir && isExpanded && (node.children || []).map((c) => (
          <Row key={c.path} node={c} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {children.map((n) => (
        <Row key={n.path || n.name} node={n} depth={0} />
      ))}
    </div>
  );
}
