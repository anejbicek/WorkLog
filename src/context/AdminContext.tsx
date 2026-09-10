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
  username: string;
  authUserId?: string;
  role: UserRole;
  active: boolean;
};

export type AdminProject = {
  id: number;
  name: string;
  serialNumber?: string;
  requiredQuantity: number;
  active: boolean;
  status: "preparation" | "active" | "completed";
  archived?: boolean;
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
    user: Omit<AdminUser, "id" | "authUserId">,
    initialPassword: string
  ) => Promise<boolean>;

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

  activateProject: (
    id: number
  ) => void;

  completeProject: (
    id: number
  ) => void;

  archiveProject: (
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
    username: "anej",
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
    date: "2026-04-05",
    name: "Velikonočna nedelja",
  },
  {
    id: 5,
    date: "2026-04-06",
    name: "Velikonočni ponedeljek",
  },
  {
    id: 6,
    date: "2026-04-27",
    name: "Dan upora proti okupatorju",
  },
  {
    id: 7,
    date: "2026-05-01",
    name: "Praznik dela",
  },
  {
    id: 8,
    date: "2026-05-02",
    name: "Praznik dela",
  },
  {
    id: 9,
    date: "2026-05-24",
    name: "Binkošti",
  },
  {
    id: 10,
    date: "2026-06-25",
    name: "Dan državnosti",
  },
  {
    id: 11,
    date: "2026-08-15",
    name: "Marijino vnebovzetje",
  },
  {
    id: 12,
    date: "2026-10-31",
    name: "Dan reformacije",
  },
  {
    id: 13,
    date: "2026-11-01",
    name: "Dan spomina na mrtve",
  },
  {
    id: 14,
    date: "2026-12-25",
    name: "Božič",
  },
  {
    id: 15,
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
  autoBreak: true,
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

export function AdminProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [users, setUsers] =
    useState<AdminUser[]>(
      defaultUsers
    );

  const [projects, setProjects] =
    useState<AdminProject[]>(
      defaultProjects
    );

  const [machines, setMachines] =
    useState<AdminMachine[]>(
      defaultMachines
    );

  const [holidays, setHolidays] =
    useState<AdminHoliday[]>(
      defaultHolidays
    );

  const [settings, setSettings] =
    useState<AdminSettings>(
      defaultSettings
    );

  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      const storedUsers =
        localStorage.getItem(
          STORAGE_KEYS.users
        );

      if (storedUsers) {
        setUsers(
          JSON.parse(
            storedUsers
          )
        );
      }

      const storedProjects =
        localStorage.getItem(
          STORAGE_KEYS.projects
        );

      if (storedProjects) {
        const parsed =
          JSON.parse(
            storedProjects
          );

        setProjects(
          parsed.map(
            (
              project: AdminProject
            ) => ({
              ...project,
              archived:
                project.archived ??
                false,
            })
          )
        );
      }

      const storedMachines =
        localStorage.getItem(
          STORAGE_KEYS.machines
        );

      if (storedMachines) {
        setMachines(
          JSON.parse(
            storedMachines
          )
        );
      }

      const storedHolidays =
        localStorage.getItem(
          STORAGE_KEYS.holidays
        );

      if (storedHolidays) {
        setHolidays(
          JSON.parse(
            storedHolidays
          )
        );
      }

      const storedSettings =
        localStorage.getItem(
          STORAGE_KEYS.settings
        );

      if (storedSettings) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(
            storedSettings
          ),
        });
      }
    } catch (error) {
      console.error(
        "Napaka pri nalaganju nastavitev:",
        error
      );
    }
  }, []);

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
     UPORABNIKI
  ======================================================= */

  const addUser = async (
    user: Omit<
      AdminUser,
      "id" | "authUserId"
    >,
    initialPassword: string
  ) => {
    try {
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !sessionData.session?.access_token
      ) {
        console.error(
          "Napaka pri preverjanju prijave:",
          sessionError
        );

        return false;
      }

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          "create-user",
          {
            body: {
              name:
                user.name.trim(),
              email:
                user.email
                  .trim()
                  .toLowerCase(),
              username:
                user.username.trim(),
              password:
                initialPassword,
              role:
                user.role,
              active:
                user.active,
            },
            headers: {
              Authorization:
                `Bearer ${sessionData.session.access_token}`,
            },
          }
        );

      if (error) {
        console.error(
          "Napaka pri ustvarjanju uporabnika:",
          error
        );

        return false;
      }

      const newUserData =
        data?.user;

      if (!newUserData?.id) {
        console.error(
          "Edge Function ni vrnila podatkov novega uporabnika:",
          data
        );

        return false;
      }

      const newId =
        users.length > 0
          ? Math.max(
              ...users.map(
                (item) =>
                  item.id
              )
            ) + 1
          : 1;

      const newUser: AdminUser =
        {
          ...user,
          id: newId,
          authUserId:
            newUserData.id,
        };

      setUsers(
        (current) => [
          ...current,
          newUser,
        ]
      );

      return true;
    } catch (error) {
      console.error(
        "Napaka pri dodajanju uporabnika:",
        error
      );

      return false;
    }
  };

  const updateUser = (
    id: number,
    user: Omit<
      AdminUser,
      "id"
    >
  ) => {
    setUsers(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  ...user,
                  id,
                }
              : item
        )
    );
  };

  const deleteUser = async (
    id: number
  ) => {
    /*
     * Glavni uporabnik sistema
     * se nikoli ne sme izbrisati.
     */
    if (id === 1) {
      return;
    }

    const user =
      users.find(
        (item) =>
          item.id === id
      );

    if (!user) {
      return;
    }

    try {
      if (
        user.authUserId
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              "users"
            )
            .delete()
            .eq(
              "auth_user_id",
              user.authUserId
            );

        if (error) {
          console.error(
            "Napaka pri brisanju profila:",
            error
          );
        }
      }

      setUsers(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (error) {
      console.error(
        "Napaka pri brisanju uporabnika:",
        error
      );
    }
  };

  const toggleUserActive = (
    id: number
  ) => {
    /*
     * Glavni uporabnik sistema
     * se ne sme deaktivirati.
     */
    if (id === 1) {
      return;
    }

    setUsers(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active:
                    !item.active,
                }
              : item
        )
    );
  };

  const linkUserAuthId = (
    email: string,
    authUserId: string
  ) => {
    setUsers(
      (current) =>
        current.map(
          (item) =>
            item.email
              .trim()
              .toLowerCase() ===
            email
              .trim()
              .toLowerCase()
              ? {
                  ...item,
                  authUserId,
                }
              : item
        )
    );
  };

  /* =======================================================
     PROJEKTI
  ======================================================= */

  const addProject = (
    project: Omit<
      AdminProject,
      "id"
    >
  ) => {
    const newId =
      projects.length > 0
        ? Math.max(
            ...projects.map(
              (item) =>
                item.id
            )
          ) + 1
        : 1;

    const newProject: AdminProject =
      {
        ...project,
        id: newId,
        archived:
          project.archived ??
          false,
      };

    setProjects(
      (current) => [
        ...current,
        newProject,
      ]
    );

    console.log(
      "WORKLOG: addProject - INSERT v Supabase"
    );

    void supabase
      .from("projects")
      .insert({
        id: newId,
        name:
          newProject.name,
        serial_number:
          newProject.serialNumber ??
          "",
        required_quantity:
          newProject.requiredQuantity,
        active:
          newProject.active,
        status:
          newProject.status,
        archived:
          newProject.archived ??
          false,
      });
  };

  const updateProject = (
    id: number,
    project: Omit<
      AdminProject,
      "id"
    >
  ) => {
    const updatedProject: AdminProject =
      {
        ...project,
        id,
        archived:
          project.archived ??
          false,
      };

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? updatedProject
              : item
        )
    );

    void supabase
      .from("projects")
      .update({
        name:
          updatedProject.name,
        serial_number:
          updatedProject.serialNumber ??
          null,
        required_quantity:
          updatedProject.requiredQuantity,
        active:
          updatedProject.active,
        status:
          updatedProject.status,
        archived:
          updatedProject.archived ??
          false,
      })
      .eq(
        "id",
        id
      );
  };

  const deleteProject = async (
    id: number
  ) => {
    setProjects(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );

    const {
      error,
    } =
      await supabase
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
    }
  };

  const toggleProjectActive = (
    id: number
  ) => {
    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active:
                    !item.active,
                }
              : item
        )
    );

    const currentProject =
      projects.find(
        (item) =>
          item.id === id
      );

    if (!currentProject) {
      return;
    }

    void supabase
      .from("projects")
      .update({
        active:
          !currentProject.active,
      })
      .eq(
        "id",
        id
      );
  };

  const activateProject = (
    id: number
  ) => {
    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active: true,
                  status:
                    "active",
                  archived:
                    false,
                }
              : item
        )
    );

    void supabase
      .from("projects")
      .update({
        active: true,
        status: "active",
        archived: false,
      })
      .eq(
        "id",
        id
      );
  };

  /* =======================================================
     ZAKLJUČEVANJE PROJEKTA
  ======================================================= */

  const completeProject = (
    id: number
  ) => {
    const currentProject =
      projects.find(
        (item) =>
          item.id === id
      );

    if (!currentProject) {
      return;
    }

    /*
     * Projekt je po kliku kljukice
     * zaključen, vendar še ni arhiviran.
     *
     * Zato:
     * - status = completed
     * - active = false
     * - archived = false
     */
    const updatedProject: AdminProject =
      {
        ...currentProject,
        status:
          "completed",
        active: false,
        archived: false,
      };

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? updatedProject
              : item
        )
    );

    void supabase
      .from("projects")
      .update({
        status:
          "completed",
        active: false,
        archived: false,
      })
      .eq(
        "id",
        id
      );
  };

  /* =======================================================
     ARHIVIRANJE PROJEKTA
  ======================================================= */

  const archiveProject = (
    id: number
  ) => {
    const currentProject =
      projects.find(
        (item) =>
          item.id === id
      );

    if (!currentProject) {
      return;
    }

    /*
     * Arhivirati je dovoljeno samo
     * že zaključen projekt.
     */
    if (
      currentProject.status !==
      "completed"
    ) {
      return;
    }

    const updatedProject: AdminProject =
      {
        ...currentProject,
        active: false,
        status:
          "completed",
        archived: true,
      };

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? updatedProject
              : item
        )
    );

    void supabase
      .from("projects")
      .update({
        active: false,
        status:
          "completed",
        archived: true,
      })
      .eq(
        "id",
        id
      );
  };

  /* =======================================================
     STROJI
  ======================================================= */

  const addMachine = (
    machine: Omit<
      AdminMachine,
      "id"
    >
  ) => {
    const newId =
      machines.length > 0
        ? Math.max(
            ...machines.map(
              (item) =>
                item.id
            )
          ) + 1
        : 1;

    setMachines(
      (current) => [
        ...current,
        {
          ...machine,
          id: newId,
        },
      ]
    );
  };

  const updateMachine = (
    id: number,
    machine: Omit<
      AdminMachine,
      "id"
    >
  ) => {
    setMachines(
      (current) =>
        current.map(
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
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  const toggleMachineActive = (
    id: number
  ) => {
    setMachines(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active:
                    !item.active,
                }
              : item
        )
    );
  };

  /* =======================================================
     PRAZNIKI
  ======================================================= */

  const addHoliday = (
    holiday: Omit<
      AdminHoliday,
      "id"
    >
  ) => {
    const newId =
      holidays.length > 0
        ? Math.max(
            ...holidays.map(
              (item) =>
                item.id
            )
          ) + 1
        : 1;

    setHolidays(
      (current) => [
        ...current,
        {
          ...holiday,
          id: newId,
        },
      ]
    );
  };

  const updateHoliday = (
    id: number,
    holiday: Omit<
      AdminHoliday,
      "id"
    >
  ) => {
    setHolidays(
      (current) =>
        current.map(
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
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  /* =======================================================
     NASTAVITVE
  ======================================================= */

  const updateSettings = (
    newSettings: AdminSettings
  ) => {
    setSettings(
      newSettings
    );
  };

  /* =======================================================
     SUPABASE – NALAGANJE PROJEKTOV
  ======================================================= */

  useEffect(() => {
    const loadProjects =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                "projects"
              )
              .select(
                "*"
              )
              .order(
                "id",
                {
                  ascending:
                    true,
                }
              );

          if (error) {
            console.error(
              "Napaka pri nalaganju projektov:",
              error
            );
            return;
          }

          if (
            data &&
            data.length >
              0
          ) {
            const mappedProjects: AdminProject[] =
              data.map(
                (
                  project: any
                ) => ({
                  id:
                    project.id,
                  name:
                    project.name ??
                    "",
                  serialNumber:
                    project.serial_number ??
                    undefined,
                  requiredQuantity:
                    Number(
                      project.required_quantity ??
                        0
                    ),
                  active:
                    Boolean(
                      project.active
                    ),
                  status:
                    project.status ===
                    "completed"
                      ? "completed"
                      : project.status ===
                        "active"
                      ? "active"
                      : "preparation",
                  archived:
                    Boolean(
                      project.archived
                    ),
                })
              );

            setProjects(
              mappedProjects
            );
          }
        } catch (error) {
          console.error(
            "Napaka pri nalaganju projektov:",
            error
          );
        }
      };

    void loadProjects();
  }, []);

  /* =======================================================
     SUPABASE – NALAGANJE UPORABNIKOV
  ======================================================= */

  useEffect(() => {
    const loadUsers =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                "users"
              )
              .select(
                "*"
              )
              .order(
                "id",
                {
                  ascending:
                    true,
                }
              );

          if (error) {
            console.error(
              "Napaka pri nalaganju uporabnikov:",
              error
            );
            return;
          }

          if (
            data &&
            data.length >
              0
          ) {
            const mappedUsers: AdminUser[] =
              data.map(
                (
                  user: any
                ) => ({
                  id:
                    Number(
                      user.id
                    ),
                  name:
                    user.name ??
                    user.full_name ??
                    user.username ??
                    "",
                  email:
                    user.email ??
                    "",
                  username:
                    user.username ??
                    "",
                  authUserId:
                    user.auth_user_id ??
                    user.authUserId ??
                    undefined,
                  role:
                    user.role ===
                    "admin"
                      ? "admin"
                      : "worker",
                  active:
                    user.active !==
                    false,
                })
              );

            /*
             * Glavni uporabnik sistema
             * mora vedno obstajati in biti
             * aktiven.
             */
            const hasOwner =
              mappedUsers.some(
                (
                  user
                ) =>
                  user.id ===
                  1
              );

            if (
              !hasOwner
            ) {
              mappedUsers.unshift(
                defaultUsers[0]
              );
            } else {
              const ownerIndex =
                mappedUsers.findIndex(
                  (
                    user
                  ) =>
                    user.id ===
                    1
                );

              if (
                ownerIndex >=
                0
              ) {
                mappedUsers[
                  ownerIndex
                ] = {
                  ...mappedUsers[
                    ownerIndex
                  ],
                  role:
                    "admin",
                  active:
                    true,
                };
              }
            }

            setUsers(
              mappedUsers
            );
          }
        } catch (error) {
          console.error(
            "Napaka pri nalaganju uporabnikov:",
            error
          );
        }
      };

    void loadUsers();
  }, []);

  /* =======================================================
     SUPABASE – NALAGANJE STROJEV
  ======================================================= */

  useEffect(() => {
    const loadMachines =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                "machines"
              )
              .select(
                "*"
              )
              .order(
                "id",
                {
                  ascending:
                    true,
                }
              );

          if (error) {
            console.error(
              "Napaka pri nalaganju strojev:",
              error
            );
            return;
          }

          if (
            data &&
            data.length >
              0
          ) {
            setMachines(
              data.map(
                (
                  machine: any
                ) => ({
                  id:
                    Number(
                      machine.id
                    ),
                  name:
                    machine.name ??
                    "",
                  active:
                    machine.active !==
                    false,
                })
              )
            );
          }
        } catch (error) {
          console.error(
            "Napaka pri nalaganju strojev:",
            error
          );
        }
      };

    void loadMachines();
  }, []);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value: AdminContextType =
    {
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
      activateProject,
      completeProject,
      archiveProject,

      addMachine,
      updateMachine,
      deleteMachine,
      toggleMachineActive,

      addHoliday,
      updateHoliday,
      deleteHoliday,

      updateSettings,
    };

  return (
    <AdminContext.Provider
      value={value}
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
    useContext(
      AdminContext
    );

  if (!context) {
    throw new Error(
      "useAdmin mora biti uporabljen znotraj AdminProvider."
    );
  }

  return context;
}