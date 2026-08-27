import { useState } from "react";

import {
  useWorkOrders,
} from "../context/WorkOrderContext";

import WorkOrderHeader from "../components/Workorders/WorkOrderHeader";
import WorkOrderCard from "../components/Workorders/WorkOrderCard";
import WorkOrderTable from "../components/Workorders/WorkOrderTable";
import WorkOrderEditModal from "../components/Workorders/WorkOrderEditModal";

import type { WorkOrder } from "../types/WorkOrder";

function Dashboard() {
  const {
    workOrders,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,

    startDate,
    endDate,
  } = useWorkOrders();

  const [
    editingWorkOrder,
    setEditingWorkOrder,
  ] = useState<WorkOrder | null>(null);

  /* =========================================
     UREDI DELOVNI NALOG
  ========================================= */

  const handleEditWorkOrder = (
    workOrder: WorkOrder
  ) => {
    setEditingWorkOrder(workOrder);
  };

  /* =========================================
     SHRANI SPREMEMBE
  ========================================= */

  const handleUpdateWorkOrder = (
    workOrder: WorkOrder
  ) => {
    updateWorkOrder(workOrder);
    setEditingWorkOrder(null);
  };

  /* =========================================
     FILTRIRANJE PO DATUMU
  ========================================= */

  const filteredWorkOrders =
    workOrders.filter(
      (workOrder) => {
        if (!workOrder.date) {
          return false;
        }

        return (
          workOrder.date >=
            startDate &&
          workOrder.date <=
            endDate
        );
      }
    );

  /* =========================================
     SKUPAJ URE
     
     Upoštevajo se samo nalogi
     v izbranem obdobju.
  ========================================= */

  const totalHours =
    filteredWorkOrders.reduce(
      (sum, workOrder) =>
        sum +
        Number(
          workOrder.hours || 0
        ),
      0
    );

  return (
    <>
      {/* =====================================
          GLAVA
      ===================================== */}

      <WorkOrderHeader />

      {/* =====================================
          VNOS DELOVNEGA NALOGA
      ===================================== */}

      <WorkOrderCard
        onAddWorkOrder={
          addWorkOrder
        }
      />

      {/* =====================================
          TABELA DELOVNIH NALOGOV

          Prikaže samo naloge
          znotraj izbranega obdobja.
      ===================================== */}

      <WorkOrderTable
        workOrders={
          filteredWorkOrders
        }
        onDeleteWorkOrder={
          deleteWorkOrder
        }
        onEditWorkOrder={
          handleEditWorkOrder
        }
      />

      {/* =====================================
          SKUPAJ URE
      ===================================== */}

      <div
        style={{
          width:
            "calc(100% - 226px)",
          maxWidth: "1080px",
          margin:
            "20px auto 0 auto",
          padding: "20px",
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "14px",
          textAlign: "right",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            color: "#000000",
            marginRight: "12px",
          }}
        >
          Skupaj ure vseh nalogov:
        </span>

        <strong
          style={{
            fontSize: "22px",
            color: "#000000",
          }}
        >
          {totalHours.toFixed(2)} h
        </strong>
      </div>

      {/* =====================================
          MODAL ZA UREJANJE
      ===================================== */}

      {editingWorkOrder && (
        <WorkOrderEditModal
          workOrder={
            editingWorkOrder
          }
          onSave={
            handleUpdateWorkOrder
          }
          onClose={() =>
            setEditingWorkOrder(
              null
            )
          }
        />
      )}
    </>
  );
}

export default Dashboard;