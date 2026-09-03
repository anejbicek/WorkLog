import { useMemo, useState } from "react";

import {
  useAdmin,
  type AdminProject,
} from "../../context/AdminContext";

import { useProjects } from "../../context/ProjectContext";

function AdminProjects() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    activateProject,
    completeProject,
  } = useAdmin();

  const {
    getProjectProducedQuantity,
    getProjectHours,
  } = useProjects();

  const [name, setName] =
    useState("");

  const [
    requiredQuantity,
    setRequiredQuantity,
  ] = useState("0");

  const [
    newStatus,
    setNewStatus,
  ] = useState<
    AdminProject["status"]
  >("preparation");

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "active" | "preparation" | "completed"
  >("active");

  const [
    editing,
    setEditing,
  ] = useState<AdminProject | null>(
    null
  );

  const [
    editName,
    setEditName,
  ] = useState("");

  const [
    editRequiredQuantity,
    setEditRequiredQuantity,
  ] = useState("0");

  const [
    editStatus,
    setEditStatus,
  ] = useState<
    AdminProject["status"]
  >("preparation");

  /* =========================================================
     PROJEKTI PO STATUSU
  ========================================================= */

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.status ===
          "active"
      ),
    [projects]
  );

  const preparationProjects =
    useMemo(
      () =>
        projects.filter(
          (project) =>
            project.status ===
            "preparation"
        ),
      [projects]
    );

  const completedProjects =
    useMemo(
      () =>
        projects.filter(
          (project) =>
            project.status ===
            "completed"
        ),
      [projects]
    );

  const visibleProjects =
    activeTab === "active"
      ? activeProjects
      : activeTab ===
          "preparation"
        ? preparationProjects
        : completedProjects;

  /* =========================================================
     DODAJ PROJEKT
  ========================================================= */

  const saveNewProject = () => {
    const trimmedName =
      name.trim();

    const quantity =
      Number(requiredQuantity);

    if (!trimmedName) {
      alert(
        "Vnesi ime projekta."
      );
      return;
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 0
    ) {
      alert(
        "Zahtevana količina mora biti celo število 0 ali več."
      );
      return;
    }

    addProject({
      name: trimmedName,
      requiredQuantity:
        quantity,
      active:
        newStatus === "active",
      status: newStatus,
    });

    setName("");
    setRequiredQuantity("0");

    setActiveTab(
      newStatus
    );
  };

  /* =========================================================
     UREDI PROJEKT
  ========================================================= */

  const startEdit = (
    project: AdminProject
  ) => {
    setEditing(project);

    setEditName(
      project.name
    );

    setEditRequiredQuantity(
      String(
        project.requiredQuantity
      )
    );

    setEditStatus(
      project.status
    );
  };

  const saveEdit = () => {
    if (
      !editing ||
      !editName.trim()
    ) {
      return;
    }

    const quantity =
      Number(
        editRequiredQuantity
      );

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 0
    ) {
      alert(
        "Zahtevana količina mora biti celo število 0 ali več."
      );
      return;
    }

    updateProject(
      editing.id,
      {
        name:
          editName.trim(),

        requiredQuantity:
          quantity,

        active:
          editStatus ===
          "active",

        status:
          editStatus,
      }
    );

    setEditing(null);

    setActiveTab(
      editStatus
    );
  };

  /* =========================================================
     AKTIVIRAJ
  ========================================================= */

  const handleActivate = (
    project: AdminProject
  ) => {
    if (
      project.requiredQuantity <=
      0
    ) {
      alert(
        "Pred aktiviranjem mora projekt imeti zahtevano količino večjo od 0."
      );
      return;
    }

    if (
      window.confirm(
        `Ali želiš aktivirati projekt »${project.name}«?`
      )
    ) {
      activateProject(
        project.id
      );

      setActiveTab(
        "active"
      );
    }
  };

  /* =========================================================
     ZAKLJUČI
  ========================================================= */

  const handleComplete = (
    project: AdminProject
  ) => {
    const produced =
      getProjectProducedQuantity(
        project.id
      );

    const required =
      project.requiredQuantity;

    if (
      required <= 0 ||
      produced < required
    ) {
      alert(
        "Projekt še ni dosegel 100 % zahtevane količine."
      );
      return;
    }

    if (
      window.confirm(
        `Ali želiš zaključiti projekt »${project.name}«?`
      )
    ) {
      completeProject(
        project.id
      );

      setActiveTab(
        "completed"
      );
    }
  };

  /* =========================================================
     IZBRIŠI
  ========================================================= */

  const handleDelete = (
    project: AdminProject
  ) => {
    if (
      project.status ===
      "completed"
    ) {
      alert(
        "Zaključenega projekta ne brišemo, ker mora ostati v zgodovini."
      );
      return;
    }

    if (
      window.confirm(
        `Ali želiš izbrisati projekt »${project.name}«?`
      )
    ) {
      deleteProject(
        project.id
      );
    }
  };

  return (
    <div>
      {/* =====================================================
          GLAVA
      ===================================================== */}

      <div style={headerStyle}>
        <h2 style={titleStyle}>
          Projekti
        </h2>

        <p style={subtitleStyle}>
          Upravljanje priprave,
          aktivnih in zaključenih
          proizvodnih projektov.
        </p>
      </div>

      {/* =====================================================
          DODAJ PROJEKT
      ===================================================== */}

      <div
        style={
          createCardStyle
        }
      >
        <div
          style={
            createGridStyle
          }
        >
          <div>
            <label
              style={labelStyle}
            >
              Ime projekta
            </label>

            <input
              value={name}
              onChange={(
                event
              ) =>
                setName(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  saveNewProject();
                }
              }}
              placeholder="Ime projekta"
              style={
                inputStyle
              }
            />
          </div>

          <div>
            <label
              style={labelStyle}
            >
              Zahtevana količina
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={
                requiredQuantity
              }
              onChange={(
                event
              ) =>
                setRequiredQuantity(
                  event.target
                    .value
                )
              }
              style={
                inputStyle
              }
            />
          </div>

          <div>
            <label
              style={labelStyle}
            >
              Status
            </label>

            <select
              value={newStatus}
              onChange={(
                event
              ) =>
                setNewStatus(
                  event.target
                    .value as AdminProject["status"]
                )
              }
              style={
                inputStyle
              }
            >
              <option value="preparation">
                V pripravi
              </option>

              <option value="active">
                Aktiven
              </option>

              <option value="completed">
                Zaključen
              </option>
            </select>
          </div>

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
            helperStyle
          }
        >
          Pri ustvarjanju lahko
          administrator neposredno
          določi status projekta.
          Delavec vidi samo
          <strong>
            {" "}
            aktivne projekte
          </strong>
          .
        </div>
      </div>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div
        style={tabsStyle}
      >
        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "active"
            )
          }
          style={{
            ...tabStyle,
            ...(activeTab ===
            "active"
              ? activeTabStyle
              : {}),
          }}
        >
          Aktivni projekti

          <span
            style={
              countStyle
            }
          >
            {
              activeProjects.length
            }
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "preparation"
            )
          }
          style={{
            ...tabStyle,
            ...(activeTab ===
            "preparation"
              ? activeTabStyle
              : {}),
          }}
        >
          Projekti v pripravi

          <span
            style={
              countStyle
            }
          >
            {
              preparationProjects.length
            }
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "completed"
            )
          }
          style={{
            ...tabStyle,
            ...(activeTab ===
            "completed"
              ? activeTabStyle
              : {}),
          }}
        >
          Zaključeni projekti

          <span
            style={
              countStyle
            }
          >
            {
              completedProjects.length
            }
          </span>
        </button>
      </div>

      {/* =====================================================
          PROJEKTI
      ===================================================== */}

      <div
        style={
          tableStyle
        }
      >
        {visibleProjects.length ===
        0 ? (
          <div
            style={
              emptyStyle
            }
          >
            {activeTab ===
              "active" &&
              "Trenutno ni aktivnih projektov."}

            {activeTab ===
              "preparation" &&
              "Trenutno ni projektov v pripravi."}

            {activeTab ===
              "completed" &&
              "Trenutno ni zaključenih projektov."}
          </div>
        ) : (
          visibleProjects.map(
            (
              project,
              index
            ) => {
              const produced =
                getProjectProducedQuantity(
                  project.id
                );

              const hours =
                getProjectHours(
                  project.id
                );

              const required =
                project.requiredQuantity;

              const progress =
                required > 0
                  ? Math.min(
                      100,
                      (produced /
                        required) *
                        100
                    )
                  : 0;

              const readyToComplete =
                project.status ===
                  "active" &&
                required > 0 &&
                produced >=
                  required;

              return (
                <div
                  key={
                    project.id
                  }
                  style={{
                    padding:
                      "18px 20px",
                    borderBottom:
                      index ===
                      visibleProjects.length -
                        1
                        ? "none"
                        : "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={
                      projectRowStyle
                    }
                  >
                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={
                          projectNameStyle
                        }
                      >
                        {
                          project.name
                        }
                      </div>

                      <div
                        style={
                          metaStyle
                        }
                      >
                        {produced.toLocaleString(
                          "sl-SI"
                        )}{" "}
                        /{" "}
                        {required.toLocaleString(
                          "sl-SI"
                        )}{" "}
                        kos

                        <span
                          style={
                            dotStyle
                          }
                        >
                          •
                        </span>

                        {hours.toFixed(
                          2
                        )}{" "}
                        h

                        <span
                          style={
                            dotStyle
                          }
                        >
                          •
                        </span>

                        <span
                          style={{
                            ...projectStatusStyle,
                            ...getStatusStyle(
                              project.status
                            ),
                          }}
                        >
                          {statusLabel(
                            project.status
                          )}
                        </span>
                      </div>

                      <div
                        style={
                          progressTrackStyle
                        }
                      >
                        <div
                          style={{
                            ...progressFillStyle,
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div
                        style={
                          progressTextStyle
                        }
                      >
                        {progress.toFixed(
                          0
                        )}{" "}
                        %
                      </div>
                    </div>

                    <div
                      style={
                        actionsStyle
                      }
                    >
                      {project.status ===
                        "preparation" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleActivate(
                              project
                            )
                          }
                          style={
                            primarySmallButtonStyle
                          }
                        >
                          Aktiviraj
                        </button>
                      )}

                      {readyToComplete && (
                        <button
                          type="button"
                          onClick={() =>
                            handleComplete(
                              project
                            )
                          }
                          style={
                            completeButtonStyle
                          }
                        >
                          ✓ Zaključi projekt
                        </button>
                      )}

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

                      {project.status !==
                        "completed" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              project
                            )
                          }
                          style={
                            deleteButtonStyle
                          }
                        >
                          Izbriši
                        </button>
                      )}
                    </div>
                  </div>

                  {readyToComplete && (
                    <div
                      style={
                        readyBannerStyle
                      }
                    >
                      Projekt je dosegel
                      100 % zahtevane
                      količine in čaka
                      na potrditev
                      administratorja.
                    </div>
                  )}
                </div>
              );
            }
          )
        )}
      </div>

      {/* =====================================================
          UREDI PROJEKT
      ===================================================== */}

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
              style={
                modalTitleStyle
              }
            >
              Uredi projekt
            </h3>

            <label
              style={labelStyle}
            >
              Ime projekta
            </label>

            <input
              value={editName}
              onChange={(
                event
              ) =>
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
              Zahtevana količina
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={
                editRequiredQuantity
              }
              onChange={(
                event
              ) =>
                setEditRequiredQuantity(
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
              value={editStatus}
              onChange={(
                event
              ) =>
                setEditStatus(
                  event.target
                    .value as AdminProject["status"]
                )
              }
              style={
                inputStyle
              }
            >
              <option value="preparation">
                V pripravi
              </option>

              <option value="active">
                Aktiven
              </option>

              <option value="completed">
                Zaključen
              </option>
            </select>

            <div
              style={
                modalActionsStyle
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

/* =========================================================
   STATUS
========================================================= */

function statusLabel(
  status: AdminProject["status"]
) {
  if (
    status ===
    "preparation"
  ) {
    return "V pripravi";
  }

  if (
    status ===
    "completed"
  ) {
    return "Zaključen";
  }

  return "Aktiven";
}

function getStatusStyle(
  status: AdminProject["status"]
) {
  if (
    status ===
    "preparation"
  ) {
    return {
      background:
        "#fff7ed",
      color:
        "#c2410c",
    };
  }

  if (
    status ===
    "completed"
  ) {
    return {
      background:
        "#f1f5f9",
      color:
        "#475569",
    };
  }

  return {
    background:
      "#ecfdf5",
    color:
      "#15803d",
  };
}

/* =========================================================
   STILI
========================================================= */

const headerStyle = {
  marginBottom:
    "20px",
};

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

const createCardStyle = {
  background:
    "#ffffff",
  border:
    "1px solid #e5e7eb",
  borderRadius:
    "14px",
  padding:
    "18px",
  marginBottom:
    "18px",
};

const createGridStyle = {
  display:
    "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) 180px 180px auto",
  gap:
    "12px",
  alignItems:
    "end",
};

const helperStyle = {
  marginTop:
    "10px",
  fontSize:
    "12px",
  color:
    "#64748b",
};

const labelStyle = {
  display:
    "block",
  marginBottom:
    "7px",
  fontSize:
    "13px",
  fontWeight:
    600,
  color:
    "#334155",
};

const inputStyle = {
  width:
    "100%",
  height:
    "44px",
  padding:
    "0 14px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "9px",
  background:
    "#ffffff",
  fontSize:
    "14px",
  outline:
    "none",
  boxSizing:
    "border-box" as const,
};

const primaryButtonStyle = {
  height:
    "44px",
  padding:
    "0 18px",
  border:
    "none",
  borderRadius:
    "9px",
  background:
    "#1d526b",
  color:
    "#ffffff",
  fontSize:
    "14px",
  fontWeight:
    600,
  cursor:
    "pointer",
  whiteSpace:
    "nowrap" as const,
};

const tabsStyle = {
  display:
    "flex",
  gap:
    "8px",
  marginBottom:
    "12px",
  flexWrap:
    "wrap" as const,
};

const tabStyle = {
  height:
    "40px",
  padding:
    "0 14px",
  border:
    "1px solid #dbe3e8",
  borderRadius:
    "9px",
  background:
    "#ffffff",
  color:
    "#334155",
  fontSize:
    "13px",
  fontWeight:
    600,
  cursor:
    "pointer",
  display:
    "flex",
  alignItems:
    "center",
  gap:
    "8px",
};

const activeTabStyle = {
  background:
    "#1d526b",
  borderColor:
    "#1d526b",
  color:
    "#ffffff",
};

const countStyle = {
  fontSize:
    "11px",
  opacity:
    0.75,
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

const emptyStyle = {
  padding:
    "35px",
  textAlign:
    "center" as const,
  color:
    "#64748b",
  fontSize:
    "14px",
};

const projectRowStyle = {
  display:
    "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) auto",
  gap:
    "18px",
  alignItems:
    "center",
};

const projectNameStyle = {
  color:
    "#12344d",
  fontSize:
    "15px",
  fontWeight:
    700,
};

const metaStyle = {
  marginTop:
    "5px",
  fontSize:
    "12px",
  color:
    "#64748b",
};

const dotStyle = {
  margin:
    "0 7px",
};

const projectStatusStyle = {
  display:
    "inline-block",
  padding:
    "3px 8px",
  borderRadius:
    "999px",
  fontSize:
    "11px",
  fontWeight:
    700,
};

const progressTrackStyle = {
  height:
    "7px",
  background:
    "#e2e8f0",
  borderRadius:
    "99px",
  overflow:
    "hidden" as const,
  marginTop:
    "11px",
  maxWidth:
    "520px",
};

const progressFillStyle = {
  height:
    "100%",
  background:
    "#1d526b",
  borderRadius:
    "99px",
  transition:
    "width 0.2s ease",
};

const progressTextStyle = {
  marginTop:
    "4px",
  fontSize:
    "11px",
  color:
    "#64748b",
};

const actionsStyle = {
  display:
    "flex",
  justifyContent:
    "flex-end",
  alignItems:
    "center",
  gap:
    "8px",
  flexWrap:
    "nowrap" as const,
  whiteSpace:
    "nowrap" as const,
};

const primarySmallButtonStyle = {
  ...primaryButtonStyle,
  height:
    "34px",
  padding:
    "0 12px",
  fontSize:
    "12px",
};

const completeButtonStyle = {
  ...primarySmallButtonStyle,
  background:
    "#15803d",
};

const secondaryButtonStyle = {
  height:
    "34px",
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
  fontSize:
    "12px",
  fontWeight:
    600,
  cursor:
    "pointer",
  whiteSpace:
    "nowrap" as const,
};

const deleteButtonStyle = {
  ...secondaryButtonStyle,
  borderColor:
    "#fecaca",
  color:
    "#dc2626",
};

const readyBannerStyle = {
  marginTop:
    "12px",
  padding:
    "10px 12px",
  borderRadius:
    "8px",
  background:
    "#ecfdf5",
  color:
    "#166534",
  fontSize:
    "12px",
  fontWeight:
    600,
};

const overlayStyle = {
  position:
    "fixed" as const,
  inset:
    0,
  background:
    "rgba(15,23,42,0.35)",
  display:
    "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  zIndex:
    1000,
};

const modalStyle = {
  width:
    "420px",
  maxWidth:
    "calc(100vw - 30px)",
  background:
    "#ffffff",
  borderRadius:
    "14px",
  padding:
    "24px",
  boxShadow:
    "0 20px 50px rgba(0,0,0,0.18)",
};

const modalTitleStyle = {
  margin:
    "0 0 18px",
  color:
    "#12344d",
};

const modalActionsStyle = {
  display:
    "flex",
  justifyContent:
    "flex-end",
  gap:
    "10px",
  marginTop:
    "22px",
};

export default AdminProjects;