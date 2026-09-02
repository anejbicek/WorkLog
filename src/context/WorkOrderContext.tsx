import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  DayStatus,
  WorkOrder,
} from "../types/WorkOrder";

import { supabase } from "../services/supabase";

type WorkOrderContextType = {
  workOrders: WorkOrder[];

  allWorkOrders: WorkOrder[];

  getWorkOrdersForUser: (
    userId: string
  ) => WorkOrder[];

  addWorkOrder: (
    workOrder: WorkOrder
  ) => Promise<void>;

  updateWorkOrder: (
    workOrder: WorkOrder
  ) => Promise<void>;

  deleteWorkOrder: (
    id: number
  ) => Promise<void>;

  startDate: string;

  endDate: string;

  setStartDate: (
    date: string
  ) => void;

  setEndDate: (
    date: string
  ) => void;

  dayStatuses: Record<
    string,
    DayStatus
  >;

  setDayStatus: (
    date: string,
    status: DayStatus
  ) => Promise<void>;
};

const WorkOrderContext =
  createContext<
    WorkOrderContextType | undefined
  >(undefined);

type WorkOrderProviderProps = {
  children: ReactNode;
};

/* =========================================
   SUPABASE → WORKORDER
========================================= */

function fromDatabase(
  row: any
): WorkOrder {
  return {
    id: Number(row.id),

    userId:
      row.user_id ??
      undefined,

    project:
      row.project ?? "",

    machine:
      row.machine ?? "",

    additionalMachine:
      row.additional_machine ??
      undefined,

    date:
      row.date ?? "",

    startTime:
      row.start_time ?? "",

    endTime:
      row.end_time ?? "",

    hours:
      Number(
        row.hours ?? 0
      ),

    regularHours:
      Number(
        row.regular_hours ?? 0
      ),

    nightHours:
      Number(
        row.night_hours ?? 0
      ),

    holidayHours:
      Number(
        row.holiday_hours ?? 0
      ),

    overtimeHours:
      Number(
        row.overtime_hours ?? 0
      ),

    additionalHours:
      Number(
        row.additional_hours ?? 0
      ),

    meal:
      row.meal_type ===
      "withMe",

    note:
      row.note ?? "",
  };
}

/* =========================================
   WORKORDER → SUPABASE
========================================= */

function toDatabase(
  workOrder: WorkOrder,
  userId: string
) {
  return {
    user_id:
      userId,

    project:
      workOrder.project,

    machine:
      workOrder.machine,

    additional_machine:
      workOrder.additionalMachine ??
      null,

    date:
      workOrder.date,

    start_time:
      workOrder.startTime,

    end_time:
      workOrder.endTime,

    hours:
      workOrder.hours,

    regular_hours:
      workOrder.regularHours,

    night_hours:
      workOrder.nightHours,

    holiday_hours:
      workOrder.holidayHours,

    overtime_hours:
      workOrder.overtimeHours,

    additional_hours:
      workOrder.additionalHours,

    meal_type:
      workOrder.meal
        ? "withMe"
        : "outside",

    note:
      workOrder.note,
  };
}

/* =========================================
   PROVIDER
========================================= */

export function WorkOrderProvider({
  children,
}: WorkOrderProviderProps) {
  const [
    workOrders,
    setWorkOrders,
  ] = useState<WorkOrder[]>(
    []
  );

  const [
    allWorkOrders,
    setAllWorkOrders,
  ] = useState<WorkOrder[]>(
    []
  );

  /* =========================================
     DATUMI
  ========================================= */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const firstDayOfMonth =
    new Date();

  firstDayOfMonth.setDate(1);

  const defaultStartDate =
    firstDayOfMonth
      .toISOString()
      .split("T")[0];

  const [
    startDate,
    setStartDate,
  ] = useState<string>(
    defaultStartDate
  );

  const [
    endDate,
    setEndDate,
  ] = useState<string>(
    today
  );

  /* =========================================
     STATUSI DNI
  ========================================= */

  const [
    dayStatuses,
    setDayStatuses,
  ] = useState<
    Record<
      string,
      DayStatus
    >
  >({});

  /* =========================================
     NALOŽI PODATKE
  ========================================= */

  const loadData =
    async () => {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        setWorkOrders([]);
        setAllWorkOrders([]);
        setDayStatuses({});
        return;
      }

      /* ---------------------------------
         DELOVNI NALOGI TRENUTNEGA UPORABNIKA
      --------------------------------- */

      const {
        data:
          workOrderData,
        error:
          workOrderError,
      } =
        await supabase
          .from(
            "work_orders"
          )
          .select("*")
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (
        workOrderError
      ) {
        console.error(
          "Napaka pri nalaganju delovnih nalogov:",
          workOrderError
        );

        setWorkOrders([]);
      } else {
        setWorkOrders(
          (
            workOrderData ??
            []
          ).map(
            fromDatabase
          )
        );
      }

      /* ---------------------------------
         VSI DELOVNI NALOGI

         To je namenjeno administraciji.
      --------------------------------- */

      const {
        data:
          allWorkOrderData,
        error:
          allWorkOrderError,
      } =
        await supabase
          .from(
            "work_orders"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (
        allWorkOrderError
      ) {
        console.error(
          "Napaka pri nalaganju vseh delovnih nalogov:",
          allWorkOrderError
        );

        setAllWorkOrders([]);
      } else {
        setAllWorkOrders(
          (
            allWorkOrderData ??
            []
          ).map(
            fromDatabase
          )
        );
      }

      /* ---------------------------------
         STATUSI DNI

         Zaenkrat ostane obstoječe
         obnašanje.
      --------------------------------- */

      const {
        data:
          statusData,
        error:
          statusError,
      } =
        await supabase
          .from(
            "work_day_statuses"
          )
          .select("*");

      if (
        statusError
      ) {
        console.error(
          "Napaka pri nalaganju statusov dni:",
          statusError
        );

        return;
      }

      const statuses:
        Record<
          string,
          DayStatus
        > = {};

      (
        statusData ??
        []
      ).forEach(
        (
          row: any
        ) => {
          statuses[
            row.date
          ] =
            row.status as DayStatus;
        }
      );

      setDayStatuses(
        statuses
      );
    };

  /* =========================================
     AUTH + NALOŽI PODATKE
  ========================================= */

  useEffect(() => {
    loadData();

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        () => {
          loadData();
        }
      );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /* =========================================
     PRIDOBI NALOGE UPORABNIKA
  ========================================= */

  const getWorkOrdersForUser =
    (
      userId: string
    ): WorkOrder[] => {
      return allWorkOrders.filter(
        (
          workOrder
        ) =>
          workOrder.userId ===
          userId
      );
    };

  /* =========================================
     DODAJ DELOVNI NALOG
  ========================================= */

  const addWorkOrder =
    async (
      workOrder: WorkOrder
    ): Promise<void> => {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        alert(
          "Uporabnik ni prijavljen."
        );

        return;
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "work_orders"
          )
          .insert(
            toDatabase(
              workOrder,
              user.id
            )
          )
          .select()
          .single();

      if (error) {
        console.error(
          "Napaka pri shranjevanju delovnega naloga:",
          error
        );

        alert(
          "Delovnega naloga ni bilo mogoče shraniti."
        );

        return;
      }

      const savedWorkOrder =
        fromDatabase(
          data
        );

      setWorkOrders(
        (
          previous
        ) => [
          savedWorkOrder,
          ...previous,
        ]
      );

      setAllWorkOrders(
        (
          previous
        ) => [
          savedWorkOrder,
          ...previous,
        ]
      );
    };

  /* =========================================
     UREDI DELOVNI NALOG
  ========================================= */

  const updateWorkOrder =
    async (
      updatedWorkOrder: WorkOrder
    ): Promise<void> => {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        alert(
          "Uporabnik ni prijavljen."
        );

        return;
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "work_orders"
          )
          .update(
            toDatabase(
              updatedWorkOrder,
              user.id
            )
          )
          .eq(
            "id",
            updatedWorkOrder.id
          )
          .eq(
            "user_id",
            user.id
          )
          .select()
          .single();

      if (error) {
        console.error(
          "Napaka pri urejanju delovnega naloga:",
          error
        );

        alert(
          "Delovnega naloga ni bilo mogoče urediti."
        );

        return;
      }

      const savedWorkOrder =
        fromDatabase(
          data
        );

      setWorkOrders(
        (
          previous
        ) =>
          previous.map(
            (
              workOrder
            ) =>
              workOrder.id ===
              savedWorkOrder.id
                ? savedWorkOrder
                : workOrder
          )
      );

      setAllWorkOrders(
        (
          previous
        ) =>
          previous.map(
            (
              workOrder
            ) =>
              workOrder.id ===
              savedWorkOrder.id
                ? savedWorkOrder
                : workOrder
          )
      );
    };

  /* =========================================
     IZBRIŠI DELOVNI NALOG
  ========================================= */

  const deleteWorkOrder =
    async (
      id: number
    ): Promise<void> => {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        alert(
          "Uporabnik ni prijavljen."
        );

        return;
      }

      const {
        error,
      } =
        await supabase
          .from(
            "work_orders"
          )
          .delete()
          .eq(
            "id",
            id
          )
          .eq(
            "user_id",
            user.id
          );

      if (error) {
        console.error(
          "Napaka pri brisanju delovnega naloga:",
          error
        );

        alert(
          "Delovnega naloga ni bilo mogoče izbrisati."
        );

        return;
      }

      setWorkOrders(
        (
          previous
        ) =>
          previous.filter(
            (
              workOrder
            ) =>
              workOrder.id !==
              id
          )
      );

      setAllWorkOrders(
        (
          previous
        ) =>
          previous.filter(
            (
              workOrder
            ) =>
              workOrder.id !==
              id
          )
      );
    };

  /* =========================================
     STATUS DNEVA
  ========================================= */

  const setDayStatus =
    async (
      date: string,
      status: DayStatus
    ): Promise<void> => {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        alert(
          "Uporabnik ni prijavljen."
        );

        return;
      }

      if (
        status ===
        "none"
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              "work_day_statuses"
            )
            .delete()
            .eq(
              "date",
              date
            )
            .eq(
              "user_id",
              user.id
            );

        if (error) {
          console.error(
            "Napaka pri brisanju statusa dneva:",
            error
          );

          alert(
            "Status dneva ni bilo mogoče shraniti."
          );

          return;
        }

        setDayStatuses(
          (
            previous
          ) => {
            const next = {
              ...previous,
            };

            delete next[
              date
            ];

            return next;
          }
        );

        return;
      }

      const {
        error,
      } =
        await supabase
          .from(
            "work_day_statuses"
          )
          .upsert(
            {
              user_id:
                user.id,

              date,

              status,
            },
            {
              onConflict:
                "user_id,date",
            }
          );

      if (error) {
        console.error(
          "Napaka pri shranjevanju statusa dneva:",
          error
        );

        alert(
          "Status dneva ni bilo mogoče shraniti."
        );

        return;
      }

      setDayStatuses(
        (
          previous
        ) => ({
          ...previous,

          [date]:
            status,
        })
      );
    };

  /* =========================================
     PROVIDER VALUE
  ========================================= */

  return (
    <WorkOrderContext.Provider
      value={{
        workOrders,

        allWorkOrders,

        getWorkOrdersForUser,

        addWorkOrder,

        updateWorkOrder,

        deleteWorkOrder,

        startDate,

        endDate,

        setStartDate,

        setEndDate,

        dayStatuses,

        setDayStatus,
      }}
    >
      {children}
    </WorkOrderContext.Provider>
  );
}

/* =========================================
   HOOK
========================================= */

export function useWorkOrders() {
  const context =
    useContext(
      WorkOrderContext
    );

  if (!context) {
    throw new Error(
      "useWorkOrders mora biti uporabljen znotraj WorkOrderProvider."
    );
  }

  return context;
}