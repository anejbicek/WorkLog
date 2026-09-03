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
import Projects from "./pages/Projects";

import { supabase } from "./services/supabase";

import {
  useAdmin,
} from "./context/AdminContext";

export type Page =
  | "dashboard"
  | "evidenca"
  | "statistika"
  | "pdf"
  | "projects"
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
     PREVERI SEJO
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

        if (
          session?.user?.email
        ) {
          const currentUser =
            users.find(
              (
                user
              ) =>
                user.email
                  .toLowerCase() ===
                session.user.email!
                  .toLowerCase()
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

    void checkSession();

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

          if (
            session?.user?.email
          ) {
            const currentUser =
              users.find(
                (
                  user
                ) =>
                  user.email
                    .toLowerCase() ===
                  session.user.email!
                    .toLowerCase()
              );

            setIsAdmin(
              currentUser?.role ===
                "admin"
            );
          } else {
            setIsAdmin(false);
          }

          if (
            session &&
            !users.some(
              (
                user
              ) =>
                user.email
                  .toLowerCase() ===
                  session.user.email!
                    .toLowerCase() &&
                user.role ===
                  "admin"
            )
          ) {
            setCurrentPage(
              (
                page
              ) =>
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
     ADMIN ZAŠČITA
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

  if (
    checkingSession
  ) {
    return null;
  }

  /* =====================================================
     LOGIN
  ===================================================== */

  if (
    !isLoggedIn
  ) {
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
        "projects" && (
        <Projects />
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