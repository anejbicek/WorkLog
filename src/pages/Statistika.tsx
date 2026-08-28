import {
  useMemo,
  useState,
} from "react";

import {
  useWorkOrders,
} from "../context/WorkOrderContext";

import WorkOrderEditModal from "../components/Workorders/WorkOrderEditModal";

import type {
  DayStatus,
  WorkOrder,
} from "../types/WorkOrder";

function Statistika() {
  const {
    workOrders,
    updateWorkOrder,
    dayStatuses,
    setDayStatus,
  } = useWorkOrders();

  const today =
    new Date();

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}`
  );

  const [
    editingWorkOrder,
    setEditingWorkOrder,
  ] =
    useState<WorkOrder | null>(
      null
    );

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  const [
    statusDate,
    setStatusDate,
  ] = useState<
    string | null
  >(null);

  const monthWorkOrders =
    useMemo(
      () =>
        workOrders.filter(
          (
            workOrder
          ) =>
            workOrder.date.startsWith(
              selectedMonth
            )
        ),
      [
        workOrders,
        selectedMonth,
      ]
    );

  const regularHours =
    monthWorkOrders.reduce(
      (
        sum,
        workOrder
      ) =>
        sum +
        Number(
          workOrder.regularHours ||
            0
        ),
      0
    );

  const nightHours =
    monthWorkOrders.reduce(
      (
        sum,
        workOrder
      ) =>
        sum +
        Number(
          workOrder.nightHours ||
            0
        ),
      0
    );

  const holidayHours =
    monthWorkOrders.reduce(
      (
        sum,
        workOrder
      ) =>
        sum +
        Number(
          workOrder.holidayHours ||
            0
        ),
      0
    );

  const additionalHours =
    monthWorkOrders.reduce(
      (
        sum,
        workOrder
      ) =>
        sum +
        Number(
          workOrder.additionalHours ||
            0
        ),
      0
    );

  const overtimeHours =
    monthWorkOrders.reduce(
      (
        sum,
        workOrder
      ) =>
        sum +
        Number(
          workOrder.overtimeHours ||
            0
        ),
      0
    );

  const totalHours =
    regularHours +
    nightHours +
    holidayHours +
    additionalHours +
    overtimeHours;

  const machineTotals:
    Record<
      string,
      number
    > = {};

  monthWorkOrders.forEach(
    (
      workOrder
    ) => {
      if (
        workOrder.machine
      ) {
        machineTotals[
          workOrder.machine
        ] =
          (
            machineTotals[
              workOrder.machine
            ] || 0
          ) +
          Number(
            workOrder.hours ||
              0
          );
      }

      if (
        workOrder.additionalMachine
      ) {
        machineTotals[
          workOrder.additionalMachine
        ] =
          (
            machineTotals[
              workOrder.additionalMachine
            ] || 0
          ) +
          Number(
            workOrder.hours ||
              0
          );
      }
    }
  );

  const projectTotals:
    Record<
      string,
      number
    > = {};

  monthWorkOrders.forEach(
    (
      workOrder
    ) => {
      if (
        !workOrder.project
      ) {
        return;
      }

      projectTotals[
        workOrder.project
      ] =
        (
          projectTotals[
            workOrder.project
          ] || 0
        ) +
        Number(
          workOrder.hours ||
            0
        );
    }
  );

  const dailyData =
    useMemo(
      () => {
        const days:
          Record<
            string,
            {
              orders: WorkOrder[];
              hours: number;
              additionalHours: number;
              twoMachines: boolean;
            }
          > = {};

        monthWorkOrders.forEach(
          (
            workOrder
          ) => {
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
            ].hours +=
              Number(
                workOrder.hours ||
                  0
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
              ].twoMachines =
                true;
            }
          }
        );

        return days;
      },
      [monthWorkOrders]
    );

  const [
    yearString,
    monthString,
  ] =
    selectedMonth.split(
      "-"
    );

  const year =
    Number(
      yearString
    );

  const month =
    Number(
      monthString
    );

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

  const firstDayMonday =
    firstDay === 0
      ? 6
      : firstDay - 1;

  const calendarCells:
    (
      | number
      | null
    )[] = [];

  for (
    let i = 0;
    i <
    firstDayMonday;
    i++
  ) {
    calendarCells.push(
      null
    );
  }

  for (
    let day = 1;
    day <=
    daysInMonth;
    day++
  ) {
    calendarCells.push(
      day
    );
  }

  const monthName =
    new Date(
      year,
      month - 1,
      1
    ).toLocaleDateString(
      "sl-SI",
      {
        month:
          "long",
        year:
          "numeric",
      }
    );

  const getStatusText =
    (
      status:
        | DayStatus
        | undefined,
      data:
        | {
            twoMachines: boolean;
          }
        | undefined
    ) => {
      switch (
        status
      ) {
        case "sick":
          return "Bolniška";

        case "vacation":
          return "Dopust";

        case "holiday":
          return "Praznik";

        case "work":
          return data?.twoMachines
            ? "Delo – 2 stroja"
            : "Delal";

        default:
          return data
            ? data.twoMachines
              ? "Delo – 2 stroja"
              : "Delal"
            : "Brez vnosa";
      }
    };

  const getDayColors =
    (
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

      return {
        background:
          "#ffffff",
        border:
          "#e2e8f0",
        text:
          "#64748b",
      };
    };

  const handleDayClick =
    (
      dateString: string
    ) => {
      if (
        editMode
      ) {
        setStatusDate(
          dateString
        );

        return;
      }

      const data =
        dailyData[
          dateString
        ];

      if (
        data &&
        data.orders
          .length > 0
      ) {
        setEditingWorkOrder(
          data.orders[0]
        );
      }
    };

  const handleStatusSave =
    async (
      status: DayStatus
    ) => {
      if (
        !statusDate
      ) {
        return;
      }

      await setDayStatus(
        statusDate,
        status
      );

      setStatusDate(
        null
      );
    };

  const formatHours =
    (
      value: number
    ) =>
      `${value.toFixed(
        2
      )} h`;

  return (
    <div
      style={{
        width:
          "100%",
        maxWidth:
          "1080px",
        margin:
          "0 auto",
      }}
    >
      <style>
        {`
          @keyframes worklogJiggle {
            0% {
              transform:
                rotate(-0.7deg)
                translateY(0);
            }

            25% {
              transform:
                rotate(0.7deg)
                translateY(-1px);
            }

            50% {
              transform:
                rotate(-0.5deg)
                translateY(1px);
            }

            75% {
              transform:
                rotate(0.6deg)
                translateY(0);
            }

            100% {
              transform:
                rotate(-0.7deg)
                translateY(0);
            }
          }
        `}
      </style>

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
              "32px",
            fontWeight:
              700,
            color:
              "#12344d",
          }}
        >
          Statistika
        </h1>

        <p
          style={{
            marginTop:
              "8px",
            fontSize:
              "15px",
            color:
              "#64748b",
          }}
        >
          Pregled opravljenega
          dela po mesecih.
        </p>
      </div>

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "16px",
          padding:
            "20px",
          marginBottom:
            "20px",
          display:
            "flex",
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
          onChange={(
            event
          ) =>
            setSelectedMonth(
              event.target
                .value
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
              {editMode
                ? "Izberi dan za nastavitev statusa."
                : "Klikni dan za urejanje delovne kartice."}
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

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(7, 1fr)",
            gap:
              "8px",
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
            (
              day
            ) => (
              <div
                key={
                  day
                }
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

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(7, 1fr)",
            gap:
              "8px",
          }}
        >
          {calendarCells.map(
            (
              day,
              index
            ) => {
              if (
                day ===
                null
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
                getStatusText(
                  manualStatus,
                  data
                );

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
                  title={
                    editMode
                      ? "Nastavi status dneva"
                      : data
                      ? "Uredi delovno kartico"
                      : "Ni delovne kartice"
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
                      editMode ||
                      data
                        ? "pointer"
                        : "default",
                    userSelect:
                      "none",
                    transition:
                      "all 0.15s ease",
                    animation:
                      editMode
                        ? `worklogJiggle ${
                            0.32 +
                            (day %
                              4) *
                              0.04
                          }s infinite`
                        : "none",
                  }}
                >
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
                    {
                      statusText
                    }
                  </div>

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
                        {
                          data.hours.toFixed(
                            2
                          )
                        }{" "}
                        h
                      </div>

                      {data.additionalHours >
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
                          +{" "}
                          {
                            data.additionalHours.toFixed(
                              2
                            )
                          }{" "}
                          dodatnih
                        </div>
                      )}

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
                        {
                          data.orders
                            .length
                        }{" "}
                        {data.orders
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

        <div
          style={{
            display:
              "flex",
            flexWrap:
              "wrap",
            alignItems:
              "center",
            gap:
              "18px",
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

          <button
            type="button"
            onClick={() =>
              setEditMode(
                (
                  previous
                ) =>
                  !previous
              )
            }
            style={{
              marginLeft:
                "auto",
              height:
                "36px",
              padding:
                "0 16px",
              border:
                editMode
                  ? "1px solid #12344d"
                  : "1px solid #cbd5e1",
              borderRadius:
                "9px",
              background:
                editMode
                  ? "#12344d"
                  : "#ffffff",
              color:
                editMode
                  ? "#ffffff"
                  : "#334155",
              fontSize:
                "13px",
              fontWeight:
                600,
              cursor:
                "pointer",
            }}
          >
            {editMode
              ? "Končaj urejanje"
              : "Uredi"}
          </button>
        </div>
      </div>

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap:
            "18px",
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

      <StatisticsList
        title="Statistika strojev"
        subtitle="Pregled opravljenih ur po strojih."
        data={
          machineTotals
        }
      />

      <StatisticsList
        title="Statistika projektov"
        subtitle="Pregled opravljenih ur po projektih."
        data={
          projectTotals
        }
      />

      {editingWorkOrder && (
        <WorkOrderEditModal
          workOrder={
            editingWorkOrder
          }
          onSave={(
            updatedWorkOrder
          ) => {
            updateWorkOrder(
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

      {statusDate && (
        <StatusModal
          date={
            statusDate
          }
          currentStatus={
            dayStatuses[
              statusDate
            ] ||
            "none"
          }
          onSave={
            handleStatusSave
          }
          onClose={() =>
            setStatusDate(
              null
            )
          }
        />
      )}
    </div>
  );
}

function Legend({
  background,
  border,
  text,
}: {
  background: string;
  border: string;
  text: string;
}) {
  return (
    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "7px",
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

function StatusModal({
  date,
  currentStatus,
  onSave,
  onClose,
}: {
  date: string;

  currentStatus:
    DayStatus;

  onSave: (
    status: DayStatus
  ) => Promise<void>;

  onClose: () => void;
}) {
  const [
    status,
    setStatus,
  ] =
    useState<DayStatus>(
      currentStatus
    );

  const options: {
    value: DayStatus;
    label: string;
  }[] = [
    {
      value: "none",
      label:
        "Brez vnosa",
    },
    {
      value: "work",
      label: "Delal",
    },
    {
      value: "sick",
      label:
        "Bolniška",
    },
    {
      value: "vacation",
      label:
        "Dopust",
    },
    {
      value: "holiday",
      label:
        "Praznik",
    },
  ];

  return (
    <div
      style={{
        position:
          "fixed",
        inset: 0,
        zIndex:
          1100,
        background:
          "rgba(15,23,42,0.45)",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        padding:
          "20px",
      }}
      onClick={
        onClose
      }
    >
      <div
        style={{
          width:
            "min(420px, 100%)",
          background:
            "#ffffff",
          borderRadius:
            "16px",
          padding:
            "25px",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.2)",
        }}
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <h2
          style={{
            margin: 0,
            color:
              "#12344d",
            fontSize:
              "22px",
          }}
        >
          Status dneva
        </h2>

        <p
          style={{
            color:
              "#64748b",
            marginTop:
              "7px",
          }}
        >
          {date}
        </p>

        <label
          style={{
            display:
              "block",
            marginTop:
              "20px",
            marginBottom:
              "8px",
            fontSize:
              "14px",
            fontWeight:
              600,
            color:
              "#334155",
          }}
        >
          Izberi status
        </label>

        <select
          value={
            status
          }
          onChange={(
            event
          ) =>
            setStatus(
              event.target
                .value as DayStatus
            )
          }
          style={{
            width:
              "100%",
            height:
              "44px",
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
          }}
        >
          {options.map(
            (
              option
            ) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </option>
            )
          )}
        </select>

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "flex-end",
            gap:
              "10px",
            marginTop:
              "22px",
          }}
        >
          <button
            type="button"
            onClick={
              onClose
            }
            style={{
              height:
                "42px",
              padding:
                "0 18px",
              border:
                "1px solid #cbd5e1",
              borderRadius:
                "9px",
              background:
                "#ffffff",
              color:
                "#334155",
              cursor:
                "pointer",
            }}
          >
            Prekliči
          </button>

          <button
            type="button"
            onClick={() =>
              onSave(
                status
              )
            }
            style={{
              height:
                "42px",
              padding:
                "0 18px",
              border:
                "none",
              borderRadius:
                "9px",
              background:
                "#12344d",
              color:
                "#ffffff",
              cursor:
                "pointer",
              fontWeight:
                600,
            }}
          >
            Shrani
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
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

function StatisticsList({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: Record<
    string,
    number
  >;
}) {
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

      {Object.keys(
        data
      ).length === 0 ? (
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
          Trenutno ni
          podatkov.
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
            (
              [
                name,
                hours,
              ]
            ) => (
              <div
                key={
                  name
                }
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
                  {
                    hours.toFixed(
                      2
                    )
                  }{" "}
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