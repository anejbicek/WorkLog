import {
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  useAdmin,
  type AdminProject,
} from "../../context/AdminContext";

import {
  useProjects,
} from "../../context/ProjectContext";

import ProjectCard from "../Projects/ProjectCard";
import ProjectDetails from "../Projects/ProjectDetails";

type ProjectSection =
  | "active"
  | "preparation"
  | "completed"
  | "add";

/* =========================================================
   GLAVNA KOMPONENTA
========================================================= */

function AdminProjectManagement() {
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
    getProjectWorkers,
    getProjectMachines,
    getProjectEntries,
  } = useProjects();

  /* =========================================================
     MENI
  ========================================================= */

  const [
    activeSection,
    setActiveSection,
  ] = useState<ProjectSection>(
    "active"
  );

  /* =========================================================
     NOV PROJEKT
  ========================================================= */

  const [
    name,
    setName,
  ] = useState("");

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

  /* =========================================================
     UREJANJE
  ========================================================= */

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
    editRequiredQuantity,
    setEditRequiredQuantity,
  ] = useState("0");

  const [
    editStatus,
    setEditStatus,
  ] =
    useState<
      AdminProject["status"]
    >("preparation");

  /* =========================================================
     PODROBNOSTI PROJEKTA
  ========================================================= */

  const [
    detailsProjectId,
    setDetailsProjectId,
  ] = useState<number | null>(
    null
  );

  /* =========================================================
     PROJEKTI PO STATUSU
  ========================================================= */

  const activeProjects =
    useMemo(
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
    activeSection === "active"
      ? activeProjects
      : activeSection ===
          "preparation"
        ? preparationProjects
        : completedProjects;

  /* =========================================================
     DODAJ PROJEKT
  ========================================================= */

  const saveNewProject =
    () => {
      const trimmedName =
        name.trim();

      const quantity =
        Number(
          requiredQuantity
        );

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
          newStatus ===
          "active",
        status:
          newStatus,
      });

      setName("");

      setRequiredQuantity(
        "0"
      );

      setNewStatus(
        "preparation"
      );

      setActiveSection(
        newStatus
      );
    };

  /* =========================================================
     ZAČNI UREJANJE
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

  /* =========================================================
     SHRANI UREJANJE
  ========================================================= */

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

    setActiveSection(
      editStatus
    );
  };

  /* =========================================================
     AKTIVIRAJ PROJEKT
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

      setActiveSection(
        "active"
      );
    }
  };

  /* =========================================================
     ZAKLJUČI PROJEKT
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

      setActiveSection(
        "completed"
      );
    }
  };

  /* =========================================================
     IZBRIŠI PROJEKT
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

  /* =========================================================
     PODROBNOSTI
  ========================================================= */

  const openDetails = (
    projectId: number
  ) => {
    setDetailsProjectId(
      projectId
    );
  };

  const closeDetails = () => {
    setDetailsProjectId(
      null
    );
  };

  const detailsProject =
    detailsProjectId !== null
      ? projects.find(
          (project) =>
            project.id ===
            detailsProjectId
        ) ?? null
      : null;

  /* =========================================================
     PRIKAZ
  ========================================================= */

  return (
    <>
      <style>
        {`
          .admin-project-layout {
            display: grid;
            grid-template-columns: 210px minmax(0, 1fr);
            gap: 24px;
            align-items: start;
          }

          .admin-project-grid {
            display: grid;
            grid-template-columns: repeat(2, 550px);
            justify-content: center;
            gap: 20px;
            align-items: start;
          }

          .admin-project-card-wrapper {
            width: 550px;
            max-width: 100%;
          }

          .admin-project-actions {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
          }

          .admin-project-action {
            height: 36px;
            padding: 0 14px;
            border-radius: 9px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
          }

          .admin-project-action-edit {
            border: 1px solid #dbe3e8;
            background: #ffffff;
            color: #334155;
          }

          .admin-project-action-delete {
            border: 1px solid #fecaca;
            background: #ffffff;
            color: #dc2626;
          }

          .admin-project-action-complete {
            border: none;
            background: #15803d;
            color: #ffffff;
          }

          .admin-project-action-activate {
            border: none;
            background: #1d526b;
            color: #ffffff;
          }

          .admin-project-action:hover {
            opacity: 0.88;
          }

          @media (max-width: 1200px) {
            .admin-project-grid {
              grid-template-columns: 550px;
            }
          }

          @media (max-width: 850px) {
            .admin-project-layout {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 600px) {
            .admin-project-grid {
              grid-template-columns: 100%;
            }

            .admin-project-card-wrapper {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="admin-project-layout">

        {/* ===================================================
            LEVI MENI
        =================================================== */}

        <aside
          style={
            sidebarStyle
          }
        >
          <div
            style={
              sidebarTitleStyle
            }
          >
            UPRAVLJANJE PROJEKTOV
          </div>

          <SidebarButton
            active={
              activeSection ===
              "active"
            }
            onClick={() =>
              setActiveSection(
                "active"
              )
            }
          >
            Aktivni projekti
            <Count>
              {
                activeProjects.length
              }
            </Count>
          </SidebarButton>

          <SidebarButton
            active={
              activeSection ===
              "preparation"
            }
            onClick={() =>
              setActiveSection(
                "preparation"
              )
            }
          >
            V pripravi
            <Count>
              {
                preparationProjects.length
              }
            </Count>
          </SidebarButton>

          <SidebarButton
            active={
              activeSection ===
              "completed"
            }
            onClick={() =>
              setActiveSection(
                "completed"
              )
            }
          >
            Zaključeni
            <Count>
              {
                completedProjects.length
              }
            </Count>
          </SidebarButton>

          <div
            style={
              separatorStyle
            }
          />

          <SidebarButton
            active={
              activeSection ===
              "add"
            }
            onClick={() =>
              setActiveSection(
                "add"
              )
            }
          >
            + Dodaj projekt
          </SidebarButton>
        </aside>

        {/* ===================================================
            DESNI DEL
        =================================================== */}

        <main
          style={
            contentStyle
          }
        >

          {/* =================================================
              DODAJ PROJEKT
          ================================================= */}

          {activeSection ===
            "add" && (
            <CreateProject
              name={name}
              setName={setName}
              requiredQuantity={
                requiredQuantity
              }
              setRequiredQuantity={
                setRequiredQuantity
              }
              status={
                newStatus
              }
              setStatus={
                setNewStatus
              }
              onSave={
                saveNewProject
              }
            />
          )}

          {/* =================================================
              PROJEKTI
          ================================================= */}

          {activeSection !==
            "add" && (
            <>
              <div
                style={
                  headerStyle
                }
              >
                <div>
                  <h2
                    style={
                      titleStyle
                    }
                  >
                    {activeSection ===
                      "active" &&
                      "Aktivni projekti"}

                    {activeSection ===
                      "preparation" &&
                      "Projekti v pripravi"}

                    {activeSection ===
                      "completed" &&
                      "Zaključeni projekti"}
                  </h2>

                  <p
                    style={
                      subtitleStyle
                    }
                  >
                    Upravljanje
                    projektov.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      "add"
                    )
                  }
                  style={
                    primaryButtonStyle
                  }
                >
                  + Dodaj projekt
                </button>
              </div>

              {/* =============================================
                  PRAZEN STAN
              ============================================= */}

              {visibleProjects.length ===
              0 ? (
                <div
                  style={
                    emptyStyle
                  }
                >
                  {activeSection ===
                    "active" &&
                    "Trenutno ni aktivnih projektov."}

                  {activeSection ===
                    "preparation" &&
                    "Trenutno ni projektov v pripravi."}

                  {activeSection ===
                    "completed" &&
                    "Trenutno ni zaključenih projektov."}
                </div>
              ) : (
                /* ===========================================
                   KARTICE
                =========================================== */

                <div className="admin-project-grid">

                  {visibleProjects.map(
                    (
                      project
                    ) => {
                      const requiredQuantity =
                        project.requiredQuantity;

                      const producedQuantity =
                        getProjectProducedQuantity(
                          project.id
                        );

                      const hours =
                        getProjectHours(
                          project.id
                        );

                      const workers =
                        getProjectWorkers(
                          project.id
                        );

                      const projectMachines =
                        getProjectMachines(
                          project.id
                        );

                      const readyToComplete =
                        project.status ===
                          "active" &&
                        requiredQuantity >
                          0 &&
                        producedQuantity >=
                          requiredQuantity;

                      return (
                        <div
                          key={
                            project.id
                          }
                          className="admin-project-card-wrapper"
                        >

                          {/* =================================
                              ENAKA KARTICA KOT PRI DELAVCU
                          ================================= */}

                          <ProjectCard
                            project={
                              project
                            }

                            requiredQuantity={
                              requiredQuantity
                            }

                            producedQuantity={
                              producedQuantity
                            }

                            hours={
                              hours
                            }

                            workerCount={
                              workers.length
                            }

                            machineCount={
                              projectMachines.length
                            }

                            onDetails={() =>
                              openDetails(
                                project.id
                              )
                            }

                            onAddEntry={() =>
                              openDetails(
                                project.id
                              )
                            }
                          />

                          {/* =================================
                              ADMINISTRATORSKE FUNKCIJE
                          ================================= */}

                          <div
                            className="admin-project-actions"
                          >

                            {/* V PRIPRAVI */}
                            {project.status ===
                              "preparation" && (
                              <button
                                type="button"
                                className="admin-project-action admin-project-action-activate"
                                onClick={() =>
                                  handleActivate(
                                    project
                                  )
                                }
                              >
                                Aktiviraj
                              </button>
                            )}

                            {/* ZAKLJUČI */}
                            {readyToComplete && (
                              <button
                                type="button"
                                className="admin-project-action admin-project-action-complete"
                                onClick={() =>
                                  handleComplete(
                                    project
                                  )
                                }
                              >
                                ✓ Zaključi
                              </button>
                            )}

                            {/* UREDI */}
                            {project.status !==
                              "completed" && (
                              <button
                                type="button"
                                className="admin-project-action admin-project-action-edit"
                                onClick={() =>
                                  startEdit(
                                    project
                                  )
                                }
                              >
                                ✏ Uredi
                              </button>
                            )}

                            {/* IZBRIŠI */}
                            {project.status !==
                              "completed" && (
                              <button
                                type="button"
                                className="admin-project-action admin-project-action-delete"
                                onClick={() =>
                                  handleDelete(
                                    project
                                  )
                                }
                              >
                                🗑 Izbriši
                              </button>
                            )}

                            {/* ZAČETEK */}
                            {project.status ===
                              "completed" && (
                              <span
                                style={{
                                  fontSize:
                                    "12px",
                                  color:
                                    "#64748b",
                                  padding:
                                    "8px 10px",
                                }}
                              >
                                Projekt je zaključen
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}

                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* =====================================================
          PODROBNOSTI PROJEKTA
      ===================================================== */}

      {detailsProject &&
        (() => {
          const entries =
            getProjectEntries(
              detailsProject.id
            );

          const producedQuantity =
            getProjectProducedQuantity(
              detailsProject.id
            );

          const hours =
            getProjectHours(
              detailsProject.id
            );

          const workers =
            getProjectWorkers(
              detailsProject.id
            );

          const machines =
            getProjectMachines(
              detailsProject.id
            );

          return (
            <ProjectDetails
              project={
                detailsProject
              }

              entries={
                entries
              }

              requiredQuantity={
                detailsProject.requiredQuantity
              }

              producedQuantity={
                producedQuantity
              }

              hours={
                hours
              }

              workers={
                workers
              }

              machines={
                machines
              }

              onAddEntry={() => {
                closeDetails();
              }}

              onDeleteEntry={() => {
                closeDetails();
              }}

              onClose={
                closeDetails
              }
            />
          );
        })()}

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
              onChange={(
                event
              ) =>
                setEditName(
                  event.target.value
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
                  event.target.value
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
                editStatus
              }
              onChange={(
                event
              ) =>
                setEditStatus(
                  event.target.value as
                    AdminProject["status"]
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
    </>
  );
}

/* =========================================================
   DODAJ PROJEKT
========================================================= */

function CreateProject({
  name,
  setName,
  requiredQuantity,
  setRequiredQuantity,
  status,
  setStatus,
  onSave,
}: {
  name: string;

  setName: (
    value: string
  ) => void;

  requiredQuantity: string;

  setRequiredQuantity: (
    value: string
  ) => void;

  status:
    AdminProject["status"];

  setStatus: (
    value:
      AdminProject["status"]
  ) => void;

  onSave: () => void;
}) {
  return (
    <div>
      <div
        style={
          headerStyle
        }
      >
        <div>
          <h2
            style={
              titleStyle
            }
          >
            Dodaj projekt
          </h2>

          <p
            style={
              subtitleStyle
            }
          >
            Ustvari nov projekt
            in določi njegov
            začetni status.
          </p>
        </div>
      </div>

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
              style={
                labelStyle
              }
            >
              Ime projekta
            </label>

            <input
              value={
                name
              }
              onChange={(
                event
              ) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Ime projekta"
              style={
                inputStyle
              }
            />
          </div>

          <div>
            <label
              style={
                labelStyle
              }
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
                  event.target.value
                )
              }
              style={
                inputStyle
              }
            />
          </div>

          <div>
            <label
              style={
                labelStyle
              }
            >
              Status
            </label>

            <select
              value={
                status
              }
              onChange={(
                event
              ) =>
                setStatus(
                  event.target.value as
                    AdminProject["status"]
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
              onSave
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
          Izbrani status se
          shrani neposredno
          skupaj s projektom.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      style={{
        ...sidebarButtonStyle,

        ...(active
          ? sidebarButtonActiveStyle
          : {}),
      }}
    >
      <span
        style={{
          width:
            "7px",

          height:
            "7px",

          borderRadius:
            "50%",

          background:
            active
              ? "#ffffff"
              : "#94a3b8",

          flexShrink: 0,
        }}
      />

      <span
        style={{
          flex: 1,
        }}
      >
        {children}
      </span>
    </button>
  );
}

/* =========================================================
   COUNT
========================================================= */

function Count({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span
      style={{
        fontSize:
          "11px",

        opacity:
          0.75,
      }}
    >
      {children}
    </span>
  );
}

/* =========================================================
   STILI
========================================================= */

const sidebarStyle = {
  background:
    "#ffffff",

  border:
    "1px solid #e2e8f0",

  borderRadius:
    "14px",

  padding:
    "10px",

  boxShadow:
    "0 4px 14px rgba(15,23,42,0.04)",
};

const sidebarTitleStyle = {
  padding:
    "10px 12px 8px",

  fontSize:
    "10px",

  fontWeight:
    700,

  letterSpacing:
    "0.08em",

  color:
    "#94a3b8",
};

const sidebarButtonStyle = {
  width:
    "100%",

  minHeight:
    "44px",

  display:
    "flex",

  alignItems:
    "center",

  gap:
    "10px",

  padding:
    "0 12px",

  marginBottom:
    "4px",

  border:
    "1px solid transparent",

  borderRadius:
    "9px",

  background:
    "transparent",

  color:
    "#334155",

  fontSize:
    "14px",

  fontWeight:
    600,

  textAlign:
    "left" as const,

  cursor:
    "pointer",
};

const sidebarButtonActiveStyle =
  {
    background:
      "#1d526b",

    color:
      "#ffffff",

    boxShadow:
      "0 4px 10px rgba(29,82,107,0.18)",
  };

const separatorStyle = {
  height:
    "1px",

  background:
    "#e2e8f0",

  margin:
    "8px 4px",
};

const contentStyle = {
  minWidth:
    0,
};

const headerStyle = {
  display:
    "flex",

  justifyContent:
    "space-between",

  alignItems:
    "flex-start",

  gap:
    "20px",

  marginBottom:
    "20px",
};

const titleStyle = {
  margin:
    0,

  fontSize:
    "21px",

  color:
    "#12344d",
};

const subtitleStyle = {
  margin:
    "5px 0 0",

  fontSize:
    "14px",

  color:
    "#64748b",
};

const createCardStyle = {
  background:
    "#ffffff",

  border:
    "1px solid #e5e7eb",

  borderRadius:
    "14px",

  padding:
    "20px",
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
    "12px",

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

const emptyStyle = {
  background:
    "#ffffff",

  border:
    "1px solid #e5e7eb",

  borderRadius:
    "14px",

  padding:
    "50px 30px",

  textAlign:
    "center" as const,

  color:
    "#64748b",

  fontSize:
    "14px",
};

const secondaryButtonStyle =
  {
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

export default AdminProjectManagement;