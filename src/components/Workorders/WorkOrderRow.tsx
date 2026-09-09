import {
  Pencil,
  Trash2,
} from "lucide-react";

import type {
  WorkOrder,
} from "../../types/WorkOrder";

type WorkOrderRowProps = {
  workOrder: WorkOrder;

  onDelete: (
    id: number
  ) => void;

  onEdit: (
    workOrder: WorkOrder
  ) => void;
};

type ActionButtonProps = {
  children: React.ReactNode;

  danger?: boolean;

  onClick?: () => void;
};

function ActionButton({
  children,
  danger = false,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "8px",
        border:
          "1px solid #dbe3e8",
        background: "#ffffff",
        color: danger
          ? "#dc2626"
          : "#334155",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

function WorkOrderRow({
  workOrder,
  onDelete,
  onEdit,
}: WorkOrderRowProps) {
  console.log(
    "onDelete:",
    onDelete
  );

  return (
    <div
      style={{
        background: "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "18px 22px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          fontSize: "15px",
          color: "#12344d",
          fontWeight: 600,
        }}
      >
        <span>
          {workOrder.project}
        </span>

        <span
          style={{
            color: "#cbd5e1",
          }}
        >
          |
        </span>

        <span>
          {workOrder.machine}
        </span>

        <span
          style={{
            color: "#cbd5e1",
          }}
        >
          |
        </span>

        <span>
          {workOrder.date}
        </span>

        <span
          style={{
            color: "#cbd5e1",
          }}
        >
          |
        </span>

        <span>
          {workOrder.startTime} -{" "}
          {workOrder.endTime}
        </span>

        <span
          style={{
            color: "#cbd5e1",
          }}
        >
          |
        </span>

        <span
          style={{
            color: "#2563eb",
            fontWeight: 700,
          }}
        >
          {workOrder.hours} h
        </span>
      </div>

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            color: "#475569",
            fontSize: "14px",
            flex: 1,
          }}
        >
          <strong>
            Opomba:
          </strong>{" "}
          {workOrder.note}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <ActionButton
            onClick={() =>
              onEdit(workOrder)
            }
          >
            <Pencil size={16} />

            Uredi
          </ActionButton>

          <ActionButton
            danger
            onClick={() =>
              onDelete(
                workOrder.id
              )
            }
          >
            <Trash2 size={16} />

            Izbriši
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export default WorkOrderRow;