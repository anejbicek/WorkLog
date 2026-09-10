import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAdmin,
  type AdminProject,
} from "../../context/AdminContext";

import {
  useProjects,
} from "../../context/ProjectContext";

import {
  supabase,
} from "../../services/supabase";

import ProjectCard from "../Projects/ProjectCard";
import ProjectDetails from "../Projects/ProjectDetails";
import ProjectEntryForm from "../Projects/ProjectEntryForm";

type ProjectSection =
  | "active"
  | "preparation"
  | "completed"
  | "add";

function AdminProjectManagement() {
  const {
    projects,
    machines,
    users,
    addProject,
    updateProject,
    deleteProject,
    activateProject,
    completeProject,
    archiveProject,
  } = useAdmin();

  const {
    addEntry,
    deleteEntry,
    reloadEntries,
    getProjectEntries,
    getProjectProducedQuantity,
    getProjectHours,
    getProjectWorkers,
    getProjectMachines,
  } = useProjects();

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<ProjectSection>(
      "active"
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    serialNumber,
    setSerialNumber,
  ] = useState("");

  const [
    requiredQuantity,
    setRequiredQuantity,
  ] = useState("0");

  const [
    newStatus,
    setNewStatus,
  ] =
    useState<
      AdminProject["status"]
    >("preparation");

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
    editSerialNumber,
    setEditSerialNumber,
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

  const [
    detailsProjectId,
    setDetailsProjectId,
  ] =
    useState<number | null>(
      null
    );

  const [
    showEntryForm,
    setShowEntryForm,
  ] = useState(false);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] =
    useState<number | "">(
      ""
    );

  const [
    entryDate,
    setEntryDate,
  ] = useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("07:00");

  const [
    endTime,
    setEndTime,
  ] = useState("15:00");

  const [
    selectedMachine,
    setSelectedMachine,
  ] = useState("");

  const [
    entryQuantity,
    setEntryQuantity,
  ] = useState("0");

  const [
    currentWorker,
    setCurrentWorker,
  ] =
    useState(
      "Administrator"
    );

  const [
    savingEntry,
    setSavingEntry,
  ] = useState(false);

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  useEffect(() => {
    setEntryDate(today);
  }, [today]);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentAdmin =
      async () => {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (
          !user ||
          cancelled
        ) {
          return;
        }

        const profile =
          users.find(
            (item) =>
              item.authUserId ===
              user.id
          );

        if (
          !cancelled &&
          profile?.name
        ) {
          setCurrentWorker(
            profile.name
          );

          return;
        }

        const {
          data,
        } = await supabase
          .from("users")
          .select("name")
          .eq(
            "auth_user_id",
            user.id
          )
          .maybeSingle();

        if (
          !cancelled &&
          data?.name
        ) {
          setCurrentWorker(
            data.name
          );
        }
      };

    void loadCurrentAdmin();

    return () => {
      cancelled = true;
    };
  }, [users]);

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
              "completed" &&
            !project.archived
        ),
      [projects]
    );

  const visibleProjects =
    activeSection ===
    "active"
      ? activeProjects
      : activeSection ===
          "preparation"
        ? preparationProjects
        : completedProjects;

  const detailsProject =
    detailsProjectId === null
      ? null
      : projects.find(
          (project) =>
            project.id ===
            detailsProjectId
        ) ?? null;

  const activeMachines =
    useMemo(
      () =>
        machines.filter(
          (machine) =>
            machine.active
        ),
      [machines]
    );

  const openEntryForm = (
    projectId?: number
  ) => {
    const project =
      projectId === undefined
        ? activeProjects[0]
        : activeProjects.find(
            (item) =>
              item.id ===
              projectId
          );

    if (!project) {
      return;
    }

    const required =
      Number(
        project.requiredQuantity ??
          0
      );

    const produced =
      getProjectProducedQuantity(
        project.id
      );

    if (
      required > 0 &&
      produced >= required
    ) {
      alert(
        "Projekt je že dosegel zahtevano količino."
      );

      return;
    }

    setSelectedProjectId(
      project.id
    );

    setEntryDate(
      today
    );

    setStartTime(
      "07:00"
    );

    setEndTime(
      "15:00"
    );

    setSelectedMachine(
      activeMachines[0]?.name ??
        ""
    );

    setEntryQuantity(
      "0"
    );

    setShowEntryForm(
      true
    );
  };

  const closeEntryForm =
    () => {
      setShowEntryForm(
        false
      );

      setSelectedProjectId(
        ""
      );

      setEntryQuantity(
        "0"
      );
    };

  const selectedProject =
    typeof selectedProjectId ===
    "number"
      ? activeProjects.find(
          (project) =>
            project.id ===
            selectedProjectId
        ) ?? null
      : null;

  const saveEntry =
    async () => {
      if (!selectedProject) {
        alert(
          "Izberi projekt."
        );

        return;
      }

      if (
        !entryDate ||
        !startTime ||
        !endTime ||
        !selectedMachine
      ) {
        alert(
          "Izpolni datum, čas in stroj."
        );

        return;
      }

      const quantity =
        Number(
          entryQuantity
        );

      if (
        !Number.isFinite(
          quantity
        ) ||
        quantity < 0
      ) {
        alert(
          "Izdelana količina mora biti veljavna številka."
        );

        return;
      }

      const required =
        Number(
          selectedProject.requiredQuantity ??
            0
        );

      const produced =
        getProjectProducedQuantity(
          selectedProject.id
        );

      if (
        required > 0 &&
        produced >= required
      ) {
        alert(
          "Projekt je že dosegel zahtevano količino."
        );

        return;
      }

      setSavingEntry(
        true
      );

      try {
        await addEntry({
          projectId:
            selectedProject.id,

          date:
            entryDate,

          startTime,

          endTime,

          machine:
            selectedMachine,

          quantity:
            Math.round(
              quantity
            ),

          workerName:
            currentWorker,
        });

        await reloadEntries();

        closeEntryForm();
      } finally {
        setSavingEntry(
          false
        );
      }
    };

  const openEdit = (
    project: AdminProject
  ) => {
    setEditing(
      project
    );

    setEditName(
      project.name
    );

    setEditSerialNumber(
      project.serialNumber ?? ""
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

  const saveEdit =
    () => {
      if (
        !editing ||
        !editName.trim()
      ) {
        alert(
          "Vnesi ime projekta."
        );

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

          serialNumber:
            editSerialNumber.trim(),

          requiredQuantity:
            quantity,

          active:
            editStatus ===
            "active",

          status:
            editStatus,
        }
      );

      setEditing(
        null
      );

      setActiveSection(
        editStatus
      );
    };

  const handleActivate = (
    project: AdminProject
  ) => {
    const confirmed =
      window.confirm(
        `Ali želiš projekt »${project.name}« vrniti med aktivne projekte?`
      );

    if (!confirmed) {
      return;
    }

    activateProject(
      project.id
    );

    setActiveSection(
      "active"
    );
  };

  const handleComplete = (
    project: AdminProject
  ) => {
    const required =
      Number(
        project.requiredQuantity ??
          0
      );

    const produced =
      getProjectProducedQuantity(
        project.id
      );

    if (
      required <= 0 ||
      produced < required
    ) {
      alert(
        "Projekt še ni dosegel 100 % zahtevane količine."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Ali želiš zaključiti projekt »${project.name}«?`
      );

    if (!confirmed) {
      return;
    }

    completeProject(
      project.id
    );

    setActiveSection(
      "completed"
    );
  };

  const handleArchive = (
    project: AdminProject
  ) => {
    const confirmed =
      window.confirm(
        `Ali želiš arhivirati projekt »${project.name}«?`
      );

    if (!confirmed) {
      return;
    }

    archiveProject(project.id);
  };

  const handleDelete = (
    project: AdminProject
  ) => {
    const confirmed =
      window.confirm(
        `Ali res želiš izbrisati projekt »${project.name}«?`
      );

    if (!confirmed) {
      return;
    }

    deleteProject(
      project.id
    );
  };

  const getProjectData = (
    projectId: number
  ) => ({
    entries:
      getProjectEntries(
        projectId
      ),

    requiredQuantity:
      projects.find(
        (project) =>
          project.id ===
          projectId
      )?.requiredQuantity ??
      0,

    producedQuantity:
      getProjectProducedQuantity(
        projectId
      ),

    hours:
      getProjectHours(
        projectId
      ),

    workers:
      getProjectWorkers(
        projectId
      ),

    machines:
      getProjectMachines(
        projectId
      ),
  });

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
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
            align-items: start;
            width: 100%;
          }

          .admin-project-card-wrapper {
            width: 100%;
            min-width: 0;
          }

          .admin-project-action-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            flex-wrap: wrap;
          }

          .admin-project-action-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .admin-project-action {
            height: 36px;
            padding: 0 11px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
          }

          .admin-project-action-edit {
            border: 1px solid #d1d5db;
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

          @media (max-width: 1250px) {
            .admin-project-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 850px) {
            .admin-project-grid {
              grid-template-columns: 1fr;
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

      <div
        className="admin-project-layout"
      >
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
            Aktivni projekti{" "}
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
            V pripravi{" "}
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
            Zaključeni{" "}
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

        <main
          style={{
            minWidth: 0,
          }}
        >
          {activeSection ===
          "add" ? (
            <CreateProject
              name={
                name
              }
              setName={
                setName
              }
              serialNumber={serialNumber}
              setSerialNumber={setSerialNumber}
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
              onSave={() => {
                const trimmedName =
                  name.trim();

                const quantity =
                  Number(
                    requiredQuantity
                  );

                if (
                  !trimmedName
                ) {
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
                  name:
                    trimmedName,

                  serialNumber:
                    serialNumber.trim(),

                  requiredQuantity:
                    quantity,

                  active:
                    newStatus ===
                    "active",

                  status:
                    newStatus,
                });

                setName(
                  ""
                );

                setSerialNumber(
                  ""
                );

                setRequiredQuantity(
                  "0"
                );

                setNewStatus(
                  "preparation"
                );

                setActiveSection(
                  newStatus
                );
              }}
            />
          ) : (
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
                    Upravljanje projektov.
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
                <div
                  className="admin-project-grid"
                >
                  {visibleProjects.map(
                    (
                      project
                    ) => {
                      const required =
                        Number(
                          project.requiredQuantity ??
                            0
                        );

                      const produced =
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
                        required >
                          0 &&
                        produced >=
                          required;

                      return (
                        <div
                          key={
                            project.id
                          }
                          className="admin-project-card-wrapper"
                        >
                          <ProjectCard
                            project={
                              project
                            }
                            requiredQuantity={
                              required
                            }
                            producedQuantity={
                              produced
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
                            width="100%"
                            onDetails={() =>
                              setDetailsProjectId(
                                project.id
                              )
                            }
                            onAddEntry={() =>
                              openEntryForm(
                                project.id
                              )
                            }
                            showAddEntry={
                              project.status ===
                              "active"
                            }
                            adminActions={
                              <div
                                className="admin-project-action-group"
                              >
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

                                {project.status ===
                                  "active" && (
                                  <button
                                    type="button"
                                    className="admin-project-action admin-project-action-complete"
                                    onClick={() =>
                                      handleComplete(
                                        project
                                      )
                                    }
                                    disabled={
                                      !readyToComplete
                                    }
                                    style={{
                                      opacity:
                                        readyToComplete
                                          ? 1
                                          : 0.45,

                                      cursor:
                                        readyToComplete
                                          ? "pointer"
                                          : "not-allowed",
                                    }}
                                  >
                                    ✓ Zaključi
                                  </button>
                                )}

                                {project.status ===
                                  "completed" && (
                                  <button
                                    type="button"
                                    className="admin-project-action admin-project-action-activate"
                                    onClick={() =>
                                      handleArchive(
                                        project
                                      )
                                    }
                                  >
                                    📦 Arhiviraj
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="admin-project-action admin-project-action-edit"
                                  onClick={() =>
                                    openEdit(
                                      project
                                    )
                                  }
                                >
                                  ✏ Uredi
                                </button>

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
                              </div>
                            }
                          />
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

      {detailsProject &&
        (() => {
          const data =
            getProjectData(
              detailsProject.id
            );

          return (
            <ProjectDetails
              project={
                detailsProject
              }
              entries={
                data.entries
              }
              requiredQuantity={
                data.requiredQuantity
              }
              producedQuantity={
                data.producedQuantity
              }
              hours={
                data.hours
              }
              workers={
                data.workers
              }
              machines={
                data.machines
              }
              onClose={() =>
                setDetailsProjectId(
                  null
                )
              }
              onAddEntry={() => {
                if (
                  detailsProject.status !==
                  "active"
                ) {
                  return;
                }

                setDetailsProjectId(
                  null
                );

                openEntryForm(
                  detailsProject.id
                );
              }}
              onDeleteEntry={async (
                entryId
              ) => {
                await deleteEntry(
                  entryId
                );

                await reloadEntries();
              }}
            />
          );
        })()}

      {showEntryForm && (
        <ProjectEntryForm
          projects={
            activeProjects
          }
          machines={
            activeMachines
          }
          selectedProjectId={
            selectedProjectId
          }
          date={
            entryDate
          }
          startTime={
            startTime
          }
          endTime={
            endTime
          }
          machine={
            selectedMachine
          }
          quantity={
            entryQuantity
          }
          currentWorker={
            currentWorker
          }
          saving={
            savingEntry
          }
          onProjectChange={
            setSelectedProjectId
          }
          onDateChange={
            setEntryDate
          }
          onStartTimeChange={
            setStartTime
          }
          onEndTimeChange={
            setEndTime
          }
          onMachineChange={
            setSelectedMachine
          }
          onQuantityChange={
            setEntryQuantity
          }
          onSave={() =>
            void saveEntry()
          }
          onClose={
            closeEntryForm
          }
        />
      )}

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
                marginTop: 16,
              }}
            >
              Serijska št. projekta
            </label>

            <input
              value={editSerialNumber}
              onChange={(event) =>
                setEditSerialNumber(event.target.value)
              }
              placeholder="Serijska št. projekta"
              style={inputStyle}
            />

            <label
              style={{
                ...labelStyle,
                marginTop: 16,
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
                marginTop: 16,
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
   SIDEBAR BUTTON
========================================================= */

function SidebarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children:
    React.ReactNode;
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
          width: 7,
          height: 7,
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
  children:
    React.ReactNode;
}) {
  return (
    <span
      style={{
        fontSize: 11,
        opacity: 0.75,
      }}
    >
      {children}
    </span>
  );
}

/* =========================================================
   DODAJ PROJEKT
========================================================= */

function CreateProject({
  name,
  setName,
  serialNumber,
  setSerialNumber,
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

  serialNumber: string;

  setSerialNumber: (
    value: string
  ) => void;

  requiredQuantity:
    string;

  setRequiredQuantity: (
    value: string
  ) => void;

  status:
    AdminProject["status"];

  setStatus: (
    value:
      AdminProject["status"]
  ) => void;

  onSave:
    () => void;
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
            Ustvari nov projekt in določi njegov začetni status.
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
              Serijska št. projekta
            </label>

            <input
              value={serialNumber}
              onChange={(event) =>
                setSerialNumber(event.target.value)
              }
              placeholder="Serijska št. projekta"
              style={inputStyle}
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
          Izbrani status se shrani skupaj s projektom.
        </div>
      </div>
    </div>
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
    14,

  padding:
    10,

  boxShadow:
    "0 4px 14px rgba(15,23,42,0.04)",
};

const sidebarTitleStyle = {
  padding:
    "10px 12px 8px",

  fontSize:
    10,

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
    44,

  display:
    "flex",

  alignItems:
    "center",

  gap:
    10,

  padding:
    "0 12px",

  marginBottom:
    4,

  border:
    "1px solid transparent",

  borderRadius:
    9,

  background:
    "transparent",

  color:
    "#334155",

  fontSize:
    14,

  fontWeight:
    600,

  textAlign:
    "left" as const,

  cursor:
    "pointer",
};

const sidebarButtonActiveStyle = {
  background:
    "#1d526b",

  color:
    "#ffffff",

  boxShadow:
    "0 4px 10px rgba(29,82,107,0.18)",
};

const separatorStyle = {
  height:
    1,

  background:
    "#e2e8f0",

  margin:
    "8px 4px",
};

const headerStyle = {
  display:
    "flex",

  justifyContent:
    "space-between",

  alignItems:
    "flex-start",

  gap:
    20,

  marginBottom:
    20,
};

const titleStyle = {
  margin:
    0,

  fontSize:
    21,

  color:
    "#12344d",
};

const subtitleStyle = {
  margin:
    "5px 0 0",

  fontSize:
    14,

  color:
    "#64748b",
};

const createCardStyle = {
  background:
    "#ffffff",

  border:
    "1px solid #e5e7eb",

  borderRadius:
    14,

  padding:
    20,
};

const createGridStyle = {
  display:
    "grid",

  gridTemplateColumns:
    "minmax(0, 1fr) 180px 180px auto",

  gap:
    12,

  alignItems:
    "end",
};

const helperStyle = {
  marginTop:
    12,

  fontSize:
    12,

  color:
    "#64748b",
};

const labelStyle = {
  display:
    "block",

  marginBottom:
    7,

  fontSize:
    13,

  fontWeight:
    600,

  color:
    "#334155",
};

const inputStyle = {
  width:
    "100%",

  height:
    44,

  padding:
    "0 14px",

  border:
    "1px solid #d1d5db",

  borderRadius:
    9,

  background:
    "#ffffff",

  fontSize:
    14,

  outline:
    "none",

  boxSizing:
    "border-box" as const,
};

const primaryButtonStyle = {
  height:
    44,

  padding:
    "0 18px",

  border:
    "none",

  borderRadius:
    9,

  background:
    "#1d526b",

  color:
    "#ffffff",

  fontSize:
    14,

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
    14,

  padding:
    "50px 30px",

  textAlign:
    "center" as const,

  color:
    "#64748b",

  fontSize:
    14,
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
    1100,

  padding:
    20,

  boxSizing:
    "border-box" as const,
};

const modalStyle = {
  width:
    "100%",

  maxWidth:
    420,

  background:
    "#ffffff",

  borderRadius:
    14,

  padding:
    24,

  boxShadow:
    "0 20px 50px rgba(15,23,42,0.20)",
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
    10,

  marginTop:
    22,
};

const secondaryButtonStyle = {
  height:
    44,

  padding:
    "0 16px",

  border:
    "1px solid #d1d5db",

  borderRadius:
    9,

  background:
    "#ffffff",

  color:
    "#475569",

  fontSize:
    14,

  fontWeight:
    600,

  cursor:
    "pointer",
};

export default AdminProjectManagement;