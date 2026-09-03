import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAdmin,
} from "../context/AdminContext";

import {
  useProjects,
} from "../context/ProjectContext";

import {
  supabase,
} from "../services/supabase";

import ProjectCard from "../components/Projects/ProjectCard";
import ProjectDetails from "../components/Projects/ProjectDetails";
import ProjectEntryForm from "../components/Projects/ProjectEntryForm";

function Projects() {
  const {
    projects,
    machines,
  } = useAdmin();

  const {
    loading,
    error,
    addEntry,
    deleteEntry,
    reloadEntries,
    getProjectEntries,
    getProjectProducedQuantity,
    getProjectHours,
    getProjectWorkers,
    getProjectMachines,
  } = useProjects();

  /* =========================================================
     AKTIVNI PROJEKTI IN STROJI
  ========================================================= */

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.active
      ),
    [projects]
  );

  const activeMachines = useMemo(
    () =>
      machines.filter(
        (machine) =>
          machine.active
      ),
    [machines]
  );

  /* =========================================================
     PRIJAVLJENI UPORABNIK
  ========================================================= */

  const [
    currentWorker,
    setCurrentWorker,
  ] = useState("Uporabnik");

  useEffect(() => {
    let cancelled = false;

    const loadCurrentWorker =
      async () => {
        try {
          const {
            data: {
              user,
            },
            error: authError,
          } =
            await supabase.auth.getUser();

          if (
            authError ||
            !user
          ) {
            if (!cancelled) {
              setCurrentWorker(
                "Uporabnik"
              );
            }

            return;
          }

          const {
            data: profile,
            error: profileError,
          } = await supabase
            .from("users")
            .select(
              "name"
            )
            .eq(
              "auth_user_id",
              user.id
            )
            .maybeSingle();

          if (
            profileError
          ) {
            console.error(
              "Napaka pri nalaganju prijavljenega uporabnika:",
              profileError
            );

            if (!cancelled) {
              setCurrentWorker(
                "Uporabnik"
              );
            }

            return;
          }

          if (
            !cancelled &&
            profile?.name
          ) {
            setCurrentWorker(
              profile.name
            );
          }
        } catch (exception) {
          console.error(
            "Napaka pri ugotavljanju prijavljenega uporabnika:",
            exception
          );

          if (!cancelled) {
            setCurrentWorker(
              "Uporabnik"
            );
          }
        }
      };

    void loadCurrentWorker();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     DATUM
  ========================================================= */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /* =========================================================
     STANJE MODALOV
  ========================================================= */

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState<
    number | ""
  >("");

  const [
    showEntryForm,
    setShowEntryForm,
  ] = useState(false);

  const [
    detailsProjectId,
    setDetailsProjectId,
  ] = useState<
    number | null
  >(null);

  /* =========================================================
     STANJE VNOSA IZDELAVE
  ========================================================= */

  const [
    entryDate,
    setEntryDate,
  ] = useState(today);

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
    quantity,
    setQuantity,
  ] = useState("0");

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* =========================================================
     IZBRANI PROJEKT ZA VNOS
  ========================================================= */

  const selectedProject =
    typeof selectedProjectId ===
    "number"
      ? activeProjects.find(
          (project) =>
            project.id ===
            selectedProjectId
        ) ?? null
      : null;

  /* =========================================================
     PROJEKT ZA PODROBNOSTI
  ========================================================= */

  const detailsProject =
    detailsProjectId !== null
      ? projects.find(
          (project) =>
            project.id ===
            detailsProjectId
        ) ?? null
      : null;

  /* =========================================================
     ODPRE VNOS IZDELAVE
  ========================================================= */

  const openEntryForm = (
    projectId?: number
  ) => {
    const project =
      projectId !== undefined
        ? activeProjects.find(
            (item) =>
              item.id ===
              projectId
          )
        : activeProjects[0];

    if (!project) {
      return;
    }

    setSelectedProjectId(
      project.id
    );

    setEntryDate(today);

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

    setQuantity("0");

    setShowEntryForm(true);
  };

  /* =========================================================
     ZAPRE VNOS IZDELAVE
  ========================================================= */

  const closeEntryForm = () => {
    setShowEntryForm(false);

    setSelectedProjectId(
      ""
    );

    setQuantity("0");
  };

  /* =========================================================
     ODPRE PODROBNOSTI PROJEKTA
  ========================================================= */

  const openProjectDetails = (
    projectId: number
  ) => {
    setDetailsProjectId(
      projectId
    );
  };

  /* =========================================================
     ZAPRE PODROBNOSTI PROJEKTA
  ========================================================= */

  const closeProjectDetails = () => {
    setDetailsProjectId(
      null
    );
  };

  /* =========================================================
     SHRANI VNOS IZDELAVE
  ========================================================= */

  const saveEntry =
    async () => {
      if (!selectedProject) {
        return;
      }

      if (!entryDate) {
        return;
      }

      if (
        !startTime ||
        !endTime
      ) {
        return;
      }

      if (!selectedMachine) {
        return;
      }

      const parsedQuantity =
        Number(quantity);

      if (
        !Number.isFinite(
          parsedQuantity
        ) ||
        parsedQuantity < 0
      ) {
        return;
      }

      setSaving(true);

      try {
        await addEntry({
          projectId:
            selectedProject.id,

          date:
            entryDate,

          startTime:
            startTime,

          endTime:
            endTime,

          machine:
            selectedMachine,

          quantity:
            Math.round(
              parsedQuantity
            ),

          workerName:
            currentWorker,
        });

        await reloadEntries();

        closeEntryForm();
      } finally {
        setSaving(false);
      }
    };

  /* =========================================================
     IZBRIS VNOSA IZDELAVE
  ========================================================= */

  const handleDeleteEntry =
    async (
      entryId: number
    ) => {
      const confirmed =
        window.confirm(
          "Ali res želiš izbrisati ta vnos izdelave?"
        );

      if (!confirmed) {
        return;
      }

      await deleteEntry(
        entryId
      );

      await reloadEntries();
    };

  /* =========================================================
     PODATKI ZA PROJEKT
  ========================================================= */

  const getProjectData = (
    projectId: number
  ) => {
    const projectEntries =
      getProjectEntries(
        projectId
      );

    const project =
      projects.find(
        (item) =>
          item.id ===
          projectId
      );

    const requiredQuantity =
      project
        ?.requiredQuantity ??
      0;

    const producedQuantity =
      getProjectProducedQuantity(
        projectId
      );

    const hours =
      getProjectHours(
        projectId
      );

    const workers =
      getProjectWorkers(
        projectId
      );

    const projectMachines =
      getProjectMachines(
        projectId
      );

    return {
      entries:
        projectEntries,

      requiredQuantity:
        requiredQuantity,

      producedQuantity:
        producedQuantity,

      hours:
        hours,

      workers:
        workers,

      machines:
        projectMachines,
    };
  };

  /* =========================================================
     NALAGANJE
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              "14px",
            padding:
              "40px",
            textAlign:
              "center",
            color:
              "#64748b",
          }}
        >
          Nalagam projekte ...
        </div>
      </div>
    );
  }

  /* =========================================================
     NAPAKA
  ========================================================= */

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #fecaca",
            borderRadius:
              "14px",
            padding:
              "30px",
            color:
              "#b91c1c",
          }}
        >
          <strong>
            Napaka pri nalaganju
            projektov
          </strong>

          <div
            style={{
              marginTop:
                "8px",
              fontSize:
                "14px",
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     GLAVNI PRIKAZ
  ========================================================= */

  return (
    <>
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* ===================================================
            GLAVA
        =================================================== */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            gap:
              "20px",
            marginBottom:
              "30px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize:
                  "32px",
                fontWeight:
                  700,
                color:
                  "#12344d",
              }}
            >
              Projekti
            </h1>

            <p
              style={{
                marginTop:
                  "8px",
                marginBottom:
                  0,
                fontSize:
                  "15px",
                color:
                  "#64748b",
              }}
            >
              Spremljanje
              izdelave,
              količin in
              porabe časa
              po projektih.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openEntryForm()
            }
            disabled={
              activeProjects.length ===
              0
            }
            style={{
              border:
                "none",
              borderRadius:
                "10px",
              padding:
                "11px 18px",
              background:
                activeProjects.length ===
                0
                  ? "#cbd5e1"
                  : "#1d526b",
              color:
                "#ffffff",
              fontSize:
                "14px",
              fontWeight:
                700,
              cursor:
                activeProjects.length ===
                0
                  ? "not-allowed"
                  : "pointer",
              whiteSpace:
                "nowrap",
            }}
          >
            + Dodaj izdelavo
          </button>
        </div>

        {/* ===================================================
            PRAZEN STAN
        =================================================== */}

        {activeProjects.length ===
        0 ? (
          <div
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                "14px",
              padding:
                "50px 30px",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "18px",
                fontWeight:
                  700,
                color:
                  "#12344d",
                marginBottom:
                  "8px",
              }}
            >
              Trenutno ni
              aktivnih
              projektov
            </div>

            <div
              style={{
                fontSize:
                  "14px",
                color:
                  "#64748b",
              }}
            >
              Projekt najprej
              ustvari v
              Administracija
              → Projekti.
            </div>
          </div>
        ) : (
          <>
            {/* ===============================================
                PROJEKTNE KARTICE
            =============================================== */}

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(340px, 1fr))",
                gap:
                  "20px",
              }}
            >
              {activeProjects.map(
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

                  return (
                    <ProjectCard
                      key={
                        project.id
                      }
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
                        openProjectDetails(
                          project.id
                        )
                      }
                      onAddEntry={() =>
                        openEntryForm(
                          project.id
                        )
                      }
                    />
                  );
                }
              )}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          PODROBNOSTI PROJEKTA
      ===================================================== */}

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

              onAddEntry={() => {
                closeProjectDetails();

                openEntryForm(
                  detailsProject.id
                );
              }}

              onDeleteEntry={
                handleDeleteEntry
              }

              onClose={
                closeProjectDetails
              }
            />
          );
        })()}

      {/* =====================================================
          VNOS IZDELAVE
      ===================================================== */}

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
            quantity
          }

          currentWorker={
            currentWorker
          }

          saving={
            saving
          }

          onProjectChange={(
            value
          ) => {
            if (
              value === ""
            ) {
              setSelectedProjectId(
                ""
              );

              return;
            }

            setSelectedProjectId(
              Number(value)
            );
          }}

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
            setQuantity
          }

          onSave={
            saveEntry
          }

          onClose={
            closeEntryForm
          }
        />
      )}
    </>
  );
}

export default Projects;