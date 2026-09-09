import { useState } from "react";

import Logo from "../components/Logo";

import { supabase } from "../services/supabase";

import { useAdmin } from "../context/AdminContext";

type LoginProps = {
  onLogin: () => void;
};

function Login({
  onLogin,
}: LoginProps) {
  const {
    linkUserAuthId,
  } = useAdmin();

  const [
    loginValue,
    setLoginValue,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resetMode,
    setResetMode,
  ] = useState(false);

  const [
    resetLoading,
    setResetLoading,
  ] = useState(false);

  const [
    resetMessage,
    setResetMessage,
  ] = useState("");

  const handleLogin =
    async () => {
      setError("");

      const trimmedLogin =
        loginValue.trim().toLowerCase();

      if (
        !trimmedLogin ||
        !password
      ) {
        setError(
          "Vnesite uporabniško ime ali email ter geslo."
        );

        return;
      }

      if (
        password.length < 4
      ) {
        setError(
          "Geslo mora vsebovati najmanj 4 znake."
        );

        return;
      }

      setLoading(true);

      try {
        let email =
          trimmedLogin;

        /*
         * Če je uporabnik vnesel uporabniško ime,
         * poiščemo njegov email preko RPC funkcije.
         *
         * Če je uporabnik vnesel email,
         * ga uporabimo neposredno za Supabase Auth.
         */
        if (
          !trimmedLogin.includes("@")
        ) {
          /* =====================================================
             POIŠČI E-POŠTO UPORABNIKA
          ===================================================== */

          const {
            data: loginEmail,
            error: lookupError,
          } = await supabase.rpc(
            "get_login_email",
            {
              login_value:
                trimmedLogin,
            }
          );

          if (
            lookupError ||
            !loginEmail
          ) {
            setError(
              "Napačno uporabniško ime, email ali geslo."
            );

            setLoading(false);

            return;
          }

          email =
            String(loginEmail);
        }

        /* =====================================================
           PRIJAVA V SUPABASE AUTH
        ===================================================== */

        const {
          data,
          error: loginError,
        } =
          await supabase.auth.signInWithPassword(
            {
              email,
              password,
            }
          );

        if (loginError) {
          setError(
            "Napačno uporabniško ime, email ali geslo."
          );

          setLoading(false);

          return;
        }

        /* =====================================================
           POVEŽI PRIJAVLJENEGA UPORABNIKA
           Z WORKLOG UPORABNIKOM
        ===================================================== */

        if (data.user) {
          linkUserAuthId(
            data.user.email ??
              email,
            data.user.id
          );
        }

        setLoading(false);

        onLogin();
      } catch (
        loginException
      ) {
        console.error(
          "Napaka pri prijavi:",
          loginException
        );

        setError(
          "Prijava ni uspela. Poskusite ponovno."
        );

        setLoading(false);
      }
    };

  /* ===========================================================
     POZABLJENO GESLO
  =========================================================== */

  const handleForgotPassword =
    async () => {
      setError("");
      setResetMessage("");

      const trimmedLogin =
        loginValue.trim().toLowerCase();

      if (!trimmedLogin) {
        setError(
          "Vnesite uporabniško ime ali email."
        );

        return;
      }

      setResetLoading(true);

      try {
        let email =
          trimmedLogin;

        /*
         * Če je uporabnik vnesel uporabniško ime,
         * poiščemo njegov email preko iste RPC funkcije
         * kot pri običajni prijavi.
         */
        if (
          !trimmedLogin.includes("@")
        ) {
          const {
            data: loginEmail,
            error: lookupError,
          } = await supabase.rpc(
            "get_login_email",
            {
              login_value:
                trimmedLogin,
            }
          );

          if (
            lookupError ||
            !loginEmail
          ) {
            setError(
              "Uporabniško ime ali email ni najden."
            );

            setResetLoading(false);

            return;
          }

          email =
            String(loginEmail);
        }

        /* =====================================================
           POŠLJI RESET POVEZAVO
        ===================================================== */

        const {
          error: resetError,
        } =
          await supabase.auth.resetPasswordForEmail(
            email,
            {
              redirectTo:
                `${window.location.origin}/`,
            }
          );

        if (resetError) {
          console.error(
            "Napaka pri ponastavitvi gesla:",
            resetError
          );

          setError(
            "E-pošte za ponastavitev gesla ni bilo mogoče poslati."
          );

          setResetLoading(false);

          return;
        }

        setResetMessage(
          "Povezava za ponastavitev gesla je bila poslana na vaš email."
        );

        setResetLoading(false);
      } catch (
        resetException
      ) {
        console.error(
          "Napaka pri ponastavitvi gesla:",
          resetException
        );

        setError(
          "Ponastavitev gesla ni uspela. Poskusite ponovno."
        );

        setResetLoading(false);
      }
    };

  /* ===========================================================
     NAZAJ NA PRIJAVO
  =========================================================== */

  const handleBackToLogin =
    () => {
      setResetMode(false);
      setError("");
      setResetMessage("");
      setPassword("");
    };

  return (
    <div
      className="login-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent:
          "center",
        alignItems: "center",

        backgroundColor:
          "#f5f8f5",

        backgroundImage: `
          radial-gradient(
            circle at top left,
            rgba(212,230,220,.75),
            transparent 42%
          ),
          radial-gradient(
            circle at bottom right,
            rgba(198,226,208,.75),
            transparent 42%
          ),
          repeating-linear-gradient(
            -28deg,
            rgba(255,255,255,.22) 0px,
            rgba(255,255,255,.22) 2px,
            transparent 2px,
            transparent 30px
          )
        `,
      }}
    >
      <div
        className="login-card"
        style={{
          width: 560,
          background:
            "#ffffff",
          borderRadius: 30,
          padding: 60,
          boxShadow:
            "0 25px 70px rgba(30,60,45,.12)",
          textAlign:
            "center",
        }}
      >
        {/* LOGO */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            marginBottom: 15,
          }}
        >
          <Logo />
        </div>

        {/* NASLOV */}

        <p
          style={{
            fontSize: 24,
            color: "#6f7d75",
            marginBottom: 40,
            fontWeight: 500,
          }}
        >
          WorkLog
        </p>

        {/* E-POŠTA ALI UPORABNIŠKO IME */}

        <label
          style={{
            display: "block",
            textAlign:
              "left",
            marginBottom: 8,
            fontWeight: 600,
            color: "#4c5c54",
          }}
        >
          Uporabniško ime ali email
        </label>

        <input
          type="text"
          value={
            loginValue
          }
          onChange={(
            event
          ) =>
            setLoginValue(
              event.target.value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Enter"
            ) {
              if (
                resetMode
              ) {
                void handleForgotPassword();
              } else {
                void handleLogin();
              }
            }
          }}
          placeholder="Vnesite uporabniško ime ali email"
          autoComplete="username"
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 12,
            border:
              "1px solid #d9e5de",
            fontSize: 15,
            marginBottom:
              resetMode
                ? 24
                : 16,
            boxSizing:
              "border-box",
            outline: "none",
          }}
        />

        {/* =====================================================
           OBIČAJNA PRIJAVA
        ===================================================== */}

        {!resetMode && (
          <>
            {/* GESLO */}

            <label
              style={{
                display: "block",
                textAlign:
                  "left",
                marginBottom: 8,
                fontWeight: 600,
                color: "#4c5c54",
              }}
            >
              Geslo
            </label>

            <input
              type="password"
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  void handleLogin();
                }
              }}
              placeholder="Vnesite geslo"
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: 12,
                border:
                  "1px solid #d9e5de",
                fontSize: 15,
                boxSizing:
                  "border-box",
                outline: "none",
              }}
            />

            {/* POZABLJENO GESLO */}

            <div
              style={{
                textAlign:
                  "right",
                marginTop: 10,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setResetMode(true);
                  setError("");
                  setResetMessage("");
                  setPassword("");
                }}
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color:
                    "#17465d",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor:
                    "pointer",
                  padding: 0,
                }}
              >
                Pozabljeno geslo?
              </button>
            </div>
          </>
        )}

        {/* =====================================================
           RESET GESLA
        ===================================================== */}

        {resetMode && (
          <div
            style={{
              textAlign:
                "left",
              color:
                "#6f7d75",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Vnesite uporabniško ime ali email in poslali vam bomo
            povezavo za ponastavitev gesla.
          </div>
        )}

        {/* USPEŠNO POSLAN RESET EMAIL */}

        {resetMessage && (
          <div
            style={{
              marginTop: 18,
              padding:
                "12px 14px",
              borderRadius: 10,
              background:
                "#eef8f1",
              border:
                "1px solid #cce8d4",
              color:
                "#2e6b42",
              fontSize: 14,
              textAlign:
                "left",
              lineHeight: 1.5,
            }}
          >
            {resetMessage}
          </div>
        )}

        {/* NAPAKA */}

        {error && (
          <div
            style={{
              marginTop: 18,
              padding:
                "11px 14px",
              borderRadius: 10,
              background:
                "#fff1f1",
              border:
                "1px solid #ffd0d0",
              color:
                "#c62828",
              fontSize: 14,
              textAlign:
                "left",
            }}
          >
            {error}
          </div>
        )}

        {/* =====================================================
           GUMBI
        ===================================================== */}

        {!resetMode ? (
          <button
            onClick={() =>
              void handleLogin()
            }
            disabled={
              loading
            }
            style={{
              width: "100%",
              marginTop: 35,
              padding: "16px",
              borderRadius: 12,
              border: "none",
              background:
                "#17465d",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading
                ? "default"
                : "pointer",
              opacity: loading
                ? 0.7
                : 1,
            }}
          >
            {loading
              ? "Prijavljanje..."
              : "Prijava"}
          </button>
        ) : (
          <>
            <button
              onClick={() =>
                void handleForgotPassword()
              }
              disabled={
                resetLoading
              }
              style={{
                width: "100%",
                marginTop: 35,
                padding: "16px",
                borderRadius: 12,
                border: "none",
                background:
                  "#17465d",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor:
                  resetLoading
                    ? "default"
                    : "pointer",
                opacity:
                  resetLoading
                    ? 0.7
                    : 1,
              }}
            >
              {resetLoading
                ? "Pošiljanje..."
                : "Pošlji povezavo za ponastavitev"}
            </button>

            <button
              type="button"
              onClick={
                handleBackToLogin
              }
              style={{
                width: "100%",
                marginTop: 12,
                padding: "12px",
                borderRadius: 12,
                border:
                  "1px solid #d9e5de",
                background:
                  "#ffffff",
                color:
                  "#17465d",
                fontSize: 14,
                fontWeight: 500,
                cursor:
                  "pointer",
              }}
            >
              Nazaj na prijavo
            </button>
          </>
        )}

        {/* NOGA */}

        <p
          style={{
            marginTop: 35,
            color: "#99a39e",
            fontSize: 13,
          }}
        >
          © 2026ŽustAI. Vse pravice
          pridržane.
        </p>
      </div>
    </div>
  );
}

export default Login;