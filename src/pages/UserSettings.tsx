import {
  useEffect,
  useState,
} from "react";

import {
  Lock,
  User,
  Mail,
  Save,
} from "lucide-react";

import { supabase } from "../services/supabase";

function UserSettings() {
  const [
    userEmail,
    setUserEmail,
  ] = useState("");

  const [
    userName,
    setUserName,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserEmail(
        user.email ?? ""
      );

      setLoading(false);
    };

    void loadUser();
  }, []);

  const handleSave =
    async () => {
      setError("");
      setMessage("");

      if (
        newPassword ||
        confirmPassword
      ) {
        if (
          newPassword.length <
          8
        ) {
          setError(
            "Geslo mora imeti najmanj 8 znakov."
          );
          return;
        }

        if (
          newPassword !==
          confirmPassword
        ) {
          setError(
            "Gesli se ne ujemata."
          );
          return;
        }
      }

      setSaving(true);

      try {
        if (newPassword) {
          const {
            error:
              passwordError,
          } =
            await supabase.auth.updateUser(
              {
                password:
                  newPassword,
              }
            );

          if (
            passwordError
          ) {
            setError(
              passwordError.message
            );
            setSaving(false);
            return;
          }
        }

        setNewPassword("");
        setConfirmPassword("");

        setMessage(
          "Nastavitve so bile uspešno shranjene."
        );
      } catch {
        setError(
          "Nastavitev ni bilo mogoče shraniti."
        );
      }

      setSaving(false);
    };

  if (loading) {
    return (
      <div
        style={{
          padding:
            "40px",
          color:
            "#64748b",
        }}
      >
        Nalaganje nastavitev...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth:
          "760px",
        margin:
          "0 auto",
      }}
    >
      {/* NASLOV */}

      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "14px",
          marginBottom:
            "30px",
        }}
      >
        <div
          style={{
            width:
              "46px",
            height:
              "46px",
            borderRadius:
              "12px",
            background:
              "#e6eef2",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          <User
            size={24}
            color="#17465d"
          />
        </div>

        <div>
          <h1
            style={{
              margin:
                0,
              fontSize:
                "28px",
              fontWeight:
                700,
              color:
                "#17465d",
            }}
          >
            Nastavitve uporabnika
          </h1>

          <p
            style={{
              margin:
                "5px 0 0",
              color:
                "#64748b",
              fontSize:
                "14px",
            }}
          >
            Upravljaj svoje podatke za prijavo v WorkLog.
          </p>
        </div>
      </div>

      {/* OSEBNI PODATKI */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "28px",
          marginBottom:
            "20px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 22px",
            fontSize:
              "18px",
            color:
              "#334155",
          }}
        >
          Podatki uporabnika
        </h2>

        {/* UPORABNIŠKO IME */}

        <div
          style={{
            marginBottom:
              "20px",
          }}
        >
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            Uporabniško ime
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <User
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="text"
              value={
                userName
              }
              onChange={(
                e
              ) =>
                setUserName(
                  e.target.value
                )
              }
              placeholder="Uporabniško ime"
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#334155",
              }}
            />
          </div>
        </div>

        {/* E-POŠTA */}

        <div>
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            E-pošta
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <Mail
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="email"
              value={
                userEmail
              }
              disabled
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#64748b",
                background:
                  "#f8fafc",
              }}
            />
          </div>

          <div
            style={{
              marginTop:
                "7px",
              fontSize:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            E-poštni naslov se uporablja za prijavo in obnovitev gesla.
          </div>
        </div>
      </div>

      {/* GESLO */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "28px",
          marginBottom:
            "20px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 8px",
            fontSize:
              "18px",
            color:
              "#334155",
          }}
        >
          Sprememba gesla
        </h2>

        <p
          style={{
            margin:
              "0 0 22px",
            fontSize:
              "13px",
            color:
              "#64748b",
          }}
        >
          Če želiš spremeniti geslo, vpiši novo geslo in ga potrdi.
        </p>

        {/* NOVO GESLO */}

        <div
          style={{
            marginBottom:
              "20px",
          }}
        >
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            Novo geslo
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <Lock
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="password"
              value={
                newPassword
              }
              onChange={(
                e
              ) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Vpiši novo geslo"
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#334155",
              }}
            />
          </div>
        </div>

        {/* POTRDITEV GESLA */}

        <div>
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            Ponovi novo geslo
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <Lock
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(
                e
              ) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Ponovi novo geslo"
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#334155",
              }}
            />
          </div>

          <div
            style={{
              marginTop:
                "7px",
              fontSize:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            Geslo mora vsebovati najmanj 8 znakov.
          </div>
        </div>
      </div>

      {/* SPOROČILA */}

      {error && (
        <div
          style={{
            marginBottom:
              "15px",
            padding:
              "12px 15px",
            borderRadius:
              "9px",
            background:
              "#fff5f5",
            border:
              "1px solid #fecaca",
            color:
              "#c62828",
            fontSize:
              "14px",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom:
              "15px",
            padding:
              "12px 15px",
            borderRadius:
              "9px",
            background:
              "#f0fdf4",
            border:
              "1px solid #bbf7d0",
            color:
              "#166534",
            fontSize:
              "14px",
          }}
        >
          {message}
        </div>
      )}

      {/* SHRANI */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "flex-end",
        }}
      >
        <button
          onClick={
            handleSave
          }
          disabled={
            saving
          }
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "9px",
            padding:
              "12px 20px",
            border:
              "none",
            borderRadius:
              "9px",
            background:
              saving
                ? "#94a3b8"
                : "#17465d",
            color:
              "#ffffff",
            fontSize:
              "14px",
            fontWeight:
              600,
            cursor:
              saving
                ? "default"
                : "pointer",
          }}
        >
          <Save size={17} />

          {saving
            ? "Shranjevanje..."
            : "Shrani spremembe"}
        </button>
      </div>
    </div>
  );
}

export default UserSettings;