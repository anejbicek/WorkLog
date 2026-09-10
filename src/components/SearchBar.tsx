import { useEffect, useMemo, useRef, useState } from "react";
import { Search, FolderKanban, User, Cog, ClipboardList } from "lucide-react";

import { useAdmin, type AdminProject } from "../context/AdminContext";
import { useWorkOrders } from "../context/WorkOrderContext";
import { supabase } from "../services/supabase";
import type { Page } from "../App";

type SearchBarProps = {
  onNavigate: (page: Page) => void;
};

type SearchResult = {
  id: string;
  type: "project" | "user" | "machine" | "workorder";
  title: string;
  subtitle: string;
  page:Page;
};

function SearchBar({ onNavigate }: SearchBarProps) {
  const { projects, users, machines } = useAdmin();
  const { workOrders, allWorkOrders } = useWorkOrders();

  const [query, setQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user?.email) {
        setIsAdmin(false);
        return;
      }

      const currentUser = users.find(
        (item) =>
          item.email.toLowerCase() ===
          user.email!.toLowerCase()
      );

      setIsAdmin(currentUser?.role === "admin");
    };

    void loadRole();

    return () => {
      cancelled = true;
    };
  }, [users]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
      return [];
    }

    const matches = (values: Array<string | number | undefined>) =>
      values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedQuery)
      );

    const projectResults: SearchResult[] = projects
      .filter((project) => {
        const typedProject = project as AdminProject & {
          projectNumber?: number;
          archived?: boolean;
        };

        return matches([
          typedProject.name,
          typedProject.id,
          typedProject.serialNumber,
          typedProject.projectNumber,
        ]);
      })
      .slice(0, 5)
      .map((project) => {
        const typedProject = project as AdminProject & {
          projectNumber?: number;
          archived?: boolean;
        };

        const projectNumber =
          typedProject.projectNumber ?? typedProject.id;

        return {
          id: `project-${project.id}`,
          type: "project",
          title: `Projekt #${projectNumber} – ${project.name}`,
          subtitle: typedProject.archived
            ? "Arhiviran projekt"
            : typedProject.status === "completed"
              ? "Zaključen projekt"
              : "Projekt",
          page: "projects",
        };
      });

    const machineResults: SearchResult[] = isAdmin
      ? machines
          .filter((machine) =>
            matches([machine.name, machine.id])
          )
          .slice(0, 5)
          .map((machine) => ({
            id: `machine-${machine.id}`,
            type: "machine",
            title: machine.name,
            subtitle: "Stroj",
            page: "admin",
          }))
      : [];

    const userResults: SearchResult[] = isAdmin
      ? users
          .filter((user) =>
            matches([
              user.name,
              user.username,
              user.email,
              user.id,
            ])
          )
          .slice(0, 5)
          .map((user) => ({
            id: `user-${user.id}`,
            type: "user",
            title: user.name,
            subtitle: `Uporabnik · ${user.username}`,
            page: "admin",
          }))
      : [];

    const visibleWorkOrders = isAdmin ? allWorkOrders : workOrders;

    const workOrderResults: SearchResult[] = visibleWorkOrders
      .filter((workOrder) =>
        matches([
          workOrder.id,
          workOrder.project,
          workOrder.machine,
          workOrder.date,
          workOrder.note,
        ])
      )
      .slice(0, 5)
      .map((workOrder) => ({
        id: `workorder-${workOrder.id}`,
        type: "workorder",
        title: `Delovni nalog #${workOrder.id}`,
        subtitle: `${workOrder.project || "Brez projekta"} · ${workOrder.date}`,
        page: "evidenca",
      }));

    return [
      ...projectResults,
      ...userResults,
      ...machineResults,
      ...workOrderResults,
    ].slice(0, 10);
  }, [
    allWorkOrders,
    isAdmin,
    machines,
    projects,
    query,
    users,
    workOrders,
  ]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    onNavigate(result.page);
  };

  const getIcon = (type: SearchResult["type"]) => {
    if (type === "project") {
      return <FolderKanban size={17} color="#17465d" />;
    }

    if (type === "user") {
      return <User size={17} color="#17465d" />;
    }

    if (type === "machine") {
      return <Cog size={17} color="#17465d" />;
    }

    return <ClipboardList size={17} color="#17465d" />;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "280px",
        height: "42px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          border: open
            ? "1px solid #17465d"
            : "1px solid #d1d5db",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          padding: "0 13px",
          boxSizing: "border-box",
          background: "#ffffff",
        }}
      >
        <Search size={19} color="#64748b" />

        <input
          type="text"
          value={query}
          placeholder="Išči..."
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            marginLeft: "9px",
            fontSize: "14px",
            color: "#334155",
            background: "transparent",
          }}
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: 0,
            width: "360px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.14)",
            overflow: "hidden",
            zIndex: 2000,
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: "16px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Ni zadetkov.
            </div>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  border: "none",
                  borderBottom: "1px solid #f1f5f9",
                  background: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "#ffffff";
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "9px",
                    background: "#eef4f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getIcon(result.type)}
                </div>

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#334155",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {result.title}
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {result.subtitle}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
