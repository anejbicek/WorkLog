import { useMemo, useState } from "react";
import { Archive, Folder, Pencil, Plus, Trash2, X } from "lucide-react";

import { useAdmin, type AdminProject } from "../../context/AdminContext";

function AdminProjectManagement() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    toggleProjectActive,
    archiveProject,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects
      .filter((project) => !project.archived)
      .filter((project) =>
        query
          ? [project.name, project.serialNumber, project.id]
              .some((value) =>
                String(value ?? "").toLowerCase().includes(query)
              )
          : true
      )
      .sort((a, b) => a.name.localeCompare(b.name, "sl"));
  }, [projects, search]);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setSerialNumber("");
    setShowForm(false);
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setSerialNumber("");
    setShowForm(true);
  };

  const openEdit = (project: AdminProject) => {
    setEditing(project);
    setName(project.name);
    setSerialNumber(project.serialNumber ?? "");
    setShowForm(true);
  };

  const save = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Vnesi ime projekta.");
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await updateProject(editing.id, {
          name: trimmedName,
          serialNumber: serialNumber.trim(),
          requiredQuantity: editing.requiredQuantity ?? 0,
          active: editing.active,
          status: editing.status,
          archived: editing.archived ?? false,
        });
      } else {
        await addProject({
          name: trimmedName,
          serialNumber: serialNumber.trim(),
          requiredQuantity: 0,
          active: true,
          status: "active",
          archived: false,
        });
      }

      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (project: AdminProject) => {
    const confirmed = window.confirm(
      `Ali res želiš izbrisati projekt »${project.name}«?`
    );

    if (!confirmed) {
      return;
    }

    await deleteProject(project.id);
  };

  const archive = async (project: AdminProject) => {
    await archiveProject(project.id);
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 11px",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff",
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Folder size={24} color="#17465d" />
            <h2 style={{ margin: 0, color: "#17465d" }}>Projekti</h2>
          </div>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
            Upravljanje projektov, ki se uporabljajo pri delovnih nalogih.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: "7px", border: "none", background: "#17465d", color: "#fff", borderRadius: "8px", padding: "10px 14px", cursor: "pointer", fontWeight: 600 }}
        >
          <Plus size={16} /> Dodaj projekt
        </button>
      </div>

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Išči po imenu, serijski številki ali ID-ju..."
            style={inputStyle}
          />
        </div>

        {visibleProjects.length === 0 ? (
          <div style={{ padding: "35px 20px", textAlign: "center", color: "#64748b" }}>
            Ni projektov, ki ustrezajo iskanju.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "Projekt",
                    "Serijska številka",
                    "ID",
                    "Stanje",
                    "Dejanja",
                  ].map((heading) => (
                    <th key={heading} style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #e2e8f0", fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((project) => (
                  <tr key={project.id}>
                    <td style={{ padding: "14px 15px", borderBottom: "1px solid #eef2f7", fontWeight: 600, color: "#1e293b" }}>
                      {project.name}
                    </td>
                    <td style={{ padding: "14px 15px", borderBottom: "1px solid #eef2f7", color: "#475569" }}>
                      {project.serialNumber || "—"}
                    </td>
                    <td style={{ padding: "14px 15px", borderBottom: "1px solid #eef2f7", color: "#64748b" }}>
                      #{project.id}
                    </td>
                    <td style={{ padding: "14px 15px", borderBottom: "1px solid #eef2f7" }}>
                      <button
                        type="button"
                        onClick={() => void toggleProjectActive(project.id)}
                        style={{ border: "none", borderRadius: "999px", padding: "5px 10px", cursor: "pointer", background: project.active ? "#dcfce7" : "#f1f5f9", color: project.active ? "#166534" : "#64748b", fontWeight: 600, fontSize: "12px" }}
                      >
                        {project.active ? "Aktiven" : "Neaktiven"}
                      </button>
                    </td>
                    <td style={{ padding: "14px 15px", borderBottom: "1px solid #eef2f7" }}>
                      <div style={{ display: "flex", gap: "7px" }}>
                        <button type="button" onClick={() => openEdit(project)} style={{ display: "flex", alignItems: "center", gap: "5px", border: "1px solid #dbe5ea", background: "#fff", color: "#334155", borderRadius: "7px", padding: "7px 9px", cursor: "pointer" }}>
                          <Pencil size={14} /> Uredi
                        </button>
                        <button type="button" onClick={() => void archive(project)} style={{ display: "flex", alignItems: "center", gap: "5px", border: "1px solid #dbe5ea", background: "#fff", color: "#334155", borderRadius: "7px", padding: "7px 9px", cursor: "pointer" }}>
                          <Archive size={14} /> Arhiviraj
                        </button>
                        <button type="button" onClick={() => void remove(project)} style={{ display: "flex", alignItems: "center", gap: "5px", border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", borderRadius: "7px", padding: "7px 9px", cursor: "pointer" }}>
                          <Trash2 size={14} /> Izbriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "14px", boxShadow: "0 20px 50px rgba(15,23,42,0.2)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, color: "#17465d" }}>{editing ? "Uredi projekt" : "Dodaj projekt"}</h3>
              <button type="button" onClick={resetForm} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "grid", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Ime projekta</label>
                <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} autoFocus />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Serijska številka</label>
                <input value={serialNumber} onChange={(event) => setSerialNumber(event.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "14px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <button type="button" onClick={resetForm} style={{ border: "1px solid #d1d5db", background: "#fff", borderRadius: "8px", padding: "9px 13px", cursor: "pointer" }}>
                Prekliči
              </button>
              <button type="button" disabled={saving} onClick={() => void save()} style={{ border: "none", background: "#17465d", color: "#fff", borderRadius: "8px", padding: "9px 14px", cursor: saving ? "wait" : "pointer", fontWeight: 600 }}>
                {saving ? "Shranjujem..." : editing ? "Shrani spremembe" : "Ustvari projekt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProjectManagement;
