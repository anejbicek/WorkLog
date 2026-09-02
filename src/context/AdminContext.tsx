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

export type UserRole = "admin" | "worker";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  authUserId?: string;
  role: UserRole;
  active: boolean;
};

export type AdminProject = {
  id: number;
  name: string;
  active: boolean;
};

export type AdminMachine = {
  id: number;
  name: string;
  active: boolean;
};

export type AdminHoliday = {
  id: number;
  date: string;
  name: string;
};

export type AdminSettings = {
  companyName: string;
  workDayHours: string;
  breakMinutes: string;
  nightStart: string;
  nightEnd: string;
  overtimeAfter: string;
  autoBreak: boolean;
  pdfCompanyName: string;
  pdfResponsiblePerson: string;
  notificationsService: boolean;
  notificationsMissingWorkOrders: boolean;
};

/* =========================================================
   CONTEXT TYPE
========================================================= */

type AdminContextType = {
  users: AdminUser[];
  projects: AdminProject[];
  machines: AdminMachine[];
  holidays: AdminHoliday[];
  settings: AdminSettings;

  addUser: (
    user: Omit<AdminUser, "id">
  ) => void;

  updateUser: (
    id: number,
    user: Omit<AdminUser, "id">
  ) => void;

  deleteUser: (
    id: number
  ) => void;

  toggleUserActive: (
    id: number
  ) => void;

  linkUserAuthId: (
    email: string,
    authUserId: string
  ) => void;

  addProject: (
    project: Omit<AdminProject, "id">
  ) => void;

  updateProject: (
    id: number,
    project: Omit<AdminProject, "id">
  ) => void;

  deleteProject: (
    id: number
  ) => void;

  toggleProjectActive: (
    id: number
  ) => void;

  addMachine: (
    machine: Omit<AdminMachine, "id">
  ) => void;

  updateMachine: (
    id: number,
    machine: Omit<AdminMachine, "id">
  ) => void;

  deleteMachine: (
    id: number
  ) => void;

  toggleMachineActive: (
    id: number
  ) => void;

  addHoliday: (
    holiday: Omit<AdminHoliday, "id">
  ) => void;

  updateHoliday: (
    id: number,
    holiday: Omit<AdminHoliday, "id">
  ) => void;

  deleteHoliday: (
    id: number
  ) => void;

  updateSettings: (
    settings: AdminSettings
  ) => void;
};

/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {
  users: "zusta_worklog_v2_users",
  projects: "zusta_worklog_v2_projects",
  machines: "zusta_worklog_v2_machines",
  holidays: "zusta_worklog_v2_holidays",
  settings: "zusta_worklog_v2_settings",
};

/* =========================================================
   PRIVZETI UPORABNIK
========================================================= */

const defaultUsers: AdminUser[] = [
  {
    id: 1,
    name: "Anej Biček",
    email: "anej.bicek@gmail.com",
    role: "admin",
    active: true,
  },
];

/* =========================================================
   PRIVZETI PROJEKTI
========================================================= */

const defaultProjects: AdminProject[] = [];

/* =========================================================
   PRIVZETI STROJI
========================================================= */

const defaultMachines: AdminMachine[] = [
  {
    id: 1,
    name: "OKUMA MB-56VB",
    active: true,
  },
  {
    id: 2,
    name: "OKUMA M460V-5AX",
    active: true,
  },
  {
    id: 3,
    name: "Žična erozija",
    active: true,
  },
  {
    id: 4,
    name: "Potopna erozija",
    active: true,
  },
];

/* =========================================================
   PRIVZETI PRAZNIKI – SLOVENIJA 2026
========================================================= */

const defaultHolidays: AdminHoliday[] = [
  {
    id: 1,
    date: "2026-01-01",
    name: "Novo leto",
  },
  {
    id: 2,
    date: "2026-01-02",
    name: "Novo leto",
  },
  {
    id: 3,
    date: "2026-02-08",
    name: "Prešernov dan",
  },
  {
    id: 4,
    date: "2026-04-06",
    name: "Velikonočni ponedeljek",
  },
  {
    id: 5,
    date: "2026-04-27",
    name: "Dan upora proti okupatorju",
  },
  {
    id: 6,
    date: "2026-05-01",
    name: "Praznik dela",
  },
  {
    id: 7,
    date: "2026-05-02",
    name: "Praznik dela",
  },
  {
    id: 8,
    date: "2026-06-25",
    name: "Dan državnosti",
  },
  {
    id: 9,
    date: "2026-08-15",
    name: "Marijino vnebovzetje",
  },
  {
    id: 10,
    date: "2026-10-31",
    name: "Dan reformacije",
  },
  {
    id: 11,
    date: "2026-11-01",
    name: "Dan spomina na mrtve",
  },
  {
    id: 12,
    date: "2026-12-25",
    name: "Božič",
  },
  {
    id: 13,
    date: "2026-12-26",
    name: "Dan samostojnosti in enotnosti",
  },
];

/* =========================================================
   PRIVZETE NASTAVITVE
========================================================= */

const defaultSettings: AdminSettings = {
  companyName: "ŽustAI",
  workDayHours: "8",
  breakMinutes: "30",
  nightStart: "22:00",
  nightEnd: "06:00",
  overtimeAfter: "8",
  autoBreak: false,
  pdfCompanyName: "ŽustAI",
  pdfResponsiblePerson: "",
  notificationsService: true,
  notificationsMissingWorkOrders: true,
};

/* =========================================================
   CONTEXT
========================================================= */

const AdminContext =
  createContext<
    AdminContextType | undefined
  >(undefined);

/* =========================================================
   PROVIDER
========================================================= */

type AdminProviderProps = {
  children: ReactNode;
};

export function AdminProvider({
  children,
}: AdminProviderProps) {
  /* =======================================================
     USERS
  ======================================================= */

  const [users, setUsers] =
    useState<AdminUser[]>(defaultUsers);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async (
      authUser: {
        id: string;
        email?: string | null;
      }
    ) => {
      const {
        data,
        error,
      } = await supabase
        .from("users")
        .select("*")
        .order("id", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Napaka pri nalaganju uporabnikov:",
          error
        );
        return;
      }

      if (data && data.length > 0) {
        const mappedUsers: AdminUser[] =
          data.map((row) => ({
            id: Number(row.id),
            name: row.name,
            email: row.email,
            authUserId:
              row.auth_user_id ??
              undefined,
            role:
              row.role as UserRole,
            active: row.active,
          }));

        const currentUser =
          mappedUsers.find(
            (user) =>
              user.email.toLowerCase() ===
              authUser.email?.toLowerCase()
          );

        if (
          currentUser &&
          currentUser.authUserId !==
            authUser.id
        ) {
          const {
            error: linkError,
          } = await supabase
            .from("users")
            .update({
              auth_user_id:
                authUser.id,
            })
            .eq(
              "id",
              currentUser.id
            );

          if (linkError) {
            console.error(
              "Napaka pri povezovanju WorkLog uporabnika z Auth uporabnikom:",
              linkError
            );
          } else {
            currentUser.authUserId =
              authUser.id;
          }
        }

        if (!cancelled) {
          setUsers(mappedUsers);
        }

        return;
      }

      /*
       * PRVA MIGRACIJA:
       * Če tabela users še nima uporabnikov, poskusimo prenesti
       * obstoječe WorkLog uporabnike iz localStorage.
       */

      let localUsers: AdminUser[] =
        defaultUsers;

      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.users
          );

        if (saved) {
          localUsers =
            JSON.parse(saved);
        }
      } catch {
        localUsers =
          defaultUsers;
      }

      const rowsToInsert =
        localUsers.map(
          (user) => ({
            name: user.name,
            email: user.email,
            auth_user_id:
              user.authUserId ??
              (user.email.toLowerCase() ===
              authUser.email?.toLowerCase()
                ? authUser.id
                : null),
            role: user.role,
            active: user.active,
          })
        );

      const {
        data: insertedUsers,
        error: insertError,
      } = await supabase
        .from("users")
        .insert(rowsToInsert)
        .select("*");

      if (insertError) {
        console.error(
          "Napaka pri prvi migraciji uporabnikov v Supabase:",
          insertError
        );
        return;
      }

      const mappedInsertedUsers: AdminUser[] =
        (
          insertedUsers ??
          []
        ).map(
          (row) => ({
            id: Number(row.id),
            name: row.name,
            email: row.email,
            authUserId:
              row.auth_user_id ??
              undefined,
            role:
              row.role as UserRole,
            active: row.active,
          })
        );

      if (!cancelled) {
        setUsers(
          mappedInsertedUsers
        );
      }
    };

    const initialize =
      async () => {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (session?.user) {
          await loadUsers(
            session.user
          );
        }
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
          if (session?.user) {
            void loadUsers(
              session.user
            );
          } else if (
            !cancelled
          ) {
            setUsers(
              defaultUsers
            );
          }
        }
      );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     PROJECTS
  ======================================================= */

  const [projects, setProjects] =
    useState<AdminProject[]>(
      defaultProjects
    );

  /*
   * Naloži projekte iz Supabase.
   */

  useEffect(() => {
    let cancelled = false;

    const loadProjects =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("projects")
          .select("*")
          .order("id", {
            ascending: true,
          });

        if (error) {
          console.error(
            "Napaka pri nalaganju projektov:",
            error
          );
          return;
        }

        const mappedProjects: AdminProject[] =
          (
            data ??
            []
          ).map(
            (row) => ({
              id: Number(row.id),
              name: row.name,
              active: row.active,
            })
          );

        if (!cancelled) {
          setProjects(
            mappedProjects
          );
        }
      };

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     MACHINES
  ======================================================= */

  const [machines, setMachines] =
    useState<AdminMachine[]>(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.machines
          );

        return saved
          ? JSON.parse(saved)
          : defaultMachines;
      } catch {
        return defaultMachines;
      }
    });

  /* =======================================================
     PRAZNIKI
  ======================================================= */

  const [holidays, setHolidays] =
    useState<AdminHoliday[]>(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.holidays
          );

        return saved
          ? JSON.parse(saved)
          : defaultHolidays;
      } catch {
        return defaultHolidays;
      }
    });

  /* =======================================================
     NASTAVITVE
  ======================================================= */

  const [settings, setSettings] =
    useState<AdminSettings>(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.settings
          );

        return saved
          ? JSON.parse(saved)
          : defaultSettings;
      } catch {
        return defaultSettings;
      }
    });

  /* =======================================================
     SHRANJEVANJE
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.machines,
      JSON.stringify(machines)
    );
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.holidays,
      JSON.stringify(holidays)
    );
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify(settings)
    );
  }, [settings]);

  /* =======================================================
     USERS – FUNKCIJE
  ======================================================= */

  const addUser = (
    user: Omit<AdminUser, "id">
  ) => {
    const saveUser = async () => {
      const {
        data,
        error,
      } = await supabase
        .from("users")
        .insert({
          name: user.name,
          email: user.email,
          auth_user_id:
            user.authUserId ??
            null,
          role: user.role,
          active: user.active,
        })
        .select("*")
        .single();

      if (error) {
        console.error(
          "Napaka pri dodajanju uporabnika:",
          error
        );
        return;
      }

      const newUser: AdminUser =
        {
          id: Number(data.id),
          name: data.name,
          email: data.email,
          authUserId:
            data.auth_user_id ??
            undefined,
          role:
            data.role as UserRole,
          active: data.active,
        };

      setUsers(
        (previous) => [
          ...previous,
          newUser,
        ]
      );
    };

    void saveUser();
  };

  const updateUser = (
    id: number,
    user: Omit<AdminUser, "id">
  ) => {
    const saveUser =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("users")
          .update({
            name: user.name,
            email: user.email,
            auth_user_id:
              user.authUserId ??
              null,
            role: user.role,
            active: user.active,
          })
          .eq(
            "id",
            id
          )
          .select("*")
          .single();

        if (error) {
          console.error(
            "Napaka pri urejanju uporabnika:",
            error
          );
          return;
        }

        const updatedUser: AdminUser =
          {
            id: Number(data.id),
            name: data.name,
            email: data.email,
            authUserId:
              data.auth_user_id ??
              undefined,
            role:
              data.role as UserRole,
            active: data.active,
          };

        setUsers(
          (previous) =>
            previous.map(
              (item) =>
                item.id === id
                  ? updatedUser
                  : item
            )
        );
      };

    void saveUser();
  };

  const deleteUser = (
    id: number
  ) => {
    if (id === 1) {
      return;
    }

    const removeUser =
      async () => {
        const {
          error,
        } = await supabase
          .from("users")
          .delete()
          .eq(
            "id",
            id
          );

        if (error) {
          console.error(
            "Napaka pri brisanju uporabnika:",
            error
          );
          return;
        }

        setUsers(
          (previous) =>
            previous.filter(
              (user) =>
                user.id !== id
            )
        );
      };

    void removeUser();
  };

  const toggleUserActive = (
    id: number
  ) => {
    const toggleUser =
      async () => {
        const currentUser =
          users.find(
            (user) =>
              user.id === id
          );

        if (!currentUser) {
          return;
        }

        const newActive =
          !currentUser.active;

        const {
          error,
        } = await supabase
          .from("users")
          .update({
            active:
              newActive,
          })
          .eq(
            "id",
            id
          );

        if (error) {
          console.error(
            "Napaka pri spreminjanju aktivnega stanja uporabnika:",
            error
          );
          return;
        }

        setUsers(
          (previous) =>
            previous.map(
              (user) =>
                user.id === id
                  ? {
                      ...user,
                      active:
                        newActive,
                    }
                  : user
            )
        );
      };

    void toggleUser();
  };

  /* =======================================================
     POVEŽI SUPABASE UPORABNIKA
  ======================================================= */

  const linkUserAuthId = (
    email: string,
    authUserId: string
  ) => {
    const linkUser =
      async () => {
        const {
          error,
        } = await supabase
          .from("users")
          .update({
            auth_user_id:
              authUserId,
          })
          .eq(
            "email",
            email
          );

        if (error) {
          console.error(
            "Napaka pri povezovanju uporabnika z Auth računom:",
            error
          );
          return;
        }

        setUsers(
          (previous) =>
            previous.map(
              (user) =>
                user.email.toLowerCase() ===
                email.toLowerCase()
                  ? {
                      ...user,
                      authUserId,
                    }
                  : user
            )
        );
      };

    void linkUser();
  };

  /* =======================================================
     PROJECTS – FUNKCIJE
  ======================================================= */

  const addProject = (
    project: Omit<AdminProject, "id">
  ) => {
    const saveProject =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("projects")
          .insert({
            name: project.name,
            active: project.active,
          })
          .select("*")
          .single();

        if (error) {
          console.error(
            "Napaka pri dodajanju projekta:",
            error
          );
          return;
        }

        const newProject: AdminProject =
          {
            id: Number(data.id),
            name: data.name,
            active: data.active,
          };

        setProjects(
          (previous) => [
            ...previous,
            newProject,
          ]
        );
      };

    void saveProject();
  };

  const updateProject = (
    id: number,
    project: Omit<AdminProject, "id">
  ) => {
    const saveProject =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("projects")
          .update({
            name: project.name,
            active:
              project.active,
          })
          .eq(
            "id",
            id
          )
          .select("*")
          .single();

        if (error) {
          console.error(
            "Napaka pri urejanju projekta:",
            error
          );
          return;
        }

        const updatedProject: AdminProject =
          {
            id: Number(data.id),
            name: data.name,
            active: data.active,
          };

        setProjects(
          (previous) =>
            previous.map(
              (item) =>
                item.id === id
                  ? updatedProject
                  : item
            )
        );
      };

    void saveProject();
  };

  const deleteProject = (
    id: number
  ) => {
    const removeProject =
      async () => {
        const {
          error,
        } = await supabase
          .from("projects")
          .delete()
          .eq(
            "id",
            id
          );

        if (error) {
          console.error(
            "Napaka pri brisanju projekta:",
            error
          );
          return;
        }

        setProjects(
          (previous) =>
            previous.filter(
              (project) =>
                project.id !== id
            )
        );
      };

    void removeProject();
  };

  const toggleProjectActive = (
    id: number
  ) => {
    const toggleProject =
      async () => {
        const currentProject =
          projects.find(
            (project) =>
              project.id === id
          );

        if (!currentProject) {
          return;
        }

        const newActive =
          !currentProject.active;

        const {
          error,
        } = await supabase
          .from("projects")
          .update({
            active:
              newActive,
          })
          .eq(
            "id",
            id
          );

        if (error) {
          console.error(
            "Napaka pri spreminjanju aktivnega stanja projekta:",
            error
          );
          return;
        }

        setProjects(
          (previous) =>
            previous.map(
              (project) =>
                project.id === id
                  ? {
                      ...project,
                      active:
                        newActive,
                    }
                  : project
            )
        );
      };

    void toggleProject();
  };

  /* =======================================================
     MACHINES – FUNKCIJE
  ======================================================= */

  const addMachine = (
    machine: Omit<AdminMachine, "id">
  ) => {
    setMachines(
      (previous) => [
        ...previous,
        {
          ...machine,
          id: Date.now(),
        },
      ]
    );
  };

  const updateMachine = (
    id: number,
    machine: Omit<AdminMachine, "id">
  ) => {
    setMachines(
      (previous) =>
        previous.map(
          (item) =>
            item.id === id
              ? {
                  ...machine,
                  id,
                }
              : item
        )
    );
  };

  const deleteMachine = (
    id: number
  ) => {
    setMachines(
      (previous) =>
        previous.filter(
          (machine) =>
            machine.id !== id
        )
    );
  };

  const toggleMachineActive = (
    id: number
  ) => {
    setMachines(
      (previous) =>
        previous.map(
          (machine) =>
            machine.id === id
              ? {
                  ...machine,
                  active:
                    !machine.active,
                }
              : machine
        )
    );
  };

  /* =======================================================
     PRAZNIKI – FUNKCIJE
  ======================================================= */

  const addHoliday = (
    holiday: Omit<AdminHoliday, "id">
  ) => {
    setHolidays(
      (previous) => [
        ...previous,
        {
          ...holiday,
          id: Date.now(),
        },
      ]
    );
  };

  const updateHoliday = (
    id: number,
    holiday: Omit<AdminHoliday, "id">
  ) => {
    setHolidays(
      (previous) =>
        previous.map(
          (item) =>
            item.id === id
              ? {
                  ...holiday,
                  id,
                }
              : item
        )
    );
  };

  const deleteHoliday = (
    id: number
  ) => {
    setHolidays(
      (previous) =>
        previous.filter(
          (holiday) =>
            holiday.id !== id
        )
    );
  };

  /* =======================================================
     SETTINGS
  ======================================================= */

  const updateSettings = (
    nextSettings: AdminSettings
  ) => {
    setSettings(
      nextSettings
    );
  };

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <AdminContext.Provider
      value={{
        users,
        projects,
        machines,
        holidays,
        settings,

        addUser,
        updateUser,
        deleteUser,
        toggleUserActive,
        linkUserAuthId,

        addProject,
        updateProject,
        deleteProject,
        toggleProjectActive,

        addMachine,
        updateMachine,
        deleteMachine,
        toggleMachineActive,

        addHoliday,
        updateHoliday,
        deleteHoliday,

        updateSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useAdmin() {
  const context =
    useContext(AdminContext);

  if (!context) {
    throw new Error(
      "useAdmin mora biti uporabljen znotraj AdminProvider."
    );
  }

  return context;
}