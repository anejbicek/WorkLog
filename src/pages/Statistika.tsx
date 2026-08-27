import {
  useMemo,
  useState,
} from "react";

import {
  useWorkOrders,
} from "../context/WorkOrderContext";

import WorkOrderEditModal from "../components/Workorders/WorkOrderEditModal";

import type { WorkOrder } from "../types/WorkOrder";

/* =====================================================
   STATUS DNEVA
===================================================== */

type DayStatus =
  | "none"
  | "work"
  | "twoMachines"
  | "sick"
  | "vacation"
  | "holiday";

/* =====================================================
   STATISTIKA
===================================================== */

function Statistika() {
  const {
    workOrders,
  } = useWorkOrders();

  /* ===================================================
     IZBIRA MESECA
  =================================================== */

  const today = new Date();

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`
  );

  /* ===================================================
     UREDI KARTICO
  =================================================== */

  const [
    editingWorkOrder,
    setEditingWorkOrder,
  ] = useState<WorkOrder | null>(
    null
  );

  /* ===================================================
     STATUSI DNI

     Zaenkrat lokalno.
     Kasneje jih bova shranila skupaj
     z ostalimi podatki.
  =================================================== */

  const [
    dayStatuses,
    setDayStatuses,
  ] = useState<
    Record<string, DayStatus>
  >({});

  /* ===================================================
     WORK ORDERJI IZBRANEGA MESECA
  =================================================== */

  const monthWorkOrders =
    useMemo(() => {
      return workOrders.filter(
        (workOrder) =>
          workOrder.date.startsWith(
            selectedMonth
          )
      );
    }, [
      workOrders,
      selectedMonth,
    ]);

  /* ===================================================
     FORMAT UR
  =================================================== */

  const formatHours = (
    value: number
  ) => {
    return `${value.toFixed(2)} h`;
  };

  /* ===================================================
     SEŠTEVKI
  =================================================== */

  const regularHours =
    monthWorkOrders.reduce(
      (sum, workOrder) =>
        sum +
        Number(
          workOrder.regularHours || 0
        ),
      0
    );

  const nightHours =
    monthWorkOrders.reduce(
      (sum, workOrder) =>
        sum +
        Number(
          workOrder.nightHours || 0
        ),
      0
    );

  const holidayHours =
    monthWorkOrders.reduce(
      (sum, workOrder) =>
        sum +
        Number(
          workOrder.holidayHours || 0
        ),
      0
    );

  const additionalHours =
    monthWorkOrders.reduce(
      (sum, workOrder) =>
        sum +
        Number(
          workOrder.additionalHours || 0
        ),
      0
    );

  const overtimeHours =
    monthWorkOrders.reduce(
      (sum, workOrder) =>
        sum +
        Number(
          workOrder.overtimeHours || 0
        ),
      0
    );

  const totalHours =
    regularHours +
    nightHours +
    holidayHours +
    additionalHours +
    overtimeHours;

  /* ===================================================
     STATISTIKA STROJEV
  =================================================== */

  const machineTotals: Record<
    string,
    number
  > = {};

  monthWorkOrders.forEach(
    (workOrder) => {
      if (workOrder.machine) {
        machineTotals[
          workOrder.machine
        ] =
          (machineTotals[
            workOrder.machine
          ] || 0) +
          Number(
            workOrder.hours || 0
          );
      }

      if (
        workOrder.additionalMachine
      ) {
        machineTotals[
          workOrder.additionalMachine
        ] =
          (machineTotals[
            workOrder
              .additionalMachine
          ] || 0) +
          Number(
            workOrder.hours || 0
          );
      }
    }
  );

  /* ===================================================
     STATISTIKA PROJEKTOV
  =================================================== */

  const projectTotals: Record<
    string,
    number
  > = {};

  monthWorkOrders.forEach(
    (workOrder) => {
      if (!workOrder.project) {
        return;
      }

      projectTotals[
        workOrder.project
      ] =
        (projectTotals[
          workOrder.project
        ] || 0) +
        Number(
          workOrder.hours || 0
        );
    }
  );

  /* ===================================================
     PODATKI PO DNEVIH
  =================================================== */

  const dailyData =
    useMemo(() => {
      const days: Record<
        string,
        {
          orders: WorkOrder[];
          hours: number;
          additionalHours: number;
          twoMachines: boolean;
        }
      > = {};

      monthWorkOrders.forEach(
        (workOrder) => {
          if (
            !days[
              workOrder.date
            ]
          ) {
            days[
              workOrder.date
            ] = {
              orders: [],
              hours: 0,
              additionalHours: 0,
              twoMachines: false,
            };
          }

          days[
            workOrder.date
          ].orders.push(
            workOrder
          );

          days[
            workOrder.date
          ].hours += Number(
            workOrder.hours || 0
          );

          days[
            workOrder.date
          ].additionalHours +=
            Number(
              workOrder.additionalHours ||
                0
            );

          if (
            workOrder.additionalMachine
          ) {
            days[
              workOrder.date
            ].twoMachines = true;
          }
        }
      );

      return days;
    }, [monthWorkOrders]);

  /* ===================================================
     MESEC
  =================================================== */

  const [
    yearString,
    monthString,
  ] = selectedMonth.split("-");

  const year =
    Number(yearString);

  const month =
    Number(monthString);

  const daysInMonth =
    new Date(
      year,
      month,
      0
    ).getDate();

  const firstDay =
    new Date(
      year,
      month - 1,
      1
    ).getDay();

  /*
    JavaScript:
    0 = nedelja

    Mi želimo:
    PON TOR SRE ČET PET SOB NED
  */

  const firstDayMonday =
    firstDay === 0
      ? 6
      : firstDay - 1;

  const calendarCells: (
    | number
    | null
  )[] = [];

  for (
    let i = 0;
    i < firstDayMonday;
    i++
  ) {
    calendarCells.push(
      null
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(
      day
    );
  }

  /* ===================================================
     IME MESECA
  =================================================== */

  const monthName =
    new Date(
      year,
      month - 1,
      1
    ).toLocaleDateString(
      "sl-SI",
      {
        month: "long",
        year: "numeric",
      }
    );

  /* ===================================================
     SPREMENI STATUS
  =================================================== */

  const setDayStatus = (
    dateString: string,
    status: DayStatus
  ) => {
    setDayStatuses(
      (previous) => ({
        ...previous,
        [dateString]:
          status,
      })
    );
  };

  /* ===================================================
     STATUS TEKSTA
  =================================================== */

  const getStatusText = (
    status: DayStatus
  ) => {
    switch (status) {
      case "sick":
        return "Bolniška";

      case "vacation":
        return "Dopust";

      case "holiday":
        return "Praznik";

      case "twoMachines":
        return "Delo – 2 stroja";

      case "work":
        return "Delal";

      default:
        return "Brez vnosa";
    }
  };

  /* ===================================================
     STATUS BARVA
  =================================================== */

  const getDayColors = (
    dateString: string
  ) => {
    const data =
      dailyData[
        dateString
      ];

    const manualStatus =
      dayStatuses[
        dateString
      ];

    /*
      Ročno nastavljen status
      ima prednost.
    */

    if (
      manualStatus ===
      "sick"
    ) {
      return {
        background:
          "#fee2e2",
        border:
          "#ef4444",
        text:
          "#991b1b",
      };
    }

    if (
      manualStatus ===
      "vacation"
    ) {
      return {
        background:
          "#fef3c7",
        border:
          "#f59e0b",
        text:
          "#92400e",
      };
    }

    if (
      manualStatus ===
      "holiday"
    ) {
      return {
        background:
          "#e0e7ff",
        border:
          "#6366f1",
        text:
          "#3730a3",
      };
    }

    /*
      Dva stroja
    */

    if (
      data?.twoMachines
    ) {
      return {
        background:
          "#d9f5ef",
        border:
          "#0f766e",
        text:
          "#115e59",
      };
    }

    /*
      En stroj
    */

    if (data) {
      return {
        background:
          "#dcfce7",
        border:
          "#15803d",
        text:
          "#166534",
      };
    }

    /*
      Prazen dan
    */

    return {
      background:
        "#ffffff",
      border:
        "#e2e8f0",
      text:
        "#64748b",
    };
  };

  /* ===================================================
     KLIK NA DAN
  =================================================== */

  const handleDayClick = (
    dateString: string
  ) => {
    const currentStatus =
      dayStatuses[
        dateString
      ];

    const data =
      dailyData[
        dateString
      ];

    let message =
      "Izberi status dneva:\n\n";

    message +=
      "1 - Delal\n";

    message +=
      "2 - Bolniška\n";

    message +=
      "3 - Dopust\n";

    message +=
      "4 - Praznik\n";

    message +=
      "5 - Brez vnosa\n";

    const choice =
      window.prompt(
        message,
        currentStatus ===
          "sick"
          ? "2"
          : currentStatus ===
            "vacation"
          ? "3"
          : currentStatus ===
            "holiday"
          ? "4"
          : data
          ? "1"
          : "5"
      );

    if (
      choice === null
    ) {
      return;
    }

    switch (choice) {
      case "1":
        setDayStatus(
          dateString,
          data?.twoMachines
            ? "twoMachines"
            : "work"
        );
        break;

      case "2":
        setDayStatus(
          dateString,
          "sick"
        );
        break;

      case "3":
        setDayStatus(
          dateString,
          "vacation"
        );
        break;

      case "4":
        setDayStatus(
          dateString,
          "holiday"
        );
        break;

      case "5":
        setDayStatus(
          dateString,
          "none"
        );
        break;

      default:
        break;
    }
  };

  /* ===================================================
     DVOJNI KLIK
  =================================================== */

  const handleDayDoubleClick =
    (
      dateString: string
    ) => {
      const data =
        dailyData[
          dateString
        ];

      if (
        !data ||
        data.orders.length ===
          0
      ) {
        return;
      }

      /*
        Če je več kartic,
        trenutno odpremo prvo.
      */

      setEditingWorkOrder(
        data.orders[0]
      );
    };

  /* ===================================================
     RETURN
  =================================================== */

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
      }}
    >
      {/* =========================================
          NASLOV
      ========================================= */}

      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: 700,
            color: "#12344d",
          }}
        >
          Statistika
        </h1>

        <p
          style={{
            marginTop: "8px",
            fontSize: "15px",
            color: "#64748b",
          }}
        >
          Pregled opravljenega
          dela po mesecih.
        </p>
      </div>

      {/* =========================================
          IZBIRA MESECA
      ========================================= */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "20px",
          marginBottom:
            "20px",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          boxSizing:
            "border-box",
        }}
      >
        <div>
          <div
            style={{
              fontSize:
                "13px",
              color:
                "#64748b",
              marginBottom:
                "5px",
            }}
          >
            Izbran mesec
          </div>

          <div
            style={{
              fontSize:
                "20px",
              fontWeight:
                700,
              color:
                "#12344d",
              textTransform:
                "capitalize",
            }}
          >
            {monthName}
          </div>
        </div>

        <input
          type="month"
          value={
            selectedMonth
          }
          onChange={(event) =>
            setSelectedMonth(
              event.target.value
            )
          }
          style={{
            width:
              "210px",
            height:
              "42px",
            border:
              "1px solid #cbd5e1",
            borderRadius:
              "9px",
            padding:
              "0 12px",
            fontSize:
              "14px",
            background:
              "#ffffff",
            boxSizing:
              "border-box",
          }}
        />
      </div>

      {/* =========================================
          KOLEDAR
      ========================================= */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "16px",
          padding:
            "25px",
          marginBottom:
            "20px",
          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize:
                  "21px",
                fontWeight:
                  700,
                color:
                  "#12344d",
              }}
            >
              Koledar
            </h2>

            <p
              style={{
                marginTop:
                  "6px",
                marginBottom:
                  0,
                fontSize:
                  "14px",
                color:
                  "#64748b",
              }}
            >
              Klikni za status,
              dvakrat klikni za
              urejanje kartice.
            </p>
          </div>

          <div
            style={{
              fontSize:
                "17px",
              fontWeight:
                700,
              color:
                "#12344d",
              textTransform:
                "capitalize",
            }}
          >
            {monthName}
          </div>
        </div>

        {/* =====================================
            DNEVI TEDNA
        ===================================== */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(7, 1fr)",
            gap: "8px",
            marginBottom:
              "8px",
          }}
        >
          {[
            "PON",
            "TOR",
            "SRE",
            "ČET",
            "PET",
            "SOB",
            "NED",
          ].map(
            (day) => (
              <div
                key={day}
                style={{
                  textAlign:
                    "center",
                  fontSize:
                    "12px",
                  fontWeight:
                    700,
                  color:
                    "#64748b",
                  padding:
                    "8px 0",
                }}
              >
                {day}
              </div>
            )
          )}
        </div>

        {/* =====================================
            CELICE KOLEDARJA
        ===================================== */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(7, 1fr)",
            gap: "8px",
          }}
        >
          {calendarCells.map(
            (
              day,
              index
            ) => {
              if (
                day === null
              ) {
                return (
                  <div
                    key={`empty-${index}`}
                    style={{
                      minHeight:
                        "105px",
                    }}
                  />
                );
              }

              const dateString =
                `${year}-${String(
                  month
                ).padStart(
                  2,
                  "0"
                )}-${String(
                  day
                ).padStart(
                  2,
                  "0"
                )}`;

              const data =
                dailyData[
                  dateString
                ];

              const manualStatus =
                dayStatuses[
                  dateString
                ];

              const colors =
                getDayColors(
                  dateString
                );

              const statusText =
                manualStatus
                  ? getStatusText(
                      manualStatus
                    )
                  : data
                  ? data.twoMachines
                    ? "Delo – 2 stroja"
                    : "Delal"
                  : "Brez vnosa";

              return (
                <div
                  key={
                    dateString
                  }
                  onClick={() =>
                    handleDayClick(
                      dateString
                    )
                  }
                  onDoubleClick={() =>
                    handleDayDoubleClick(
                      dateString
                    )
                  }
                  title={
                    data
                      ? "Klik = status | Dvojni klik = uredi kartico"
                      : "Klik = izberi status"
                  }
                  style={{
                    minHeight:
                      "105px",
                    border:
                      `2px solid ${colors.border}`,
                    borderRadius:
                      "10px",
                    padding:
                      "10px",
                    boxSizing:
                      "border-box",
                    background:
                      colors.background,
                    cursor:
                      "pointer",
                    userSelect:
                      "none",
                    transition:
                      "all 0.15s ease",
                  }}
                >
                  {/* ŠTEVILKA */}

                  <div
                    style={{
                      fontSize:
                        "14px",
                      fontWeight:
                        700,
                      color:
                        "#12344d",
                      marginBottom:
                        "7px",
                    }}
                  >
                    {day}
                  </div>

                  {/* STATUS */}

                  <div
                    style={{
                      fontSize:
                        "12px",
                      fontWeight:
                        700,
                      color:
                        colors.text,
                    }}
                  >
                    {statusText}
                  </div>

                  {/* URE */}

                  {data && (
                    <>
                      <div
                        style={{
                          marginTop:
                            "5px",
                          fontSize:
                            "12px",
                          color:
                            "#475569",
                        }}
                      >
                        {data.hours.toFixed(
                          2
                        )}{" "}
                        h
                      </div>

                      {/* DODATNE URE */}

                      {data
                        .additionalHours >
                        0 && (
                        <div
                          style={{
                            marginTop:
                              "3px",
                            fontSize:
                              "11px",
                            fontWeight:
                              600,
                            color:
                              "#f97316",
                          }}
                        >
                          +
                          {" "}
                          {data.additionalHours.toFixed(
                            2
                          )}{" "}
                          dodatnih
                        </div>
                      )}

                      {/* ŠTEVILO KARTIC */}

                      <div
                        style={{
                          marginTop:
                            "5px",
                          fontSize:
                            "10px",
                          color:
                            "#64748b",
                        }}
                      >
                        {data
                          .orders
                          .length}{" "}
                        {data
                          .orders
                          .length ===
                        1
                          ? "kartica"
                          : "kartice"}
                      </div>
                    </>
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* =====================================
            LEGENDA
        ===================================== */}

        <div
          style={{
            display:
              "flex",
            flexWrap:
              "wrap",
            alignItems:
              "center",
            gap: "18px",
            marginTop:
              "20px",
            paddingTop:
              "15px",
            borderTop:
              "1px solid #e5e7eb",
          }}
        >
          <Legend
            background="#dcfce7"
            border="#15803d"
            text="Delo – 1 stroj"
          />

          <Legend
            background="#d9f5ef"
            border="#0f766e"
            text="Delo – 2 stroja"
          />

          <Legend
            background="#fee2e2"
            border="#ef4444"
            text="Bolniška"
          />

          <Legend
            background="#fef3c7"
            border="#f59e0b"
            text="Dopust"
          />

          <Legend
            background="#e0e7ff"
            border="#6366f1"
            text="Praznik"
          />
        </div>
      </div>

      {/* =========================================
          STATISTIČNE KARTICE
      ========================================= */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "18px",
          marginBottom:
            "20px",
        }}
      >
        <StatCard
          title="Redne ure"
          value={formatHours(
            regularHours
          )}
          color="#2563eb"
        />

        <StatCard
          title="Nočne ure"
          value={formatHours(
            nightHours
          )}
          color="#7c3aed"
        />

        <StatCard
          title="Nedelje / prazniki"
          value={formatHours(
            holidayHours
          )}
          color="#dc2626"
        />

        <StatCard
          title="Dodatne ure"
          value={formatHours(
            additionalHours
          )}
          color="#f97316"
        />

        <StatCard
          title="Nadure"
          value={formatHours(
            overtimeHours
          )}
          color="#ca8a04"
        />

        <StatCard
          title="Skupaj"
          value={formatHours(
            totalHours
          )}
          color="#059669"
        />
      </div>

      {/* =========================================
          STROJI
      ========================================= */}

      <StatisticsList
        title="Statistika strojev"
        subtitle="Pregled opravljenih ur po strojih."
        data={
          machineTotals
        }
      />

      {/* =========================================
          PROJEKTI
      ========================================= */}

      <StatisticsList
        title="Statistika projektov"
        subtitle="Pregled opravljenih ur po projektih."
        data={
          projectTotals
        }
      />

      {/* =========================================
          MODAL ZA UREJANJE
      ========================================= */}

      {editingWorkOrder && (
        <WorkOrderEditModal
          workOrder={
            editingWorkOrder
          }
          onSave={(
            updatedWorkOrder
          ) => {
            /*
              WorkOrderEditModal že vrne
              celoten posodobljen WorkOrder.

              Tukaj zaenkrat zapremo modal.
              Če je glavni WorkOrderTable povezan
              z istim Contextom, bo tam spremembo
              obravnaval njegov obstoječi mehanizem.
            */

            console.log(
              "Posodobljen delovni nalog:",
              updatedWorkOrder
            );

            setEditingWorkOrder(
              null
            );
          }}
          onClose={() =>
            setEditingWorkOrder(
              null
            )
          }
        />
      )}
    </div>
  );
}

/* =====================================================
   LEGENDA
===================================================== */

type LegendProps = {
  background: string;
  border: string;
  text: string;
};

function Legend({
  background,
  border,
  text,
}: LegendProps) {
  return (
    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap: "7px",
        fontSize:
          "12px",
        color:
          "#64748b",
      }}
    >
      <span
        style={{
          width:
            "13px",
          height:
            "13px",
          borderRadius:
            "4px",
          background,
          border:
            `2px solid ${border}`,
          display:
            "inline-block",
          boxSizing:
            "border-box",
        }}
      />

      {text}
    </div>
  );
}

/* =====================================================
   STATISTIČNA KARTICA
===================================================== */

type StatCardProps = {
  title: string;
  value: string;
  color: string;
};

function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "16px",
        padding:
          "22px",
        minHeight:
          "120px",
        boxSizing:
          "border-box",
        boxShadow:
          "0 3px 10px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          fontSize:
            "14px",
          color:
            "#000000",
          marginBottom:
            "10px",
          fontWeight:
            600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "28px",
          fontWeight:
            700,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =====================================================
   SEZNAM STATISTIKE
===================================================== */

type StatisticsListProps = {
  title: string;
  subtitle: string;
  data: Record<
    string,
    number
  >;
};

function StatisticsList({
  title,
  subtitle,
  data,
}: StatisticsListProps) {
  return (
    <div
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "16px",
        padding:
          "25px",
        marginBottom:
          "20px",
        boxSizing:
          "border-box",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize:
            "21px",
          fontWeight:
            700,
          color:
            "#12344d",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          marginTop:
            "6px",
          marginBottom:
            0,
          color:
            "#64748b",
          fontSize:
            "14px",
        }}
      >
        {subtitle}
      </p>

      {Object.keys(data)
        .length === 0 ? (
        <div
          style={{
            marginTop:
              "20px",
            color:
              "#64748b",
            fontSize:
              "14px",
          }}
        >
          Trenutno ni podatkov.
        </div>
      ) : (
        <div
          style={{
            marginTop:
              "20px",
          }}
        >
          {Object.entries(
            data
          ).map(
            ([
              name,
              hours,
            ]) => (
              <div
                key={name}
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  padding:
                    "13px 0",
                  borderBottom:
                    "1px solid #e5e7eb",
                }}
              >
                <span
                  style={{
                    color:
                      "#000000",
                    fontSize:
                      "15px",
                  }}
                >
                  {name}
                </span>

                <strong
                  style={{
                    color:
                      "#000000",
                    fontSize:
                      "15px",
                  }}
                >
                  {hours.toFixed(
                    2
                  )}{" "}
                  h
                </strong>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Statistika;