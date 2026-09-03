import {
  Clock3,
  Factory,
  FolderKanban,
  Users,
  X,
} from "lucide-react";

import type {
  AdminProject,
} from "../../context/AdminContext";

import type {
  ProjectEntry,
} from "../../context/ProjectContext";

import ProjectEntriesTable from "./ProjectEntriesTable";

type ProjectDetailsProps = {
  project: AdminProject;
  entries: ProjectEntry[];
  requiredQuantity: number;
  producedQuantity: number;
  hours: number;
  workers: string[];
  machines: string[];
  onClose: () => void;
  onAddEntry: () => void;
  onDeleteEntry?: (
    id: number
  ) => void;
};

function ProjectDetails({
  project,
  entries,
  requiredQuantity,
  producedQuantity,
  hours,
  workers,
  machines,
  onClose,
  onAddEntry,
  onDeleteEntry,
}: ProjectDetailsProps) {
  const remainingQuantity =
    Math.max(
      0,
      requiredQuantity -
        producedQuantity
    );

  const progress =
    requiredQuantity > 0
      ? Math.min(
          100,
          Math.round(
            (producedQuantity /
              requiredQuantity) *
              100
          )
        )
      : 0;

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
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={
            modalHeaderStyle
          }
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius:
                  "10px",
                background:
                  "#eaf2f5",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#1d526b",
              }}
            >
              <FolderKanban
                size={23}
              />
            </div>

            <div>
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "12px",
                  marginBottom:
                    "3px",
                }}
              >
                Projekt #
                {
                  project.id
                }
              </div>

              <h2
                style={{
                  margin: 0,
                  color:
                    "#12344d",
                  fontSize:
                    "22px",
                }}
              >
                {
                  project.name
                }
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
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

        {/* =================================================
            GLAVNI PODATKI
        ================================================= */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: "12px",
            marginBottom:
              "22px",
          }}
        >
          <InfoBox
            label="Zahtevano"
            value={`${requiredQuantity} kos`}
          />

          <InfoBox
            label="Izdelano"
            value={`${producedQuantity} kos`}
          />

          <InfoBox
            label="Preostalo"
            value={`${remainingQuantity} kos`}
          />

          <InfoBox
            label="Napredek"
            value={`${progress} %`}
          />
        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div
          style={{
            marginBottom:
              "24px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              marginBottom:
                "7px",
              color:
                "#64748b",
              fontSize:
                "12px",
            }}
          >
            <span>
              Napredek projekta
            </span>

            <strong
              style={{
                color:
                  "#12344d",
              }}
            >
              {
                progress
              }
              %
            </strong>
          </div>

          <div
            style={{
              height:
                "10px",
              borderRadius:
                "999px",
              background:
                "#e5e7eb",
              overflow:
                "hidden",
            }}
          >
            <div
              style={{
                width:
                  `${progress}%`,
                height:
                  "100%",
                background:
                  "#1d526b",
                borderRadius:
                  "999px",
                transition:
                  "width 0.2s ease",
              }}
            />
          </div>
        </div>

        {/* =================================================
            STATISTIKA
        ================================================= */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "12px",
            marginBottom:
              "26px",
          }}
        >
          <StatCard
            icon={
              <Clock3
                size={18}
              />
            }
            label="Skupaj ur"
            value={`${hours.toFixed(
              2
            )} h`}
          />

          <StatCard
            icon={
              <Users
                size={18}
              />
            }
            label="Delavci"
            value={`${workers.length}`}
          />

          <StatCard
            icon={
              <Factory
                size={18}
              />
            }
            label="Stroji"
            value={`${machines.length}`}
          />
        </div>

        {/* =================================================
            DELAVCI
        ================================================= */}

        <div
          style={{
            marginBottom:
              "22px",
          }}
        >
          <SectionTitle>
            Delavci
          </SectionTitle>

          {workers.length ===
          0 ? (
            <EmptyText>
              Za ta projekt še
              ni zabeleženega
              delavca.
            </EmptyText>
          ) : (
            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap: "8px",
              }}
            >
              {workers.map(
                (
                  worker
                ) => (
                  <div
                    key={
                      worker
                    }
                    style={
                      tagStyle
                    }
                  >
                    <Users
                      size={
                        13
                      }
                    />

                    {
                      worker
                    }
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* =================================================
            STROJI
        ================================================= */}

        <div
          style={{
            marginBottom:
              "24px",
          }}
        >
          <SectionTitle>
            Stroji
          </SectionTitle>

          {machines.length ===
          0 ? (
            <EmptyText>
              Za ta projekt še
              ni zabeleženega
              stroja.
            </EmptyText>
          ) : (
            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap: "8px",
              }}
            >
              {machines.map(
                (
                  machine
                ) => (
                  <div
                    key={
                      machine
                    }
                    style={
                      tagStyle
                    }
                  >
                    <Factory
                      size={
                        13
                      }
                    />

                    {
                      machine
                    }
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* =================================================
            IZDELAVA
        ================================================= */}

        <div
          style={{
            marginBottom:
              "22px",
          }}
        >
          <SectionTitle>
            Izdelava
          </SectionTitle>

          <ProjectEntriesTable
            entries={
              entries
            }
            onDelete={
              onDeleteEntry
            }
          />
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "flex-end",
            paddingTop:
              "18px",
            borderTop:
              "1px solid #e5e7eb",
          }}
        >
          <button
            type="button"
            onClick={
              onAddEntry
            }
            style={
              primaryButtonStyle
            }
          >
            + Dodaj izdelavo
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   POMOŽNE KOMPONENTE
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding:
          "13px",
        background:
          "#f8fafc",
        borderRadius:
          "9px",
      }}
    >
      <div
        style={{
          marginBottom:
            "5px",
          color:
            "#64748b",
          fontSize:
            "11px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            "#12344d",
          fontSize:
            "17px",
          fontWeight:
            700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap: "10px",
        padding:
          "13px",
        background:
          "#f8fafc",
        borderRadius:
          "9px",
      }}
    >
      <div
        style={{
          color:
            "#1d526b",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color:
              "#64748b",
            fontSize:
              "10px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color:
              "#12344d",
            fontSize:
              "14px",
            fontWeight:
              700,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3
      style={{
        margin:
          "0 0 10px 0",
        color:
          "#12344d",
        fontSize:
          "15px",
        fontWeight:
          700,
      }}
    >
      {children}
    </h3>
  );
}

function EmptyText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        color:
          "#64748b",
        fontSize:
          "12px",
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   STILI
========================================================= */

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
  maxWidth:
    "1050px",
  maxHeight:
    "90vh",
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

const tagStyle = {
  display: "flex",
  alignItems:
    "center",
  gap: "6px",
  padding:
    "7px 10px",
  borderRadius:
    "8px",
  background:
    "#eaf2f5",
  color:
    "#1d526b",
  fontSize:
    "12px",
  fontWeight:
    600,
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

export default ProjectDetails;