import {
  Check,
  LockKeyhole,
  Shield,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { useAdmin } from "../../context/AdminContext";

type PermissionRow = {
  label: string;
  admin: boolean;
  worker: boolean;
};

function AdminSecurity() {
  const {
    users,
  } = useAdmin();

  const activeAdmins = users.filter(
    (user) =>
      user.role === "admin" &&
      user.active
  ).length;

  const activeWorkers = users.filter(
    (user) =>
      user.role === "worker" &&
      user.active
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.active
  ).length;

  const permissions: PermissionRow[] = [
    {
      label: "Administracija",
      admin: true,
      worker: false,
    },
    {
      label: "Uporabniki",
      admin: true,
      worker: false,
    },
    {
      label: "Stroji",
      admin: true,
      worker: false,
    },
    {
      label: "Nastavitve",
      admin: true,
      worker: false,
    },
    {
      label: "Varnost in pravice",
      admin: true,
      worker: false,
    },
    {
      label: "Poročila sistema",
      admin: true,
      worker: false,
    },
    {
      label: "Arhiv",
      admin: true,
      worker: false,
    },
    {
      label: "Delovni nalogi",
      admin: true,
      worker: true,
    },
    {
      label: "Evidenca",
      admin: true,
      worker: true,
    },
    {
      label: "Statistika",
      admin: true,
      worker: true,
    },
    {
      label: "PDF poročila",
      admin: true,
      worker: true,
    },
  ];

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>
            Varnost in pravice
          </h2>

          <p style={subtitleStyle}>
            Pregled uporabnikov, vlog in
            dostopnih pravic v WorkLogu.
          </p>
        </div>

        <div style={securityBadgeStyle}>
          <Shield
            size={20}
            strokeWidth={2.2}
          />

          <span>
            Administratorski nadzor
          </span>
        </div>
      </div>

      <div style={statsGridStyle}>
        <SecurityStat
          icon={Shield}
          title="Administratorji"
          value={activeAdmins}
          subtitle="aktivnih"
          accent="#2563eb"
        />

        <SecurityStat
          icon={UserCheck}
          title="Delavci"
          value={activeWorkers}
          subtitle="aktivnih"
          accent="#16a34a"
        />

        <SecurityStat
          icon={UserX}
          title="Neaktivni"
          value={inactiveUsers}
          subtitle="uporabniških računov"
          accent="#f97316"
        />

        <SecurityStat
          icon={Users}
          title="Skupaj"
          value={users.length}
          subtitle="uporabnikov"
          accent="#7c3aed"
        />
      </div>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={panelTitleGroupStyle}>
            <LockKeyhole
              size={21}
              color="#2563eb"
              strokeWidth={2.2}
            />

            <div>
              <h3 style={panelTitleStyle}>
                Pravice dostopa
              </h3>

              <p style={panelDescriptionStyle}>
                Pregled dovoljenj glede na
                uporabniško vlogo.
              </p>
            </div>
          </div>
        </div>

        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thLeftStyle}>
                  Funkcija
                </th>

                <th style={thStyle}>
                  Administrator
                </th>

                <th style={thStyle}>
                  Delavec
                </th>
              </tr>
            </thead>

            <tbody>
              {permissions.map(
                (permission) => (
                  <tr key={permission.label}>
                    <td style={tdLeftStyle}>
                      {permission.label}
                    </td>

                    <td style={tdStyle}>
                      <Access
                        value={permission.admin}
                      />
                    </td>

                    <td style={tdStyle}>
                      <Access
                        value={permission.worker}
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div style={noticeStyle}>
          <Shield
            size={17}
            strokeWidth={2}
          />

          <span>
            Pravice so trenutno prikazane kot
            sistemski pregled. Spremembe pravic
            se izvajajo preko uporabniških vlog.
          </span>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={panelTitleGroupStyle}>
            <Users
              size={21}
              color="#2563eb"
              strokeWidth={2.2}
            />

            <div>
              <h3 style={panelTitleStyle}>
                Uporabniki in njihove vloge
              </h3>

              <p style={panelDescriptionStyle}>
                Trenutno stanje uporabniških
                računov.
              </p>
            </div>
          </div>
        </div>

        <div style={usersTableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thLeftStyle}>
                  Uporabnik
                </th>

                <th style={thLeftStyle}>
                  E-pošta
                </th>

                <th style={thStyle}>
                  Vloga
                </th>

                <th style={thStyle}>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={emptyCellStyle}
                  >
                    Ni uporabnikov.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={String(user.id)}
                  >
                    <td style={tdLeftStyle}>
                      <strong
                        style={userNameStyle}
                      >
                        {user.name}
                      </strong>
                    </td>

                    <td style={tdLeftStyle}>
                      <span
                        style={emailStyle}
                      >
                        {user.email}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <RoleBadge
                        role={user.role}
                      />
                    </td>

                    <td style={tdStyle}>
                      <StatusBadge
                        active={user.active}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SecurityStat({
  icon: Icon,
  title,
  value,
  subtitle,
  accent,
}: {
  icon: typeof Shield;
  title: string;
  value: number;
  subtitle: string;
  accent: string;
}) {
  return (
    <div style={statCardStyle}>
      <div
        style={{
          ...statIconStyle,
          background: `${accent}18`,
          color: accent,
        }}
      >
        <Icon
          size={23}
          strokeWidth={2.2}
        />
      </div>

      <div>
        <div style={statTitleStyle}>
          {title}
        </div>

        <div style={statValueStyle}>
          {value}
        </div>

        <div style={statSubtitleStyle}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function Access({
  value,
}: {
  value: boolean;
}) {
  if (!value) {
    return (
      <span style={accessNoStyle}>
        —
      </span>
    );
  }

  return (
    <span style={accessYesStyle}>
      <Check
        size={15}
        strokeWidth={2.5}
      />

      <span>Dovoljeno</span>
    </span>
  );
}

function RoleBadge({
  role,
}: {
  role: string;
}) {
  const isAdmin = role === "admin";

  return (
    <span
      style={{
        ...roleBadgeStyle,
        background: isAdmin
          ? "#eff6ff"
          : "#f0fdf4",
        color: isAdmin
          ? "#2563eb"
          : "#16a34a",
      }}
    >
      {isAdmin
        ? "Administrator"
        : "Delavec"}
    </span>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      style={{
        ...statusBadgeStyle,
        background: active
          ? "#f0fdf4"
          : "#f8fafc",
        color: active
          ? "#16a34a"
          : "#64748b",
      }}
    >
      <span
        style={{
          ...statusDotStyle,
          background: active
            ? "#16a34a"
            : "#94a3b8",
        }}
      />

      {active
        ? "Aktiven"
        : "Neaktiven"}
    </span>
  );
}

const pageStyle = {
  width: "100%",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "20px",
};

const titleStyle = {
  margin: 0,
  fontSize: "25px",
  fontWeight: 700,
  color: "#12344d",
};

const subtitleStyle = {
  marginTop: "6px",
  marginBottom: 0,
  fontSize: "14px",
  color: "#64748b",
};

const securityBadgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  border: "1px solid #dbe3e8",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#1d526b",
  fontSize: "12px",
  fontWeight: 600,
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "14px",
};

const statCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  minHeight: "105px",
  padding: "17px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const statIconStyle = {
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "11px",
  flexShrink: 0,
};

const statTitleStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#64748b",
};

const statValueStyle = {
  marginTop: "3px",
  fontSize: "27px",
  lineHeight: 1,
  fontWeight: 700,
  color: "#12344d",
};

const statSubtitleStyle = {
  marginTop: "6px",
  fontSize: "11px",
  color: "#64748b",
};

const panelStyle = {
  marginBottom: "14px",
  padding: "18px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "16px",
};

const panelTitleGroupStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "9px",
};

const panelTitleStyle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 700,
  color: "#12344d",
};

const panelDescriptionStyle = {
  margin: "4px 0 0",
  fontSize: "12px",
  color: "#64748b",
};

const tableWrapperStyle = {
  overflowX: "auto" as const,
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const usersTableWrapperStyle = {
  overflowX: "auto" as const,
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse" as const,
};

const thLeftStyle = {
  padding: "11px 13px",
  borderBottom:
    "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 700,
  textAlign: "left" as const,
};

const thStyle = {
  padding: "11px 13px",
  borderBottom:
    "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 700,
  textAlign: "center" as const,
};

const tdLeftStyle = {
  padding: "11px 13px",
  borderBottom:
    "1px solid #eef2f6",
  color: "#334155",
  fontSize: "12px",
  textAlign: "left" as const,
};

const tdStyle = {
  padding: "11px 13px",
  borderBottom:
    "1px solid #eef2f6",
  color: "#334155",
  fontSize: "12px",
  textAlign: "center" as const,
};

const accessYesStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  padding: "5px 8px",
  borderRadius: "7px",
  background: "#f0fdf4",
  color: "#16a34a",
  fontSize: "10px",
  fontWeight: 700,
};

const accessNoStyle = {
  color: "#cbd5e1",
  fontSize: "16px",
};

const noticeStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "9px",
  marginTop: "13px",
  padding: "11px 13px",
  borderRadius: "9px",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "11px",
  lineHeight: 1.5,
};

const roleBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 9px",
  borderRadius: "7px",
  fontSize: "10px",
  fontWeight: 700,
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "5px 9px",
  borderRadius: "7px",
  fontSize: "10px",
  fontWeight: 700,
};

const statusDotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
};

const userNameStyle = {
  color: "#12344d",
};

const emailStyle = {
  color: "#64748b",
};

const emptyCellStyle = {
  padding: "25px",
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center" as const,
};

export default AdminSecurity;