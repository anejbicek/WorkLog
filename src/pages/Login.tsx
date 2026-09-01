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
    email,
    setEmail,
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

  const handleLogin =
    async () => {
      setError("");

      if (
        !email ||
        !password
      ) {
        setError(
          "Vnesite e-poštni naslov in geslo."
        );

        return;
      }

      setLoading(true);

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

      setLoading(false);

      if (loginError) {
        setError(
          "Napačen e-poštni naslov ali geslo."
        );

        return;
      }

      /* =====================================================
         POVEŽI PRIJAVLJENEGA UPORABNIKA Z ADMIN UPORABNIKOM
      ===================================================== */

      if (data.user) {
        linkUserAuthId(
          data.user.email ??
            email,
          data.user.id
        );
      }

      onLogin();
    };

  return (
    <div
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

        {/* E-POŠTA */}

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
          E-poštni naslov
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              handleLogin();
            }
          }}
          placeholder="Vnesite e-poštni naslov"
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 12,
            border:
              "1px solid #d9e5de",
            fontSize: 15,
            marginBottom: 24,
            boxSizing:
              "border-box",
            outline: "none",
          }}
        />

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
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              handleLogin();
            }
          }}
          placeholder="Vnesite geslo"
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

        {/* PRIJAVA */}

        <button
          onClick={
            handleLogin
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

        {/* NOGA */}

        <p
          style={{
            marginTop: 35,
            color: "#99a39e",
            fontSize: 13,
          }}
        >
          © 2024 ŽustAI. Vse pravice
          pridržane.
        </p>
      </div>
    </div>
  );
}

export default Login;