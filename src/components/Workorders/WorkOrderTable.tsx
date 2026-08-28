import type {
  WorkOrder,
} from "../../types/WorkOrder";

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
  const sortedWorkOrders =
    [
      ...workOrders,
    ].sort((a, b) => {
      const dateComparison =
        b.date.localeCompare(
          a.date
        );

      if (
        dateComparison !==
        0
      ) {
        return dateComparison;
      }

      return b.id - a.id;
    });

  return (
    <div
      style={{
        width:
          "calc(100% - 40px)",
        maxWidth:
          "calc(1080px + 1cm)",
        margin:
          "25px auto 0 auto",
      }}
    >
      {sortedWorkOrders.length ===
      0 ? (
        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e5e7eb",
            borderRadius:
              "14px",
            padding:
              "30px",
            textAlign:
              "center",
            color:
              "#64748b",
          }}
        >
          Ni dodanih delovnih
          nalogov.
        </div>
      ) : (
        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap:
              "14px",
          }}
        >
          {sortedWorkOrders.map(
            (
              workOrder
            ) => {
              const firstMachine =
                workOrder.machine ||
                "";

              const secondMachine =
                workOrder.additionalMachine ||
                "";

              const machineText =
                firstMachine &&
                secondMachine
                  ? `${firstMachine} + ${secondMachine}`
                  : firstMachine ||
                    secondMachine ||
                    "Stroj ni izbran";

              return (
                <div
                  key={
                    workOrder.id
                  }
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      "14px",
                    padding:
                      "18px 20px",
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
                        "flex-start",
                      gap:
                        "20px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
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
                        {
                          workOrder.date
                        }
                      </div>

                      <div
                        style={{
                          fontSize:
                            "19px",
                          fontWeight:
                            700,
                          color:
                            "#12344d",
                          marginBottom:
                            "7px",
                        }}
                      >
                        {
                          workOrder.project
                        }
                      </div>

                      <div
                        style={{
                          fontSize:
                            "14px",
                          color:
                            "#334155",
                          fontWeight:
                            600,
                        }}
                      >
                        {
                          machineText
                        }
                      </div>

                      {workOrder.note && (
                        <div
                          style={{
                            marginTop:
                              "8px",
                            fontSize:
                              "14px",
                            color:
                              "#64748b",
                          }}
                        >
                          {
                            workOrder.note
                          }
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "18px",
                        flexShrink:
                          0,
                        transform:
                          "translateY(28px)",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "baseline",
                          gap:
                            "6px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                          }}
                        >
                          Ure
                        </span>

                        <strong
                          style={{
                            fontSize:
                              "16px",
                            color:
                              "#184e43",
                          }}
                        >
                          {Number(
                            workOrder.hours ||
                              0
                          ).toFixed(
                            2
                          )}{" "}
                          h
                        </strong>
                      </div>

                      <button
                        onClick={() =>
                          onEditWorkOrder(
                            workOrder
                          )
                        }
                        style={{
                          height:
                            "34px",
                          padding:
                            "0 14px",
                          border:
                            "1px solid #cbd5e1",
                          borderRadius:
                            "9px",
                          background:
                            "#ffffff",
                          color:
                            "#334155",
                          fontSize:
                            "13px",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Uredi
                      </button>

                      <button
                        onClick={() =>
                          onDeleteWorkOrder(
                            workOrder.id
                          )
                        }
                        style={{
                          height:
                            "34px",
                          padding:
                            "0 14px",
                          border:
                            "1px solid #fecaca",
                          borderRadius:
                            "9px",
                          background:
                            "#ffffff",
                          color:
                            "#dc2626",
                          fontSize:
                            "13px",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Izbriši
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop:
                        "16px",
                      paddingTop:
                        "14px",
                      borderTop:
                        "1px solid #e5e7eb",
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#64748b",
                      }}
                    >
                      {
                        workOrder.startTime
                      }
                      {" – "}
                      {
                        workOrder.endTime
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#64748b",
                      }}
                    >
                      {workOrder.mealType ===
                      "outside"
                        ? "Malica zunaj"
                        : workOrder.mealType ===
                          "withMe"
                        ? "Malica s seboj"
                        : "Malica ni izbrana"}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default WorkOrderTable;