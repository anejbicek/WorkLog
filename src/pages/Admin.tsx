import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Activity,
  Archive,
  BarChart3,
  ClipboardList,
  FileText,
  Folder,
  Gauge,
  Home,
  MonitorCog,
  Settings,
  Shield,
  Users,
  Wrench,
} from "lucide-react";

import {
  useAdmin,
} from "../context/AdminContext";

import {
  useWorkOrders,
} from "../context/WorkOrderContext";

import {
  calculateUniqueWorkHours,
} from "../utils/workHours";

import AdminUsers from "../components/Admin/AdminUsers";
import AdminMachines from "../components/Admin/AdminMachines";
import AdminSettings from "../components/Admin/AdminSettings";
import AdminSecurity from "../components/Admin/AdminSecurity";
import AdminSystemReports from "../components/Admin/AdminSystemReports";
import AdminArchive from "../components/Admin/AdminArchive";

type AdminSection =
  | "home"
  | "users"
  | "machines"
  | "settings"
  | "security"
  | "reports"
  | "archive";

type MenuItem = {
  id: AdminSection;
  title: string;
  icon: typeof Home;
};

function Admin() {
  const {
    users,
    machines,
    projects,
  } = useAdmin();

  const {
    allWorkOrders,
  } = useWorkOrders();

  const [
    activeSection,
    setActiveSection,
  ] = useState<AdminSection>("home");

  const menuItems: MenuItem[] = [
    {
      id: "home",
      title: "Administracija",
      icon: Home,
    },
    {
      id: "users",
      title: "Uporabniki",
      icon: Users,
    },
    {
      id: "machines",
      title: "Stroji",
      icon: MonitorCog,
    },
    {
      id: "settings",
      title: "Nastavitve",
      icon: Settings,
    },
    {
      id: "security",
      title: "Varnost in pravice",
      icon: Shield,
    },
    {
      id: "reports",
      title: "Poročila sistema",
      icon: FileText,
    },
    {
      id: "archive",
      title: "Arhiv",
      icon: Archive,
    },
  ];

  const activeUsers = useMemo(
    () =>
      users.filter(
        (user) => user.active
      ),
    [users]
  );

  const activeMachines = useMemo(
    () =>
      machines.filter(
        (machine) => machine.active
      ),
    [machines]
  );

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.status === "active"
      ),
    [projects]
  );

  const currentMonth = useMemo(
    () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
    },
    []
  );

  const monthWorkOrders = useMemo(
    () =>
      allWorkOrders.filter(
        (order) =>
          order.date.startsWith(
            currentMonth
          )
      ),
    [allWorkOrders, currentMonth]
  );

  const monthHours = useMemo(
    () =>
      calculateUniqueWorkHours(
        monthWorkOrders
      ),
    [monthWorkOrders]
  );

  const monthOvertime = useMemo(
    () =>
      monthWorkOrders.reduce(
        (sum, order) =>
          sum +
          Number(
            order.overtimeHours ?? 0
          ),
        0
      ),
    [monthWorkOrders]
  );

  const roleCounts = useMemo(
    () => ({
      admin: users.filter(
        (user) =>
          user.role === "admin" &&
          user.active
      ).length,
      worker: users.filter(
        (user) =>
          user.role === "worker" &&
          user.active
      ).length,
    }),
    [users]
  );

  const projectStatusCounts = useMemo(
    () => ({
      active: projects.filter(
        (project) =>
          project.status === "active"
      ).length,
      preparation: projects.filter(
        (project) =>
          project.status === "preparation"
      ).length,
      completed: projects.filter(
        (project) =>
          project.status === "completed"
      ).length,
    }),
    [projects]
  );

  const machineStatusCounts = useMemo(
    () => ({
      active: machines.filter(
        (machine) => machine.active
      ).length,
      inactive: machines.filter(
        (machine) => !machine.active
      ).length,
    }),
    [machines]
  );

  const projectHours = useMemo(
    () => {
      const totals = new Map<
        string,
        number
      >();

      for (
        const order of monthWorkOrders
      ) {
        const project =
          order.project?.trim() ||
          "Brez projekta";

        totals.set(
          project,
          (totals.get(project) ?? 0) +
            Number(order.hours ?? 0)
        );
      }

      return Array.from(
        totals.entries()
      )
        .map(
          ([name, hours]) => ({
            name,
            hours,
          })
        )
        .sort(
          (a, b) =>
            b.hours - a.hours
        )
        .slice(0, 6);
    },
    [monthWorkOrders]
  );

  const maxProjectHours =
    projectHours[0]?.hours ?? 1;

  const today = new Date();

  const dateLabel =
    today.toLocaleDateString(
      "sl-SI",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const renderContent = () => {
    if (
      activeSection === "users"
    ) {
      return <AdminUsers />;
    }

    if (
      activeSection === "machines"
    ) {
      return <AdminMachines />;
    }

    if (
      activeSection === "settings"
    ) {
      return <AdminSettings />;
    }

    if (
      activeSection === "security"
    ) {
      return <AdminSecurity />;
    }

    if (
      activeSection === "reports"
    ) {
      return <AdminSystemReports />;
    }

    if (
      activeSection === "archive"
    ) {
      return <AdminArchive />;
    }

    return (
      <AdministrationHome
        activeUsers={activeUsers.length}
        activeMachines={
          activeMachines.length
        }
        activeProjects={
          activeProjects.length
        }
        workOrderCount={
          monthWorkOrders.length
        }
        monthHours={monthHours}
        monthOvertime={
          monthOvertime
        }
        roleCounts={roleCounts}
        projectStatusCounts={
          projectStatusCounts
        }
        machineStatusCounts={
          machineStatusCounts
        }
        projectHours={projectHours}
        maxProjectHours={
          maxProjectHours
        }
        dateLabel={dateLabel}
        onNavigate={
          setActiveSection
        }
      />
    );
  };

  return (
    <div
      style={pageStyle}
    >
      <div
        style={headerStyle}
      >
        <div>
          <h1
            style={titleStyle}
          >
            Administracija
          </h1>

          <p
            style={
              subtitleStyle
            }
          >
            Upravljanje uporabnikov,
            strojev, pravic in
            sistemskih nastavitev WorkLoga.
          </p>
        </div>

        <div
          style={
            dateBoxStyle
          }
        >
          <Activity
            size={19}
            strokeWidth={2}
          />

          <div>
            <div
              style={
                dateTextStyle
              }
            >
              {dateLabel}
            </div>

            <div
              style={
                timeTextStyle
              }
            >
              {today.toLocaleTimeString(
                "sl-SI",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={
          layoutStyle
        }
      >
        <aside
          style={
            sidebarStyle
          }
        >
          <div
            style={
              sidebarTitleStyle
            }
          >
            ADMINISTRACIJA
          </div>

          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                activeSection ===
                item.id;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      item.id
                    )
                  }
                  style={{
                    ...sidebarButtonStyle,
                    ...(active
                      ? sidebarButtonActiveStyle
                      : {}),
                  }}
                >
                  <Icon
                    size={19}
                    strokeWidth={
                      active
                        ? 2.4
                        : 2
                    }
                  />

                  <span>
                    {item.title}
                  </span>
                </button>
              );
            }
          )}

          <div
            style={
              sidebarDividerStyle
            }
          />

          <div
            style={
              sidebarHintStyle
            }
          >
            <Shield
              size={16}
              strokeWidth={2}
            />

            <span>
              Administratorski
              dostop
            </span>
          </div>
        </aside>

        <main
          style={
            contentStyle
          }
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

type AdministrationHomeProps = {
  activeUsers: number;
  activeMachines: number;
  activeProjects: number;
  workOrderCount: number;
  monthHours: number;
  monthOvertime: number;
  roleCounts: {
    admin: number;
    worker: number;
  };
  projectStatusCounts: {
    active: number;
    preparation: number;
    completed: number;
  };
  machineStatusCounts: {
    active: number;
    inactive: number;
  };
  projectHours: Array<{
    name: string;
    hours: number;
  }>;
  maxProjectHours: number;
  dateLabel: string;
  onNavigate: (
    section: AdminSection
  ) => void;
};

function AdministrationHome({
  activeUsers,
  activeMachines,
  activeProjects,
  workOrderCount,
  monthHours,
  monthOvertime,
  roleCounts,
  projectStatusCounts,
  machineStatusCounts,
  projectHours,
  maxProjectHours,
  dateLabel,
  onNavigate,
}: AdministrationHomeProps) {
  const totalUsers =
    roleCounts.admin +
    roleCounts.worker;

  const totalMachines =
    machineStatusCounts.active +
    machineStatusCounts.inactive;

  const totalProjects =
    projectStatusCounts.active +
    projectStatusCounts.preparation +
    projectStatusCounts.completed;

  return (
    <>
      <div
        style={
          filterRowStyle
        }
      >
        <div
          style={
            monthLabelStyle
          }
        >
          September 2026
        </div>

        <div
          style={
            filterButtonsStyle
          }
        >
          <button
            type="button"
            style={
              activeFilterStyle
            }
          >
            Danes
          </button>

          <button
            type="button"
            style={
              filterButtonStyle
            }
          >
            Ta teden
          </button>

          <button
            type="button"
            style={
              filterButtonStyle
            }
          >
            Ta mesec
          </button>

          <button
            type="button"
            style={
              filterButtonStyle
            }
          >
            Letos
          </button>
        </div>
      </div>

      <div
        style={
          cardsGridStyle
        }
      >
        <MetricCard
          icon={Users}
          title="UPORABNIKI"
          value={activeUsers}
          subtitle="aktivnih uporabnikov"
          accent="#2563eb"
        />

        <MetricCard
          icon={Wrench}
          title="STROJI"
          value={activeMachines}
          subtitle="aktivnih strojev"
          accent="#16a34a"
        />

        <MetricCard
          icon={Folder}
          title="PROJEKTI"
          value={activeProjects}
          subtitle="aktivnih projektov"
          accent="#f97316"
        />

        <MetricCard
          icon={ClipboardList}
          title="DELOVNI NALOGI"
          value={workOrderCount}
          subtitle="ta mesec"
          accent="#7c3aed"
        />
      </div>

      <div
        style={
          chartGridStyle
        }
      >
        <StatusCard
          title="Uporabniki po vlogah"
          icon={Users}
          total={totalUsers}
          centerLabel="uporabnikov"
          segments={[
            {
              label:
                "Administrator",
              value:
                roleCounts.admin,
              color:
                "#2563eb",
            },
            {
              label:
                "Delavec",
              value:
                roleCounts.worker,
              color:
                "#f97316",
            },
          ]}
        />

        <StatusCard
          title="Stroji po statusu"
          icon={Wrench}
          total={totalMachines}
          centerLabel="strojev"
          segments={[
            {
              label: "Aktiven",
              value:
                machineStatusCounts.active,
              color:
                "#16a34a",
            },
            {
              label: "Neaktiven",
              value:
                machineStatusCounts.inactive,
              color:
                "#ef4444",
            },
          ]}
        />

        <StatusCard
          title="Projekti po statusu"
          icon={Folder}
          total={totalProjects}
          centerLabel="projektov"
          segments={[
            {
              label:
                "V delu",
              value:
                projectStatusCounts.active,
              color:
                "#16a34a",
            },
            {
              label:
                "V pripravi",
              value:
                projectStatusCounts.preparation,
              color:
                "#3b82f6",
            },
            {
              label:
                "Zaključen",
              value:
                projectStatusCounts.completed,
              color:
                "#94a3b8",
            },
          ]}
        />
      </div>

      <div
        style={
          lowerGridStyle
        }
      >
        <Panel
          title="Ure po projektih"
          icon={BarChart3}
          action="Ta mesec"
        >
          {projectHours.length === 0 ? (
            <EmptyChart>
              Trenutno še ni podatkov
              o opravljenih urah.
            </EmptyChart>
          ) : (
            <div
              style={
                barsContainerStyle
              }
            >
              {projectHours.map(
                (item, index) => (
                  <div
                    key={
                      item.name
                    }
                    style={
                      barRowStyle
                    }
                  >
                    <div
                      style={
                        barLabelStyle
                      }
                    >
                      {item.name}
                    </div>

                    <div
                      style={
                        barTrackStyle
                      }
                    >
                      <div
                        style={{
                          ...barStyle,
                          width: `${Math.max(
                            4,
                            (item.hours /
                              maxProjectHours) *
                              100
                          )}%`,
                          background:
                            barColors[
                              index %
                                barColors.length
                            ],
                        }}
                      />
                    </div>

                    <strong
                      style={
                        barValueStyle
                      }
                    >
                      {item.hours.toFixed(
                        1
                      )}{" "}
                      h
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </Panel>

        <Panel
          title="Pregled dela"
          icon={Gauge}
          action="Ta mesec"
        >
          <div
            style={
              overviewGridStyle
            }
          >
            <OverviewValue
              label="Delovne ure"
              value={`${monthHours.toFixed(
                1
              )} h`}
            />

            <OverviewValue
              label="Nadure"
              value={`${monthOvertime.toFixed(
                1
              )} h`}
            />

            <OverviewValue
              label="Delovni nalogi"
              value={String(
                workOrderCount
              )}
            />

            <OverviewValue
              label="Danes"
              value={dateLabel.split(
                ","
              )[0]}
            />
          </div>

          <div
            style={
              quickActionsTitleStyle
            }
          >
            Hitra dejanja
          </div>

          <div
            style={
              quickActionsGridStyle
            }
          >
            <QuickAction
              icon={Users}
              label="Dodaj uporabnika"
              onClick={() =>
                onNavigate(
                  "users"
                )
              }
            />

            <QuickAction
              icon={MonitorCog}
              label="Uredi stroje"
              onClick={() =>
                onNavigate(
                  "machines"
                )
              }
            />

            <QuickAction
              icon={Shield}
              label="Varnost in pravice"
              onClick={() =>
                onNavigate(
                  "security"
                )
              }
            />

            <QuickAction
              icon={Settings}
              label="Nastavitve"
              onClick={() =>
                onNavigate(
                  "settings"
                )
              }
            />
          </div>
        </Panel>
      </div>

      <Panel
        title="Kaj imamo v administraciji?"
        icon={Settings}
      >
        <div
          style={
            infoGridStyle
          }
        >
          <InfoItem
            icon={Users}
            title="Uporabniki"
            text="Uporabniški računi, vloge in aktivnost."
            onClick={() =>
              onNavigate(
                "users"
              )
            }
          />

          <InfoItem
            icon={MonitorCog}
            title="Stroji"
            text="Seznam strojev in njihovo aktivno stanje."
            onClick={() =>
              onNavigate(
                "machines"
              )
            }
          />

          <InfoItem
            icon={Shield}
            title="Varnost in pravice"
            text="Vloge uporabnikov in pregled dostopov."
            onClick={() =>
              onNavigate(
                "security"
              )
            }
          />

          <InfoItem
            icon={FileText}
            title="Poročila sistema"
            text="Pregled delovnih nalogov, ur in aktivnosti."
            onClick={() =>
              onNavigate(
                "reports"
              )
            }
          />

          <InfoItem
            icon={Archive}
            title="Arhiv"
            text="Neaktivni uporabniki, stroji in zaključeni projekti."
            onClick={() =>
              onNavigate(
                "archive"
              )
            }
          />

          <InfoItem
            icon={Settings}
            title="Nastavitve"
            text="Delovni čas, prazniki, PDF in obvestila."
            onClick={() =>
              onNavigate(
                "settings"
              )
            }
          />
        </div>
      </Panel>
    </>
  );
}

type MetricCardProps = {
  icon: typeof Users;
  title: string;
  value: number;
  subtitle: string;
  accent: string;
};

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  accent,
}: MetricCardProps) {
  return (
    <div
      style={
        metricCardStyle
      }
    >
      <div
        style={{
          ...metricIconStyle,
          background: `${accent}18`,
          color: accent,
        }}
      >
        <Icon
          size={24}
          strokeWidth={2.2}
        />
      </div>

      <div
        style={
          metricContentStyle
        }
      >
        <div
          style={
            metricTitleStyle
          }
        >
          {title}
        </div>

        <div
          style={
            metricValueStyle
          }
        >
          {value}
        </div>

        <div
          style={
            metricSubtitleStyle
          }
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          ...metricFaintIconStyle,
          color: accent,
        }}
      >
        <Icon
          size={58}
          strokeWidth={1.4}
        />
      </div>
    </div>
  );
}

type StatusSegment = {
  label: string;
  value: number;
  color: string;
};

type StatusCardProps = {
  title: string;
  icon: typeof Users;
  total: number;
  centerLabel: string;
  segments: StatusSegment[];
};

function StatusCard({
  title,
  icon: Icon,
  total,
  centerLabel,
  segments,
}: StatusCardProps) {
  const gradient =
    createDonutGradient(
      segments,
      total
    );

  return (
    <div
      style={
        panelStyle
      }
    >
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

          <h3
            style={
              panelTitleStyle
            }
          >
            {title}
          </h3>
        </div>
      </div>

      <div
        style={
          donutLayoutStyle
        }
      >
        <div
          style={{
            ...donutStyle,
            background:
              total > 0
                ? gradient
                : "#e2e8f0",
          }}
        >
          <div
            style={
              donutCenterStyle
            }
          >
            <strong
              style={
                donutNumberStyle
              }
            >
              {total}
            </strong>

            <span
              style={
                donutLabelStyle
              }
            >
              {centerLabel}
            </span>
          </div>
        </div>

        <div
          style={
            legendStyle
          }
        >
          {segments.map(
            (segment) => (
              <div
                key={
                  segment.label
                }
                style={
                  legendRowStyle
                }
              >
                <span
                  style={{
                    ...legendDotStyle,
                    background:
                      segment.color,
                  }}
                />

                <span
                  style={
                    legendLabelStyle
                  }
                >
                  {segment.label}
                </span>

                <strong>
                  {segment.value}
                </strong>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

type PanelProps = {
  title: string;
  icon: typeof Settings;
  action?: string;
  children: ReactNode;
};

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: PanelProps) {
  return (
    <section
      style={
        panelStyle
      }
    >
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

          <h3
            style={
              panelTitleStyle
            }
          >
            {title}
          </h3>
        </div>

        {action && (
          <span
            style={
              panelActionStyle
            }
          >
            {action}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

function EmptyChart({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={
        emptyChartStyle
      }
    >
      {children}
    </div>
  );
}

function OverviewValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={
        overviewValueStyle
      }
    >
      <span
        style={
          overviewLabelStyle
        }
      >
        {label}
      </span>

      <strong
        style={
          overviewNumberStyle
        }
      >
        {value}
      </strong>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Users;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        quickActionStyle
      }
    >
      <Icon
        size={18}
        color="#2563eb"
      />

      <span>
        {label}
      </span>
    </button>
  );
}

function InfoItem({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: typeof Users;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        infoItemStyle
      }
    >
      <div
        style={
          infoIconStyle
        }
      >
        <Icon
          size={20}
          color="#2563eb"
        />
      </div>

      <div>
        <strong
          style={
            infoTitleStyle
          }
        >
          {title}
        </strong>

        <div
          style={
            infoTextStyle
          }
        >
          {text}
        </div>
      </div>
    </button>
  );
}

function createDonutGradient(
  segments: StatusSegment[],
  total: number
) {
  if (
    total <= 0 ||
    segments.length === 0
  ) {
    return "#e2e8f0";
  }

  let current = 0;

  const parts = segments.map(
    (segment) => {
      const start =
        (current / total) * 100;

      current +=
        segment.value;

      const end =
        (current / total) * 100;

      return `${segment.color} ${start}% ${end}%`;
    }
  );

  return `conic-gradient(${parts.join(
    ", "
  )})`;
}

const barColors = [
  "#60a5fa",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#94a3b8",
  "#cbd5e1",
];

const pageStyle = {
  width: "100%",
  maxWidth: "1500px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "22px",
};

const titleStyle = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 700,
  color: "#12344d",
};

const subtitleStyle = {
  marginTop: "7px",
  marginBottom: 0,
  fontSize: "15px",
  color: "#64748b",
};

const dateBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "11px 15px",
  border: "1px solid #dbe3e8",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#1d526b",
  boxShadow:
    "0 2px 8px rgba(15,23,42,0.03)",
};

const dateTextStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#334155",
};

const timeTextStyle = {
  marginTop: "2px",
  fontSize: "12px",
  color: "#64748b",
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns:
    "210px minmax(0, 1fr)",
  gap: "24px",
  alignItems: "start",
};

const sidebarStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "10px",
  boxShadow:
    "0 4px 14px rgba(15,23,42,0.04)",
};

const sidebarTitleStyle = {
  padding:
    "10px 12px 8px",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing:
    "0.08em",
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
  border:
    "1px solid transparent",
  borderRadius: "9px",
  background: "transparent",
  color: "#334155",
  fontSize: "14px",
  fontWeight: 600,
  textAlign:
    "left" as const,
  cursor: "pointer",
};

const sidebarButtonActiveStyle = {
  background: "#1d526b",
  color: "#ffffff",
  boxShadow:
    "0 4px 10px rgba(29,82,107,0.18)",
};

const sidebarDividerStyle = {
  height: "1px",
  margin:
    "12px 6px",
  background: "#e5e7eb",
};

const sidebarHintStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding:
    "9px 12px",
  color: "#64748b",
  fontSize: "11px",
};

const contentStyle = {
  minWidth: 0,
};

const filterRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px",
};

const monthLabelStyle = {
  marginRight: "2px",
  padding:
    "9px 13px",
  border:
    "1px solid #dbe3e8",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 600,
};

const filterButtonsStyle = {
  display: "flex",
};

const activeFilterStyle = {
  height: "38px",
  padding: "0 15px",
  border:
    "1px solid #1d526b",
  background: "#1d526b",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const filterButtonStyle = {
  height: "38px",
  padding: "0 15px",
  border:
    "1px solid #dbe3e8",
  borderLeft: 0,
  background: "#ffffff",
  color: "#475569",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "14px",
};

const metricCardStyle = {
  position:
    "relative" as const,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  minHeight: "126px",
  padding: "18px",
  border:
    "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const metricIconStyle = {
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  flexShrink: 0,
};

const metricContentStyle = {
  position:
    "relative" as const,
  zIndex: 1,
};

const metricTitleStyle = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#64748b",
  letterSpacing:
    "0.02em",
};

const metricValueStyle = {
  marginTop: "4px",
  fontSize: "30px",
  lineHeight: 1,
  fontWeight: 700,
  color: "#12344d",
};

const metricSubtitleStyle = {
  marginTop: "7px",
  fontSize: "12px",
  color: "#64748b",
};

const metricFaintIconStyle = {
  position:
    "absolute" as const,
  right: "10px",
  top: "13px",
  opacity: 0.08,
};

const chartGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "14px",
};

const lowerGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "1.25fr 0.75fr",
  gap: "14px",
  marginBottom: "14px",
};

const panelStyle = {
  minWidth: 0,
  padding: "18px",
  border:
    "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.035)",
};

const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "17px",
};

const panelTitleGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
};

const panelTitleStyle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 700,
  color: "#12344d",
};

const panelActionStyle = {
  fontSize: "12px",
  color: "#64748b",
};

const donutLayoutStyle = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  minHeight: "155px",
};

const donutStyle = {
  width: "132px",
  height: "132px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  flexShrink: 0,
};

const donutCenterStyle = {
  width: "78px",
  height: "78px",
  display: "flex",
  flexDirection:
    "column" as const,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#ffffff",
};

const donutNumberStyle = {
  fontSize: "22px",
  lineHeight: 1,
  color: "#12344d",
};

const donutLabelStyle = {
  marginTop: "4px",
  fontSize: "10px",
  color: "#64748b",
  textAlign:
    "center" as const,
};

const legendStyle = {
  flex: 1,
  minWidth: 0,
};

const legendRowStyle = {
  display: "grid",
  gridTemplateColumns:
    "10px minmax(0,1fr) auto",
  alignItems: "center",
  gap: "7px",
  marginBottom: "9px",
  fontSize: "12px",
  color: "#475569",
};

const legendDotStyle = {
  width: "9px",
  height: "9px",
  borderRadius: "50%",
};

const legendLabelStyle = {
  overflow: "hidden",
  textOverflow:
    "ellipsis",
  whiteSpace:
    "nowrap" as const,
};

const barsContainerStyle = {
  display: "flex",
  flexDirection:
    "column" as const,
  gap: "11px",
};

const barRowStyle = {
  display: "grid",
  gridTemplateColumns:
    "155px minmax(0,1fr) 48px",
  alignItems: "center",
  gap: "9px",
};

const barLabelStyle = {
  overflow: "hidden",
  textOverflow:
    "ellipsis",
  whiteSpace:
    "nowrap" as const,
  fontSize: "12px",
  color: "#334155",
};

const barTrackStyle = {
  height: "15px",
  overflow: "hidden",
  borderRadius: "5px",
  background: "#eef2f6",
};

const barStyle = {
  height: "100%",
  borderRadius: "5px",
};

const barValueStyle = {
  fontSize: "12px",
  color: "#334155",
  textAlign:
    "right" as const,
};

const emptyChartStyle = {
  minHeight: "180px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontSize: "13px",
};

const overviewGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0,1fr))",
  gap: "10px",
};

const overviewValueStyle = {
  padding: "13px",
  border:
    "1px solid #e8edf1",
  borderRadius: "10px",
  background: "#f8fafc",
};

const overviewLabelStyle = {
  display: "block",
  fontSize: "11px",
  color: "#64748b",
};

const overviewNumberStyle = {
  display: "block",
  marginTop: "5px",
  fontSize: "18px",
  color: "#12344d",
};

const quickActionsTitleStyle = {
  marginTop: "17px",
  marginBottom: "9px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#64748b",
};

const quickActionsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0,1fr))",
  gap: "8px",
};

const quickActionStyle = {
  minHeight: "40px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0 11px",
  border:
    "1px solid #dbe3e8",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  textAlign:
    "left" as const,
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0,1fr))",
  gap: "10px",
};

const infoItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "11px",
  padding: "13px",
  border:
    "1px solid #e2e8f0",
  borderRadius: "10px",
  background: "#ffffff",
  textAlign:
    "left" as const,
  cursor: "pointer",
};

const infoIconStyle = {
  width: "36px",
  height: "36px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9px",
  background: "#eff6ff",
  flexShrink: 0,
};

const infoTitleStyle = {
  display: "block",
  fontSize: "13px",
  color: "#12344d",
};

const infoTextStyle = {
  marginTop: "4px",
  fontSize: "11px",
  lineHeight: 1.45,
  color: "#64748b",
};

export default Admin;
