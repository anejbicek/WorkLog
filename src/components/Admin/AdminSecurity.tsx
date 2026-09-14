import {
  Check,
  History,
  LockKeyhole,
  Shield,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import {
  DEFAULT_ADMIN_PERMISSIONS,
  USER_ROLE_HIERARCHY,
  USER_ROLE_LABELS,
  type PermissionKey,
  type UserRole,
} from "../../context/AdminContext";
import { useAdmin } from "../../context/AdminContext";

type RoleKey = UserRole;

type PermissionRow = {
  key: PermissionKey;
  label: string;
};

type PermissionState = Record<
  PermissionKey,
  Record<RoleKey, boolean>
>;

const ROLE_ORDER: RoleKey[] = [
  "super_admin",
  "admin",
  "manager",
  "worker",
];

const ROLE_LABELS: Record<RoleKey, string> =
  USER_ROLE_LABELS;

const ROLE_LEVEL: Record<RoleKey, number> =
  USER_ROLE_HIERARCHY;

const permissions: PermissionRow[] = [
  { key: "administration", label: "Administracija" },
  { key: "users", label: "Uporabniki" },
  { key: "machines", label: "Stroji" },
  { key: "settings", label: "Nastavitve" },
  { key: "security", label: "Varnost in pravice" },
  { key: "system_reports", label: "Poročila sistema" },
  { key: "archive", label: "Arhiv" },
  { key: "work_orders", label: "Delovni nalogi" },
  { key: "records", label: "Evidenca" },
  { key: "statistics", label: "Statistika" },
  { key: "pdf_reports", label: "PDF poročila" },
];

const DEFAULT_PERMISSIONS =
  DEFAULT_ADMIN_PERMISSIONS;

function normalizeRole(role: string): RoleKey {
  if (
    role === "super_admin" ||
    role === "superadmin" ||
    role === "super-administrator"
  ) {
    return "super_admin";
  }

  if (
    role === "manager" ||
    role === "vodja"
  ) {
    return "manager";
  }

  if (role === "worker") {
    return "worker";
  }

  return "admin";
}

function AdminSecurity() {
  const adminContext = useAdmin();

  const {
    users,
    permissions: permissionState,
    currentUserRole,
    canManageRole,
    setPermission,
    setLastChange,
    lastChange: contextLastChange,
    changeHistory,
  } = adminContext;

  const activeAdmins = users.filter(
    (user) =>
      (normalizeRole(user.role) === "admin" ||
        normalizeRole(user.role) === "super_admin") &&
      user.active
  ).length;

  const activeWorkers = users.filter(
    (user) =>
      normalizeRole(user.role) === "worker" &&
      user.active
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.active
  ).length;

  const togglePermission = (
    permissionKey: PermissionKey,
    role: RoleKey
  ) => {
    if (
      ROLE_LEVEL[currentUserRole] <=
      ROLE_LEVEL[role]
    ) {
      return;
    }

    const current =
      permissionState[permissionKey]?.[role] ??
      DEFAULT_PERMISSIONS[permissionKey]?.[role] ??
      false;

    const nextValue = !current;

    setPermission(
      permissionKey,
      role,
      nextValue
    );

    const permission = permissions.find(
      (item) => item.key === permissionKey
    );

    const changeText =
      `${permission?.label || permissionKey} → ` +
      `${ROLE_LABELS[role]}: ` +
      `${nextValue ? "Dovoljeno" : "Ni dovoljeno"}`;

    setLastChange(changeText);
  };

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

      <section style={changeHistoryPanelStyle}>
        <div style={changeHistoryHeaderStyle}>
          <div style={changeHistoryTitleGroupStyle}>
            <History size={20} color="#2563eb" strokeWidth={2.2} />
            <div>
              <h3 style={changeHistoryTitleStyle}>Zgodovina sprememb</h3>
              <p style={changeHistoryDescriptionStyle}>Pregled zadnjih sprememb v administraciji.</p>
            </div>
          </div>
        </div>

        {changeHistory.length === 0 ? (
          <div style={changeHistoryEmptyStyle}>Ni zabeleženih sprememb.</div>
        ) : (
          <div style={changeHistoryListStyle}>
            {changeHistory.map((change) => (
              <div key={change.id} style={changeHistoryRowStyle}>
                <div style={changeHistoryIconStyle}>
                  <History size={16} strokeWidth={2.2} />
                </div>
                <div style={changeHistoryMainStyle}>
                  <div style={changeHistoryMessageStyle}>{change.message}</div>
                  <div style={changeHistoryMetaStyle}>
                    <span>{change.userName}</span>
                    <span>•</span>
                    <span>{ROLE_LABELS[change.userRole]}</span>
                    {change.userEmail && (
                      <>
                        <span>•</span>
                        <span>{change.userEmail}</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={changeHistoryDateStyle}>
                  {new Date(change.at).toLocaleString("sl-SI")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
                Kliknite na dovoljenje, da ga
                vklopite ali izklopite za posamezno
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

                {ROLE_ORDER.map((role) => (
                  <th
                    key={role}
                    style={thStyle}
                  >
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {permissions.map(
                (permission) => (
                  <tr key={permission.key}>
                    <td style={tdLeftStyle}>
                      {permission.label}
                    </td>

                    {ROLE_ORDER.map((role) => {
                      const allowed =
                        permissionState[
                          permission.key
                        ]?.[role] ?? false;

                      return (
                        <td
                          key={role}
                          style={tdStyle}
                        >
                          <button
                            type="button"
                            disabled={!canManageRole(role)}
                            onClick={() =>
                              togglePermission(
                                permission.key,
                                role
                              )
                            }
                            style={{
                              ...accessButtonStyle,
                              cursor: canManageRole(role)
                                ? "pointer"
                                : "default",
                              opacity: canManageRole(role)
                                ? 1
                                : 0.65,
                            }}
                            title={
                              !canManageRole(role)
                                ? "Te vloge ne morete urejati."
                                : allowed
                                ? "Kliknite za odvzem pravice"
                                : "Kliknite za dovoljenje"
                            }
                          >
                            <Access
                              value={allowed}
                            />
                          </button>
                        </td>
                      );
                    })}
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
            Kliknite na posamezno celico tabele,
            da spremenite dovoljenje. Spremembe se
            samodejno shranijo.
          </span>
        </div>
      </section>

      <section style={lastChangePanelStyle}>
        <div style={lastChangeIconStyle}>
          <Check
            size={19}
            strokeWidth={2.3}
          />
        </div>

        <div>
          <div style={lastChangeTitleStyle}>
            Zadnja sprememba
          </div>

          <div style={lastChangeTextStyle}>
            {contextLastChange.message}
          </div>
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
                users.map((user: any) => (
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
                        role={String(
                          user.role
                        )}
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
  const normalized = normalizeRole(role);

  const styles: Record<
    RoleKey,
    {
      background: string;
      color: string;
    }
  > = {
    super_admin: {
      background: "#fef3c7",
      color: "#b45309",
    },
    admin: {
      background: "#eff6ff",
      color: "#2563eb",
    },
    manager: {
      background: "#f5f3ff",
      color: "#7c3aed",
    },
    worker: {
      background: "#f0fdf4",
      color: "#16a34a",
    },
  };

  return (
    <span
      style={{
        ...roleBadgeStyle,
        background:
          styles[normalized].background,
        color: styles[normalized].color,
      }}
    >
      {ROLE_LABELS[normalized]}
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
  whiteSpace: "nowrap" as const,
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

const accessButtonStyle = {
  border: "none",
  background: "transparent",
  padding: 0,
  margin: 0,
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
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "70px",
  minHeight: "25px",
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

const lastChangePanelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px",
  padding: "14px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const lastChangeIconStyle = {
  width: "38px",
  height: "38px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: "9px",
  background: "#f0fdf4",
  color: "#16a34a",
};

const lastChangeTitleStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#64748b",
};

const lastChangeTextStyle = {
  marginTop: "3px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#334155",
};

const changeHistoryPanelStyle = {
  marginBottom: "14px",
  padding: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow: "0 3px 12px rgba(15,23,42,0.035)",
};

const changeHistoryHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "13px",
};

const changeHistoryTitleGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const changeHistoryTitleStyle = {
  margin: 0,
  fontSize: "14px",
  fontWeight: 700,
  color: "#12344d",
};

const changeHistoryDescriptionStyle = {
  margin: "3px 0 0",
  fontSize: "11px",
  color: "#64748b",
};

const changeHistoryListStyle = {
  display: "flex",
  flexDirection: "column" as const,
  borderTop: "1px solid #eef2f6",
};

const changeHistoryRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "12px 0",
  borderBottom: "1px solid #eef2f6",
};

const changeHistoryIconStyle = {
  width: "34px",
  height: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: "8px",
  background: "#eff6ff",
  color: "#2563eb",
};

const changeHistoryMainStyle = {
  minWidth: 0,
  flex: 1,
};

const changeHistoryMessageStyle = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#334155",
};

const changeHistoryMetaStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "5px",
  marginTop: "4px",
  fontSize: "10px",
  color: "#64748b",
};

const changeHistoryDateStyle = {
  flexShrink: 0,
  fontSize: "10px",
  color: "#64748b",
  textAlign: "right" as const,
};

const changeHistoryEmptyStyle = {
  padding: "18px 0 4px",
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center" as const,
};

const roleBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 9px",
  borderRadius: "7px",
  fontSize: "10px",
  fontWeight: 700,
  whiteSpace: "nowrap" as const,
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
