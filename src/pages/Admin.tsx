import { useState } from "react";

import AdminUsers from "../components/Admin/AdminUsers";
import AdminProjects from "../components/Admin/AdminProjects";
import AdminMachines from "../components/Admin/AdminMachines";
import AdminSettings from "../components/Admin/AdminSettings";

type AdminSection = "users" | "projects" | "machines" | "settings";

function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>("users");

  const sections: { id: AdminSection; title: string }[] = [
    { id: "users", title: "Uporabniki" },
    { id: "projects", title: "Projekti" },
    { id: "machines", title: "Stroji" },
    { id: "settings", title: "Nastavitve" },
  ];

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Administracija</h1>
        <p style={subtitleStyle}>
          Upravljanje uporabnikov, projektov, strojev in nastavitev WorkLoga.
        </p>
      </div>

      <div style={layoutStyle}>
        <aside style={sidebarStyle}>
          <div style={sidebarTitleStyle}>ADMINISTRACIJA</div>
          {sections.map((section) => {
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  ...sidebarButtonStyle,
                  ...(active ? sidebarButtonActiveStyle : {}),
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: active ? "#ffffff" : "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                {section.title}
              </button>
            );
          })}
        </aside>

        <main style={contentStyle}>
          {activeSection === "users" && <AdminUsers />}
          {activeSection === "projects" && <AdminProjects />}
          {activeSection === "machines" && <AdminMachines />}
          {activeSection === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}

const pageStyle = {
  width: "100%",
  maxWidth: "1500px",
  margin: "0 auto",
};

const headerStyle = { marginBottom: "25px" };
const titleStyle = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 700,
  color: "#12344d",
};
const subtitleStyle = {
  marginTop: "7px",
  marginBottom: 0,
  fontSize: "15px",
  color: "#64748b",
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "210px minmax(0, 1fr)",
  gap: "24px",
  alignItems: "start",
};

const sidebarStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "10px",
  boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
};

const sidebarTitleStyle = {
  padding: "10px 12px 8px",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "#94a3b8",
};

const sidebarButtonStyle = {
  width: "100%",
  minHeight: "44px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "0 12px",
  marginBottom: "4px",
  border: "1px solid transparent",
  borderRadius: "9px",
  background: "transparent",
  color: "#334155",
  fontSize: "14px",
  fontWeight: 600,
  textAlign: "left" as const,
  cursor: "pointer",
};

const sidebarButtonActiveStyle = {
  background: "#1d526b",
  color: "#ffffff",
  boxShadow: "0 4px 10px rgba(29,82,107,0.18)",
};

const contentStyle = {
  minWidth: 0,
};

export default Admin;
