import {
  useEffect,
  useState,
} from "react";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Evidenca from "./pages/Evidenca";
import Statistika from "./pages/Statistika";
import PDF from "./pages/PDF";
import Login from "./pages/Login";

import { supabase } from "./services/supabase";

type Page =
  | "dashboard"
  | "evidenca"
  | "statistika"
  | "pdf";

function App() {
  const [
    currentPage,
    setCurrentPage,
  ] = useState<Page>("dashboard");

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  /* =========================================
     PREVERI, ALI JE UPORABNIK ŽE PRIJAVLJEN
  ========================================= */

  useEffect(() => {
    const checkSession =
      async () => {
        const {
          data,
        } = await supabase.auth.getSession();

        setIsLoggedIn(
          !!data.session
        );

        setCheckingSession(false);
      };

    checkSession();

    /* =======================================
       SPREMLJANJE SPREMEMB PRIJAVE
    ======================================= */

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          setIsLoggedIn(
            !!session
          );
        }
      );

    return () => {
      authListener
        .subscription
        .unsubscribe();
    };
  }, []);

  /* =========================================
     PREVERJANJE SEJE
  ========================================= */

  if (checkingSession) {
    return null;
  }

  /* =========================================
     LOGIN
  ========================================= */

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() =>
          setIsLoggedIn(true)
        }
      />
    );
  }

  /* =========================================
     WORKLOG
  ========================================= */

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {currentPage ===
        "dashboard" && (
        <Dashboard />
      )}

      {currentPage ===
        "evidenca" && (
        <Evidenca />
      )}

      {currentPage ===
        "statistika" && (
        <Statistika />
      )}

      {currentPage === "pdf" && (
        <PDF />
      )}
    </MainLayout>
  );
}

export default App;