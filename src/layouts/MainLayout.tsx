import {
  useEffect,
  type ReactNode,
} from "react";

import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  useAdmin,
} from "../context/AdminContext";

type Page =
  | "dashboard"
  | "evidenca"
  | "statistika"
  | "pdf"
  | "admin";

type Props = {
  children: ReactNode;

  currentPage: Page;

  onNavigate: (
    page: Page
  ) => void;
};

function MainLayout({
  children,
  currentPage,
  onNavigate,
}: Props) {
  const {
    projects,
  } = useAdmin();

  /*
    ==========================================
    PROJEKTNI AUTOCOMPLETE

    Obstoječemu inputu:

    placeholder="Izberi projekt"

    dodamo HTML datalist.

    Tako WorkOrderCard ni potrebno
    spreminjati.
  */

  useEffect(() => {
    const projectInput =
      document.querySelector<HTMLInputElement>(
        'input[placeholder="Izberi projekt"]'
      );

    if (
      projectInput
    ) {
      projectInput.setAttribute(
        "list",
        "zusta-worklog-projects"
      );
    }
  }, [projects]);

  const activeProjects =
    projects.filter(
      (project) =>
        project.active
    );

  return (
    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        flexDirection:
          "column",

        background:
          "#f5f7f6",
      }}
    >
      <Header />

      <Navbar
        currentPage={
          currentPage
        }
        onNavigate={
          onNavigate
        }
      />

      <main
        style={{
          flex:
            1,

          padding:
            "40px",
        }}
      >
        {children}

        {/* ==================================
            PROJEKTNI SEZNAM
        ================================== */}

        <datalist
          id="zusta-worklog-projects"
        >
          {activeProjects.map(
            (project) => (
              <option
                key={
                  project.id
                }
                value={
                  project.name
                }
              />
            )
          )}
        </datalist>
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;