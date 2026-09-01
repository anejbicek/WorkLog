import { useState } from "react";

import {
  useAdmin,
  type AdminProject,
} from "../../context/AdminContext";

function AdminProjects() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    toggleProject,
  } = useAdmin();

  const [
    name,
    setName,
  ] = useState("");

  const [
    editing,
    setEditing,
  ] =
    useState<AdminProject | null>(
      null
    );

  const [
    editName,
    setEditName,
  ] = useState("");

  const [
    editActive,
    setEditActive,
  ] = useState(true);

  const saveNewProject =
    () => {
      if (!name.trim()) {
        return;
      }

      addProject(name);

      setName("");
    };

  const startEdit = (
    project: AdminProject
  ) => {
    setEditing(project);
    setEditName(
      project.name
    );
    setEditActive(
      project.active
    );
  };

  const saveEdit =
    () => {
      if (
        !editing ||
        !editName.trim()
      ) {
        return;
      }

      updateProject({
        ...editing,

        name:
          editName.trim(),

        active:
          editActive,
      });

      setEditing(null);
    };

  return (
    <div>
      <div
        style={{
          marginBottom:
            "20px",
        }}
      >
        <h2
          style={
            titleStyle
          }
        >
          Projekti
        </h2>

        <p
          style={
            subtitleStyle
          }
        >
          Projekti, ki bodo
          na voljo pri vnosu
          delovnih nalogov.
        </p>
      </div>

      <div
        style={{
          display:
            "flex",
          gap: "10px",
          marginBottom:
            "18px",
        }}
      >
        <input
          value={name}
          onChange={(event) =>
            setName(
              event.target
                .value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              saveNewProject();
            }
          }}
          placeholder="Ime projekta"
          style={{
            ...inputStyle,
            flex: 1,
          }}
        />

        <button
          type="button"
          onClick={
            saveNewProject
          }
          style={
            primaryButtonStyle
          }
        >
          + Dodaj projekt
        </button>
      </div>

      <div
        style={
          tableStyle
        }
      >
        {projects.length ===
        0 ? (
          <div
            style={{
              padding:
                "35px",
              textAlign:
                "center",
              color:
                "#64748b",
              fontSize:
                "14px",
            }}
          >
            Trenutno ni
            dodanih projektov.
          </div>
        ) : (
          projects.map(
            (
              project,
              index
            ) => (
              <div
                key={
                  project.id
                }
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1.3fr 300px",
                  alignItems:
                    "center",
                  gap: "15px",
                  padding:
                    "16px 20px",
                  borderBottom:
                    index ===
                    projects.length -
                      1
                      ? "none"
                      : "1px solid #e5e7eb",
                }}
              >
                <div>
                  <strong
                    style={{
                      color:
                        "#12344d",
                      fontSize:
                        "14px",
                    }}
                  >
                    {
                      project.name
                    }
                  </strong>

                  <div
                    style={{
                      marginTop:
                        "4px",
                      fontSize:
                        "12px",
                      color:
                        project.active
                          ? "#15803d"
                          : "#dc2626",
                    }}
                  >
                    {project.active
                      ? "Aktiven"
                      : "Neaktiven"}
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      startEdit(
                        project
                      )
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    Uredi
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleProject(
                        project.id
                      )
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    {project.active
                      ? "Deaktiviraj"
                      : "Aktiviraj"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Ali želiš izbrisati projekt?"
                        )
                      ) {
                        deleteProject(
                          project.id
                        );
                      }
                    }}
                    style={
                      deleteButtonStyle
                    }
                  >
                    Izbriši
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      {editing && (
        <div
          style={
            overlayStyle
          }
        >
          <div
            style={
              modalStyle
            }
          >
            <h3
              style={{
                margin:
                  "0 0 18px",
                color:
                  "#12344d",
              }}
            >
              Uredi projekt
            </h3>

            <label
              style={
                labelStyle
              }
            >
              Ime projekta
            </label>

            <input
              value={
                editName
              }
              onChange={(event) =>
                setEditName(
                  event.target
                    .value
                )
              }
              style={
                inputStyle
              }
            />

            <label
              style={{
                ...labelStyle,
                marginTop:
                  "16px",
              }}
            >
              Status
            </label>

            <select
              value={
                editActive
                  ? "active"
                  : "inactive"
              }
              onChange={(event) =>
                setEditActive(
                  event.target
                    .value ===
                    "active"
                )
              }
              style={
                inputStyle
              }
            >
              <option value="active">
                Aktiven
              </option>

              <option value="inactive">
                Neaktiven
              </option>
            </select>

            <div
              style={
                modalActions
              }
            >
              <button
                type="button"
                onClick={() =>
                  setEditing(
                    null
                  )
                }
                style={
                  secondaryButtonStyle
                }
              >
                Prekliči
              </button>

              <button
                type="button"
                onClick={
                  saveEdit
                }
                style={
                  primaryButtonStyle
                }
              >
                Shrani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const titleStyle = {
  margin: 0,
  fontSize: "21px",
  color: "#12344d",
};

const subtitleStyle = {
  margin:
    "5px 0 0",
  fontSize: "14px",
  color: "#64748b",
};

const tableStyle = {
  background:
    "#ffffff",
  border:
    "1px solid #e5e7eb",
  borderRadius:
    "14px",
  overflow:
    "hidden" as const,
};

const inputStyle = {
  width: "100%",
  height: "44px",
  padding:
    "0 14px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "9px",
  background:
    "#ffffff",
  fontSize: "14px",
  outline: "none",
  boxSizing:
    "border-box" as const,
};

const labelStyle = {
  display: "block",
  marginBottom:
    "7px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#334155",
};

const primaryButtonStyle = {
  height: "44px",
  padding:
    "0 18px",
  border: "none",
  borderRadius:
    "9px",
  background:
    "#1d526b",
  color:
    "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  cursor:
    "pointer",
};

const secondaryButtonStyle = {
  height: "34px",
  padding:
    "0 12px",
  border:
    "1px solid #dbe3e8",
  borderRadius:
    "8px",
  background:
    "#ffffff",
  color:
    "#334155",
  fontSize: "12px",
  fontWeight: 600,
  cursor:
    "pointer",
};

const deleteButtonStyle = {
  ...secondaryButtonStyle,
  border:
    "1px solid #fecaca",
  color:
    "#dc2626",
};

const overlayStyle = {
  position:
    "fixed" as const,
  inset: 0,
  background:
    "rgba(15,23,42,0.35)",
  display: "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  zIndex: 1000,
};

const modalStyle = {
  width: "420px",
  background:
    "#ffffff",
  borderRadius:
    "14px",
  padding: "24px",
  boxShadow:
    "0 20px 50px rgba(0,0,0,0.18)",
};

const modalActions = {
  display: "flex",
  justifyContent:
    "flex-end",
  gap: "10px",
  marginTop:
    "22px",
};

export default AdminProjects;