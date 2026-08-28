import type { WorkOrder } from "../../types/WorkOrder";

type WorkOrderTableProps = {
  workOrders: WorkOrder[];

  onDeleteWorkOrder: (
    id: number
  ) => void;

  onEditWorkOrder: (
    workOrder: WorkOrder
  ) => void;
};

function WorkOrderTable({
  workOrders,
  onDeleteWorkOrder,
  onEditWorkOrder,
}: WorkOrderTableProps) {
  return (
    <div
      style={{
        width:
          "calc(100% - 226px)",
        maxWidth: "1080px",
        margin:
          "30px auto 0 auto",
        background: "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {/* =========================================
          NASLOV TABELE
      ========================================= */}

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
          Delovni nalogi
        </h2>
      </div>

      {/* =========================================
          PRAZNA TABELA
      ========================================= */}

      {workOrders.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Za izbrano obdobje ni delovnih nalogov.
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
                "1000px",
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
                  Projekt
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Stroj
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Začetek
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Končano
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Ure
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
                  Malica
                </th>

                <th
                  style={{
                    ...tableHeaderStyle,
                    textAlign:
                      "center",
                  }}
                >
                  Akcije
                </th>
              </tr>
            </thead>

            <tbody>
              {workOrders.map(
                (workOrder) => (
                  <tr
                    key={
                      workOrder.id
                    }
                  >
                    {/* DATUM */}

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {workOrder.date}
                    </td>

                    {/* PROJEKT */}

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {workOrder.project}
                    </td>

                    {/* STROJ */}

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      <div>
                        {workOrder.machine}
                      </div>

                      {workOrder.additionalMachine && (
                        <div
                          style={{
                            marginTop:
                              "4px",
                            color:
                              "#64748b",
                            fontSize:
                              "13px",
                          }}
                        >
                          +
                          {" "}
                          {
                            workOrder.additionalMachine
                          }
                        </div>
                      )}
                    </td>

                    {/* ZAČETEK */}

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {
                        workOrder.startTime
                      }
                    </td>

                    {/* KONČANO */}

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {
                        workOrder.endTime
                      }
                    </td>

                    {/* URE */}

                    <td
                      style={{
                        ...tableCellStyle,
                        fontWeight: 600,
                      }}
                    >
                      {Number(
                        workOrder.hours ||
                          0
                      ).toFixed(2)}{" "}
                      h
                    </td>

                    {/* DODATNE */}

                    <td
                      style={{
                        ...tableCellStyle,
                        color:
                          "#f97316",
                        fontWeight: 600,
                      }}
                    >
                      {Number(
                        workOrder.additionalHours ||
                          0
                      ).toFixed(2)}{" "}
                      h
                    </td>

                    {/* =================================
                        MALICA

                        true  = s seboj
                        false = zunaj

                        Napis se ne spreminja
                        v delovnem nalogu.
                    ================================= */}

                    <td
                      style={{
                        ...tableCellStyle,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {workOrder.meal ? (
                        <span
                          style={{
                            color:
                              "#059669",
                            fontWeight:
                              600,
                          }}
                        >
                          ✓ Malica s seboj
                        </span>
                      ) : (
                        <span
                          style={{
                            color:
                              "#64748b",
                          }}
                        >
                          Malica zunaj
                        </span>
                      )}
                    </td>

                    {/* =================================
                        AKCIJE
                    ================================= */}

                    <td
                      style={{
                        ...tableCellStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onEditWorkOrder(
                              workOrder
                            )
                          }
                          style={
                            editButtonStyle
                          }
                        >
                          Uredi
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                "Ali res želiš izbrisati ta delovni nalog?"
                              );

                            if (
                              confirmed
                            ) {
                              onDeleteWorkOrder(
                                workOrder.id
                              );
                            }
                          }}
                          style={
                            deleteButtonStyle
                          }
                        >
                          Izbriši
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================================
   STILI
========================================= */

const tableHeaderStyle = {
  padding:
    "14px 18px",
  textAlign:
    "left" as const,
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  whiteSpace:
    "nowrap" as const,
};

const tableCellStyle = {
  padding:
    "16px 18px",
  borderTop:
    "1px solid #e5e7eb",
  fontSize: "14px",
  color: "#334155",
  whiteSpace:
    "nowrap" as const,
};

const editButtonStyle = {
  border: "none",
  borderRadius:
    "8px",
  padding:
    "8px 14px",
  background:
    "#eff6ff",
  color:
    "#2563eb",
  fontSize:
    "13px",
  fontWeight: 600,
  cursor:
    "pointer",
};

const deleteButtonStyle = {
  border: "none",
  borderRadius:
    "8px",
  padding:
    "8px 14px",
  background:
    "#fef2f2",
  color:
    "#dc2626",
  fontSize:
    "13px",
  fontWeight: 600,
  cursor:
    "pointer",
};

export default WorkOrderTable;