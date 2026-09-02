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
import Admin from "./pages/Admin";
import UserSettings from "./pages/UserSettings";

import { supabase } from "./services/supabase";

import { useAdmin } from "./context/AdminContext";

export type Page =
  | "dashboard"
  | "evidenca"
  | "statistika"
  | "pdf"
  | "admin"
  | "settings";

function App() {
  const {
    users,
  } = useAdmin();

  const [
    currentPage,
    setCurrentPage,
  ] = useState<Page>(
    "dashboard"
  );

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false);

  /* =====================================================
     PREVERI SEJO IN VLOGO UPORABNIKA
  ===================================================== */

  useEffect(() => {
    const checkSession =
      async () => {
        const {
          data,
        } =
          await supabase.auth.getSession();

        const session =
          data.session;

        setIsLoggedIn(
          !!session
        );

        /* -----------------------------------------------
           PREVERI VLOGO
        ----------------------------------------------- */

        if (
          session?.user?.email
        ) {
          const currentUser =
            users.find(
              (user) =>
                user.email.toLowerCase() ===
                session.user.email!.toLowerCase()
            );

          setIsAdmin(
            currentUser?.role ===
              "admin"
          );
        } else {
          setIsAdmin(false);
        }

        setCheckingSession(
          false
        );
      };

    checkSession();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          setIsLoggedIn(
            !!session
          );

          if (
            session?.user?.email
          ) {
            const currentUser =
              users.find(
                (user) =>
                  user.email.toLowerCase() ===
                  session.user.email!.toLowerCase()
              );

            setIsAdmin(
              currentUser?.role ===
                "admin"
            );
          } else {
            setIsAdmin(false);
          }

          /* ---------------------------------------------
             Če uporabnik ni administrator,
             ga nikoli ne pustimo na admin strani.
          --------------------------------------------- */

          if (
            session &&
            !users.some(
              (user) =>
                user.email.toLowerCase() ===
                  session.user.email!.toLowerCase() &&
                user.role ===
                  "admin"
            )
          ) {
            setCurrentPage(
              (page) =>
                page ===
                "admin"
                  ? "dashboard"
                  : page
            );
          }
        }
      );

    return () => {
      authListener
        .subscription
        .unsubscribe();
    };
  }, [users]);

  /* =====================================================
     PREPREČI DOSTOP DO ADMIN STRANI
  ===================================================== */

  useEffect(() => {
    if (
      currentPage ===
        "admin" &&
      !isAdmin
    ) {
      setCurrentPage(
        "dashboard"
      );
    }
  }, [
    currentPage,
    isAdmin,
  ]);

  /* =====================================================
     PREVERJANJE SEJE
  ===================================================== */

  if (checkingSession) {
    return null;
  }

  /* =====================================================
     NI PRIJAVLJEN
  ===================================================== */

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() =>
          setIsLoggedIn(
            true
          )
        }
      />
    );
  }

  /* =====================================================
     APLIKACIJA
  ===================================================== */

  return (
    <MainLayout
      currentPage={
        currentPage
      }
      onNavigate={(
        page
      ) => {
        /* -----------------------------------------------
           DODATNA ZAŠČITA ADMINISTRACIJE
        ----------------------------------------------- */

        if (
          page ===
            "admin" &&
          !isAdmin
        ) {
          return;
        }

        setCurrentPage(
          page
        );
      }}
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

      {currentPage ===
        "pdf" && (
        <PDF />
      )}

      {currentPage ===
        "admin" &&
        isAdmin && (
          <Admin />
        )}

      {currentPage ===
        "settings" && (
        <UserSettings />
      )}
    </MainLayout>
  );
}

export default App;