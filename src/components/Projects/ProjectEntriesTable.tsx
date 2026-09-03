import {
  Clock3,
  Trash2,
} from "lucide-react";

import type {
  ProjectEntry,
} from "../../context/ProjectContext";

type ProjectEntriesTableProps = {
  entries: ProjectEntry[];
  onDelete?: (
    id: number
  ) => void;
};

function ProjectEntriesTable({
  entries,
  onDelete,
}: ProjectEntriesTableProps) {
  if (
    entries.length ===
    0
  ) {
    return (
      <div
        style={{
          padding: "35px",
          textAlign: "center",
          background: "#f8fafc",
          borderRadius: "10px",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        Za ta projekt še ni
        vnosov izdelave.
      </div>
    );
  }

  return (
    <div
      style={{
        border:
          "1px solid #e5e7eb",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "100px 1fr 170px 100px 45px",
          gap: "12px",
          padding:
            "11px 15px",
          background:
            "#f8fafc",
          borderBottom:
            "1px solid #e5e7eb",
          color: "#64748b",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        <div>
          Datum
        </div>

        <div>
          Delavec
        </div>

        <div>
          Stroj
        </div>

        <div
          style={{
            textAlign:
              "right",
          }}
        >
          Izdelano
        </div>

        <div />
      </div>

      {entries.map(
        (
          entry,
          index
        ) => (
          <div
            key={
              entry.id
            }
            style={{
              display: "grid",
              gridTemplateColumns:
                "100px 1fr 170px 100px 45px",
              gap: "12px",
              alignItems:
                "center",
              padding:
                "13px 15px",
              borderBottom:
                index ===
                entries.length -
                  1
                  ? "none"
                  : "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "12px",
              }}
            >
              {formatDate(
                entry.date
              )}
            </div>

            <div>
              <div
                style={{
                  color:
                    "#12344d",
                  fontSize:
                    "13px",
                  fontWeight:
                    600,
                }}
              >
                {
                  entry.workerName
                }
              </div>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "4px",
                  marginTop:
                    "3px",
                  color:
                    "#64748b",
                  fontSize:
                    "11px",
                }}
              >
                <Clock3
                  size={
                    11
                  }
                />

                {
                  entry.startTime
                }{" "}
                –{" "}
                {
                  entry.endTime
                }

                <span>
                  ·
                </span>

                {calculateHours(
                  entry.startTime,
                  entry.endTime
                ).toFixed(
                  2
                )}{" "}
                h
              </div>
            </div>

            <div
              style={{
                color:
                  "#475569",
                fontSize:
                  "12px",
              }}
            >
              {
                entry.machine
              }
            </div>

            <div
              style={{
                textAlign:
                  "right",
                color:
                  "#12344d",
                fontSize:
                  "14px",
                fontWeight:
                  700,
              }}
            >
              +
              {
                entry.quantity
              }{" "}
              kos
            </div>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              {onDelete && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(
                      entry.id
                    )
                  }
                  title="Izbriši vnos"
                  style={
                    deleteButtonStyle
                  }
                >
                  <Trash2
                    size={
                      15
                    }
                  />
                </button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function calculateHours(
  startTime: string,
  endTime: string
) {
  const [
    startHours,
    startMinutes,
  ] =
    startTime
      .split(":")
      .map(Number);

  const [
    endHours,
    endMinutes,
  ] =
    endTime
      .split(":")
      .map(Number);

  const start =
    startHours * 60 +
    startMinutes;

  const end =
    endHours * 60 +
    endMinutes;

  let minutes =
    end - start;

  if (
    minutes < 0
  ) {
    minutes +=
      24 * 60;
  }

  return (
    minutes / 60
  );
}

function formatDate(
  value: string
) {
  const parts =
    value.split("-");

  if (
    parts.length !== 3
  ) {
    return value;
  }

  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

const deleteButtonStyle = {
  width: "30px",
  height: "30px",
  border: "none",
  borderRadius: "7px",
  background: "#fef2f2",
  color: "#b91c1c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

export default ProjectEntriesTable;