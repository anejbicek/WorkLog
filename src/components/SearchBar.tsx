import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  FolderKanban,
  User,
  Cog,
  ClipboardList,
  Settings,
} from "lucide-react";

import { useAdmin, type AdminProject } from "../context/AdminContext";
import { useWorkOrders } from "../context/WorkOrderContext";
import { supabase } from "../services/supabase";
import type { Page } from "../App";

type SearchBarProps = {
  onNavigate: (page: Page) => void;
};

type SearchResult = {
  id: string;
  type:
    | "project"
    | "user"
    | "machine"
    | "workorder"
    | "navigation";
  title: string;
  subtitle: string;
  page: Page;
  focus?:
    | "admin-machines"
    | "admin-users"
    | "admin-settings"
    | "admin-work-time"
    | "admin-night-work"
    | "admin-pdf"
    | "admin-notifications"
    | "admin-holidays"
    | "admin-security"
    | "admin-reports"
    | "admin-archive"
    | "user-settings"
    | "user-profile"
    | "user-password"
    | "user-night-mode";
};

type NavigationDefinition = {
  id: string;
  title: string;
  subtitle: string;
  page: Page;
  focus?: SearchResult["focus"];
  keywords: string[];
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

  const navigationDefinitions: NavigationDefinition[] = [
    {
      id: "nav-dashboard",
      title: "Delovni nalogi",
      subtitle: "Odpri zavihek Delovni nalogi",
      page: "dashboard",
      keywords: ["delovni nalogi", "delovni nalog", "nalogi", "nalog", "novo delo", "nov nalog", "delo"],
    },
    {
      id: "nav-evidenca",
      title: "Evidenca",
      subtitle: "Odpri evidenco delovnih ur",
      page: "evidenca",
      keywords: ["evidenca", "ure", "evidenca ur", "delovne ure", "čas", "cas"],
    },
    {
      id: "nav-statistika",
      title: "Statistika",
      subtitle: "Odpri statistiko",
      page: "statistika",
      keywords: ["statistika", "statistike", "pregled ur", "analitika"],
    },
    {
      id: "nav-pdf",
      title: "PDF",
      subtitle: "Odpri pripravo in izvoz PDF poročil",
      page: "pdf",
      keywords: ["pdf", "poročilo", "porocilo", "poročila", "porocila", "izvoz pdf", "izvozi pdf"],
    },
    {
      id: "nav-projects",
      title: "Projekti",
      subtitle: "Odpri upravljanje projektov",
      page: "projects",
      keywords: ["projekt", "projekti", "projekta", "izdelava", "proizvodnja", "količina", "kolicina", "serijska številka", "serijska stevilka"],
    },
    {
      id: "nav-user-settings",
      title: "Nastavitve uporabnika",
      subtitle: "Profil, geslo, profilna slika in osebne nastavitve",
      page: "settings",
      focus: "user-settings",
      keywords: ["nastavitve uporabnika", "moje nastavitve", "profil", "moj profil"],
    },
    {
      id: "nav-user-password",
      title: "Sprememba gesla",
      subtitle: "Odpri nastavitev gesla",
      page: "settings",
      focus: "user-password",
      keywords: ["geslo", "novo geslo", "spremeni geslo", "pozabljeno geslo", "password"],
    },
    {
      id: "nav-user-profile",
      title: "Profilna slika in uporabniški profil",
      subtitle: "Odpri osebne podatke in profilno sliko",
      page: "settings",
      focus: "user-profile",
      keywords: ["profilna slika", "slika profila", "uporabniško ime", "uporabnisko ime", "e-pošta", "email"],
    },
    {
      id: "nav-night-mode",
      title: "Nočni način",
      subtitle: "Odpri nastavitev nočnega načina",
      page: "settings",
      focus: "user-night-mode",
      keywords: ["nočni način", "nocni nacin", "nočni", "nocni", "temni način", "temni nacin", "dark mode", "tema", "temna tema"],
    },
  ];

  const adminNavigationDefinitions: NavigationDefinition[] = isAdmin
    ? [
        {
          id: "nav-admin",
          title: "Administracija",
          subtitle: "Odpri administracijo WorkLoga",
          page: "admin",
          keywords: ["administracija", "admin", "upravljanje sistema"],
        },
        {
          id: "nav-admin-users",
          title: "Administracija – Uporabniki",
          subtitle: "Upravljanje uporabnikov in njihovih pravic",
          page: "admin",
          focus: "admin-users",
          keywords: ["uporabniki", "uporabnik", "zaposleni", "delavci", "vloge", "administrator", "pravice uporabnikov"],
        },
        {
          id: "nav-admin-machines",
          title: "Administracija – Stroji",
          subtitle: "Upravljanje strojev",
          page: "admin",
          focus: "admin-machines",
          keywords: ["stroj", "stroji", "strojev", "naprava", "naprave", "vzdrževanje strojev", "vzdrzevanje strojev", "servis strojev"],
        },
        {
          id: "nav-admin-settings",
          title: "Administrativne nastavitve",
          subtitle: "Delovni čas, nočno delo, PDF, obvestila in prazniki",
          page: "admin",
          focus: "admin-settings",
          keywords: ["administrativne nastavitve", "admin nastavitve", "sistemske nastavitve", "nastavitve sistema"],
        },
        {
          id: "nav-admin-work-time",
          title: "Administracija – Delovni čas",
          subtitle: "Nastavitve delovnega časa, odmora in nadur",
          page: "admin",
          focus: "admin-work-time",
          keywords: ["delovni čas", "delovni cas", "delovnik", "odmor", "malica", "samodejni odmor", "nadure", "nadura"],
        },
        {
          id: "nav-admin-night-work",
          title: "Administracija – Nočno delo",
          subtitle: "Nastavitve obdobja nočnega dela",
          page: "admin",
          focus: "admin-night-work",
          keywords: ["nočno delo", "nocno delo", "začetek nočnega dela", "zacetek nocnega dela", "konec nočnega dela", "night work"],
        },
        {
          id: "nav-admin-pdf",
          title: "Administracija – PDF poročila",
          subtitle: "Nastavitve podatkov na PDF poročilih",
          page: "admin",
          focus: "admin-pdf",
          keywords: ["pdf nastavitve", "nastavitve pdf", "pdf poročila", "pdf porocila", "odgovorna oseba"],
        },
        {
          id: "nav-admin-notifications",
          title: "Administracija – Obvestila",
          subtitle: "Sistemska obvestila WorkLoga",
          page: "admin",
          focus: "admin-notifications",
          keywords: ["obvestila", "opozorila", "servisna obvestila", "manjkajoči delovni nalogi", "manjkajoci delovni nalogi"],
        },
        {
          id: "nav-admin-holidays",
          title: "Administracija – Prazniki",
          subtitle: "Upravljanje praznikov in dela prostih dni",
          page: "admin",
          focus: "admin-holidays",
          keywords: ["praznik", "prazniki", "dela prost dan", "dela prosti dnevi", "prost dan", "neradni dan", "neradni dnevi"],
        },
        {
          id: "nav-admin-security",
          title: "Varnost in pravice",
          subtitle: "Vloge in dostopne pravice",
          page: "admin",
          focus: "admin-security",
          keywords: ["varnost", "pravice", "dostop", "dostopne pravice", "vloga", "vloge"],
        },
        {
          id: "nav-admin-reports",
          title: "Poročila sistema",
          subtitle: "Sistemska poročila in pregled aktivnosti",
          page: "admin",
          focus: "admin-reports",
          keywords: ["poročila sistema", "porocila sistema", "sistemska poročila", "sistemska porocila", "aktivnost sistema", "pregled sistema"],
        },
        {
          id: "nav-admin-archive",
          title: "Arhiv",
          subtitle: "Arhiv uporabnikov, strojev in projektov",
          page: "admin",
          focus: "admin-archive",
          keywords: ["arhiv", "arhivirano", "arhivirani projekti", "zaključeni projekti", "zakljuceni projekti"],
        },
      ]
    : [];

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

    const navigationResults: SearchResult[] = [
      ...navigationDefinitions,
      ...adminNavigationDefinitions,
    ]
      .filter((item) =>
        item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(normalizedQuery) ||
          normalizedQuery.includes(keyword.toLowerCase())
        )
      )
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        type: "navigation",
        title: item.title,
        subtitle: item.subtitle,
        page: item.page,
        focus: item.focus,
      }));

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
      ...navigationResults,
      ...projectResults,
      ...userResults,
      ...machineResults,
      ...workOrderResults,
    ].slice(0, 12);
  }, [
    allWorkOrders,
    isAdmin,
    navigationDefinitions,
    adminNavigationDefinitions,
    machines,
    projects,
    query,
    users,
    workOrders,
  ]);

  const focusElementAfterNavigation = (result: SearchResult) => {
    if (!result.focus) {
      return;
    }

    const focusMap: Record<NonNullable<SearchResult["focus"]>, string[]> = {
      "admin-machines": ["Stroji"],
      "admin-users": ["Uporabniki"],
      "admin-settings": ["Nastavitve"],
      "admin-work-time": ["Nastavitve", "Osnovne nastavitve"],
      "admin-night-work": ["Nastavitve", "Nočno delo"],
      "admin-pdf": ["Nastavitve", "PDF poročila"],
      "admin-notifications": ["Nastavitve", "Obvestila"],
      "admin-holidays": ["Nastavitve", "Prazniki"],
      "admin-security": ["Varnost in pravice"],
      "admin-reports": ["Poročila sistema"],
      "admin-archive": ["Arhiv"],
      "user-settings": ["Nastavitve uporabnika"],
      "user-profile": ["Profilna slika", "Podatki uporabnika"],
      "user-password": ["Novo geslo", "Sprememba gesla"],
      "user-night-mode": ["Nočni način"],
    };

    const labels = focusMap[result.focus];
    const deadline = Date.now() + 1800;

    const normalizeText = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const findByText = (label: string) => {
      const normalizedLabel = normalizeText(label);
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(
          "button, h1, h2, h3, h4, div, span, label"
        )
      );

      return elements.find((element) => {
        const text = normalizeText(element.textContent ?? "");
        return text === normalizedLabel;
      });
    };

    const tryFocus = () => {
      const isAdminFocus = result.focus?.startsWith("admin-");
      const requiresAdminSettings =
        result.focus === "admin-settings" ||
        result.focus === "admin-work-time" ||
        result.focus === "admin-night-work" ||
        result.focus === "admin-pdf" ||
        result.focus === "admin-notifications" ||
        result.focus === "admin-holidays";

      if (isAdminFocus) {
        const adminButton = findByText(labels[0]);

        if (requiresAdminSettings) {
          if (adminButton instanceof HTMLButtonElement) {
            adminButton.click();
          }

          const target = findByText(labels[1] ?? labels[0]);
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            return;
          }
        } else {
          if (adminButton instanceof HTMLButtonElement) {
            adminButton.click();
          }

          if (adminButton) {
            adminButton.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            return;
          }
        }
      } else {
        const target = findByText(labels[0]);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          return;
        }
      }

      if (Date.now() < deadline) {
        window.setTimeout(tryFocus, 100);
      }
    };

    window.setTimeout(tryFocus, 80);
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    onNavigate(result.page);
    focusElementAfterNavigation(result);
  };

  const getIcon = (type: SearchResult["type"]) => {
    if (type === "navigation") {
      return <Settings size={17} color="#17465d" />;
    }

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
