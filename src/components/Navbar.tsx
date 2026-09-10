import {
  ClipboardList,
  Clock3,
  BarChart3,
  FileText,
  FolderKanban,
  Settings,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import {
  useAdmin,
} from "../context/AdminContext";

type Page =
  | "dashboard"
  | "evidenca"
  | "statistika"
  | "pdf"
  | "projects"
  | "admin";

type NavbarProps = {
  currentPage: Page;

  onNavigate: (
    page: Page
  ) => void;
};

function Navbar({
  currentPage,
  onNavigate,
}: NavbarProps) {
  const {
    users,
  } = useAdmin();

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false);

  /* =====================================================
     PREVERI VLOGO
  ===================================================== */

  useEffect(() => {
    const checkUserRole =
      async () => {
        const {
          data,
        } =
          await supabase.auth.getUser();

        const email =
          data.user?.email;

        if (!email) {
          setIsAdmin(false);

          return;
        }

        const currentUser =
          users.find(
            (
              user
            ) =>
              user.email
                .toLowerCase() ===
              email
                .toLowerCase()
          );

        setIsAdmin(
          currentUser?.role ===
            "admin"
        );
      };

    void checkUserRole();
  }, [users]);

  /* =====================================================
     ZAVIHKI
  ===================================================== */

  const items = [
    {
      icon:
        <ClipboardList
          size={20}
        />,

      text:
        "Delovni nalogi",

      page:
        "dashboard" as const,
    },

    {
      icon:
        <Clock3
          size={20}
        />,

      text:
        "Evidenca",

      page:
        "evidenca" as const,
    },

    {
      icon:
        <BarChart3
          size={20}
        />,

      text:
        "Statistika",

      page:
        "statistika" as const,
    },

    {
      icon:
        <FileText
          size={20}
        />,

      text:
        "PDF",

      page:
        "pdf" as const,
    },

    {
      icon:
        <FolderKanban
          size={20}
        />,

      text:
        "PROJEKTI",

      page:
        "projects" as const,
    },

    ...(isAdmin
      ? [
          {
            icon:
              <Settings
                size={20}
              />,

            text:
              "Administracija",

            page:
              "admin" as const,
          },
        ]
      : []),
  ];

  return (
    <nav
      style={{
        height:
          "62px",

        background:
          "#1d526b",

        display:
          "flex",

        alignItems:
          "center",

        padding:
          "0 35px",

        gap:
          "10px",

        boxSizing:
          "border-box",

        transform:
          "translateY(-22px)",
      }}
    >
      {items.map(
        (
          item
        ) => {
          const active =
            currentPage ===
            item.page;

          return (
            <div
              key={
                item.text
              }
              onClick={() =>
                onNavigate(
                  item.page
                )
              }
              style={{
                height:
                  "62px",

                padding:
                  "0 18px",

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "9px",

                color:
                  active
                    ? "#17465d"
                    : "#ffffff",

                cursor:
                  "pointer",

                fontWeight:
                  600,

                fontSize:
                  "16px",

                boxSizing:
                  "border-box",

                background:
                  active
                    ? "#ffffff"
                    : "transparent",

                borderBottom:
                  active
                    ? "3px solid #17465d"
                    : "3px solid transparent",

                transition:
                  "all 0.15s ease",
              }}
            >
              {
                item.icon
              }

              <span>
                {
                  item.text
                }
              </span>
            </div>
          );
        }
      )}
    </nav>
  );
}

export default Navbar;