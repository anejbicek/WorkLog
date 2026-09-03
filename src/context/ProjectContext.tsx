import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../services/supabase";

/* =========================================================
   TIPI
========================================================= */

export type ProjectEntry = {
  id: number;
  projectId: number;
  userId: number;
  machineId: number;

  date: string;
  startTime: string;
  endTime: string;

  machine: string;
  quantity: number;

  workerName: string;
  createdAt?: string;
};

/* =========================================================
   VHODNI PODATKI ZA NOV VNOS
========================================================= */

export type AddProjectEntryInput = {
  projectId: number;
  date: string;
  startTime: string;
  endTime: string;
  machine: string;
  quantity: number;

  /*
   * Projects.tsx lahko pošlje tudi ime delavca.
   * Dejanski uporabnik se še vedno določi
   * preko prijavljenega Supabase Auth uporabnika.
   */
  workerName?: string;
};

/* =========================================================
   CONTEXT TYPE
========================================================= */

type ProjectContextType = {
  entries: ProjectEntry[];

  loading: boolean;
  error: string | null;

  addEntry: (
    entry: AddProjectEntryInput
  ) => Promise<boolean>;

  updateEntry: (
    id: number,
    entry: AddProjectEntryInput
  ) => Promise<boolean>;

  deleteEntry: (
    id: number
  ) => Promise<boolean>;

  refreshEntries: () => Promise<void>;

  /*
   * Alias za obstoječi Projects.tsx,
   * ki uporablja reloadEntries().
   */
  reloadEntries: () => Promise<void>;

  getProjectEntries: (
    projectId: number
  ) => ProjectEntry[];

  getProjectProducedQuantity: (
    projectId: number
  ) => number;

  getProjectHours: (
    projectId: number
  ) => number;

  getProjectWorkers: (
    projectId: number
  ) => string[];

  getProjectMachines: (
    projectId: number
  ) => string[];
};

/* =========================================================
   CONTEXT
========================================================= */

const ProjectContext =
  createContext<
    ProjectContextType | undefined
  >(undefined);

/* =========================================================
   POMOŽNE FUNKCIJE
========================================================= */

function calculateHours(
  startTime: string,
  endTime: string
): number {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHours, startMinutes] =
    startTime
      .split(":")
      .map(Number);

  const [endHours, endMinutes] =
    endTime
      .split(":")
      .map(Number);

  if (
    Number.isNaN(startHours) ||
    Number.isNaN(startMinutes) ||
    Number.isNaN(endHours) ||
    Number.isNaN(endMinutes)
  ) {
    return 0;
  }

  let startTotal =
    startHours * 60 +
    startMinutes;

  let endTotal =
    endHours * 60 +
    endMinutes;

  /*
   * Če je konec po polnoči.
   */
  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }

  const minutes =
    endTotal - startTotal;

  return minutes / 60;
}

/* =========================================================
   SUPABASE RELACIJE
========================================================= */

function getRelationName(
  relation: unknown
): string | undefined {
  if (
    Array.isArray(relation)
  ) {
    const first = relation[0];

    if (
      first &&
      typeof first === "object" &&
      "name" in first &&
      typeof first.name === "string"
    ) {
      return first.name;
    }

    return undefined;
  }

  if (
    relation &&
    typeof relation === "object" &&
    "name" in relation &&
    typeof relation.name === "string"
  ) {
    return relation.name;
  }

  return undefined;
}

/* =========================================================
   PROVIDER
========================================================= */

type ProjectProviderProps = {
  children: ReactNode;
};

export function ProjectProvider({
  children,
}: ProjectProviderProps) {
  const [entries, setEntries] =
    useState<ProjectEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     NALAGANJE VNOSOV
  ======================================================= */

  const loadEntries =
    async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        /*
         * Brez prijavljenega uporabnika
         * ne nalagamo projektnih vnosov.
         */
        if (!session?.user) {
          setEntries([]);
          setLoading(false);
          return;
        }

        const {
          data,
          error: loadError,
        } =
          await supabase
            .from(
              "project_work_entries"
            )
            .select(
              `
                id,
                project_id,
                user_id,
                machine_id,
                work_date,
                start_time,
                end_time,
                quantity,
                created_at,
                user:users!project_work_entries_user_fk (
                  name
                ),
                machine:machines!project_work_entries_machine_fk (
                  name
                )
              `
            )
            .order(
              "work_date",
              {
                ascending: false,
              }
            )
            .order(
              "start_time",
              {
                ascending: false,
              }
            );

        if (loadError) {
          console.error(
            "Napaka pri nalaganju projektnih vnosov:",
            loadError
          );

          setError(
            "Projektnih vnosov ni bilo mogoče naložiti."
          );

          setEntries([]);
          setLoading(false);
          return;
        }

        const mappedEntries:
          ProjectEntry[] =
          (
            data ?? []
          ).map(
            (row: any) => ({
              id: Number(
                row.id
              ),

              projectId: Number(
                row.project_id
              ),

              userId: Number(
                row.user_id
              ),

              machineId: Number(
                row.machine_id
              ),

              date:
                row.work_date,

              startTime:
                row.start_time,

              endTime:
                row.end_time,

              machine:
                getRelationName(
                  row.machine
                ) ??
                "Neznan stroj",

              quantity:
                Number(
                  row.quantity ?? 0
                ),

              workerName:
                getRelationName(
                  row.user
                ) ??
                "Neznan uporabnik",

              createdAt:
                row.created_at,
            })
          );

        setEntries(
          mappedEntries
        );
      } catch (exception) {
        console.error(
          "Napaka pri nalaganju projektnih vnosov:",
          exception
        );

        setError(
          "Prišlo je do napake pri nalaganju projektnih podatkov."
        );

        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     INITIAL LOAD + AUTH
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const initialize =
      async () => {
        if (cancelled) {
          return;
        }

        await loadEntries();
      };

    void initialize();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (cancelled) {
            return;
          }

          if (session?.user) {
            void loadEntries();
          } else {
            setEntries([]);
            setLoading(false);
          }
        }
      );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshEntries =
    async () => {
      await loadEntries();
    };

  /*
   * Združljivost s Projects.tsx.
   */
  const reloadEntries =
    async () => {
      await loadEntries();
    };

  /* =======================================================
     DODAJ VNOS
  ======================================================= */

  const addEntry = async (
    entry: AddProjectEntryInput
  ): Promise<boolean> => {
    setError(null);

    try {
      /*
       * Preveri prijavljenega uporabnika.
       */
      const {
        data: {
          user: authUser,
        },
      } =
        await supabase.auth.getUser();

      if (!authUser) {
        setError(
          "Za vnos izdelave moraš biti prijavljen."
        );

        return false;
      }

      /*
       * Poiščemo uporabnika v public.users.
       */
      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from("users")
          .select(
            "id, name, active"
          )
          .eq(
            "auth_user_id",
            authUser.id
          )
          .maybeSingle();

      if (profileError) {
        console.error(
          "Napaka pri iskanju uporabnika:",
          profileError
        );

        setError(
          "Uporabnika ni bilo mogoče prepoznati."
        );

        return false;
      }

      if (!profile) {
        setError(
          "Tvoj uporabniški račun še ni povezan z WorkLog uporabnikom."
        );

        return false;
      }

      if (!profile.active) {
        setError(
          "Tvoj uporabniški račun ni aktiven."
        );

        return false;
      }

      /*
       * Poiščemo stroj.
       */
      const {
        data: machine,
        error: machineError,
      } =
        await supabase
          .from("machines")
          .select(
            "id, name, active"
          )
          .eq(
            "name",
            entry.machine
          )
          .maybeSingle();

      if (machineError) {
        console.error(
          "Napaka pri iskanju stroja:",
          machineError
        );

        setError(
          "Stroja ni bilo mogoče najti."
        );

        return false;
      }

      if (!machine) {
        setError(
          "Izbrani stroj ne obstaja."
        );

        return false;
      }

      if (!machine.active) {
        setError(
          "Izbrani stroj ni aktiven."
        );

        return false;
      }

      /* ===================================================
         VALIDACIJA
      =================================================== */

      if (
        !entry.projectId ||
        entry.projectId <= 0
      ) {
        setError(
          "Izberi projekt."
        );

        return false;
      }

      if (!entry.date) {
        setError(
          "Izberi datum."
        );

        return false;
      }

      if (!entry.startTime) {
        setError(
          "Vnesi začetni čas."
        );

        return false;
      }

      if (!entry.endTime) {
        setError(
          "Vnesi končni čas."
        );

        return false;
      }

      if (
        entry.quantity < 0
      ) {
        setError(
          "Količina ne more biti negativna."
        );

        return false;
      }

      const hours =
        calculateHours(
          entry.startTime,
          entry.endTime
        );

      if (hours <= 0) {
        setError(
          "Končni čas mora biti drugačen od začetnega časa."
        );

        return false;
      }

      /* ===================================================
         INSERT
      =================================================== */

      const {
        data,
        error: insertError,
      } =
        await supabase
          .from(
            "project_work_entries"
          )
          .insert({
            project_id:
              entry.projectId,

            user_id:
              Number(profile.id),

            machine_id:
              Number(machine.id),

            work_date:
              entry.date,

            start_time:
              entry.startTime,

            end_time:
              entry.endTime,

            quantity:
              Math.max(
                0,
                Math.round(
                  entry.quantity
                )
              ),
          })
          .select(
            `
              id,
              project_id,
              user_id,
              machine_id,
              work_date,
              start_time,
              end_time,
              quantity,
              created_at,
              user:users!project_work_entries_user_fk (
                name
              ),
              machine:machines!project_work_entries_machine_fk (
                name
              )
            `
          )
          .single();

      if (insertError) {
        console.error(
          "Napaka pri dodajanju projektnega vnosa:",
          insertError
        );

        setError(
          insertError.message ||
            "Izdelave ni bilo mogoče shraniti."
        );

        return false;
      }

      const newEntry:
        ProjectEntry =
        {
          id: Number(
            data.id
          ),

          projectId:
            Number(
              data.project_id
            ),

          userId:
            Number(
              data.user_id
            ),

          machineId:
            Number(
              data.machine_id
            ),

          date:
            data.work_date,

          startTime:
            data.start_time,

          endTime:
            data.end_time,

          machine:
            getRelationName(
              data.machine
            ) ??
            machine.name,

          quantity:
            Number(
              data.quantity ?? 0
            ),

          workerName:
            getRelationName(
              data.user
            ) ??
            profile.name,

          createdAt:
            data.created_at,
        };

      setEntries(
        (previous) => [
          newEntry,
          ...previous,
        ]
      );

      return true;
    } catch (exception) {
      console.error(
        "Napaka pri dodajanju projektnega vnosa:",
        exception
      );

      setError(
        "Izdelave ni bilo mogoče shraniti."
      );

      return false;
    }
  };

  /* =======================================================
     UREDI VNOS
  ======================================================= */

  const updateEntry = async (
    id: number,
    entry: AddProjectEntryInput
  ): Promise<boolean> => {
    setError(null);

    try {
      const {
        data: {
          user: authUser,
        },
      } =
        await supabase.auth.getUser();

      if (!authUser) {
        setError(
          "Za urejanje moraš biti prijavljen."
        );

        return false;
      }

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from("users")
          .select(
            "id, name, active"
          )
          .eq(
            "auth_user_id",
            authUser.id
          )
          .maybeSingle();

      if (
        profileError ||
        !profile
      ) {
        setError(
          "Uporabnika ni bilo mogoče prepoznati."
        );

        return false;
      }

      if (!profile.active) {
        setError(
          "Tvoj uporabniški račun ni aktiven."
        );

        return false;
      }

      const {
        data: machine,
        error: machineError,
      } =
        await supabase
          .from("machines")
          .select(
            "id, name, active"
          )
          .eq(
            "name",
            entry.machine
          )
          .maybeSingle();

      if (
        machineError ||
        !machine
      ) {
        setError(
          "Izbranega stroja ni bilo mogoče najti."
        );

        return false;
      }

      if (!machine.active) {
        setError(
          "Izbrani stroj ni aktiven."
        );

        return false;
      }

      const hours =
        calculateHours(
          entry.startTime,
          entry.endTime
        );

      if (hours <= 0) {
        setError(
          "Končni čas mora biti drugačen od začetnega časa."
        );

        return false;
      }

      const {
        data,
        error: updateError,
      } =
        await supabase
          .from(
            "project_work_entries"
          )
          .update({
            project_id:
              entry.projectId,

            machine_id:
              Number(machine.id),

            work_date:
              entry.date,

            start_time:
              entry.startTime,

            end_time:
              entry.endTime,

            quantity:
              Math.max(
                0,
                Math.round(
                  entry.quantity
                )
              ),
          })
          .eq(
            "id",
            id
          )
          .select(
            `
              id,
              project_id,
              user_id,
              machine_id,
              work_date,
              start_time,
              end_time,
              quantity,
              created_at,
              user:users!project_work_entries_user_fk (
                name
              ),
              machine:machines!project_work_entries_machine_fk (
                name
              )
            `
          )
          .single();

      if (updateError) {
        console.error(
          "Napaka pri urejanju projektnega vnosa:",
          updateError
        );

        setError(
          updateError.message ||
            "Projektnega vnosa ni bilo mogoče urediti."
        );

        return false;
      }

      const updatedEntry:
        ProjectEntry =
        {
          id: Number(
            data.id
          ),

          projectId:
            Number(
              data.project_id
            ),

          userId:
            Number(
              data.user_id
            ),

          machineId:
            Number(
              data.machine_id
            ),

          date:
            data.work_date,

          startTime:
            data.start_time,

          endTime:
            data.end_time,

          machine:
            getRelationName(
              data.machine
            ) ??
            machine.name,

          quantity:
            Number(
              data.quantity ?? 0
            ),

          workerName:
            getRelationName(
              data.user
            ) ??
            profile.name,

          createdAt:
            data.created_at,
        };

      setEntries(
        (previous) =>
          previous.map(
            (item) =>
              item.id === id
                ? updatedEntry
                : item
          )
      );

      return true;
    } catch (exception) {
      console.error(
        "Napaka pri urejanju projektnega vnosa:",
        exception
      );

      setError(
        "Projektnega vnosa ni bilo mogoče urediti."
      );

      return false;
    }
  };

  /* =======================================================
     IZBRIŠI VNOS
  ======================================================= */

  const deleteEntry = async (
    id: number
  ): Promise<boolean> => {
    setError(null);

    try {
      const {
        error: deleteError,
      } =
        await supabase
          .from(
            "project_work_entries"
          )
          .delete()
          .eq(
            "id",
            id
          );

      if (deleteError) {
        console.error(
          "Napaka pri brisanju projektnega vnosa:",
          deleteError
        );

        setError(
          deleteError.message ||
            "Projektnega vnosa ni bilo mogoče izbrisati."
        );

        return false;
      }

      setEntries(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      );

      return true;
    } catch (exception) {
      console.error(
        "Napaka pri brisanju projektnega vnosa:",
        exception
      );

      setError(
        "Projektnega vnosa ni bilo mogoče izbrisati."
      );

      return false;
    }
  };

  /* =======================================================
     VNOSI PROJEKTA
  ======================================================= */

  const getProjectEntries = (
    projectId: number
  ): ProjectEntry[] => {
    return entries.filter(
      (entry) =>
        entry.projectId ===
        projectId
    );
  };

  /* =======================================================
     IZDELANI KOSI
  ======================================================= */

  const getProjectProducedQuantity = (
    projectId: number
  ): number => {
    return getProjectEntries(
      projectId
    ).reduce(
      (total, entry) =>
        total + entry.quantity,
      0
    );
  };

  /* =======================================================
     URE
  ======================================================= */

  const getProjectHours = (
    projectId: number
  ): number => {
    return getProjectEntries(
      projectId
    ).reduce(
      (total, entry) =>
        total +
        calculateHours(
          entry.startTime,
          entry.endTime
        ),
      0
    );
  };

  /* =======================================================
     DELAVCI
  ======================================================= */

  const getProjectWorkers = (
    projectId: number
  ): string[] => {
    const workers =
      getProjectEntries(
        projectId
      )
        .map(
          (entry) =>
            entry.workerName
        )
        .filter(Boolean);

    return Array.from(
      new Set(workers)
    );
  };

  /* =======================================================
     STROJI
  ======================================================= */

  const getProjectMachines = (
    projectId: number
  ): string[] => {
    const machineNames =
      getProjectEntries(
        projectId
      )
        .map(
          (entry) =>
            entry.machine
        )
        .filter(Boolean);

    return Array.from(
      new Set(machineNames)
    );
  };

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <ProjectContext.Provider
      value={{
        entries,

        loading,
        error,

        addEntry,
        updateEntry,
        deleteEntry,

        refreshEntries,
        reloadEntries,

        getProjectEntries,
        getProjectProducedQuantity,
        getProjectHours,
        getProjectWorkers,
        getProjectMachines,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useProjects() {
  const context =
    useContext(
      ProjectContext
    );

  if (!context) {
    throw new Error(
      "useProjects mora biti uporabljen znotraj ProjectProvider."
    );
  }

  return context;
}