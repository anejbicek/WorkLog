import type { ReactNode } from "react";

import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Page =
  | "dashboard"
  | "evidenca"
  | "statistika"
  | "pdf";

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
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f7f6",
      }}
    >
      <Header />

      <Navbar
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <main
        style={{
          flex: 1,
          padding: "40px",
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;