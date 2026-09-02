import {
  useState,
  type ReactNode,
} from "react";

import {
  useAdmin,
  type AdminUser,
  type UserRole,
} from "../../context/AdminContext";

import AdminUserStatistics from "./AdminUserStatistics";

function AdminUsers() {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
  } = useAdmin();

  const [showForm, setShowForm] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<AdminUser | null>(null);

  const [
    selectedStatisticsUser,
    setSelectedStatisticsUser,
  ] = useState<AdminUser | null>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [initialPassword, setInitialPassword] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [role, setRole] =
    useState<UserRole>("worker");

  const [active, setActive] =
    useState(true);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setName("");
    setEmail("");
    setUsername("");
    setInitialPassword("");
    setFormError("");
    setRole("worker");
    setActive(true);

    setShowForm(false);
    setEditingUser(null);
  };

  /* =========================================================
     UREDI UPORABNIKA
  ========================================================= */

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);

    setName(user.name);
    setEmail(user.email);
    setUsername(user.username ?? "");
    setInitialPassword("");
    setFormError("");
    setRole(user.role);
    setActive(user.active);

    setShowForm(true);
  };

  /* =========================================================
     SHRANI UPORABNIKA
  ========================================================= */

  const saveUser = async () => {
    setFormError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !username.trim()
    ) {
      setFormError(
        "Ime, e-naslov in uporabniško ime so obvezni."
      );
      return;
    }

    /*
     * Pri ustvarjanju novega uporabnika
     * mora administrator določiti začetno geslo.
     */
    if (!editingUser) {
      if (!initialPassword.trim()) {
        setFormError(
          "Za novega uporabnika moraš vnesti začetno geslo."
        );
        return;
      }

      if (initialPassword.length < 6) {
        setFormError(
          "Začetno geslo mora vsebovati najmanj 6 znakov."
        );
        return;
      }
    }

    const userData: Omit<
      AdminUser,
      "id" | "authUserId"
    > = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      role,
      active,
    };

    setSaving(true);

    try {
      /*
       * UREJANJE OBSTOJEČEGA UPORABNIKA
       */
      if (editingUser) {
        updateUser(editingUser.id, {
          ...userData,
          authUserId:
            editingUser.authUserId,
        });
      }

      /*
       * USTVARJANJE NOVEGA UPORABNIKA
       *
       * Supabase ID se tukaj NE vpisuje.
       * Supabase ga ustvari sam.
       *
       * Administrator določi samo začetno geslo.
       */
      else {
        const created = await addUser(
          userData,
          initialPassword
        );

        if (!created) {
          setFormError(
            "Uporabnika ni bilo mogoče ustvariti. Preveri Supabase Edge Function in podatke uporabnika."
          );
          return;
        }
      }

      resetForm();
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     STATISTIKA UPORABNIKA
  ========================================================= */

  if (selectedStatisticsUser) {
    return (
      <AdminUserStatistics
        userName={
          selectedStatisticsUser.name
        }
        authUserId={
          selectedStatisticsUser.authUserId
        }
        onBack={() =>
          setSelectedStatisticsUser(null)
        }
      />
    );
  }

  return (
    <div>
      {/* =====================================================
          GLAVA
      ===================================================== */}

      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>
            Uporabniki
          </h2>

          <p style={subtitleStyle}>
            Upravljaj uporabniške račune
            in njihove pravice.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={primaryButtonStyle}
        >
          + Dodaj uporabnika
        </button>
      </div>

      {/* =====================================================
          OBRAZEC
      ===================================================== */}

      {showForm && (
        <div style={panelStyle}>
          <h3
            style={{
              margin: "0 0 18px",
              color: "#12344d",
              fontSize: "17px",
            }}
          >
            {editingUser
              ? "Uredi uporabnika"
              : "Nov uporabnik"}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(5, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {/* IME */}

            <Field label="Ime in priimek">
              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Ime in priimek"
                style={inputStyle}
              />
            </Field>

            {/* UPORABNIŠKO IME */}

            <Field label="Uporabniško ime">
              <input
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="Uporabniško ime"
                style={inputStyle}
              />
            </Field>

            {/* E-POŠTA */}

            <Field label="E-naslov">
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="E-naslov"
                style={inputStyle}
              />
            </Field>

            {/* ZAČETNO GESLO */}

            {!editingUser && (
              <Field label="Začetno geslo">
                <input
                  type="password"
                  value={initialPassword}
                  onChange={(event) =>
                    setInitialPassword(
                      event.target.value
                    )
                  }
                  placeholder="Začetno geslo"
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </Field>
            )}

            {/* VLOGA */}

            <Field label="Vloga">
              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as UserRole
                  )
                }
                style={inputStyle}
              >
                <option value="worker">
                  Delavec
                </option>

                <option value="admin">
                  Administrator
                </option>
              </select>
            </Field>

            {/* STATUS */}

            <Field label="Status">
              <select
                value={
                  active
                    ? "active"
                    : "inactive"
                }
                onChange={(event) =>
                  setActive(
                    event.target.value ===
                      "active"
                  )
                }
                style={inputStyle}
              >
                <option value="active">
                  Aktiven
                </option>

                <option value="inactive">
                  Neaktiven
                </option>
              </select>
            </Field>
          </div>

          {/* OPIS ZAČETNEGA GESLA */}

          {!editingUser && (
            <div
              style={{
                marginTop: "8px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Začetno geslo uporabi
              uporabnik za prvo prijavo.
              Supabase ID se ustvari
              samodejno in ga
              administrator ne vpisuje.
              Uporabnik lahko geslo
              pozneje spremeni v svojih
              nastavitvah.
            </div>
          )}

          {/* NAPAKA */}

          {formError && (
            <div style={errorBoxStyle}>
              {formError}
            </div>
          )}

          {/* GUMBI */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            <button
              type="button"
              onClick={resetForm}
              style={secondaryButtonStyle}
            >
              Prekliči
            </button>

            <button
              type="button"
              onClick={() =>
                void saveUser()
              }
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                opacity: saving ? 0.7 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? "Shranjujem ..."
                : "Shrani"}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          TABELA UPORABNIKOV
      ===================================================== */}

      <div style={tableStyle}>
        {users.map(
          (user, index) => (
            <div
              key={user.id}
              style={{
                ...rowStyle,
                borderBottom:
                  index ===
                  users.length - 1
                    ? "none"
                    : "1px solid #e5e7eb",
              }}
            >
              {/* IME */}

              <div>
                <strong
                  style={{
                    color: "#12344d",
                    fontSize: "14px",
                  }}
                >
                  {user.name}
                </strong>
              </div>

              {/* UPORABNIŠKO IME */}

              <div
                style={{
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {user.username || "—"}
              </div>

              {/* E-MAIL */}

              <div
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {user.email}
              </div>

              {/* VLOGA */}

              <div>
                <span style={badgeStyle}>
                  {user.role === "admin"
                    ? "Administrator"
                    : "Delavec"}
                </span>
              </div>

              {/* STATUS */}

              <div>
                <button
                  type="button"
                  onClick={() =>
                    toggleUserActive(
                      user.id
                    )
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color:
                      user.active
                        ? "#15803d"
                        : "#dc2626",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {user.active
                    ? "Aktiven"
                    : "Neaktiven"}
                </button>
              </div>

              {/* AKCIJE */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedStatisticsUser(
                      user
                    )
                  }
                  style={
                    statisticsButtonStyle
                  }
                >
                  Prikaži statistiko
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startEdit(user)
                  }
                  style={
                    secondaryButtonStyle
                  }
                >
                  Uredi
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleUserActive(
                      user.id
                    )
                  }
                  style={
                    secondaryButtonStyle
                  }
                >
                  {user.active
                    ? "Deaktiviraj"
                    : "Aktiviraj"}
                </button>

                {user.id !== 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Ali želiš izbrisati uporabnika?"
                        )
                      ) {
                        deleteUser(
                          user.id
                        );
                      }
                    }}
                    style={
                      deleteButtonStyle
                    }
                  >
                    Izbriši
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   STILI
========================================================= */

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const titleStyle = {
  margin: 0,
  fontSize: "21px",
  color: "#12344d",
};

const subtitleStyle = {
  margin: "5px 0 0",
  fontSize: "14px",
  color: "#64748b",
};

const panelStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "20px",
  marginBottom: "18px",
};

const tableStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  overflow: "hidden" as const,
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns:
    "1.1fr 1.2fr 1.4fr 170px 100px 250px",
  alignItems: "center",
  gap: "15px",
  padding: "16px 20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: "42px",
  padding: "0 12px",
  border: "1px solid #d1d5db",
  borderRadius: "9px",
  background: "#ffffff",
  fontSize: "14px",
  boxSizing: "border-box" as const,
};

const primaryButtonStyle = {
  height: "42px",
  padding: "0 18px",
  border: "none",
  borderRadius: "9px",
  background: "#1d526b",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  height: "34px",
  padding: "0 10px",
  border: "1px solid #dbe3e8",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

const statisticsButtonStyle = {
  ...secondaryButtonStyle,
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  background: "#eff6ff",
};

const deleteButtonStyle = {
  ...secondaryButtonStyle,
  border: "1px solid #fecaca",
  color: "#dc2626",
};

const errorBoxStyle = {
  marginTop: "14px",
  padding: "10px 12px",
  border: "1px solid #fecaca",
  borderRadius: "9px",
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: "13px",
};

const badgeStyle = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "999px",
  background: "#f1f5f9",
  color: "#475569",
  fontSize: "12px",
  fontWeight: 700,
};

export default AdminUsers;