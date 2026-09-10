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
  type LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAdmin } from "../../context/AdminContext";
import { supabase } from "../../services/supabase";

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

/* =========================================================
   GLAVNA KOMPONENTA
========================================================= */

function AdminSystemReports() {
  const {
    users,
    projects,
    machines,
  } = useAdmin();

  const [workOrders, setWorkOrders] =
    useState<SystemWorkOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isOwner, setIsOwner] =
    useState(false);

  /* =======================================================
     PREVERI LASTNIKA
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const checkOwner =
      async () => {
        const {
          data: {
            user: authUser,
          },
        } =
          await supabase.auth.getUser();

        if (
          !authUser ||
          cancelled
        ) {
          return;
        }

        const owner =
          users.find(
            (user) =>
              user.id === 1
          );

        if (!owner) {
          return;
        }

        const ownerMatches =
          owner.authUserId ===
            authUser.id ||
          owner.email.toLowerCase() ===
            (
              authUser.email ??
              ""
            ).toLowerCase();

        if (!cancelled) {
          setIsOwner(
            ownerMatches
          );
        }
      };

    void checkOwner();

    return () => {
      cancelled = true;
    };
  }, [users]);

  /* =======================================================
     NALOŽI DELOVNE NALOGE
  ======================================================= */

  useEffect(() => {
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
  }, []);

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
     DOSTOP – SAMO LASTNIK
  ======================================================= */

  if (!isOwner) {
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
            Lastniški nadzor
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
            title="Lastniški dostop"
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
            izključno lastniku
            sistema in prikazuje
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