import { useMemo, useState } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";

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
          workOrder.additionalHours ||
            0
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

  /* =========================================
     MALICA
  ========================================= */

  const mealOutside =
    monthWorkOrders.filter(
      (workOrder) =>
        !workOrder.meal
    ).length;

  const mealWithSelf =
    monthWorkOrders.filter(
      (workOrder) =>
        Boolean(workOrder.meal)
    ).length;

  /* =========================================
     DNEVNA TABELA
  ========================================= */

  const dailyData =
    useMemo(() => {
      const days: Record<
        string,
        {
          regular: number;
          night: number;
          holiday: number;
          additional: number;
          overtime: number;
          meal: boolean;
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
              regular: 0,
              night: 0,
              holiday: 0,
              additional: 0,
              overtime: 0,
              meal: false,
            };
          }

          days[
            workOrder.date
          ].regular += Number(
            workOrder.regularHours || 0
          );

          days[
            workOrder.date
          ].night += Number(
            workOrder.nightHours || 0
          );

          days[
            workOrder.date
          ].holiday += Number(
            workOrder.holidayHours || 0
          );

          days[
            workOrder.date
          ].additional += Number(
            workOrder.additionalHours ||
              0
          );

          days[
            workOrder.date
          ].overtime += Number(
            workOrder.overtimeHours || 0
          );

          /*
            Če je katerikoli nalog
            tega dne označen z malico
            s seboj, prikažemo kljukico.
          */

          if (
            workOrder.meal
          ) {
            days[
              workOrder.date
            ].meal = true;
          }
        }
      );

      return Object.entries(days)
        .map(
          ([date, values]) => ({
            date,

            regular: Number(
              values.regular.toFixed(
                2
              )
            ),

            night: Number(
              values.night.toFixed(
                2
              )
            ),

            holiday: Number(
              values.holiday.toFixed(
                2
              )
            ),

            additional: Number(
              values.additional.toFixed(
                2
              )
            ),

            overtime: Number(
              values.overtime.toFixed(
                2
              )
            ),

            meal:
              values.meal,

            total: Number(
              (
                values.regular +
                values.night +
                values.holiday +
                values.additional +
                values.overtime
              ).toFixed(2)
            ),
          })
        )
        .sort((a, b) =>
          b.date.localeCompare(
            a.date
          )
        );
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

      {/* 8 KVADRATOV */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
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

        <SummaryCard
          title="Nadure"
          value={`${overtimeHours.toFixed(
            2
          )} h`}
          color="#ca8a04"
        />

        <SummaryCard
          title="Skupaj"
          value={`${totalHours.toFixed(
            2
          )} h`}
          color="#059669"
        />

        <SummaryCard
          title="Malica zunaj"
          value={`${mealOutside}×`}
          color="#64748b"
        />

        <SummaryCard
          title="Malica s seboj"
          value={`${mealWithSelf}×`}
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