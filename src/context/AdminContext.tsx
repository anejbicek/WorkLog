import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
    useState<AdminUser[]>(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.users
          );

        return saved
          ? JSON.parse(saved)
          : defaultUsers;
      } catch {
        return defaultUsers;
      }
    });

  /* =======================================================
     PROJECTS
  ======================================================= */

  const [projects, setProjects] =
    useState<AdminProject[]>(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.projects
          );

        return saved
          ? JSON.parse(saved)
          : defaultProjects;
      } catch {
        return defaultProjects;
      }
    });

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
      STORAGE_KEYS.users,
      JSON.stringify(users)
    );
  }, [users]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.projects,
      JSON.stringify(projects)
    );
  }, [projects]);

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
    setUsers((previous) => [
      ...previous,
      {
        ...user,
        id: Date.now(),
      },
    ]);
  };

  const updateUser = (
    id: number,
    user: Omit<AdminUser, "id">
  ) => {
    setUsers((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...user,
              id,
            }
          : item
      )
    );
  };

  const deleteUser = (
    id: number
  ) => {
    if (id === 1) {
      return;
    }

    setUsers((previous) =>
      previous.filter(
        (user) => user.id !== id
      )
    );
  };

  const toggleUserActive = (
    id: number
  ) => {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === id
          ? {
              ...user,
              active: !user.active,
            }
          : user
      )
    );
  };

  /* =======================================================
     POVEŽI SUPABASE UPORABNIKA
  ======================================================= */

  const linkUserAuthId = (
    email: string,
    authUserId: string
  ) => {
    setUsers((previous) =>
      previous.map((user) =>
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

  /* =======================================================
     PROJECTS – FUNKCIJE
  ======================================================= */

  const addProject = (
    project: Omit<AdminProject, "id">
  ) => {
    setProjects((previous) => [
      ...previous,
      {
        ...project,
        id: Date.now(),
      },
    ]);
  };

  const updateProject = (
    id: number,
    project: Omit<AdminProject, "id">
  ) => {
    setProjects((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...project,
              id,
            }
          : item
      )
    );
  };

  const deleteProject = (
    id: number
  ) => {
    setProjects((previous) =>
      previous.filter(
        (project) =>
          project.id !== id
      )
    );
  };

  const toggleProjectActive = (
    id: number
  ) => {
    setProjects((previous) =>
      previous.map((project) =>
        project.id === id
          ? {
              ...project,
              active: !project.active,
            }
          : project
      )
    );
  };

  /* =======================================================
     MACHINES – FUNKCIJE
  ======================================================= */

  const addMachine = (
    machine: Omit<AdminMachine, "id">
  ) => {
    setMachines((previous) => [
      ...previous,
      {
        ...machine,
        id: Date.now(),
      },
    ]);
  };

  const updateMachine = (
    id: number,
    machine: Omit<AdminMachine, "id">
  ) => {
    setMachines((previous) =>
      previous.map((item) =>
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
    setMachines((previous) =>
      previous.filter(
        (machine) =>
          machine.id !== id
      )
    );
  };

  const toggleMachineActive = (
    id: number
  ) => {
    setMachines((previous) =>
      previous.map((machine) =>
        machine.id === id
          ? {
              ...machine,
              active: !machine.active,
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
    setHolidays((previous) => [
      ...previous,
      {
        ...holiday,
        id: Date.now(),
      },
    ]);
  };

  const updateHoliday = (
    id: number,
    holiday: Omit<AdminHoliday, "id">
  ) => {
    setHolidays((previous) =>
      previous.map((item) =>
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
    setHolidays((previous) =>
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
    setSettings(nextSettings);
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