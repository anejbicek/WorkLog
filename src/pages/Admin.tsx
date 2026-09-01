import { useState } from "react";

import AdminUsers from "../components/Admin/AdminUsers";
import AdminProjects from "../components/Admin/AdminProjects";
import AdminMachines from "../components/Admin/AdminMachines";
import AdminSettings from "../components/Admin/AdminSettings";

type AdminTab =
  | "users"
  | "projects"
  | "machines"
  | "settings";

function Admin() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<AdminTab>(
      "users"
    );

  const tabs = [
    {
      id: "users" as const,
      title: "Uporabniki",
    },
    {
      id: "projects" as const,
      title: "Projekti",
    },
    {
      id: "machines" as const,
      title: "Stroji",
    },
    {
      id: "settings" as const,
      title: "Nastavitve",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth:
          "1080px",
        margin:
          "0 auto",
      }}
    >
      <div
        style={{
          marginBottom:
            "25px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize:
              "30px",
            fontWeight:
              700,
            color:
              "#12344d",
          }}
        >
          Administracija
        </h1>

        <p
          style={{
            marginTop:
              "7px",
            marginBottom:
              0,
            fontSize:
              "15px",
            color:
              "#64748b",
          }}
        >
          Upravljanje
          uporabnikov,
          projektov,
          strojev in
          nastavitev
          WorkLoga.
        </p>
      </div>

      <div
        style={{
          display:
            "flex",
          gap: "10px",
          marginBottom:
            "25px",
          borderBottom:
            "1px solid #e2e8f0",
          paddingBottom:
            "10px",
        }}
      >
        {tabs.map(
          (tab) => {
            const active =
              activeTab ===
              tab.id;

            return (
              <button
                key={
                  tab.id
                }
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
                style={{
                  padding:
                    "11px 18px",
                  borderRadius:
                    "9px",
                  border:
                    active
                      ? "1px solid #1d526b"
                      : "1px solid #dbe3e8",
                  background:
                    active
                      ? "#1d526b"
                      : "#ffffff",
                  color:
                    active
                      ? "#ffffff"
                      : "#334155",
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                  cursor:
                    "pointer",
                }}
              >
                {
                  tab.title
                }
              </button>
            );
          }
        )}
      </div>

      {activeTab ===
        "users" && (
        <AdminUsers />
      )}

      {activeTab ===
        "projects" && (
        <AdminProjects />
      )}

      {activeTab ===
        "machines" && (
        <AdminMachines />
      )}

      {activeTab ===
        "settings" && (
        <AdminSettings />
      )}
    </div>
  );
}

export default Admin;