import { useMemo, useState } from "react";

import {
  Archive,
  CheckCircle2,
  FolderCheck,
  MonitorCog,
  Users,
} from "lucide-react";

import { useAdmin } from "../../context/AdminContext";

type ArchiveTab =
  | "users"
  | "machines"
  | "projects";

type ArchiveRow = {
  name: string;
  detail: string;
  status: string;
};

const card = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  background: "#fff",
  padding: 18,
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const muted = {
  color: "#64748b",
  fontSize: 12,
};

function AdminArchive() {
  const {
    users,
    machines,
    projects,
  } = useAdmin();

  const [activeTab, setActiveTab] =
    useState<ArchiveTab>("users");

  const archivedUsers = useMemo(
    () =>
      users.filter(
        (user) => !user.active
      ),
    [users]
  );

  const archivedMachines = useMemo(
    () =>
      machines.filter(
        (machine) => !machine.active
      ),
    [machines]
  );

  const archivedProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.status ===
          "completed"
      ),
    [projects]
  );

  const activeRows = useMemo(() => {
    if (activeTab === "users") {
      return archivedUsers.map(
        (user): ArchiveRow => ({
          name: user.name,
          detail: user.email,
          status: "Neaktiven",
        })
      );
    }

    if (activeTab === "machines") {
      return archivedMachines.map(
        (machine): ArchiveRow => ({
          name: machine.name,
          detail: "",
          status: "Neaktiven",
        })
      );
    }

    return archivedProjects.map(
      (project): ArchiveRow => ({
        name: project.name,
        detail: String(
          project.requiredQuantity
        ),
        status: "Zaključen",
      })
    );
  }, [
    activeTab,
    archivedUsers,
    archivedMachines,
    archivedProjects,
  ]);

  const activeTitle =
    activeTab === "users"
      ? "Arhivirani uporabniki"
      : activeTab === "machines"
      ? "Arhivirani stroji"
      : "Zaključeni projekti";

  const activeEmpty =
    activeTab === "users"
      ? "Ni neaktivnih uporabnikov."
      : activeTab === "machines"
      ? "Ni neaktivnih strojev."
      : "Ni zaključenih projektov.";

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <Archive
              size={23}
              color="#2563eb"
              strokeWidth={2.2}
            />

            <h2 style={titleStyle}>
              Arhiv
            </h2>
          </div>

          <p
            style={{
              ...muted,
              margin: "6px 0 0",
            }}
          >
            Pregled neaktivnih in
            zaključenih podatkov
            WorkLoga.
          </p>
        </div>

        <div style={archiveBadgeStyle}>
          <Archive
            size={16}
            strokeWidth={2}
          />

          <span>
            Arhiv podatkov
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div style={summaryGridStyle}>
        <Summary
          icon={Users}
          label="Neaktivni uporabniki"
          value={
            archivedUsers.length
          }
          active={
            activeTab === "users"
          }
          onClick={() =>
            setActiveTab("users")
          }
        />

        <Summary
          icon={MonitorCog}
          label="Neaktivni stroji"
          value={
            archivedMachines.length
          }
          active={
            activeTab === "machines"
          }
          onClick={() =>
            setActiveTab("machines")
          }
        />

        <Summary
          icon={FolderCheck}
          label="Zaključeni projekti"
          value={
            archivedProjects.length
          }
          active={
            activeTab === "projects"
          }
          onClick={() =>
            setActiveTab("projects")
          }
        />
      </div>

      {/* ARCHIVE CONTENT */}
      <section style={card}>
        <div style={sectionHeaderStyle}>
          <div>
            <h3
              style={{
                margin: 0,
                color: "#12344d",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {activeTitle}
            </h3>

            <p
              style={{
                ...muted,
                margin: "4px 0 0",
              }}
            >
              {activeRows.length}{" "}
              zapisov v arhivu
            </p>
          </div>

          <div style={tabButtonsStyle}>
            <TabButton
              icon={Users}
              label="Uporabniki"
              active={
                activeTab === "users"
              }
              onClick={() =>
                setActiveTab("users")
              }
            />

            <TabButton
              icon={MonitorCog}
              label="Stroji"
              active={
                activeTab === "machines"
              }
              onClick={() =>
                setActiveTab("machines")
              }
            />

            <TabButton
              icon={FolderCheck}
              label="Projekti"
              active={
                activeTab === "projects"
              }
              onClick={() =>
                setActiveTab("projects")
              }
            />
          </div>
        </div>

        {activeRows.length === 0 ? (
          <div style={emptyStyle}>
            <Archive
              size={24}
              strokeWidth={1.8}
            />

            <span>
              {activeEmpty}
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 7,
            }}
          >
            {activeRows.map(
              (row, index) => (
                <ArchiveRow
                  key={`${row.name}-${index}`}
                  row={row}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* INFORMATION */}
      <section
        style={{
          ...card,
          display: "flex",
          alignItems: "flex-start",
          gap: 11,
        }}
      >
        <div style={infoIconStyle}>
          <CheckCircle2
            size={19}
            strokeWidth={2}
          />
        </div>

        <div>
          <div
            style={{
              color: "#334155",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Varen arhiv
          </div>

          <div
            style={{
              ...muted,
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            Arhiv trenutno uporablja
            obstoječe statuse WorkLoga.
            Podatki se iz te strani ne
            brišejo in se ne spreminjajo.
          </div>
        </div>
      </section>
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...card,
        display: "flex",
        alignItems: "center",
        gap: 12,
        textAlign: "left" as const,
        cursor: "pointer",
        border: active
          ? "1px solid #1d526b"
          : "1px solid #e2e8f0",
        boxShadow: active
          ? "0 4px 14px rgba(29,82,107,0.12)"
          : "0 3px 12px rgba(15,23,42,0.035)",
      }}
    >
      <div
        style={{
          width: 45,
          height: 45,
          borderRadius: 11,
          background: active
            ? "#eff6ff"
            : "#f1f5f9",
          color: active
            ? "#2563eb"
            : "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon
          size={21}
          strokeWidth={2}
        />
      </div>

      <div>
        <div
          style={{
            fontSize: 26,
            lineHeight: 1,
            fontWeight: 700,
            color: "#12344d",
          }}
        >
          {value}
        </div>

        <div
          style={{
            ...muted,
            marginTop: 5,
          }}
        >
          {label}
        </div>
      </div>
    </button>
  );
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Users;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...tabButtonStyle,
        ...(active
          ? tabButtonActiveStyle
          : {}),
      }}
    >
      <Icon
        size={15}
        strokeWidth={
          active ? 2.3 : 2
        }
      />

      <span>{label}</span>
    </button>
  );
}

function ArchiveRow({
  row,
}: {
  row: ArchiveRow;
}) {
  return (
    <div style={archiveRowStyle}>
      <div
        style={{
          minWidth: 0,
        }}
      >
        <strong
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap" as const,
            color: "#334155",
            fontSize: 12,
          }}
        >
          {row.name}
        </strong>

        {row.detail && (
          <span
            style={{
              display: "block",
              marginTop: 3,
              overflow: "hidden",
              textOverflow:
                "ellipsis",
              whiteSpace:
                "nowrap" as const,
              color: "#64748b",
              fontSize: 11,
            }}
          >
            {row.detail}
          </span>
        )}
      </div>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 92,
          padding: "5px 9px",
          borderRadius: 7,
          background:
            row.status ===
            "Zaključen"
              ? "#f1f5f9"
              : "#fff7ed",
          color:
            row.status ===
            "Zaključen"
              ? "#64748b"
              : "#ea580c",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {row.status}
      </span>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 20,
};

const titleStyle = {
  margin: 0,
  color: "#12344d",
  fontSize: 25,
  fontWeight: 700,
};

const archiveBadgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 13px",
  border: "1px solid #dbe3e8",
  borderRadius: 9,
  background: "#fff",
  color: "#1d526b",
  fontSize: 12,
  fontWeight: 600,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0,1fr))",
  gap: 14,
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 16,
};

const tabButtonsStyle = {
  display: "flex",
  gap: 6,
};

const tabButtonStyle = {
  height: 36,
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "0 11px",
  border:
    "1px solid #dbe3e8",
  borderRadius: 8,
  background: "#fff",
  color: "#475569",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

const tabButtonActiveStyle = {
  border:
    "1px solid #1d526b",
  background: "#1d526b",
  color: "#fff",
};

const archiveRowStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0,1fr) auto",
  alignItems: "center",
  gap: 12,
  padding: "11px 12px",
  border:
    "1px solid #edf1f5",
  borderRadius: 9,
  background: "#fff",
};

const emptyStyle = {
  minHeight: 180,
  display: "flex",
  flexDirection:
    "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  color: "#94a3b8",
  fontSize: 12,
};

const infoIconStyle = {
  width: 38,
  height: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9,
  background: "#f0fdf4",
  color: "#16a34a",
  flexShrink: 0,
};

export default AdminArchive;