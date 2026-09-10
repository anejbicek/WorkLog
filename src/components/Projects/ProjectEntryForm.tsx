import {
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";

import type {
  AdminMachine,
  AdminProject,
} from "../../context/AdminContext";

type ProjectEntryFormProps = {
  projects: AdminProject[];
  machines: AdminMachine[];
  selectedProjectId: number | "";
  date: string;
  startTime: string;
  endTime: string;
  machine: string;
  quantity: string;
  currentWorker: string;
  saving: boolean;

  onProjectChange: (
    value: number | ""
  ) => void;

  onDateChange: (
    value: string
  ) => void;

  onStartTimeChange: (
    value: string
  ) => void;

  onEndTimeChange: (
    value: string
  ) => void;

  onMachineChange: (
    value: string
  ) => void;

  onQuantityChange: (
    value: string
  ) => void;

  onSave: () => void;

  onClose: () => void;
};

function ProjectEntryForm({
  projects,
  machines,
  selectedProjectId,
  date,
  startTime,
  endTime,
  machine,
  quantity,
  currentWorker,
  saving,
  onProjectChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onMachineChange,
  onQuantityChange,
  onSave,
  onClose,
}: ProjectEntryFormProps) {
  return (
    <div
      style={
        overlayStyle
      }
    >
      <div
        style={
          modalStyle
        }
      >
        <div
          style={
            modalHeaderStyle
          }
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 5px 0",
                color:
                  "#12344d",
                fontSize:
                  "20px",
              }}
            >
              Vnos izdelave
            </h2>

            <p
              style={{
                margin: 0,
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Vnesi čas in
              količino izdelave.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            style={
              closeButtonStyle
            }
          >
            <X
              size={18}
            />
          </button>
        </div>

        <Field label="Projekt">
          <select
            value={
              selectedProjectId
            }
            onChange={(
              event
            ) =>
              onProjectChange(
                event.target
                  .value
                  ? Number(
                      event.target
                        .value
                    )
                  : ""
              )
            }
            style={
              inputStyle
            }
            disabled={
              saving
            }
          >
            <option value="">
              Izberi projekt
            </option>

            {projects
              .filter(
                (
                  project
                ) =>
                  project.active
              )
              .map(
                (
                  project
                ) => (
                  <option
                    key={
                      project.id
                    }
                    value={
                      project.id
                    }
                  >
                    {
                      project.name
                    }
                  </option>
                )
              )}
          </select>
        </Field>

        <Field label="Datum">
          <input
            type="date"
            value={
              date
            }
            onChange={(
              event
            ) =>
              onDateChange(
                event.target
                  .value
              )
            }
            style={
              inputStyle
            }
            disabled={
              saving
            }
          />
        </Field>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "12px",
          }}
        >
          <Field label="Začetek">
            <input
              type="time"
              value={
                startTime
              }
              onChange={(
                event
              ) =>
                onStartTimeChange(
                  event.target
                    .value
                )
              }
              style={
                inputStyle
              }
              disabled={
                saving
              }
            />
          </Field>

          <Field label="Konec">
            <input
              type="time"
              value={
                endTime
              }
              onChange={(
                event
              ) =>
                onEndTimeChange(
                  event.target
                    .value
                )
              }
              style={
                inputStyle
              }
              disabled={
                saving
              }
            />
          </Field>
        </div>

        <Field label="Stroj">
          <select
            value={
              machine
            }
            onChange={(
              event
            ) =>
              onMachineChange(
                event.target
                  .value
              )
            }
            style={
              inputStyle
            }
            disabled={
              saving
            }
          >
            <option value="">
              Izberi stroj
            </option>

            {machines
              .filter(
                (
                  item
                ) =>
                  item.active
              )
              .map(
                (
                  item
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.name
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                )
              )}
          </select>
        </Field>

        <Field
          label="Izdelana količina"
        >
          <input
            type="number"
            min="1"
            step="1"
            value={
              quantity
            }
            onChange={(
              event
            ) =>
              onQuantityChange(
                event.target
                  .value
              )
            }
            placeholder="npr. 120"
            style={
              inputStyle
            }
            disabled={
              saving
            }
          />
        </Field>

        <div
          style={{
            padding:
              "11px 13px",
            marginBottom:
              "18px",
            background:
              "#f5f7f6",
            borderRadius:
              "9px",
            fontSize:
              "12px",
            color:
              "#64748b",
          }}
        >
          Vnos bo evidentiran
          za uporabnika:{" "}

          <strong
            style={{
              color:
                "#12344d",
            }}
          >
            {
              currentWorker
            }
          </strong>
        </div>

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            style={{
              ...secondaryButtonStyle,
              opacity:
                saving
                  ? 0.6
                  : 1,
            }}
          >
            Prekliči
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onSave
            }
            style={{
              ...primaryButtonStyle,
              opacity:
                saving
                  ? 0.7
                  : 1,
            }}
          >
            {saving ? (
              <>
                <RefreshCw
                  size={
                    17
                  }
                />

                Shranjujem ...
              </>
            ) : (
              <>
                <CheckCircle2
                  size={
                    17
                  }
                />

                Shrani izdelavo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom:
          "15px",
      }}
    >
      <label
        style={{
          display:
            "block",
          marginBottom:
            "6px",
          color:
            "#334155",
          fontSize:
            "13px",
          fontWeight:
            600,
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

const overlayStyle = {
  position:
    "fixed" as const,
  inset: 0,
  background:
    "rgba(15,23,42,0.35)",
  display: "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  zIndex: 1000,
  padding: "20px",
  boxSizing:
    "border-box" as const,
};

const modalStyle = {
  width: "100%",
  maxWidth: "520px",
  maxHeight: "90vh",
  overflowY:
    "auto" as const,
  background:
    "#ffffff",
  borderRadius:
    "16px",
  padding: "24px",
  boxSizing:
    "border-box" as const,
  boxShadow:
    "0 20px 50px rgba(15,23,42,0.20)",
};

const modalHeaderStyle = {
  display: "flex",
  alignItems:
    "flex-start",
  justifyContent:
    "space-between",
  marginBottom:
    "22px",
};

const closeButtonStyle = {
  width: "34px",
  height: "34px",
  border: "none",
  borderRadius:
    "8px",
  background:
    "#f1f5f9",
  color:
    "#64748b",
  display: "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  cursor:
    "pointer",
};

const inputStyle = {
  width: "100%",
  height: "42px",
  padding: "0 12px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "9px",
  background:
    "#ffffff",
  color:
    "#334155",
  fontSize:
    "14px",
  boxSizing:
    "border-box" as const,
  outline:
    "none",
};

const primaryButtonStyle = {
  height: "42px",
  padding: "0 16px",
  border: "none",
  borderRadius:
    "9px",
  background:
    "#1d526b",
  color:
    "#ffffff",
  display: "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  gap: "8px",
  fontSize:
    "14px",
  fontWeight:
    600,
  cursor:
    "pointer",
};

const secondaryButtonStyle = {
  height: "42px",
  padding: "0 16px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "9px",
  background:
    "#ffffff",
  color:
    "#475569",
  fontSize:
    "14px",
  fontWeight:
    600,
  cursor:
    "pointer",
};

export default ProjectEntryForm;