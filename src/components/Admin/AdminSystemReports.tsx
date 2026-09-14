import {
  Activity,
  Archive,
  BarChart3,
  CheckCircle2,
  Clock3,
  Factory,
  FileText,
  FolderKanban,
  LockKeyhole,
  PackageCheck,
  Shield,
  UserCheck,
  UserX,
  Users,
  Wrench,
  XCircle,
  Wifi,
  WifiOff,
  Database,
  Server,
  AlertTriangle,
  Info,
  CalendarDays,
  Palette,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAdmin } from "../../context/AdminContext";
import { supabase } from "../../services/supabase";

import {
  DEFAULT_SEASONAL_THEMES,
  getActiveSeasonalTheme,
  loadSeasonalThemes,
  saveSeasonalThemes,
  type SeasonalTheme,
} from "../../utils/seasonalTheme";

/* =========================================================
   TIPI
========================================================= */

type SystemWorkOrder = {
  id: number;
  userId?: string;
  project: string;
  machine: string;
  quantity: number;
  date: string;
  hours: number;
  regularHours: number;
  nightHours: number;
  holidayHours: number;
  overtimeHours: number;
  overtimeNormalHours: number;
  overtimeSpecialHours: number;
};

type UserActivity = {
  userId: number;
  name: string;
  email: string;
  entries: number;
  quantity: number;
  hours: number;
};

type ProjectActivity = {
  name: string;
  requiredQuantity: number;
  producedQuantity: number;
  percentage: number;
  hours: number;
  entries: number;
  status: string;
};

type SystemError = {
  id: string;
  source: string;
  message: string;
  code: string;
  details?: string;
  hint?: string;
  at: string;
};

type DatabaseTableStatus = {
  table: string;
  accessible: boolean;
  rows: number | null;
  errorCode?: string;
  errorMessage?: string;
};

/* =========================================================
   GLAVNA KOMPONENTA
========================================================= */

function AdminSystemReports() {
  const {
    users,
    projects,
    machines,
    offlineQueue,
  } = useAdmin();

  const [workOrders, setWorkOrders] =
    useState<SystemWorkOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [systemErrors, setSystemErrors] =
    useState<SystemError[]>([]);

  const [supabaseStatus, setSupabaseStatus] =
    useState({
      online: typeof navigator !== "undefined"
        ? navigator.onLine
        : true,
      auth: false,
      database: false,
      latencyMs: null as number | null,
      checkedAt: "",
    });

  const [databaseTables, setDatabaseTables] =
    useState<DatabaseTableStatus[]>([]);

  const [diagnosticsLoading, setDiagnosticsLoading] =
    useState(false);

  const [diagnosticsOpen, setDiagnosticsOpen] =
    useState(false);

  const [seasonalThemes, setSeasonalThemes] =
    useState<SeasonalTheme[]>(() =>
      loadSeasonalThemes()
    );

  const [seasonalThemesOpen, setSeasonalThemesOpen] =
    useState(false);

  const activeSeasonalTheme =
    getActiveSeasonalTheme();

  /* =======================================================
     PREVERI ADMINISTRATORSKI DOSTOP
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const checkSystemOwner = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser || cancelled) {
        if (!cancelled) {
          setIsAdmin(false);
        }
        return;
      }

      const owner = users.find(
        (user) => user.id === 1
      );

      const ownerMatches =
        !!owner &&
        owner.active &&
        (owner.authUserId === authUser.id ||
          owner.email.toLowerCase() ===
            (authUser.email ?? "").toLowerCase());

      if (!cancelled) {
        setIsAdmin(ownerMatches);
      }
    };

    void checkSystemOwner();

    return () => {
      cancelled = true;
    };
  }, [users]);

  const runDiagnostics = async () => {
    if (!isAdmin) {
      return;
    }

    setDiagnosticsLoading(true);

    const startedAt = performance.now();
    const errors: SystemError[] = [];
    const tableResults: DatabaseTableStatus[] = [];

    const online =
      typeof navigator === "undefined"
        ? true
        : navigator.onLine;

    let authOk = false;
    let databaseOk = false;

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        errors.push({
          id: `${Date.now()}-auth`,
          source: "Supabase Auth",
          message: error.message,
          code: error.code ?? "AUTH_ERROR",
          details: (error as any).details
            ? String((error as any).details)
            : undefined,
          hint: (error as any).hint
            ? String((error as any).hint)
            : undefined,
          at: new Date().toISOString(),
        });
      } else {
        authOk = !!user;
      }
    } catch (error) {
      errors.push({
        id: `${Date.now()}-auth-exception`,
        source: "Supabase Auth",
        message: String(
          (error as any)?.message ?? error
        ),
        code: String(
          (error as any)?.code ??
            "AUTH_EXCEPTION"
        ),
        at: new Date().toISOString(),
      });
    }

    const tables = [
      "users",
      "projects",
      "machines",
      "work_orders",
    ];

    for (const table of tables) {
      try {
        const { count, error } =
          await supabase
            .from(table)
            .select("*", {
              count: "exact",
              head: true,
            });

        if (error) {
          tableResults.push({
            table,
            accessible: false,
            rows: null,
            errorCode: error.code,
            errorMessage: error.message,
          });

          errors.push({
            id: `${Date.now()}-${table}`,
            source: `Tabela ${table}`,
            message: error.message,
            code: error.code ?? "DATABASE_ERROR",
            details: error.details,
            hint: error.hint,
            at: new Date().toISOString(),
          });
        } else {
          databaseOk = true;
          tableResults.push({
            table,
            accessible: true,
            rows: count ?? 0,
          });
        }
      } catch (error) {
        const exceptionCode = String(
          (error as any)?.code ??
            "DATABASE_EXCEPTION"
        );
        const exceptionMessage = String(
          (error as any)?.message ?? error
        );

        tableResults.push({
          table,
          accessible: false,
          rows: null,
          errorCode: exceptionCode,
          errorMessage: exceptionMessage,
        });

        errors.push({
          id: `${Date.now()}-${table}-exception`,
          source: `Tabela ${table}`,
          message: exceptionMessage,
          code: exceptionCode,
          at: new Date().toISOString(),
        });
      }
    }

    const checkedAt =
      new Date().toISOString();
    const latencyMs = Math.round(
      performance.now() - startedAt
    );

    databaseOk =
      tableResults.length === tables.length &&
      tableResults.every(
        (item) => item.accessible
      );

    setSupabaseStatus({
      online,
      auth: authOk,
      database: databaseOk,
      latencyMs,
      checkedAt,
    });

    setDatabaseTables(tableResults);
    setSystemErrors(errors);
    setDiagnosticsLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    void runDiagnostics();
  }, [isAdmin]);

  /* =======================================================
     NALOŽI DELOVNE NALOGE
  ======================================================= */

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadWorkOrders =
      async () => {
        setLoading(true);
        setErrorMessage("");

        const {
          data,
          error,
        } =
          await supabase
            .from("work_orders")
            .select("*")
            .order(
              "date",
              {
                ascending:
                  false,
              }
            );

        if (error) {
          console.error(
            "Napaka pri nalaganju sistemskih poročil:",
            error
          );

          if (!cancelled) {
            setErrorMessage(
              "Podatkov delovnih nalogov ni bilo mogoče naložiti."
            );

            setWorkOrders([]);
            setLoading(false);
          }

          return;
        }

        const mapped:
          SystemWorkOrder[] =
          (
            data ??
            []
          ).map(
            (row: any) => ({
              id: Number(
                row.id
              ),

              userId:
                row.user_id ??
                undefined,

              project:
                row.project ??
                "",

              machine:
                row.machine ??
                "",

              quantity: Number(
                row.quantity ??
                  0
              ),

              date:
                row.date ??
                "",

              hours: Number(
                row.hours ??
                  0
              ),

              regularHours:
                Number(
                  row.regular_hours ??
                    row.regularHours ??
                    0
                ),

              nightHours:
                Number(
                  row.night_hours ??
                    row.nightHours ??
                    0
                ),

              holidayHours:
                Number(
                  row.holiday_hours ??
                    row.holidayHours ??
                    0
                ),

              overtimeHours:
                Number(
                  row.overtime_hours ??
                    row.overtimeHours ??
                    0
                ),

              overtimeNormalHours:
                Number(
                  row.overtime_normal_hours ??
                    row.overtimeNormalHours ??
                    0
                ),

              overtimeSpecialHours:
                Number(
                  row.overtime_special_hours ??
                    row.overtimeSpecialHours ??
                    0
                ),
            })
          );

        if (!cancelled) {
          setWorkOrders(
            mapped
          );

          setLoading(false);
        }
      };

    void loadWorkOrders();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  /* =======================================================
     STATISTIKA UR
  ======================================================= */

  const hourSummary =
    useMemo(() => {
      return workOrders.reduce(
        (
          total,
          order
        ) => ({
          hours:
            total.hours +
            order.hours,

          regular:
            total.regular +
            order.regularHours,

          night:
            total.night +
            order.nightHours,

          holiday:
            total.holiday +
            order.holidayHours,

          overtime:
            total.overtime +
            order.overtimeHours,

          overtimeNormal:
            total.overtimeNormal +
            order.overtimeNormalHours,

          overtimeSpecial:
            total.overtimeSpecial +
            order.overtimeSpecialHours,
        }),
        {
          hours: 0,
          regular: 0,
          night: 0,
          holiday: 0,
          overtime: 0,
          overtimeNormal: 0,
          overtimeSpecial: 0,
        }
      );
    }, [
      workOrders,
    ]);

  /* =======================================================
     IZDELAVA
  ======================================================= */

  const producedQuantity =
    useMemo(
      () =>
        workOrders.reduce(
          (
            total,
            order
          ) =>
            total +
            order.quantity,
          0
        ),
      [workOrders]
    );

  /* =======================================================
     UPORABNIŠKA AKTIVNOST
  ======================================================= */

  const userActivity =
    useMemo<UserActivity[]>(
      () => {
        const map =
          new Map<
            number,
            UserActivity
          >();

        users.forEach(
          (user) => {
            map.set(
              user.id,
              {
                userId:
                  user.id,
                name:
                  user.name,
                email:
                  user.email,
                entries: 0,
                quantity: 0,
                hours: 0,
              }
            );
          }
        );

        workOrders.forEach(
          (order) => {
            if (
              !order.userId
            ) {
              return;
            }

            const user =
              users.find(
                (item) =>
                  item.authUserId ===
                  order.userId
              );

            if (!user) {
              return;
            }

            const current =
              map.get(
                user.id
              );

            if (!current) {
              return;
            }

            current.entries +=
              1;

            current.quantity +=
              order.quantity;

            current.hours +=
              order.hours;
          }
        );

        return Array.from(
          map.values()
        )
          .filter(
            (item) =>
              item.entries >
              0
          )
          .sort(
            (
              a,
              b
            ) =>
              b.hours -
              a.hours
          );
      },
      [
        users,
        workOrders,
      ]
    );

  /* =======================================================
     PROJEKTNA AKTIVNOST
  ======================================================= */

  const projectActivity =
    useMemo<ProjectActivity[]>(
      () => {
        return projects
          .map(
            (project) => {
              const entries =
                workOrders.filter(
                  (order) =>
                    order.project
                      .trim()
                      .toLowerCase() ===
                    project.name
                      .trim()
                      .toLowerCase()
                );

              const produced =
                entries.reduce(
                  (
                    total,
                    order
                  ) =>
                    total +
                    order.quantity,
                  0
                );

              const hours =
                entries.reduce(
                  (
                    total,
                    order
                  ) =>
                    total +
                    order.hours,
                  0
                );

              const percentage =
                project.requiredQuantity >
                0
                  ? Math.min(
                      100,
                      Math.round(
                        (produced /
                          project.requiredQuantity) *
                          100
                      )
                    )
                  : 0;

              return {
                name:
                  project.name,

                requiredQuantity:
                  project.requiredQuantity,

                producedQuantity:
                  produced,

                percentage,

                hours,

                entries:
                  entries.length,

                status:
                  project.status,
              };
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              b.hours -
              a.hours
          );
      },
      [
        projects,
        workOrders,
      ]
    );

  /* =======================================================
     STANJE PROJEKTOV
  ======================================================= */

  const activeProjects =
    projects.filter(
      (project) =>
        project.status ===
          "active" &&
        !project.archived
    ).length;

  const preparationProjects =
    projects.filter(
      (project) =>
        project.status ===
          "preparation" &&
        !project.archived
    ).length;

  const completedProjects =
    projects.filter(
      (project) =>
        project.status ===
          "completed" &&
        !project.archived
    ).length;

  const archivedProjects =
    projects.filter(
      (project) =>
        project.archived ===
        true
    ).length;

  /* =======================================================
     UPORABNIKI
  ======================================================= */

  const activeUsers =
    users.filter(
      (user) =>
        user.active
    ).length;

  const inactiveUsers =
    users.filter(
      (user) =>
        !user.active
    ).length;

  const activeAdmins =
    users.filter(
      (user) =>
        user.role ===
          "admin" &&
        user.active
    ).length;

  const activeWorkers =
    users.filter(
      (user) =>
        user.role ===
          "worker" &&
        user.active
    ).length;

  /* =======================================================
     DOSTOP – SAMO AKTIVNI ADMINISTRATORJI
  ======================================================= */

  if (!isAdmin) {
    return (
      <div
        style={
          unauthorizedPageStyle
        }
      >
        <div
          style={
            unauthorizedIconStyle
          }
        >
          <LockKeyhole
            size={30}
          />
        </div>

        <h2
          style={
            unauthorizedTitleStyle
          }
        >
          Dostop zavrnjen
        </h2>

        <p
          style={
            unauthorizedTextStyle
          }
        >
          Poročila sistema so
          na voljo samo lastniku
          sistema.
        </p>
      </div>
    );
  }

  /* =======================================================
     GLAVNI PRIKAZ
  ======================================================= */

  return (
    <div style={pageStyle}>
      {/* =================================================
          GLAVA
      ================================================= */}

      <div
        style={headerStyle}
      >
        <div>
          <h2
            style={
              titleStyle
            }
          >
            Poročila sistema
          </h2>

          <p
            style={
              subtitleStyle
            }
          >
            Celovit pregled
            delovanja ŽustAI
            WorkLoga.
          </p>
        </div>

        <div
          style={
            ownerBadgeStyle
          }
        >
          <Shield
            size={18}
            strokeWidth={2.2}
          />

          <span>
            Administratorski nadzor
          </span>
        </div>
      </div>

      {/* =================================================
          GLAVNE KARTICE
      ================================================= */}

      <div
        style={
          statsGridStyle
        }
      >
        <SystemStat
          icon={Users}
          title="Uporabniki"
          value={
            users.length
          }
          subtitle={`${activeUsers} aktivnih`}
          accent="#2563eb"
        />

        <SystemStat
          icon={FolderKanban}
          title="Projekti"
          value={
            projects.filter(
              (project) =>
                !project.archived
            ).length
          }
          subtitle={`${activeProjects} aktivnih`}
          accent="#7c3aed"
        />

        <SystemStat
          icon={FileText}
          title="Delovni nalogi"
          value={
            workOrders.length
          }
          subtitle="vseh evidentiranih"
          accent="#0891b2"
        />

        <SystemStat
          icon={PackageCheck}
          title="Izdelani kosi"
          value={
            producedQuantity
          }
          subtitle="skupaj evidentiranih"
          accent="#16a34a"
        />
      </div>

      {/* =================================================
          SISTEMSKA DIAGNOSTIKA
      ================================================= */}

      <section
        style={
          panelStyle
        }
      >
        <PanelHeader
          icon={Server}
          title="Sistemska diagnostika"
          description="Stanje povezave, Supabase, baze in tehničnih podatkov sistema."
        />

        <div
          style={diagnosticsGridStyle}
        >
          <DiagnosticItem
            icon={
              supabaseStatus.online
                ? Wifi
                : WifiOff
            }
            label="Povezava"
            value={
              supabaseStatus.online
                ? "ONLINE"
                : "OFFLINE"
            }
            ok={
              supabaseStatus.online
            }
          />

          <DiagnosticItem
            icon={Database}
            label="Supabase baza"
            value={
              supabaseStatus.database
                ? "DOSTOPNA"
                : "NI DOSTOPNA"
            }
            ok={
              supabaseStatus.database
            }
          />

          <DiagnosticItem
            icon={Shield}
            label="Supabase Auth"
            value={
              supabaseStatus.auth
                ? "PRIJAVA OK"
                : "PREVERI"
            }
            ok={
              supabaseStatus.auth
            }
          />

          <DiagnosticItem
            icon={Clock3}
            label="Odziv"
            value={
              supabaseStatus.latencyMs !== null
                ? `${supabaseStatus.latencyMs} ms`
                : "—"
            }
            ok={
              supabaseStatus.latencyMs !== null &&
              supabaseStatus.latencyMs < 2000
            }
          />
        </div>

        <div
          style={
            diagnosticsActionRowStyle
          }
        >
          <div
            style={
              diagnosticsSummaryStyle
            }
          >
            <span>
              Čakalna vrsta offline: <strong>{offlineQueue.length}</strong>
            </span>

            {supabaseStatus.checkedAt && (
              <span>
                Zadnje preverjanje: {new Date(supabaseStatus.checkedAt).toLocaleString("sl-SI")}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => void runDiagnostics()}
            disabled={diagnosticsLoading}
            style={diagnosticsButtonStyle}
          >
            <RefreshCw
              size={14}
              style={
                diagnosticsLoading
                  ? { animation: "spin 1s linear infinite" }
                  : undefined
              }
            />
            {diagnosticsLoading
              ? "Preverjam..."
              : "Preveri ponovno"}
          </button>
        </div>

        <div
          style={
            diagnosticsTechnicalRowStyle
          }
        >
          <span>
            <strong>Napake:</strong> {systemErrors.length}
          </span>
          <span>
            <strong>Tabele:</strong> {databaseTables.filter((item) => item.accessible).length}/{databaseTables.length || 4} dostopnih
          </span>
        </div>

        <details
          open={diagnosticsOpen}
          onToggle={(event) =>
            setDiagnosticsOpen(
              (event.currentTarget as HTMLDetailsElement).open
            )
          }
          style={detailsStyle}
        >
          <summary
            style={detailsSummaryStyle}
          >
            <Info size={14} />
            Dodatni tehnični podatki
          </summary>

          <div
            style={technicalGridStyle}
          >
            <TechnicalItem
              label="Brskalnik"
              value={navigator.userAgent}
            />
            <TechnicalItem
              label="Platforma"
              value={navigator.platform || "—"}
            />
            <TechnicalItem
              label="Ločljivost"
              value={`${window.innerWidth} × ${window.innerHeight}`}
            />
            <TechnicalItem
              label="Jezik"
              value={navigator.language}
            />
            <TechnicalItem
              label="Online API"
              value={navigator.onLine ? "true" : "false"}
            />
            <TechnicalItem
              label="Čakalna vrsta"
              value={`${offlineQueue.length} operacij`}
            />
          </div>
        </details>

        <div
          style={
            diagnosticsSubsectionStyle
          }
        >
          <div
            style={
              diagnosticsSubsectionTitleStyle
            }
          >
            <Database size={14} />
            Podatki o bazi
          </div>

          <div
            style={
              databaseTableStyle
            }
          >
            {databaseTables.map((item) => (
              <div
                key={item.table}
                style={databaseRowStyle}
              >
                <span
                  style={databaseNameStyle}
                >
                  {item.table}
                </span>
                <span>
                  {item.accessible
                    ? `${item.rows ?? 0} vrstic`
                    : "NAPAKA"}
                </span>
                {!item.accessible && (
                  <span
                    style={databaseErrorStyle}
                  >
                    {item.errorCode ?? "UNKNOWN"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          style={
            diagnosticsSubsectionStyle
          }
        >
          <div
            style={
              diagnosticsSubsectionTitleStyle
            }
          >
            <AlertTriangle size={14} />
            Sistemske napake in kode
          </div>

          {systemErrors.length === 0 ? (
            <div
              style={
                noErrorsStyle
              }
            >
              <CheckCircle2 size={15} />
              Trenutno ni zaznanih sistemskih napak.
            </div>
          ) : (
            <div
              style={
                errorsListStyle
              }
            >
              {systemErrors.map((item) => (
                <div
                  key={item.id}
                  style={errorRowStyle}
                >
                  <div
                    style={errorRowMainStyle}
                  >
                    <strong>{item.source}</strong>
                    <span>{item.message}</span>
                    {item.details && (
                      <small>Podrobnosti: {item.details}</small>
                    )}
                    {item.hint && (
                      <small>Namig: {item.hint}</small>
                    )}
                  </div>
                  <div
                    style={errorCodeStyle}
                  >
                    {item.code}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          SEZONSKI IN PRAZNIČNI IZGLED
      ================================================= */}

      <section
        style={
          panelStyle
        }
      >
        <PanelHeader
          icon={CalendarDays}
          title="Sezonski in praznični izgled"
          description="Samodejno upravljanje posebnega izgleda prijave in glave WorkLoga."
        />

        <details
          open={seasonalThemesOpen}
          onToggle={(event) =>
            setSeasonalThemesOpen(
              (event.currentTarget as HTMLDetailsElement).open
            )
          }
          style={detailsStyle}
        >
          <summary
            style={detailsSummaryStyle}
          >
            <Palette size={14} />
            Upravljanje tem in terminov
          </summary>

          <div
            style={seasonalIntroStyle}
          >
            <span>
              Če se termini prekrivajo, se aktivira tema z višjo prioriteto.
              Spremembe se shranijo lokalno in se takoj uporabijo v prijavi in Headerju.
            </span>

            <button
              type="button"
              onClick={() => {
                const next = seasonalThemes.map(
                  (theme) => ({
                    ...theme,
                  })
                );
                saveSeasonalThemes(next);
                setSeasonalThemes(next);
              }}
              style={secondaryButtonStyle}
            >
              <RefreshCw size={13} />
              Osveži
            </button>
          </div>

          <div style={activeSeasonalThemeStyle}>
            <strong>Trenutno aktivna tema:</strong>{" "}
            {activeSeasonalTheme?.name ?? "Nobena"}
          </div>

          <div
            style={seasonalThemesListStyle}
          >
            {seasonalThemes.map(
              (theme) => (
                <div
                  key={theme.id}
                  style={seasonalThemeRowStyle}
                >
                  <div
                    style={seasonalThemeMainStyle}
                  >
                    <input
                      type="checkbox"
                      checked={theme.enabled}
                      onChange={(event) => {
                        const next = seasonalThemes.map(
                          (item) =>
                            item.id === theme.id
                              ? {
                                  ...item,
                                  enabled:
                                    event.target.checked,
                                }
                              : item
                        );
                        setSeasonalThemes(next);
                        saveSeasonalThemes(next);
                      }}
                    />

                    <div
                      style={seasonalThemeNameStyle}
                    >
                      {theme.name}
                    </div>
                  </div>

                  <label style={seasonalFieldStyle}>
                    Od
                    <input
                      type="text"
                      value={theme.start}
                      onChange={(event) => {
                        const next = seasonalThemes.map(
                          (item) =>
                            item.id === theme.id
                              ? {
                                  ...item,
                                  start:
                                    event.target.value,
                                }
                              : item
                        );
                        setSeasonalThemes(next);
                        saveSeasonalThemes(next);
                      }}
                      style={seasonalInputStyle}
                      placeholder="MM-DDTHH:mm"
                    />
                  </label>

                  <label style={seasonalFieldStyle}>
                    Do
                    <input
                      type="text"
                      value={theme.end}
                      onChange={(event) => {
                        const next = seasonalThemes.map(
                          (item) =>
                            item.id === theme.id
                              ? {
                                  ...item,
                                  end:
                                    event.target.value,
                                }
                              : item
                        );
                        setSeasonalThemes(next);
                        saveSeasonalThemes(next);
                      }}
                      style={seasonalInputStyle}
                      placeholder="MM-DDTHH:mm"
                    />
                  </label>

                  <label style={seasonalFieldStyle}>
                    Prioriteta
                    <input
                      type="number"
                      value={theme.priority}
                      onChange={(event) => {
                        const next = seasonalThemes.map(
                          (item) =>
                            item.id === theme.id
                              ? {
                                  ...item,
                                  priority:
                                    Number(event.target.value) || 0,
                                }
                              : item
                        );
                        setSeasonalThemes(next);
                        saveSeasonalThemes(next);
                      }}
                      style={seasonalSmallInputStyle}
                    />
                  </label>

                  <label style={seasonalImageFieldStyle}>
                    Login slika
                    <input
                      type="text"
                      value={theme.loginImage}
                      onChange={(event) => {
                        const next = seasonalThemes.map(
                          (item) =>
                            item.id === theme.id
                              ? {
                                  ...item,
                                  loginImage:
                                    event.target.value,
                                }
                              : item
                        );
                        setSeasonalThemes(next);
                        saveSeasonalThemes(next);
                      }}
                      style={seasonalImageInputStyle}
                    />
                  </label>

                  <label style={seasonalImageFieldStyle}>
                    Header slika
                    <input
                      type="text"
                      value={theme.headerImage}
                      onChange={(event) => {
                        const next = seasonalThemes.map(
                          (item) =>
                            item.id === theme.id
                              ? {
                                  ...item,
                                  headerImage:
                                    event.target.value,
                                }
                              : item
                        );
                        setSeasonalThemes(next);
                        saveSeasonalThemes(next);
                      }}
                      style={seasonalImageInputStyle}
                    />
                  </label>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const next = DEFAULT_SEASONAL_THEMES.map(
                (theme) => ({ ...theme })
              );
              setSeasonalThemes(next);
              saveSeasonalThemes(next);
            }}
            style={resetThemesButtonStyle}
          >
            Obnovi privzete teme
          </button>
        </details>
      </section>

            {/* =================================================
          SISTEM
      ================================================= */}

      <section
        style={
          panelStyle
        }
      >
        <PanelHeader
          icon={Activity}
          title="Stanje sistema"
          description="Trenutni pregled uporabnikov, projektov in proizvodnje."
        />

        <div
          style={
            overviewGridStyle
          }
        >
          <OverviewItem
            icon={UserCheck}
            label="Aktivni uporabniki"
            value={
              activeUsers
            }
            detail={`${activeAdmins} administratorjev · ${activeWorkers} delavcev`}
          />

          <OverviewItem
            icon={UserX}
            label="Neaktivni uporabniki"
            value={
              inactiveUsers
            }
            detail="uporabniških računov"
          />

          <OverviewItem
            icon={FolderKanban}
            label="Priprava projektov"
            value={
              preparationProjects
            }
            detail="projektov v pripravi"
          />

          <OverviewItem
            icon={CheckCircle2}
            label="Zaključeni projekti"
            value={
              completedProjects
            }
            detail="čakajo na arhiv"
          />

          <OverviewItem
            icon={Archive}
            label="Arhivirani projekti"
            value={
              archivedProjects
            }
            detail="projektov v arhivu"
          />

          <OverviewItem
            icon={Factory}
            label="Stroji"
            value={
              machines.length
            }
            detail={`${machines.filter((machine) => machine.active).length} aktivnih`}
          />
        </div>
      </section>

      {/* =================================================
          DELOVNE URE
      ================================================= */}

      <section
        style={
          panelStyle
        }
      >
        <PanelHeader
          icon={Clock3}
          title="Delovne ure"
          description="Skupna razčlenitev vseh evidentiranih delovnih ur."
        />

        {loading ? (
          <LoadingBox />
        ) : errorMessage ? (
          <ErrorBox
            message={
              errorMessage
            }
          />
        ) : (
          <div
            style={
              hoursGridStyle
            }
          >
            <HourCard
              label="Skupaj"
              value={
                hourSummary.hours
              }
              unit="h"
              accent="#12344d"
            />

            <HourCard
              label="Redne"
              value={
                hourSummary.regular
              }
              unit="h"
              accent="#2563eb"
            />

            <HourCard
              label="Nočne"
              value={
                hourSummary.night
              }
              unit="h"
              accent="#7c3aed"
            />

            <HourCard
              label="Nedelje / prazniki"
              value={
                hourSummary.holiday
              }
              unit="h"
              accent="#9333ea"
            />

            <HourCard
              label="Nadure"
              value={
                hourSummary.overtime
              }
              unit="h"
              accent="#ca8a04"
            />

            <HourCard
              label="Navadne nadure"
              value={
                hourSummary.overtimeNormal
              }
              unit="h"
              accent="#0891b2"
            />

            <HourCard
              label="Nedeljske nadure"
              value={
                hourSummary.overtimeSpecial
              }
              unit="h"
              accent="#9333ea"
            />
          </div>
        )}
      </section>

      {/* =================================================
          PROJEKTI
      ================================================= */}

      <section
        style={
          panelStyle
        }
      >
        <PanelHeader
          icon={BarChart3}
          title="Pregled projektov"
          description="Izdelava, porabljene ure in napredek posameznih projektov."
        />

        <div
          style={
            tableWrapperStyle
          }
        >
          <table
            style={
              tableStyle
            }
          >
            <thead>
              <tr>
                <th
                  style={
                    thLeftStyle
                  }
                >
                  Projekt
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Status
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Izdelano
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Napredek
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Ure
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Evidence
                </th>
              </tr>
            </thead>

            <tbody>
              {projectActivity.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={
                      emptyCellStyle
                    }
                  >
                    Ni projektov.
                  </td>
                </tr>
              ) : (
                projectActivity.map(
                  (
                    project
                  ) => (
                    <tr
                      key={
                        project.name
                      }
                    >
                      <td
                        style={
                          tdLeftStyle
                        }
                      >
                        <strong
                          style={
                            projectNameStyle
                          }
                        >
                          {
                            project.name
                          }
                        </strong>
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <ProjectStatus
                          status={
                            project.status
                          }
                        />
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          project.producedQuantity
                        }
                        {" / "}
                        {
                          project.requiredQuantity
                        }
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <div
                          style={
                            progressCellStyle
                          }
                        >
                          <div
                            style={
                              progressTrackStyle
                            }
                          >
                            <div
                              style={{
                                ...progressFillStyle,
                                width: `${project.percentage}%`,
                              }}
                            />
                          </div>

                          <span>
                            {
                              project.percentage
                            }
                            %
                          </span>
                        </div>
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {formatHours(
                          project.hours
                        )}{" "}
                        h
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          project.entries
                        }
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =================================================
          AKTIVNOST UPORABNIKOV
      ================================================= */}

      <section
        style={
          panelStyle
        }
      >
        <PanelHeader
          icon={Users}
          title="Aktivnost uporabnikov"
          description="Uporabniki, ki imajo evidentirano delovno aktivnost."
        />

        <div
          style={
            tableWrapperStyle
          }
        >
          <table
            style={
              tableStyle
            }
          >
            <thead>
              <tr>
                <th
                  style={
                    thLeftStyle
                  }
                >
                  Uporabnik
                </th>

                <th
                  style={
                    thLeftStyle
                  }
                >
                  E-pošta
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Evidence
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Izdelano
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Ure
                </th>
              </tr>
            </thead>

            <tbody>
              {userActivity.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={
                      emptyCellStyle
                    }
                  >
                    Trenutno ni
                    evidentirane
                    aktivnosti.
                  </td>
                </tr>
              ) : (
                userActivity.map(
                  (
                    user
                  ) => (
                    <tr
                      key={
                        user.userId
                      }
                    >
                      <td
                        style={
                          tdLeftStyle
                        }
                      >
                        <strong
                          style={
                            userNameStyle
                          }
                        >
                          {
                            user.name
                          }
                        </strong>
                      </td>

                      <td
                        style={
                          tdLeftStyle
                        }
                      >
                        <span
                          style={
                            emailStyle
                          }
                        >
                          {
                            user.email
                          }
                        </span>
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          user.entries
                        }
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          user.quantity
                        }
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {formatHours(
                          user.hours
                        )}{" "}
                        h
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =================================================
          VARNOSTNI POVZETEK
      ================================================= */}

      <section
        style={
          panelStyle
        }
      >
        <PanelHeader
          icon={Shield}
          title="Sistemski nadzor"
          description="Osnovni pregled varnostnega stanja sistema."
        />

        <div
          style={
            securityGridStyle
          }
        >
          <SecurityItem
            icon={Shield}
            title="Administratorski dostop"
            value="Aktiven"
            ok
          />

          <SecurityItem
            icon={UserCheck}
            title="Aktivni računi"
            value={`${activeUsers} / ${users.length}`}
            ok={
              activeUsers >
              0
            }
          />

          <SecurityItem
            icon={Wrench}
            title="Aktivni stroji"
            value={`${machines.filter((machine) => machine.active).length} / ${machines.length}`}
            ok={
              machines.some(
                (
                  machine
                ) =>
                  machine.active
              )
            }
          />

          <SecurityItem
            icon={FileText}
            title="Delovni nalogi"
            value={
              loading
                ? "Nalagam..."
                : `${workOrders.length}`
            }
            ok={
              !loading
            }
          />
        </div>

        <div
          style={
            noticeStyle
          }
        >
          <LockKeyhole
            size={16}
            strokeWidth={2}
          />

          <span>
            Ta razdelek je namenjen
            aktivnim administratorjem
            in prikazuje
            sistemske podatke
            WorkLoga.
          </span>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   PANEL HEADER
========================================================= */

function PanelHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div
      style={
        panelHeaderStyle
      }
    >
      <div
        style={
          panelTitleGroupStyle
        }
      >
        <Icon
          size={21}
          color="#2563eb"
          strokeWidth={2.2}
        />

        <div>
          <h3
            style={
              panelTitleStyle
            }
          >
            {title}
          </h3>

          <p
            style={
              panelDescriptionStyle
            }
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SISTEMSKA KARTICA
========================================================= */

function SystemStat({
  icon: Icon,
  title,
  value,
  subtitle,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  value: number;
  subtitle: string;
  accent: string;
}) {
  return (
    <div
      style={
        statCardStyle
      }
    >
      <div
        style={{
          ...statIconStyle,
          background: `${accent}18`,
          color: accent,
        }}
      >
        <Icon
          size={23}
          strokeWidth={2.2}
        />
      </div>

      <div>
        <div
          style={
            statTitleStyle
          }
        >
          {title}
        </div>

        <div
          style={
            statValueStyle
          }
        >
          {value}
        </div>

        <div
          style={
            statSubtitleStyle
          }
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewItem({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div
      style={
        overviewItemStyle
      }
    >
      <div
        style={
          overviewIconStyle
        }
      >
        <Icon
          size={19}
          strokeWidth={2.2}
        />
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={
            overviewLabelStyle
          }
        >
          {label}
        </div>

        <div
          style={
            overviewValueStyle
          }
        >
          {value}
        </div>

        <div
          style={
            overviewDetailStyle
          }
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   URE
========================================================= */

function HourCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  accent: string;
}) {
  return (
    <div
      style={
        hourCardStyle
      }
    >
      <div
        style={{
          ...hourIndicatorStyle,
          background: accent,
        }}
      />

      <div>
        <div
          style={
            hourLabelStyle
          }
        >
          {label}
        </div>

        <div
          style={
            hourValueStyle
          }
        >
          {formatHours(
            value
          )}{" "}
          <span
            style={
              hourUnitStyle
            }
          >
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROJECT STATUS
========================================================= */

function ProjectStatus({
  status,
}: {
  status: string;
}) {
  if (
    status ===
    "active"
  ) {
    return (
      <span
        style={{
          ...statusBadgeStyle,
          background:
            "#f0fdf4",
          color:
            "#16a34a",
        }}
      >
        <span
          style={{
            ...statusDotStyle,
            background:
              "#16a34a",
          }}
        />

        Aktivni
      </span>
    );
  }

  if (
    status ===
    "completed"
  ) {
    return (
      <span
        style={{
          ...statusBadgeStyle,
          background:
            "#eff6ff",
          color:
            "#2563eb",
        }}
      >
        <CheckCircle2
          size={12}
        />

        Zaključen
      </span>
    );
  }

  return (
    <span
      style={{
        ...statusBadgeStyle,
        background:
          "#f8fafc",
        color:
          "#64748b",
      }}
    >
      V pripravi
    </span>
  );
}

/* =========================================================
   SECURITY ITEM
========================================================= */

function SecurityItem({
  icon: Icon,
  title,
  value,
  ok,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      style={
        securityItemStyle
      }
    >
      <div
        style={
          securityItemIconStyle
        }
      >
        <Icon
          size={19}
          strokeWidth={2.2}
        />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={
            securityItemTitleStyle
          }
        >
          {title}
        </div>

        <div
          style={
            securityItemValueStyle
          }
        >
          {value}
        </div>
      </div>

      {ok ? (
        <CheckCircle2
          size={19}
          color="#16a34a"
        />
      ) : (
        <XCircle
          size={19}
          color="#f97316"
        />
      )}
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingBox() {
  return (
    <div
      style={
        loadingStyle
      }
    >
      Nalagam podatke...
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorBox({
  message,
}: {
  message: string;
}) {
  return (
    <div
      style={
        errorStyle
      }
    >
      <XCircle
        size={17}
      />

      <span>
        {message}
      </span>
    </div>
  );
}

/* =========================================================
   FORMAT UR
========================================================= */

function formatHours(
  value: number
) {
  return value
    .toFixed(2)
    .replace(
      ".00",
      ""
    );
}

/* =========================================================
   UNAUTHORIZED
========================================================= */

const unauthorizedPageStyle = {
  minHeight: "300px",
  display: "flex",
  flexDirection:
    "column" as const,
  alignItems: "center",
  justifyContent:
    "center",
  padding: "40px",
  textAlign:
    "center" as const,
};

const unauthorizedIconStyle = {
  width: "64px",
  height: "64px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "16px",
  background: "#fef2f2",
  color: "#dc2626",
  marginBottom: "15px",
};

const unauthorizedTitleStyle = {
  margin: 0,
  fontSize: "21px",
  color: "#12344d",
};

const unauthorizedTextStyle = {
  marginTop: "7px",
  fontSize: "13px",
  color: "#64748b",
};

/* =========================================================
   PAGE
========================================================= */

const pageStyle = {
  width: "100%",
};

const headerStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems:
    "flex-start",
  gap: "20px",
  marginBottom: "20px",
};

const titleStyle = {
  margin: 0,
  fontSize: "25px",
  fontWeight: 700,
  color: "#12344d",
};

const subtitleStyle = {
  marginTop: "6px",
  marginBottom: 0,
  fontSize: "14px",
  color: "#64748b",
};

const ownerBadgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  border: "1px solid #dbe3e8",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#1d526b",
  fontSize: "12px",
  fontWeight: 600,
};

/* =========================================================
   STATS
========================================================= */

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "14px",
};

const statCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  minHeight: "105px",
  padding: "17px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const statIconStyle = {
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent:
    "center",
  borderRadius: "11px",
  flexShrink: 0,
};

const statTitleStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#64748b",
};

const statValueStyle = {
  marginTop: "3px",
  fontSize: "27px",
  lineHeight: 1,
  fontWeight: 700,
  color: "#12344d",
};

const statSubtitleStyle = {
  marginTop: "6px",
  fontSize: "11px",
  color: "#64748b",
};

/* =========================================================
   PANEL
========================================================= */

const panelStyle = {
  marginBottom: "14px",
  padding: "18px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent:
    "space-between",
  gap: "12px",
  marginBottom: "16px",
};

const panelTitleGroupStyle = {
  display: "flex",
  alignItems:
    "flex-start",
  gap: "9px",
};

const panelTitleStyle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 700,
  color: "#12344d",
};

const panelDescriptionStyle = {
  margin: "4px 0 0",
  fontSize: "12px",
  color: "#64748b",
};

/* =========================================================
   OVERVIEW
========================================================= */

const overviewGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "10px",
};

const overviewItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "13px",
  borderRadius: "10px",
  background: "#f8fafc",
};

const overviewIconStyle = {
  width: "40px",
  height: "40px",
  minWidth: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent:
    "center",
  borderRadius: "9px",
  background: "#eaf2f5",
  color: "#1d526b",
};

const overviewLabelStyle = {
  fontSize: "10px",
  fontWeight: 700,
  color: "#64748b",
};

const overviewValueStyle = {
  marginTop: "2px",
  fontSize: "21px",
  lineHeight: 1.1,
  fontWeight: 700,
  color: "#12344d",
};

const overviewDetailStyle = {
  marginTop: "3px",
  fontSize: "10px",
  color: "#94a3b8",
};

/* =========================================================
   HOURS
========================================================= */

const hoursGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "10px",
};

const hourCardStyle = {
  position: "relative" as const,
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "13px",
  border:
    "1px solid #eef2f6",
  borderRadius: "10px",
  background: "#f8fafc",
  overflow: "hidden",
};

const hourIndicatorStyle = {
  width: "4px",
  height: "36px",
  borderRadius:
    "999px",
  flexShrink: 0,
};

const hourLabelStyle = {
  fontSize: "10px",
  fontWeight: 700,
  color: "#64748b",
};

const hourValueStyle = {
  marginTop: "4px",
  fontSize: "19px",
  lineHeight: 1,
  fontWeight: 700,
  color: "#12344d",
};

const hourUnitStyle = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#64748b",
};

/* =========================================================
   TABLE
========================================================= */

const tableWrapperStyle = {
  overflowX:
    "auto" as const,
  border:
    "1px solid #e2e8f0",
  borderRadius: "10px",
};

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse" as const,
};

const thLeftStyle = {
  padding:
    "11px 13px",
  borderBottom:
    "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 700,
  textAlign:
    "left" as const,
};

const thStyle = {
  padding:
    "11px 13px",
  borderBottom:
    "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 700,
  textAlign:
    "center" as const,
};

const tdLeftStyle = {
  padding:
    "11px 13px",
  borderBottom:
    "1px solid #eef2f6",
  color: "#334155",
  fontSize: "12px",
  textAlign:
    "left" as const,
};

const tdStyle = {
  padding:
    "11px 13px",
  borderBottom:
    "1px solid #eef2f6",
  color: "#334155",
  fontSize: "12px",
  textAlign:
    "center" as const,
};

const projectNameStyle = {
  color: "#12344d",
};

const userNameStyle = {
  color: "#12344d",
};

const emailStyle = {
  color: "#64748b",
};

const emptyCellStyle = {
  padding: "25px",
  color: "#94a3b8",
  fontSize: "12px",
  textAlign:
    "center" as const,
};

/* =========================================================
   PROGRESS
========================================================= */

const progressCellStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent:
    "center",
  gap: "8px",
  minWidth: "100px",
};

const progressTrackStyle = {
  width: "55px",
  height: "6px",
  borderRadius:
    "999px",
  background: "#e2e8f0",
  overflow: "hidden",
};

const progressFillStyle = {
  height: "100%",
  borderRadius:
    "999px",
  background: "#1d526b",
};

/* =========================================================
   STATUS
========================================================= */

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent:
    "center",
  gap: "6px",
  padding: "5px 9px",
  borderRadius: "7px",
  fontSize: "10px",
  fontWeight: 700,
};

const statusDotStyle = {
  width: "6px",
  height: "6px",
  borderRadius:
    "50%",
};

/* =========================================================
   SECURITY
========================================================= */

const securityGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "10px",
};

const securityItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "13px",
  border:
    "1px solid #eef2f6",
  borderRadius: "10px",
  background: "#f8fafc",
};

const securityItemIconStyle = {
  width: "38px",
  height: "38px",
  minWidth: "38px",
  display: "flex",
  alignItems: "center",
  justifyContent:
    "center",
  borderRadius: "9px",
  background: "#eaf2f5",
  color: "#1d526b",
};

const securityItemTitleStyle = {
  fontSize: "10px",
  fontWeight: 700,
  color: "#64748b",
};

const securityItemValueStyle = {
  marginTop: "3px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#12344d",
};

const noticeStyle = {
  display: "flex",
  alignItems:
    "flex-start",
  gap: "9px",
  marginTop: "13px",
  padding: "11px 13px",
  borderRadius: "9px",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "11px",
  lineHeight: 1.5,
};

/* =========================================================
   V6.4 – DIAGNOSTIKA
========================================================= */

const diagnosticsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "10px",
};

const diagnosticsActionRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "12px",
};

const diagnosticsSummaryStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "12px",
  fontSize: "11px",
  color: "#64748b",
};

const diagnosticsButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  border: "1px solid #dbe4ea",
  borderRadius: "8px",
  padding: "7px 10px",
  background: "#ffffff",
  color: "#1d526b",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
};

const diagnosticsTechnicalRowStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "16px",
  marginTop: "11px",
  paddingTop: "11px",
  borderTop: "1px solid #eef2f6",
  fontSize: "10px",
  color: "#64748b",
};

const detailsStyle = {
  marginTop: "13px",
  borderTop: "1px solid #eef2f6",
  paddingTop: "12px",
};

const detailsSummaryStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  cursor: "pointer",
  color: "#1d526b",
  fontSize: "11px",
  fontWeight: 700,
};

const technicalGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "8px",
  marginTop: "10px",
};

const technicalItemStyle = {
  padding: "9px 10px",
  borderRadius: "8px",
  background: "#f8fafc",
  border: "1px solid #eef2f6",
};

const technicalLabelStyle = {
  fontSize: "9px",
  fontWeight: 700,
  color: "#94a3b8",
};

const technicalValueStyle = {
  marginTop: "3px",
  fontSize: "10px",
  color: "#334155",
  wordBreak: "break-word" as const,
};

const diagnosticsSubsectionStyle = {
  marginTop: "13px",
  paddingTop: "13px",
  borderTop: "1px solid #eef2f6",
};

const diagnosticsSubsectionTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginBottom: "9px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#475569",
};

const databaseTableStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "5px",
};

const databaseRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 120px 100px",
  alignItems: "center",
  gap: "8px",
  padding: "8px 10px",
  borderRadius: "7px",
  background: "#f8fafc",
  fontSize: "10px",
  color: "#64748b",
};

const databaseNameStyle = {
  fontWeight: 700,
  color: "#12344d",
};

const databaseErrorStyle = {
  fontFamily: "monospace",
  fontWeight: 700,
  color: "#dc2626",
  textAlign: "right" as const,
};

const noErrorsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "10px",
  borderRadius: "8px",
  background: "#f0fdf4",
  color: "#15803d",
  fontSize: "11px",
};

const errorsListStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "6px",
};

const errorRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
  padding: "10px",
  borderRadius: "8px",
  background: "#fef2f2",
  border: "1px solid #fee2e2",
};

const errorRowMainStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "3px",
  minWidth: 0,
  color: "#475569",
  fontSize: "10px",
};

const errorCodeStyle = {
  flexShrink: 0,
  padding: "4px 7px",
  borderRadius: "6px",
  background: "#ffffff",
  color: "#dc2626",
  fontFamily: "monospace",
  fontSize: "10px",
  fontWeight: 700,
};

function DiagnosticItem({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div style={diagnosticItemStyle}>
      <div style={{
        ...diagnosticIconStyle,
        background: ok ? "#f0fdf4" : "#fef2f2",
        color: ok ? "#16a34a" : "#dc2626",
      }}>
        <Icon size={17} />
      </div>
      <div>
        <div style={diagnosticLabelStyle}>{label}</div>
        <div style={diagnosticValueStyle}>{value}</div>
      </div>
    </div>
  );
}

const diagnosticItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "11px",
  borderRadius: "9px",
  background: "#f8fafc",
  border: "1px solid #eef2f6",
};

const diagnosticIconStyle = {
  width: "34px",
  height: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  flexShrink: 0,
};

const diagnosticLabelStyle = {
  fontSize: "9px",
  fontWeight: 700,
  color: "#64748b",
};

const diagnosticValueStyle = {
  marginTop: "3px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#12344d",
};

function TechnicalItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={technicalItemStyle}>
      <div style={technicalLabelStyle}>{label}</div>
      <div style={technicalValueStyle}>{value}</div>
    </div>
  );
}

const seasonalIntroStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "10px",
  padding: "10px",
  borderRadius: "8px",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "10px",
  lineHeight: 1.5,
};

const seasonalThemesListStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "7px",
  marginTop: "10px",
};

const seasonalThemeRowStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(140px, 1fr) 125px 125px 85px minmax(180px, 1fr) minmax(180px, 1fr)",
  alignItems: "center",
  gap: "8px",
  padding: "9px 10px",
  border: "1px solid #eef2f6",
  borderRadius: "8px",
  background: "#ffffff",
};

const seasonalThemeMainStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const seasonalThemeNameStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#12344d",
};

const seasonalFieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "3px",
  fontSize: "9px",
  fontWeight: 700,
  color: "#94a3b8",
};

const seasonalInputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid #dbe4ea",
  borderRadius: "6px",
  padding: "6px 7px",
  fontSize: "10px",
  color: "#334155",
};

const seasonalSmallInputStyle = {
  ...seasonalInputStyle,
  width: "75px",
};

const activeSeasonalThemeStyle = {
  marginTop: "9px",
  padding: "8px 10px",
  borderRadius: "8px",
  background: "#eff6ff",
  color: "#1d526b",
  fontSize: "10px",
};

const seasonalImageFieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "3px",
  minWidth: 0,
  fontSize: "9px",
  fontWeight: 700,
  color: "#94a3b8",
};

const seasonalImageInputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid #dbe4ea",
  borderRadius: "6px",
  padding: "6px 7px",
  fontSize: "9px",
  color: "#334155",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  flexShrink: 0,
  border: "1px solid #dbe4ea",
  borderRadius: "7px",
  padding: "6px 9px",
  background: "#ffffff",
  color: "#1d526b",
  fontSize: "10px",
  fontWeight: 700,
  cursor: "pointer",
};

const resetThemesButtonStyle = {
  marginTop: "9px",
  border: "none",
  background: "transparent",
  color: "#64748b",
  fontSize: "10px",
  cursor: "pointer",
};

/* =========================================================
   LOADING / ERROR
========================================================= */

const loadingStyle = {
  padding: "30px",
  textAlign:
    "center" as const,
  color: "#64748b",
  fontSize: "12px",
};

const errorStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent:
    "center",
  gap: "8px",
  padding: "20px",
  color: "#dc2626",
  fontSize: "12px",
  background: "#fef2f2",
  borderRadius: "9px",
};

export default AdminSystemReports;