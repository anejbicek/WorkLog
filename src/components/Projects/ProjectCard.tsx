import {
  Clock3,
  Factory,
  FolderKanban,
  Users,
} from "lucide-react";

import type { ReactNode } from "react";

import type { AdminProject } from "../../context/AdminContext";

type ProjectCardProps = {
  project: AdminProject;
  requiredQuantity: number;
  producedQuantity: number;
  hours: number;
  workerCount: number;
  machineCount: number;
  onDetails: () => void;
  onAddEntry: () => void;
  adminActions?: ReactNode;
  showAddEntry?: boolean;

  /*
   * Omogoča AdminProjectManagement.tsx,
   * da kartici določi širino.
   */
  width?: string;
};

function ProjectCard({
  project,
  requiredQuantity,
  producedQuantity,
  hours,
  workerCount,
  machineCount,
  onDetails,
  onAddEntry,
  adminActions,
  showAddEntry = true,
  width = "550px",
}: ProjectCardProps) {
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

  /*
   * projectNumber bomo v AdminContextu uporabljali kot pravo
   * uporabniško številko projekta.
   *
   * Za prehodno obdobje uporabimo projectNumber, če obstaja,
   * sicer trenutni Supabase id.
   */
  const projectNumber =
    (
      project as AdminProject & {
        projectNumber?: number;
      }
    ).projectNumber ??
    project.id;

  return (
    <div
      style={{
        width,
        maxWidth: "100%",
        minHeight: "260px",
        boxSizing: "border-box",

        margin: "0 auto",

        background: "#ffffff",

        border:
          "1px solid #e5e7eb",

        borderRadius: "14px",

        padding: "20px",

        boxShadow:
          "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      {/* =====================================================
          GLAVA
      ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
          gap: "12px",
          marginBottom:
            "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: 0,
          }}
        >
          {/* MAPA */}

          <div
            className="project-card-folder-icon"
            style={{
              width: "44px",
              height: "44px",
              minWidth: "44px",
              borderRadius: "10px",

              background:
                "#eaf2f5",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color:
                "#1d526b",
            }}
          >
            <FolderKanban
              size={22}
            />
          </div>

          {/* IME PROJEKTA */}

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              className="project-card-name"
              style={{
                color:
                  "#12344d",

                fontSize:
                  "16px",

                fontWeight:
                  700,

                whiteSpace:
                  "nowrap",

                overflow:
                  "hidden",

                textOverflow:
                  "ellipsis",
              }}
            >
              {project.name}
            </div>

            {project.serialNumber && (
              <div
                style={{
                  marginTop: "3px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Serijska št.:{" "}
                {project.serialNumber}
              </div>
            )}

            {/* PROJEKT ŠTEVILKA */}

            <div
              className="project-card-number"
              style={{
                marginTop:
                  "3px",

                color:
                  "#64748b",

                fontSize:
                  "12px",
              }}
            >
              Projekt #{projectNumber}
            </div>
          </div>
        </div>

        {/* =================================================
            PROCENTI
        ================================================= */}

        <div
          className="project-card-progress"
          style={{
            padding:
              "5px 9px",

            borderRadius:
              "999px",

            background:
              progress >= 100
                ? "#dcfce7"
                : "#eaf2f5",

            color:
              progress >= 100
                ? "#15803d"
                : "#1d526b",

            fontSize:
              "12px",

            fontWeight:
              700,

            flexShrink: 0,
          }}
        >
          {progress} %
        </div>
      </div>

      {/* =====================================================
          NAPREDEK
      ===================================================== */}

      <div
        style={{
          height: "8px",

          borderRadius:
            "999px",

          background:
            "#e5e7eb",

          overflow:
            "hidden",

          marginBottom:
            "18px",
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
          }}
        />
      </div>

      {/* =====================================================
          KOLIČINE
      ===================================================== */}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",

          gap:
            "10px",

          marginBottom:
            "16px",
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
      </div>

      {/* =====================================================
          STATISTIKA
      ===================================================== */}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",

          gap:
            "10px",

          paddingTop:
            "15px",

          borderTop:
            "1px solid #e5e7eb",
        }}
      >
        <MiniInfo
          icon={
            <Clock3
              size={15}
            />
          }
          label="Ure"
          value={`${hours.toFixed(
            2
          )} h`}
        />

        <MiniInfo
          icon={
            <Users
              size={15}
            />
          }
          label="Delavci"
          value={`${workerCount}`}
        />

        <MiniInfo
          icon={
            <Factory
              size={15}
            />
          }
          label="Stroji"
          value={`${machineCount}`}
        />
      </div>

      {/* =====================================================
          GUMBI
      ===================================================== */}

      <div
        style={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          gap:
            "10px",

          marginTop:
            "18px",

          paddingTop:
            "14px",

          borderTop:
            "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              "8px",

            flexWrap:
              "wrap",
          }}
        >
          {/* PODROBNOSTI */}

          <button
            type="button"
            onClick={
              onDetails
            }
            style={
              secondaryButtonStyle
            }
          >
            Podrobnosti
          </button>

          {/* DODAJ IZDELAVO */}

          {showAddEntry && (
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
          )}
        </div>

        {/* ADMIN GUMBI */}

        {adminActions && (
          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "8px",

              flexWrap:
                "wrap",

              justifyContent:
                "flex-end",
            }}
          >
            {adminActions}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
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

        minWidth: 0,
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

          whiteSpace:
            "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   MINI INFO
========================================================= */

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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

        gap:
          "9px",

        padding:
          "10px 12px",

        background:
          "#f8fafc",

        borderRadius:
          "9px",

        minWidth: 0,
      }}
    >
      {/* IKONA */}

      <div
        className="project-card-mini-icon"
        style={{
          color:
            "#1d526b",

          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        {/* NAZIV */}

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

        {/* VREDNOST */}

        <div
          style={{
            color:
              "#12344d",

            fontSize:
              "13px",

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

/* =========================================================
   GUMB – PRIMARNI
========================================================= */

const primaryButtonStyle = {
  height:
    "36px",

  padding:
    "0 12px",

  border:
    "none",

  borderRadius:
    "8px",

  background:
    "#1d526b",

  color:
    "#ffffff",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    "6px",

  fontSize:
    "12px",

  fontWeight:
    600,

  cursor:
    "pointer",

  whiteSpace:
    "nowrap" as const,
};

/* =========================================================
   GUMB – SEKUNDARNI
========================================================= */

const secondaryButtonStyle = {
  height:
    "36px",

  padding:
    "0 12px",

  border:
    "1px solid #d1d5db",

  borderRadius:
    "8px",

  background:
    "#ffffff",

  color:
    "#475569",

  fontSize:
    "12px",

  fontWeight:
    600,

  cursor:
    "pointer",

  whiteSpace:
    "nowrap" as const,
};

export default ProjectCard;