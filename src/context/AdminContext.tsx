import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../services/supabase";

/* =========================================================
   TIPI
========================================================= */

export type UserRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "worker";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super administrator",
  admin: "Administrator",
  manager: "Vodja",
  worker: "Delavec",
};

export const USER_ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  worker: 1,
};

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

export type AdminLastChange = {
  message: string;
  at: string;
};

export type AdminChangeLog = {
  id: string;
  message: string;
  at: string;
  userId?: number;
  userName: string;
  userEmail: string;
  userRole: UserRole;
};

export type OfflineQueueItem = {
  id: string;
  table: "users" | "projects" | "machines";
  action: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  match?: Record<string, unknown>;
  createdAt: string;
  attempts: number;
};

export type PermissionKey =
  | "administration"
  | "users"
  | "machines"
  | "settings"
  | "security"
  | "system_reports"
  | "archive"
  | "work_orders"
  | "records"
  | "statistics"
  | "pdf_reports";

export type AdminPermissions = Record<
  PermissionKey,
  Record<UserRole, boolean>
>;

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  administration: {
    super_admin: true,
    admin: true,
    manager: false,
    worker: false,
  },
  users: {
    super_admin: true,
    admin: true,
    manager: false,
    worker: false,
  },
  machines: {
    super_admin: true,
    admin: true,
    manager: false,
    worker: false,
  },
  settings: {
    super_admin: true,
    admin: true,
    manager: false,
    worker: false,
  },
  security: {
    super_admin: true,
    admin: true,
    manager: false,
    worker: false,
  },
  system_reports: {
    super_admin: true,
    admin: true,
    manager: false,
    worker: false,
  },
  archive: {
    super_admin: true,
    admin: true,
    manager: false,
    worker: false,
  },
  work_orders: {
    super_admin: true,
    admin: true,
    manager: true,
    worker: true,
  },
  records: {
    super_admin: true,
    admin: true,
    manager: true,
    worker: true,
  },
  statistics: {
    super_admin: true,
    admin: true,
    manager: true,
    worker: true,
  },
  pdf_reports: {
    super_admin: true,
    admin: true,
    manager: true,
    worker: true,
  },
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
  lastChange: AdminLastChange;
  changeHistory: AdminChangeLog[];
  offlineQueue: OfflineQueueItem[];

  addUser: (
    user: Omit<AdminUser, "id" | "authUserId">,
    initialPassword: string
  ) => Promise<boolean>;

  updateUser: (
    id: number,
    user: Omit<AdminUser, "id">
  ) => Promise<void>;

  deleteUser: (
    id: number
  ) => void;

  toggleUserActive: (
    id: number
  ) => Promise<void>;

  linkUserAuthId: (
    email: string,
    authUserId: string
  ) => void;

  addProject: (
    project: Omit<AdminProject, "id">
  ) => Promise<void>;

  updateProject: (
    id: number,
    project: Omit<AdminProject, "id">
  ) => Promise<void>;

  deleteProject: (
    id: number
  ) => void;

  toggleProjectActive: (
    id: number
  ) => Promise<void>;

  activateProject: (
    id: number
  ) => Promise<void>;

  completeProject: (
    id: number
  ) => Promise<void>;

  archiveProject: (
    id: number
  ) => Promise<void>;

  addMachine: (
    machine: Omit<AdminMachine, "id">
  ) => Promise<void>;

  updateMachine: (
    id: number,
    machine: Omit<AdminMachine, "id">
  ) => Promise<void>;

  deleteMachine: (
    id: number
  ) => Promise<void>;

  toggleMachineActive: (
    id: number
  ) => Promise<void>;

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

  permissions: AdminPermissions;
  currentUserRole: UserRole;
  canManageRole: (role: UserRole) => boolean;
  setPermission: (
    permissionKey: PermissionKey,
    role: UserRole,
    allowed: boolean
  ) => void;
  setLastChange: (message: string) => void;
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
  lastChange: "zusta_worklog_v2_last_change",
  changeHistory: "zusta_worklog_v2_change_history",
  permissions: "zusta_worklog_v2_permissions",
  offlineQueue: "zusta_worklog_v2_offline_queue",
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

const defaultLastChange: AdminLastChange = {
  message: "Sistem inicializiran",
  at: new Date().toISOString(),
};

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

  const [lastChange, setLastChange] =
    useState<AdminLastChange>(
      defaultLastChange
    );

  const [changeHistory, setChangeHistory] =
    useState<AdminChangeLog[]>([]);

  const [currentActor, setCurrentActor] =
    useState<{
      userId?: number;
      userName: string;
      userEmail: string;
      userRole: UserRole;
    }>({
      userName: "Neznan uporabnik",
      userEmail: "",
      userRole: "worker",
    });

  const [permissions, setPermissions] =
    useState<AdminPermissions>(
      DEFAULT_ADMIN_PERMISSIONS
    );

  const [currentUserRole, setCurrentUserRole] =
    useState<UserRole>("admin");

  const [offlineQueue, setOfflineQueue] =
    useState<OfflineQueueItem[]>(() => {
      try {
        const storedQueue = localStorage.getItem(
          STORAGE_KEYS.offlineQueue
        );

        return storedQueue
          ? JSON.parse(storedQueue)
          : [];
      } catch {
        return [];
      }
    });

  const enqueueOfflineOperation = (
    operation: Omit<
      OfflineQueueItem,
      "id" | "createdAt" | "attempts"
    >
  ) => {
    const queueItem: OfflineQueueItem = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    setOfflineQueue((current) => [
      ...current,
      queueItem,
    ]);
  };

  const recordLastChange = (message: string) => {
    const at = new Date().toISOString();

    setLastChange({
      message,
      at,
    });

    setChangeHistory((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        message,
        at,
        ...currentActor,
      },
      ...current,
    ]);
  };

  /* =======================================================
     OFFLINE – SINHRONIZACIJA ČAKALNE VRSTE
  ======================================================= */

  const syncInProgressRef =
    useRef(false);

  const retryTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const synchronizeOfflineQueue = async () => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      return;
    }

    if (
      offlineQueue.length === 0 ||
      syncInProgressRef.current
    ) {
      return;
    }

    syncInProgressRef.current = true;

    let synchronizedAny = false;

    try {
      for (const item of offlineQueue) {
        try {
          let error: any = null;

          if (item.table === "users") {
            if (item.action === "update") {
              const result = await supabase
                .from("users")
                .update(item.payload)
                .match(item.match ?? {});

              error = result.error;
            } else if (item.action === "delete") {
              const result = await supabase
                .from("users")
                .delete()
                .match(item.match ?? {});

              error = result.error;
            } else {
              const result = await supabase
                .from("users")
                .insert(item.payload);

              error = result.error;
            }
          }

          if (item.table === "projects") {
            if (item.action === "insert") {
              const result = await supabase
                .from("projects")
                .insert(item.payload);

              error = result.error;
            } else if (item.action === "update") {
              const result = await supabase
                .from("projects")
                .update(item.payload)
                .match(item.match ?? {});

              error = result.error;
            } else if (item.action === "delete") {
              const result = await supabase
                .from("projects")
                .delete()
                .match(item.match ?? {});

              error = result.error;
            }
          }

          if (item.table === "machines") {
            if (item.action === "insert") {
              const result = await supabase
                .from("machines")
                .insert(item.payload);

              error = result.error;
            } else if (item.action === "update") {
              const result = await supabase
                .from("machines")
                .update(item.payload)
                .match(item.match ?? {});

              error = result.error;
            } else if (item.action === "delete") {
              const result = await supabase
                .from("machines")
                .delete()
                .match(item.match ?? {});

              error = result.error;
            }
          }

          if (error) {
            console.error(
              "Napaka pri sinhronizaciji offline spremembe:",
              error
            );

            setOfflineQueue((current) =>
              current.map((queuedItem) =>
                queuedItem.id === item.id
                  ? {
                      ...queuedItem,
                      attempts:
                        queuedItem.attempts + 1,
                    }
                  : queuedItem
              )
            );

            return;
          }

          synchronizedAny = true;

          setOfflineQueue((current) =>
            current.filter(
              (queuedItem) =>
                queuedItem.id !== item.id
            )
          );
        } catch (error) {
          console.error(
            "Napaka pri sinhronizaciji offline spremembe:",
            error
          );

          setOfflineQueue((current) =>
            current.map((queuedItem) =>
              queuedItem.id === item.id
                ? {
                    ...queuedItem,
                    attempts:
                      queuedItem.attempts + 1,
                  }
                : queuedItem
            )
          );

          return;
        }
      }

      if (synchronizedAny) {
        recordLastChange(
          "Offline spremembe so bile sinhronizirane."
        );
      }
    } finally {
      syncInProgressRef.current = false;
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      void synchronizeOfflineQueue();
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    if (retryTimeoutRef.current) {
      clearTimeout(
        retryTimeoutRef.current
      );
      retryTimeoutRef.current = null;
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.onLine &&
      offlineQueue.length > 0
    ) {
      const firstQueuedItem =
        offlineQueue[0];

      if (firstQueuedItem.attempts === 0) {
        void synchronizeOfflineQueue();
      } else {
        const retryDelay = Math.min(
          5000 *
            Math.pow(
              2,
              firstQueuedItem.attempts - 1
            ),
          60000
        );

        retryTimeoutRef.current =
          setTimeout(() => {
            void synchronizeOfflineQueue();
          }, retryDelay);
      }
    }

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      if (retryTimeoutRef.current) {
        clearTimeout(
          retryTimeoutRef.current
        );
        retryTimeoutRef.current = null;
      }
    };
  }, [offlineQueue]);

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

      const storedLastChange =
        localStorage.getItem(
          STORAGE_KEYS.lastChange
        );

      if (storedLastChange) {
        setLastChange(
          JSON.parse(
            storedLastChange
          )
        );
      }

      const storedChangeHistory =
        localStorage.getItem(
          STORAGE_KEYS.changeHistory
        );

      if (storedChangeHistory) {
        setChangeHistory(
          JSON.parse(
            storedChangeHistory
          )
        );
      }

      const storedPermissions =
        localStorage.getItem(
          STORAGE_KEYS.permissions
        );

      if (storedPermissions) {
        const parsedPermissions =
          JSON.parse(storedPermissions);

        setPermissions({
          ...DEFAULT_ADMIN_PERMISSIONS,
          ...parsedPermissions,
        });
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

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.lastChange,
      JSON.stringify(lastChange)
    );
  }, [lastChange]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.changeHistory,
      JSON.stringify(changeHistory)
    );
  }, [changeHistory]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.permissions,
      JSON.stringify(permissions)
    );
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.offlineQueue,
      JSON.stringify(offlineQueue)
    );
  }, [offlineQueue]);

  const setPermission = (
    permissionKey: PermissionKey,
    role: UserRole,
    allowed: boolean
  ) => {
    setPermissions((current) => ({
      ...current,
      [permissionKey]: {
        ...current[permissionKey],
        [role]: allowed,
      },
    }));
  };

  const canManageRole = (role: UserRole) => {
    return (
      USER_ROLE_HIERARCHY[currentUserRole] >
      USER_ROLE_HIERARCHY[role]
    );
  };

  useEffect(() => {
    const loadCurrentActor = async () => {
      try {
        const { data } =
          await supabase.auth.getUser();

        const email =
          data.user?.email
            ?.trim()
            .toLowerCase() ||
          "";

        if (!email) {
          return;
        }

        const user = users.find(
          (item) =>
            item.email
              .trim()
              .toLowerCase() === email
        );

        if (user) {
          setCurrentActor({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
          });
        } else {
          setCurrentActor({
            userName: email,
            userEmail: email,
            userRole: "worker",
          });
        }
      } catch (error) {
        console.error(
          "Napaka pri ugotavljanju trenutnega uporabnika:",
          error
        );
      }
    };

    void loadCurrentActor();
  }, [users]);

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

      recordLastChange(
        `Dodana je bila nova uporabniška oseba: ${newUser.name}.`
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

  const updateUser = async (
    id: number,
    user: Omit<
      AdminUser,
      "id"
    >
  ) => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
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

      enqueueOfflineOperation({
        table: "users",
        action: "update",
        payload: {
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          active: user.active,
        },
        match: { id },
      });

      recordLastChange(
        `Posodobljen je bil uporabnik: ${user.name} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("users")
        .update({
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          active: user.active,
        })
        .eq("id", id);

    if (error) {
      console.error(
        "Napaka pri posodabljanju uporabnika:",
        error
      );
      return;
    }

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

    recordLastChange(
      `Posodobljen je bil uporabnik: ${user.name}.`
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

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setUsers(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );

      if (user.authUserId) {
        enqueueOfflineOperation({
          table: "users",
          action: "delete",
          payload: {},
          match: {
            auth_user_id: user.authUserId,
          },
        });
      }

      recordLastChange(
        `Izbrisan je bil uporabnik: ${user.name} (čaka na sinhronizacijo).`
      );
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

      recordLastChange(
        `Izbrisan je bil uporabnik: ${user.name}.`
      );
    } catch (error) {
      console.error(
        "Napaka pri brisanju uporabnika:",
        error
      );
    }
  };

  const toggleUserActive = async (
    id: number
  ) => {
    /*
     * Glavni uporabnik sistema
     * se ne sme deaktivirati.
     */
    if (id === 1) {
      return;
    }

    const currentUser =
      users.find(
        (item) =>
          item.id === id
      );

    if (!currentUser) {
      return;
    }

    const newActive =
      !currentUser.active;

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setUsers(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    active: newActive,
                  }
                : item
          )
      );

      enqueueOfflineOperation({
        table: "users",
        action: "update",
        payload: {
          active: newActive,
        },
        match: { id },
      });

      recordLastChange(
        `Uporabnik ${currentUser.name} je bil ${newActive ? "aktiviran" : "deaktiviran"} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("users")
        .update({
          active: newActive,
        })
        .eq("id", id);

    if (error) {
      console.error(
        "Napaka pri spreminjanju aktivnega uporabnika:",
        error
      );
      return;
    }

    setUsers(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active: newActive,
                }
              : item
        )
    );

    recordLastChange(
      `Uporabnik ${currentUser.name} je bil ${newActive ? "aktiviran" : "deaktiviran"}.`
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


    recordLastChange(
      `Povezan je bil prijavni račun za ${email}.`
    );
  };

  /* =======================================================
     PROJEKTI
  ======================================================= */

  const addProject = async (
    project: Omit<AdminProject, "id">
  ): Promise<void> => {
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

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setProjects(
        (current) => [
          ...current,
          newProject,
        ]
      );

      enqueueOfflineOperation({
        table: "projects",
        action: "insert",
        payload: {
          id: newProject.id,
          name: newProject.name,
          serial_number:
            newProject.serialNumber ??
            "",
          required_quantity:
            newProject.requiredQuantity,
          active: newProject.active,
          status: newProject.status,
          archived:
            newProject.archived ??
            false,
        },
      });

      recordLastChange(
        `Dodan je bil projekt: ${newProject.name} (čaka na sinhronizacijo).`
      );
      return;
    }

    console.log(
      "WORKLOG: ustvarjam projekt:",
      newProject
    );

    const {
      data,
      error,
    } =
      await supabase
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
        })
        .select();

    console.log(
      "WORKLOG: INSERT projekt data:",
      data
    );

    console.log(
      "WORKLOG: INSERT projekt error:",
      error
    );

    if (error) {
      console.error(
        "WORKLOG: PROJEKT NI BIL SHRANJEN V SUPABASE:",
        error
      );

      return;
    }

    console.log(
      "WORKLOG: PROJEKT USPEŠNO SHRANJEN V SUPABASE"
    );

    setProjects(
      (current) => [
        ...current,
        newProject,
      ]
    );

    recordLastChange(
      `Dodan je bil projekt: ${newProject.name}.`
    );
  };

  const updateProject = async (
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

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setProjects(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? updatedProject
                : item
          )
      );

      enqueueOfflineOperation({
        table: "projects",
        action: "update",
        payload: {
          name: updatedProject.name,
          serial_number:
            updatedProject.serialNumber ??
            "",
          required_quantity:
            updatedProject.requiredQuantity,
          active: updatedProject.active,
          status: updatedProject.status,
          archived:
            updatedProject.archived ??
            false,
        },
        match: { id },
      });

      recordLastChange(
        `Posodobljen je bil projekt: ${updatedProject.name} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("projects")
        .update({
          name:
            updatedProject.name,
          serial_number:
            updatedProject.serialNumber ??
            "",
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

    if (error) {
      console.error(
        "Napaka pri posodabljanju projekta:",
        error
      );
      return;
    }

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? updatedProject
              : item
        )
    );

    recordLastChange(
      `Posodobljen je bil projekt: ${updatedProject.name}.`
    );
  };

  const deleteProject = async (
    id: number
  ) => {
    const currentProject = projects.find(
      (item) => item.id === id
    );

    if (!currentProject) {
      return;
    }

    setProjects(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      enqueueOfflineOperation({
        table: "projects",
        action: "delete",
        payload: {},
        match: { id },
      });

      recordLastChange(
        `Izbrisan je bil projekt: ${currentProject.name} (čaka na sinhronizacijo).`
      );
      return;
    }

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
      return;
    }

    recordLastChange(
      `Izbrisan je bil projekt: ${currentProject.name}.`
    );
  };

  const toggleProjectActive = async (
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

    const newActive =
      !currentProject.active;

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setProjects(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    active: newActive,
                  }
                : item
          )
      );

      enqueueOfflineOperation({
        table: "projects",
        action: "update",
        payload: {
          active: newActive,
        },
        match: { id },
      });

      recordLastChange(
        `Projekt ${currentProject.name} je bil ${newActive ? "aktiviran" : "deaktiviran"} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("projects")
        .update({
          active: newActive,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Napaka pri spreminjanju aktivnega projekta:",
        error
      );
      return;
    }

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active: newActive,
                }
              : item
        )
    );

    recordLastChange(
      `Projekt ${currentProject.name} je bil ${newActive ? "aktiviran" : "deaktiviran"}.`
    );
  };

  const activateProject = async (
    id: number
  ) => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setProjects(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    active: true,
                    status: "active",
                    archived: false,
                  }
                : item
          )
      );

      enqueueOfflineOperation({
        table: "projects",
        action: "update",
        payload: {
          active: true,
          status: "active",
          archived: false,
        },
        match: { id },
      });

      recordLastChange(
        `Projekt ${id} je bil aktiviran (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
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

    if (error) {
      console.error(
        "Napaka pri aktiviranju projekta:",
        error
      );
      return;
    }

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active: true,
                  status: "active",
                  archived: false,
                }
              : item
        )
    );

    recordLastChange(
      `Projekt ${id} je bil aktiviran.`
    );
  };

  /* =======================================================
     ZAKLJUČEVANJE PROJEKTA
  ======================================================= */

  const completeProject = async (
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

    const updatedProject: AdminProject =
      {
        ...currentProject,
        status: "completed",
        active: false,
        archived: false,
      };

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setProjects(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? updatedProject
                : item
          )
      );

      enqueueOfflineOperation({
        table: "projects",
        action: "update",
        payload: {
          status: "completed",
          active: false,
          archived: false,
        },
        match: { id },
      });

      recordLastChange(
        `Projekt ${updatedProject.name} je bil zaključen (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("projects")
        .update({
          status: "completed",
          active: false,
          archived: false,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Napaka pri zaključevanju projekta:",
        error
      );
      return;
    }

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? updatedProject
              : item
        )
    );

    recordLastChange(
      `Projekt ${updatedProject.name} je bil zaključen.`
    );
  };

  /* =======================================================
     ARHIVIRANJE PROJEKTA
  ======================================================= */

  const archiveProject = async (
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
        status: "completed",
        archived: true,
      };

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setProjects(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? updatedProject
                : item
          )
      );

      enqueueOfflineOperation({
        table: "projects",
        action: "update",
        payload: {
          active: false,
          status: "completed",
          archived: true,
        },
        match: { id },
      });

      recordLastChange(
        `Projekt ${updatedProject.name} je bil arhiviran (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("projects")
        .update({
          active: false,
          status: "completed",
          archived: true,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Napaka pri arhiviranju projekta:",
        error
      );
      return;
    }

    setProjects(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? updatedProject
              : item
        )
    );

    recordLastChange(
      `Projekt ${updatedProject.name} je bil arhiviran.`
    );
  };

  /* =======================================================
     STROJI
  ======================================================= */

  const addMachine = async (
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

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setMachines(
        (current) => [
          ...current,
          {
            ...machine,
            id: newId,
          },
        ]
      );

      enqueueOfflineOperation({
        table: "machines",
        action: "insert",
        payload: {
          id: newId,
          name: machine.name,
          active: machine.active,
        },
      });

      recordLastChange(
        `Dodan je bil stroj: ${machine.name} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("machines")
        .insert({
          id: newId,
          name: machine.name,
          active: machine.active,
        });

    if (error) {
      console.error(
        "Napaka pri dodajanju stroja:",
        error
      );
      return;
    }

    setMachines(
      (current) => [
        ...current,
        {
          ...machine,
          id: newId,
        },
      ]
    );

    recordLastChange(
      `Dodan je bil stroj: ${machine.name}.`
    );
  };

  const updateMachine = async (
    id: number,
    machine: Omit<
      AdminMachine,
      "id"
    >
  ) => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
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

      enqueueOfflineOperation({
        table: "machines",
        action: "update",
        payload: {
          name: machine.name,
          active: machine.active,
        },
        match: { id },
      });

      recordLastChange(
        `Posodobljen je bil stroj: ${machine.name} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("machines")
        .update({
          name: machine.name,
          active: machine.active,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Napaka pri posodabljanju stroja:",
        error
      );
      return;
    }

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

    recordLastChange(
      `Posodobljen je bil stroj: ${machine.name}.`
    );
  };

  const deleteMachine = async (
    id: number
  ) => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      const currentMachine =
        machines.find(
          (item) =>
            item.id === id
        );

      setMachines(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );

      enqueueOfflineOperation({
        table: "machines",
        action: "delete",
        payload: {},
        match: { id },
      });

      recordLastChange(
        `Izbrisan je bil stroj: ${currentMachine?.name ?? id} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("machines")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Napaka pri brisanju stroja:",
        error
      );
      return;
    }

    setMachines(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );

    recordLastChange(
      `Izbrisan je bil stroj: ${id}.`
    );
  };

  const toggleMachineActive = async (
    id: number
  ) => {
    const currentMachine =
      machines.find(
        (item) =>
          item.id === id
      );

    if (!currentMachine) {
      return;
    }

    const newActive =
      !currentMachine.active;

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setMachines(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    active: newActive,
                  }
                : item
          )
      );

      enqueueOfflineOperation({
        table: "machines",
        action: "update",
        payload: {
          active: newActive,
        },
        match: { id },
      });

      recordLastChange(
        `Stroj ${currentMachine.name} je bil ${newActive ? "aktiviran" : "deaktiviran"} (čaka na sinhronizacijo).`
      );
      return;
    }

    const { error } =
      await supabase
        .from("machines")
        .update({
          active: newActive,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Napaka pri spreminjanju aktivnega stroja:",
        error
      );
      return;
    }

    setMachines(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  active: newActive,
                }
              : item
        )
    );

    recordLastChange(
      `Stroj ${currentMachine.name} je bil ${newActive ? "aktiviran" : "deaktiviran"}.`
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

    recordLastChange(
      `Dodan je bil praznik: ${holiday.name}.`
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

    recordLastChange(
      `Posodobljen je bil praznik: ${holiday.name}.`
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

    recordLastChange(
      `Izbrisan je bil praznik: ${id}.`
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

    recordLastChange(
      "Posodobljene so bile sistemske nastavitve."
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

          console.log(
            "WORKLOG: projekti iz Supabase:",
            data
          );

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
                    "super_admin"
                      ? "super_admin"
                      : user.role ===
                        "admin"
                      ? "admin"
                      : user.role ===
                        "manager"
                      ? "manager"
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

            const {
              data: authData,
            } = await supabase.auth.getUser();

            const authEmail =
              authData.user?.email
                ?.trim()
                .toLowerCase();

            const signedInUser =
              mappedUsers.find(
                (user) =>
                  user.email
                    .trim()
                    .toLowerCase() ===
                  authEmail
              );

            setCurrentUserRole(
              signedInUser?.role ??
                "admin"
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
      lastChange,
      changeHistory,
      offlineQueue,
      permissions,
      currentUserRole,
      canManageRole,
      setPermission,
      setLastChange: recordLastChange,

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