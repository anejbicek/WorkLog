import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  useAdmin,
  type AdminUser,
  type UserRole,
} from "../../context/AdminContext";

import { supabase } from "../../services/supabase";

import AdminUserStatistics from "./AdminUserStatistics";

function AdminUsers() {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    linkUserAuthId,
  } = useAdmin();

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] =
    useState<AdminUser | null>(
      null
    );

  const [
    selectedStatisticsUser,
    setSelectedStatisticsUser,
  ] =
    useState<AdminUser | null>(
      null
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    authUserId,
    setAuthUserId,
  ] = useState("");

  const [
    role,
    setRole,
  ] =
    useState<UserRole>(
      "worker"
    );

  const [
    active,
    setActive,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  /* =========================================================
     SAMODEJNA POVEZAVA S SUPABASE UPORABNIKOM
  ========================================================= */

  useEffect(() => {
    const connectCurrentUser =
      async () => {
        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (
          error ||
          !data.user
        ) {
          return;
        }

        const currentEmail =
          data.user.email;

        if (!currentEmail) {
          return;
        }

        const existingUser =
          users.find(
            (user) =>
              user.email.toLowerCase() ===
              currentEmail.toLowerCase()
          );

        if (
          existingUser &&
          existingUser.authUserId !==
            data.user.id
        ) {
          linkUserAuthId(
            currentEmail,
            data.user.id
          );
        }
      };

    connectCurrentUser();
  }, [
    users,
    linkUserAuthId,
  ]);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm =
    () => {
      setName("");
      setEmail("");
      setPassword("");
      setAuthUserId("");
      setRole("worker");
      setActive(true);
      setFormError("");
      setSaving(false);

      setShowForm(false);
      setEditingUser(null);
    };

  /* =========================================================
     UREDI UPORABNIKA
  ========================================================= */

  const startEdit = (
    user: AdminUser
  ) => {
    setEditingUser(
      user
    );

    setName(
      user.name
    );

    setEmail(
      user.email
    );

    setPassword("");

    setAuthUserId(
      user.authUserId ?? ""
    );

    setRole(
      user.role
    );

    setActive(
      user.active
    );

    setFormError("");

    setShowForm(true);
  };

  /* =========================================================
     SHRANI UPORABNIKA
  ========================================================= */

  const saveUser =
    async () => {
      setFormError("");

      if (
        !name.trim() ||
        !email.trim()
      ) {
        setFormError(
          "Ime in e-poštni naslov sta obvezna."
        );

        return;
      }

      /* =====================================================
         UREJANJE OBSTOJEČEGA UPORABNIKA
      ===================================================== */

      if (editingUser) {
        const userData: Omit<
          AdminUser,
          "id"
        > = {
          name:
            name.trim(),

          email:
            email.trim(),

          authUserId:
            authUserId.trim() ||
            undefined,

          role,

          active,
        };

        updateUser(
          editingUser.id,
          userData
        );

        resetForm();

        return;
      }

      /* =====================================================
         NOV UPORABNIK
      ===================================================== */

      if (!password) {
        setFormError(
          "Za novega uporabnika moraš vnesti geslo."
        );

        return;
      }

      if (
        password.length < 6
      ) {
        setFormError(
          "Geslo mora vsebovati najmanj 6 znakov."
        );

        return;
      }

      setSaving(true);

      try {
        /* ===================================================
           USTVARI SUPABASE AUTH UPORABNIKA
        =================================================== */

        const {
          data,
          error,
        } =
          await supabase.functions.invoke(
            "create-user",
            {
              body: {
                name:
                  name.trim(),

                email:
                  email.trim(),

                password,
              },
            }
          );

        if (error) {
          let message =
            error.message ||
            "Uporabnika ni bilo mogoče ustvariti.";

          try {
            const context =
              (
                error as {
                  context?: Response;
                }
              ).context;

            if (context) {
              const responseData =
                await context.json();

              if (
                responseData?.error
              ) {
                message =
                  responseData.error;
              }
            }
          } catch {
            // Uporabi osnovno sporočilo napake.
          }

          setFormError(
            message
          );

          return;
        }

        if (
          !data?.success ||
          !data?.user?.id
        ) {
          setFormError(
            "Supabase uporabnik ni bil pravilno ustvarjen."
          );

          return;
        }

        /* ===================================================
           DODAJ UPORABNIKA V WORKLOG
        =================================================== */

        const userData: Omit<
          AdminUser,
          "id"
        > = {
          name:
            name.trim(),

          email:
            email.trim(),

          authUserId:
            data.user.id,

          role,

          active,
        };

        addUser(
          userData
        );

        resetForm();
      } catch (error) {
        console.error(
          "Napaka pri ustvarjanju uporabnika:",
          error
        );

        setFormError(
          "Pri ustvarjanju uporabnika je prišlo do napake."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================================================
     STATISTIKA UPORABNIKA
  ========================================================= */

  if (
    selectedStatisticsUser
  ) {
    return (
      <AdminUserStatistics
        userName={
          selectedStatisticsUser.name
        }
        authUserId={
          selectedStatisticsUser.authUserId
        }
        onBack={() =>
          setSelectedStatisticsUser(
            null
          )
        }
      />
    );
  }

  return (
    <div>
      {/* =====================================================
          GLAVA
      ===================================================== */}

      <div
        style={
          headerStyle
        }
      >
        <div>
          <h2
            style={
              titleStyle
            }
          >
            Uporabniki
          </h2>

          <p
            style={
              subtitleStyle
            }
          >
            Upravljaj uporabniške
            račune in njihove
            pravice.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={
            primaryButtonStyle
          }
        >
          + Dodaj uporabnika
        </button>
      </div>

      {/* =====================================================
          OBRAZEC
      ===================================================== */}

      {showForm && (
        <div
          style={
            panelStyle
          }
        >
          <h3
            style={{
              margin:
                "0 0 18px",
              color:
                "#12344d",
              fontSize:
                "17px",
            }}
          >
            {editingUser
              ? "Uredi uporabnika"
              : "Nov uporabnik"}
          </h3>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                editingUser
                  ? "1fr 1fr 1fr 180px 150px"
                  : "1fr 1fr 1fr 180px 150px",
              gap: "12px",
            }}
          >
            {/* IME */}

            <Field label="Ime in priimek">
              <input
                value={
                  name
                }
                onChange={(
                  event
                ) =>
                  setName(
                    event.target
                      .value
                  )
                }
                placeholder="Ime in priimek"
                style={
                  inputStyle
                }
              />
            </Field>

            {/* E-POŠTA */}

            <Field label="E-naslov">
              <input
                type="email"
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target
                      .value
                  )
                }
                placeholder="E-naslov"
                style={
                  inputStyle
                }
              />
            </Field>

            {/* GESLO */}

            {!editingUser ? (
              <Field label="Začetno geslo">
                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  placeholder="Najmanj 6 znakov"
                  style={
                    inputStyle
                  }
                />
              </Field>
            ) : (
              <Field label="Supabase User ID">
                <input
                  value={
                    authUserId
                  }
                  readOnly
                  placeholder="UUID uporabnika"
                  style={{
                    ...inputStyle,
                    background:
                      "#f8fafc",
                    color:
                      "#64748b",
                  }}
                />
              </Field>
            )}

            {/* VLOGA */}

            <Field label="Vloga">
              <select
                value={
                  role
                }
                onChange={(
                  event
                ) =>
                  setRole(
                    event.target
                      .value as UserRole
                  )
                }
                style={
                  inputStyle
                }
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
                onChange={(
                  event
                ) =>
                  setActive(
                    event.target
                      .value ===
                      "active"
                  )
                }
                style={
                  inputStyle
                }
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

          {/* POMOČNO BESEDILO */}

          <div
            style={{
              marginTop:
                "8px",
              color:
                "#64748b",
              fontSize:
                "12px",
            }}
          >
            {editingUser
              ? "Supabase User ID je UUID uporabnika iz Supabase Authentication."
              : "Začetno geslo bo uporabljeno za prvo prijavo uporabnika."}
          </div>

          {/* NAPAKA */}

          {formError && (
            <div
              style={{
                marginTop:
                  "14px",
                padding:
                  "11px 14px",
                borderRadius:
                  "10px",
                background:
                  "#fff1f1",
                border:
                  "1px solid #ffd0d0",
                color:
                  "#c62828",
                fontSize:
                  "14px",
              }}
            >
              {formError}
            </div>
          )}

          {/* GUMBI */}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "flex-end",
              gap: "10px",
              marginTop:
                "18px",
            }}
          >
            <button
              type="button"
              onClick={
                resetForm
              }
              disabled={
                saving
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
              onClick={
                saveUser
              }
              disabled={
                saving
              }
              style={{
                ...primaryButtonStyle,
                opacity:
                  saving
                    ? 0.7
                    : 1,
                cursor:
                  saving
                    ? "default"
                    : "pointer",
              }}
            >
              {saving
                ? "Ustvarjanje..."
                : "Shrani"}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          TABELA UPORABNIKOV
      ===================================================== */}

      <div
        style={
          tableStyle
        }
      >
        {users.map(
          (
            user,
            index
          ) => (
            <div
              key={
                user.id
              }
              style={{
                ...rowStyle,

                borderBottom:
                  index ===
                  users.length -
                    1
                    ? "none"
                    : "1px solid #e5e7eb",
              }}
            >
              {/* IME */}

              <div>
                <strong
                  style={{
                    color:
                      "#12344d",
                    fontSize:
                      "14px",
                  }}
                >
                  {
                    user.name
                  }
                </strong>
              </div>

              {/* E-MAIL */}

              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "14px",
                }}
              >
                {
                  user.email
                }
              </div>

              {/* VLOGA */}

              <div>
                <span
                  style={
                    badgeStyle
                  }
                >
                  {user.role ===
                  "admin"
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
                    border:
                      "none",
                    background:
                      "transparent",
                    color:
                      user.active
                        ? "#15803d"
                        : "#dc2626",
                    fontWeight:
                      600,
                    cursor:
                      "pointer",
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
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: "8px",
                  flexWrap:
                    "wrap",
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
                    startEdit(
                      user
                    )
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

                {user.id !==
                  1 && (
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
      <label
        style={
          labelStyle
        }
      >
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
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom:
    "18px",
};

const titleStyle = {
  margin: 0,
  fontSize: "21px",
  color: "#12344d",
};

const subtitleStyle = {
  margin:
    "5px 0 0",
  fontSize: "14px",
  color: "#64748b",
};

const panelStyle = {
  background:
    "#ffffff",
  border:
    "1px solid #e5e7eb",
  borderRadius:
    "14px",
  padding: "20px",
  marginBottom:
    "18px",
};

const tableStyle = {
  background:
    "#ffffff",
  border:
    "1px solid #e5e7eb",
  borderRadius:
    "14px",
  overflow:
    "hidden" as const,
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns:
    "1.2fr 1.5fr 170px 100px 250px",
  alignItems:
    "center",
  gap: "15px",
  padding:
    "16px 20px",
};

const labelStyle = {
  display: "block",
  marginBottom:
    "7px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: "42px",
  padding:
    "0 12px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "9px",
  background:
    "#ffffff",
  fontSize: "14px",
  boxSizing:
    "border-box" as const,
};

const primaryButtonStyle = {
  height: "42px",
  padding:
    "0 18px",
  border: "none",
  borderRadius:
    "9px",
  background:
    "#1d526b",
  color:
    "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  cursor:
    "pointer",
};

const secondaryButtonStyle = {
  height: "34px",
  padding:
    "0 10px",
  border:
    "1px solid #dbe3e8",
  borderRadius:
    "8px",
  background:
    "#ffffff",
  color:
    "#334155",
  fontSize: "12px",
  fontWeight: 600,
  cursor:
    "pointer",
};

const statisticsButtonStyle = {
  ...secondaryButtonStyle,
  border:
    "1px solid #bfdbfe",
  color:
    "#1d4ed8",
  background:
    "#eff6ff",
};

const deleteButtonStyle = {
  ...secondaryButtonStyle,
  border:
    "1px solid #fecaca",
  color:
    "#dc2626",
};

const badgeStyle = {
  display:
    "inline-block",
  padding:
    "5px 10px",
  borderRadius:
    "999px",
  background:
    "#f1f5f9",
  color:
    "#475569",
  fontSize: "12px",
  fontWeight: 700,
};

export default AdminUsers;