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

  addWorkOrder: (
    workOrder: WorkOrder
  ) => void;

  updateWorkOrder: (
    workOrder: WorkOrder
  ) => void;

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

    project:
      row.project ?? "",

    machine:
      row.machine ?? "",

    additionalMachine:
      row.additional_machine ??
      undefined,

    quantity:
      Number(
        row.quantity ?? 0
      ),

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

    mealType:
      row.meal_type ===
      "outside"
        ? "outside"
        : row.meal_type ===
          "withMe"
        ? "withMe"
        : undefined,

    note:
      row.note ?? "",
  };
}

/* =========================================
   WORKORDER → SUPABASE
========================================= */

function toDatabase(
  workOrder: WorkOrder
) {
  return {
    project:
      workOrder.project,

    machine:
      workOrder.machine,

    additional_machine:
      workOrder.additionalMachine ??
      null,

    quantity:
      workOrder.quantity,

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
      workOrder.mealType ??
      null,

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

  useEffect(() => {
    const loadData =
      async () => {
        /* DELovni NALOGI */

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

        /* STATUSI DNI */

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
          (row: any) => {
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

    loadData();
  }, []);

  /* =========================================
     DODAJ DELOVNI NALOG
  ========================================= */

  const addWorkOrder =
    async (
      workOrder: WorkOrder
    ) => {
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
              workOrder
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

      setWorkOrders(
        (
          previous
        ) => [
          fromDatabase(
            data
          ),
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
    ) => {
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
              updatedWorkOrder
            )
          )
          .eq(
            "id",
            updatedWorkOrder.id
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
    };

  /* =========================================
     IZBRIŠI DELOVNI NALOG
  ========================================= */

  const deleteWorkOrder =
    async (
      id: number
    ) => {
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
    };

  /* =========================================
     STATUS DNEVA

     none = izbriši status
     ostalo = shrani v Supabase
  ========================================= */

  const setDayStatus =
    async (
      date: string,
      status: DayStatus
    ) => {
      if (
        status === "none"
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
              date,
              status,
            },
            {
              onConflict:
                "date",
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

  return (
    <WorkOrderContext.Provider
      value={{
        workOrders,

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