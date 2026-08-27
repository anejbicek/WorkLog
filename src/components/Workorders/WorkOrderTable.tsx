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
  /*
    NOVEJŠE KARTICE SO VEDNO NA VRHU.

    Najprej primerjamo datum.
    Če je datum novejši, gre kartica višje.

    Če sta dve kartici na isti datum,
    uporabimo ID. Višji ID pomeni,
    da je bila kartica dodana kasneje.
  */
  const sortedWorkOrders = [
    ...workOrders,
  ].sort((a, b) => {
    const dateComparison =
      b.date.localeCompare(a.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return b.id - a.id;
  });

  return (
    <div
      style={{
        width: "calc(100% - 40px)",
        maxWidth: "calc(1080px + 1cm)",
        margin: "25px auto 0 auto",
      }}
    >
      {sortedWorkOrders.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "30px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Ni dodanih delovnih nalogov.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {sortedWorkOrders.map(
            (workOrder) => {
              /*
                PRVI STROJ
              */

              const firstMachine =
                workOrder.machine || "";

              /*
                DRUGI STROJ
              */

              const secondMachine =
                workOrder.additionalMachine ||
                "";

              /*
                PRIKAŽEMO OBA STROJA,
                ČE STA IZBRANA
              */

              const machineText =
                firstMachine &&
                secondMachine
                  ? `${firstMachine} + ${secondMachine}`
                  : firstMachine ||
                    secondMachine ||
                    "Stroj ni izbran";

              return (
                <div
                  key={workOrder.id}
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
                  {/* =================================
                      ZGORNJI DEL KARTICE
                  ================================= */}

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "20px",
                    }}
                  >
                    {/* =================================
                        LEVA STRAN
                    ================================= */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {/* DATUM */}

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

                      {/* PROJEKT */}

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

                      {/* STROJ / STROJA */}

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

                      {/* OPIS */}

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

                    {/* =================================
                        DESNA STRAN

                        KOLIČINA | URE | UREDI | IZBRIŠI
                    ================================= */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "18px",
                        flexShrink: 0,
                        transform:
                          "translateY(28px)",
                      }}
                    >
                      {/* KOLIČINA */}

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "baseline",
                          gap: "6px",
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
                          Količina
                        </span>

                        <strong
                          style={{
                            fontSize:
                              "18px",
                            color:
                              "#12344d",
                          }}
                        >
                          {
                            workOrder.quantity
                          }
                        </strong>
                      </div>

                      {/* URE */}

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "baseline",
                          gap: "6px",
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

                      {/* UREDI */}

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

                      {/* IZBRIŠI */}

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

                  {/* =================================
                      SPODNJI DEL
                  ================================= */}

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
                    {/* ČAS */}

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