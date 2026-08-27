import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { WorkOrder } from "../types/WorkOrder";
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

  /* =========================================
     OBDOBJE PRIKAZA
  ========================================= */

  startDate: string;

  endDate: string;

  setStartDate: (
    date: string
  ) => void;

  setEndDate: (
    date: string
  ) => void;
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

   Supabase uporablja snake_case,
   aplikacija pa camelCase.
========================================= */

function fromDatabase(
  row: any
): WorkOrder {
  return {
    id: Number(row.id),

    project: row.project ?? "",

    machine: row.machine ?? "",

    additionalMachine:
      row.additional_machine ??
      undefined,

    quantity:
      Number(row.quantity ?? 0),

    date: row.date ?? "",

    startTime:
      row.start_time ?? "",

    endTime:
      row.end_time ?? "",

    hours:
      Number(row.hours ?? 0),

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

    note: row.note ?? "",
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
  ] = useState<WorkOrder[]>([]);

  /* =========================================
     TRENUTNI DATUM
  ========================================= */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /* =========================================
     ZAČETNI DATUM
     
     Privzeto začetek trenutnega meseca
  ========================================= */

  const firstDayOfMonth =
    new Date();

  firstDayOfMonth.setDate(1);

  const defaultStartDate =
    firstDayOfMonth
      .toISOString()
      .split("T")[0];

  /* =========================================
     DATUMA OBDOBJA
  ========================================= */

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
     NALOŽI KARTICE IZ SUPABASE
  ========================================= */

  useEffect(() => {
    const loadWorkOrders =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("work_orders")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (error) {
          console.error(
            "Napaka pri nalaganju delovnih nalogov:",
            error
          );

          return;
        }

        const loadedWorkOrders =
          (data ?? []).map(
            fromDatabase
          );

        setWorkOrders(
          loadedWorkOrders
        );
      };

    loadWorkOrders();
  }, []);

  /* =========================================
     DODAJ DELOVNI NALOG
  ========================================= */

  const addWorkOrder = async (
    workOrder: WorkOrder
  ) => {
    const databaseWorkOrder =
      toDatabase(workOrder);

    const {
      data,
      error,
    } = await supabase
      .from("work_orders")
      .insert(
        databaseWorkOrder
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
      fromDatabase(data);

    /* =====================================
       NOVA KARTICA GRE NA VRH
    ===================================== */

    setWorkOrders(
      (previous) => [
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
    ) => {
      const databaseWorkOrder =
        toDatabase(
          updatedWorkOrder
        );

      const {
        data,
        error,
      } = await supabase
        .from("work_orders")
        .update(
          databaseWorkOrder
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
        fromDatabase(data);

      setWorkOrders(
        (previous) =>
          previous.map(
            (workOrder) =>
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
      } = await supabase
        .from("work_orders")
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
        (previous) =>
          previous.filter(
            (workOrder) =>
              workOrder.id !== id
          )
      );
    };

  /* =========================================
     CONTEXT
  ========================================= */

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