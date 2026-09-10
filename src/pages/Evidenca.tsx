import { useMemo, useState } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import {
  calculateDailyUniqueWorkHours,
  calculateMealCounts,
  calculateOverlapHours,
  calculateUniqueHourBreakdown,
  calculateUniqueWorkHours,
} from "../utils/workHours";

type SummaryCardProps = {
  title: string;
  value: string;
  color: string;
};

function SummaryCard({
  title,
  value,
  color,
}: SummaryCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "22px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "#64748b",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "25px",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function OvertimeSummaryCard({
  total,
  normal,
  special,
}: {
  total: number;
  normal: number;
  special: number;
}) {
  const items = [
    { label: "Nadure", value: total, color: "#ca8a04" },
    { label: "Navadne", value: normal, color: "#0891b2" },
    { label: "Nočne", value: special, color: "#9333ea" },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "22px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "#64748b",
          marginBottom: "12px",
        }}
      >
        Nadure
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {items.map((item) => (
          <div key={item.label}>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "6px",
                fontWeight: 600,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: item.color,
              }}
            >
              {item.value.toFixed(2)} h
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Evidenca() {
  const { workOrders } =
    useWorkOrders();

  const today = new Date();

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`
  );

  /* =========================================
     NALOGI IZBRANEGA MESECA
  ========================================= */

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

  /* =========================================
     SEŠTEVKI UR
  ========================================= */

  const uniqueBreakdown =
    calculateUniqueHourBreakdown(
      monthWorkOrders
    );

  const regularHours =
    uniqueBreakdown.regular;

  const nightHours =
    uniqueBreakdown.night;

  const holidayHours =
    uniqueBreakdown.holiday;

  const additionalHours = Number(
    (
      calculateOverlapHours(monthWorkOrders) / 3
    ).toFixed(2)
  );

  const overtimeHours =
    uniqueBreakdown.overtime;

  const overtimeSpecialHours =
    uniqueBreakdown.overtimeSpecial;

  const overtimeNormalHours =
    uniqueBreakdown.overtimeNormal;

  // Prekrivajoče kartice istega dne ne povečajo skupnih ur.
  const totalHours =
    calculateUniqueWorkHours(
      monthWorkOrders
    );

  /* =========================================
     MALICA
  ========================================= */

  const mealCounts =
    calculateMealCounts(
      monthWorkOrders
    );

  const mealWithSelf =
    mealCounts.withSelf;

  /* =========================================
     DNEVNA TABELA
  ========================================= */

  const dailyData =
    useMemo(() => {
      const dates = [
        ...new Set(
          monthWorkOrders.map((order) => order.date)
        ),
      ];

      return dates
        .map((date) => {
          const orders = monthWorkOrders.filter(
            (order) => order.date === date
          );
          const breakdown = calculateUniqueHourBreakdown(orders);
          const additional = Number(
            (
              calculateOverlapHours(orders) / 3
            ).toFixed(2)
          );
          const meal = orders.some((order) => Boolean(order.meal));

          return {
            date,
            regular: breakdown.regular,
            night: breakdown.night,
            holiday: breakdown.holiday,
            additional,
            overtime: breakdown.overtime,
            overtimeSpecial: breakdown.overtimeSpecial,
            overtimeNormal: breakdown.overtimeNormal,
            meal,
            total: calculateDailyUniqueWorkHours(orders, date),
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    }, [monthWorkOrders]);

  /* =========================================
     MESEC
  ========================================= */

  const monthName =
    new Date(
      `${selectedMonth}-01T00:00:00`
    ).toLocaleDateString(
      "sl-SI",
      {
        month: "long",
        year: "numeric",
      }
    );

  return (
    <div>
      {/* NASLOV */}

      <div
        style={{
          marginBottom: "30px",
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
          Evidenca ur
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Pregled opravljenih ur in dodatkov.
        </p>
      </div>

      {/* MESEC */}

      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Mesec
        </label>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(
              e.target.value
            )
          }
          style={{
            width: "220px",
            height: "46px",
            border:
              "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "0 14px",
            fontSize: "15px",
            background: "#ffffff",
            boxSizing:
              "border-box",
          }}
        />

        <div
          style={{
            marginTop: "10px",
            fontSize: "14px",
            color: "#64748b",
            textTransform:
              "capitalize",
          }}
        >
          {monthName}
        </div>
      </div>

      {/* 6 KVADRATOV */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        <SummaryCard
          title="Redne ure"
          value={`${regularHours.toFixed(
            2
          )} h`}
          color="#2563eb"
        />

        <SummaryCard
          title="Nočne"
          value={`${nightHours.toFixed(
            2
          )} h`}
          color="#7c3aed"
        />

        <SummaryCard
          title="Prazniki"
          value={`${holidayHours.toFixed(
            2
          )} h`}
          color="#dc2626"
        />

        <SummaryCard
          title="Dodatne ure"
          value={`${additionalHours.toFixed(
            2
          )} h`}
          color="#f97316"
        />

        <OvertimeSummaryCard
          total={overtimeHours}
          normal={overtimeNormalHours}
          special={overtimeSpecialHours}
        />

        <SummaryCard
          title="Skupaj"
          value={`${totalHours.toFixed(
            2
          )} h`}
          color="#059669"
        />

      </div>

      {/* TABELA */}

      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#12344d",
            }}
          >
            Dnevna evidenca
          </h2>
        </div>

        {dailyData.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Za izbrani mesec ni
            vpisanih delovnih
            nalogov.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "1150px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >
                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Datum
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Redne
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Nočne
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Prazniki
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Dodatne
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Nadure
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Skupaj
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Malica
                  </th>
                </tr>
              </thead>

              <tbody>
                {dailyData.map(
                  (day) => (
                    <tr
                      key={day.date}
                    >
                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {day.date}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {day.regular.toFixed(
                          2
                        )}{" "}
                        h
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          color:
                            "#7c3aed",
                        }}
                      >
                        {day.night.toFixed(
                          2
                        )}{" "}
                        h
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          color:
                            "#dc2626",
                        }}
                      >
                        {day.holiday.toFixed(
                          2
                        )}{" "}
                        h
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          color:
                            "#f97316",
                        }}
                      >
                        {day.additional.toFixed(
                          2
                        )}{" "}
                        h
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          color:
                            "#ca8a04",
                        }}
                      >
                        {day.overtime.toFixed(
                          2
                        )}{" "}
                        h
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          fontWeight: 700,
                          color:
                            "#059669",
                        }}
                      >
                        {day.total.toFixed(
                          2
                        )}{" "}
                        h
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          textAlign:
                            "center",
                          fontSize:
                            "20px",
                          fontWeight: 700,
                          color:
                            "#059669",
                        }}
                      >
                        {day.meal
                          ? "✓"
                          : ""}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

              {/* SKUPAJ */}

              <tfoot>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >
                  <td
                    style={{
                      padding:
                        "16px 18px",
                      fontWeight: 700,
                      color:
                        "#12344d",
                    }}
                  >
                    SKUPAJ
                  </td>

                  <td
                    style={
                      totalCellStyle
                    }
                  >
                    {regularHours.toFixed(
                      2
                    )}{" "}
                    h
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      color:
                        "#7c3aed",
                    }}
                  >
                    {nightHours.toFixed(
                      2
                    )}{" "}
                    h
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      color:
                        "#dc2626",
                    }}
                  >
                    {holidayHours.toFixed(
                      2
                    )}{" "}
                    h
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      color:
                        "#f97316",
                    }}
                  >
                    {additionalHours.toFixed(
                      2
                    )}{" "}
                    h
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      color:
                        "#ca8a04",
                    }}
                  >
                    {overtimeHours.toFixed(
                      2
                    )}{" "}
                    h
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      color:
                        "#059669",
                    }}
                  >
                    {totalHours.toFixed(
                      2
                    )}{" "}
                    h
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign:
                        "center",
                      color:
                        "#059669",
                      fontSize:
                        "20px",
                    }}
                  >
                    {mealWithSelf > 0
                      ? "✓"
                      : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  padding: "14px 18px",
  textAlign:
    "left" as const,
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  whiteSpace:
    "nowrap" as const,
};

const tableCellStyle = {
  padding: "16px 18px",
  borderTop:
    "1px solid #e5e7eb",
  fontSize: "14px",
  color: "#334155",
  whiteSpace:
    "nowrap" as const,
};

const totalCellStyle = {
  padding: "16px 18px",
  fontWeight: 700,
};

export default Evidenca;