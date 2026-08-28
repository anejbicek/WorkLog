import { useMemo } from "react";

import {
  useWorkOrders,
} from "../context/WorkOrderContext";

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
        background:
          "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "14px",
        padding:
          "22px",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          fontSize:
            "14px",
          color:
            "#64748b",
          marginBottom:
            "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "25px",
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

function Evidenca() {
  const {
    workOrders,
    startDate,
    endDate,
  } = useWorkOrders();

  const filteredWorkOrders =
    useMemo(
      () =>
        workOrders.filter(
          (
            workOrder
          ) =>
            workOrder.date >=
              startDate &&
            workOrder.date <=
              endDate
        ),
      [
        workOrders,
        startDate,
        endDate,
      ]
    );

  const regularHours =
    filteredWorkOrders.reduce(
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
    filteredWorkOrders.reduce(
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
    filteredWorkOrders.reduce(
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
    filteredWorkOrders.reduce(
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
    filteredWorkOrders.reduce(
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

  const mealOutsideDays =
    new Set(
      filteredWorkOrders
        .filter(
          (
            workOrder
          ) =>
            workOrder.mealType ===
            "outside"
        )
        .map(
          (
            workOrder
          ) =>
            workOrder.date
        )
    ).size;

  const mealWithMeDays =
    new Set(
      filteredWorkOrders
        .filter(
          (
            workOrder
          ) =>
            workOrder.mealType ===
            "withMe"
        )
        .map(
          (
            workOrder
          ) =>
            workOrder.date
        )
    ).size;

  const dailyData =
    useMemo(
      () => {
        const days: Record<
          string,
          {
            regular: number;
            night: number;
            holiday: number;
            additional: number;
            overtime: number;
          }
        > = {};

        filteredWorkOrders.forEach(
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
                regular: 0,
                night: 0,
                holiday: 0,
                additional: 0,
                overtime: 0,
              };
            }

            days[
              workOrder.date
            ].regular +=
              Number(
                workOrder.regularHours ||
                  0
              );

            days[
              workOrder.date
            ].night +=
              Number(
                workOrder.nightHours ||
                  0
              );

            days[
              workOrder.date
            ].holiday +=
              Number(
                workOrder.holidayHours ||
                  0
              );

            days[
              workOrder.date
            ].additional +=
              Number(
                workOrder.additionalHours ||
                  0
              );

            days[
              workOrder.date
            ].overtime +=
              Number(
                workOrder.overtimeHours ||
                  0
              );
          }
        );

        return Object.entries(
          days
        )
          .map(
            (
              [
                date,
                values,
              ]
            ) => ({
              date,

              regular:
                Number(
                  values.regular.toFixed(
                    2
                  )
                ),

              night:
                Number(
                  values.night.toFixed(
                    2
                  )
                ),

              holiday:
                Number(
                  values.holiday.toFixed(
                    2
                  )
                ),

              additional:
                Number(
                  values.additional.toFixed(
                    2
                  )
                ),

              overtime:
                Number(
                  values.overtime.toFixed(
                    2
                  )
                ),

              total:
                Number(
                  (
                    values.regular +
                    values.night +
                    values.holiday +
                    values.additional +
                    values.overtime
                  ).toFixed(
                    2
                  )
                ),
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.date.localeCompare(
                a.date
              )
          );
      },
      [filteredWorkOrders]
    );

  return (
    <div>
      <div
        style={{
          marginBottom:
            "30px",
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
          Evidenca ur
        </h1>

        <p
          style={{
            marginTop:
              "8px",
            color:
              "#64748b",
            fontSize:
              "15px",
          }}
        >
          Pregled opravljenih
          ur in dodatkov.
        </p>
      </div>

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius:
            "14px",
          padding:
            "20px",
          marginBottom:
            "20px",
        }}
      >
        <div
          style={{
            fontSize:
              "14px",
            fontWeight:
              600,
            color:
              "#334155",
            marginBottom:
              "8px",
          }}
        >
          Izbrano obdobje
        </div>

        <div
          style={{
            fontSize:
              "18px",
            fontWeight:
              600,
            color:
              "#12344d",
          }}
        >
          {startDate} →{" "}
          {endDate}
        </div>
      </div>

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap:
            "16px",
          marginBottom:
            "30px",
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
          title="Nočne ure"
          value={`${nightHours.toFixed(
            2
          )} h`}
          color="#7c3aed"
        />

        <SummaryCard
          title="Nedelje / prazniki"
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
          value={`${mealOutsideDays} dni`}
          color="#0891b2"
        />

        <SummaryCard
          title="Malica s seboj"
          value={`${mealWithMeDays} dni`}
          color="#0f766e"
        />
      </div>

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius:
            "14px",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            padding:
              "20px",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize:
                "20px",
              color:
                "#12344d",
            }}
          >
            Dnevna evidenca
          </h2>
        </div>

        {dailyData.length ===
        0 ? (
          <div
            style={{
              padding:
                "40px",
              textAlign:
                "center",
              color:
                "#000000",
            }}
          >
            Za izbrano obdobje
            ni vpisanih
            delovnih nalogov.
          </div>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "1000px",
                color:
                  "#000000",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                    color:
                      "#000000",
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
                    Nedelje /
                    prazniki
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
                </tr>
              </thead>

              <tbody>
                {dailyData.map(
                  (
                    day
                  ) => (
                    <tr
                      key={
                        day.date
                      }
                    >
                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          day.date
                        }
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          day.regular.toFixed(
                            2
                          )
                        }{" "}
                        h
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          day.night.toFixed(
                            2
                          )
                        }{" "}
                        h
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          day.holiday.toFixed(
                            2
                          )
                        }{" "}
                        h
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          day.additional.toFixed(
                            2
                          )
                        }{" "}
                        h
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          day.overtime.toFixed(
                            2
                          )
                        }{" "}
                        h
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          fontWeight:
                            700,
                        }}
                      >
                        {
                          day.total.toFixed(
                            2
                          )
                        }{" "}
                        h
                      </td>
                    </tr>
                  )
                )}
              </tbody>

              <tfoot>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                    color:
                      "#000000",
                  }}
                >
                  <td
                    style={{
                      padding:
                        "16px 18px",
                      fontWeight:
                        700,
                      color:
                        "#000000",
                    }}
                  >
                    SKUPAJ
                  </td>

                  <td
                    style={
                      totalCellStyle
                    }
                  >
                    {
                      regularHours.toFixed(
                        2
                      )
                    }{" "}
                    h
                  </td>

                  <td
                    style={
                      totalCellStyle
                    }
                  >
                    {
                      nightHours.toFixed(
                        2
                      )
                    }{" "}
                    h
                  </td>

                  <td
                    style={
                      totalCellStyle
                    }
                  >
                    {
                      holidayHours.toFixed(
                        2
                      )
                    }{" "}
                    h
                  </td>

                  <td
                    style={
                      totalCellStyle
                    }
                  >
                    {
                      additionalHours.toFixed(
                        2
                      )
                    }{" "}
                    h
                  </td>

                  <td
                    style={
                      totalCellStyle
                    }
                  >
                    {
                      overtimeHours.toFixed(
                        2
                      )
                    }{" "}
                    h
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      fontWeight:
                        700,
                    }}
                  >
                    {
                      totalHours.toFixed(
                        2
                      )
                    }{" "}
                    h
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
  padding:
    "14px 18px",
  textAlign:
    "left" as const,
  fontSize:
    "13px",
  fontWeight:
    600,
  color:
    "#000000",
  whiteSpace:
    "nowrap" as const,
};

const tableCellStyle = {
  padding:
    "16px 18px",
  borderTop:
    "1px solid #e5e7eb",
  fontSize:
    "14px",
  color:
    "#000000",
  whiteSpace:
    "nowrap" as const,
};

const totalCellStyle = {
  padding:
    "16px 18px",
  fontWeight:
    700,
  color:
    "#000000",
};

export default Evidenca;