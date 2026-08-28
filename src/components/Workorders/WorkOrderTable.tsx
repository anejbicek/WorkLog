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
  /* =====================================================
     SORTIRANJE

     Najnovejši delovni nalogi
     so zgoraj.
  ===================================================== */

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
      {/* =================================================
          NI NALOGOV
      ================================================= */}

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
              /* =========================================
                 STROJ

                 Če sta dva stroja,
                 se prikažeta oba.
              ========================================= */

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
                  {/* ===================================
                      GLAVNI DEL KARTICE
                  =================================== */}

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

                      {/* STROJ */}

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

                      {/* OPIS DELA */}

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

                        URE
                        MALICA
                        UREDI
                        IZBRIŠI
                    ================================= */}

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

                        /*
                          Malo nižje kot
                          datum/projekt,
                          tako kot na
                          stari kartici.
                        */
                        transform:
                          "translateY(28px)",
                      }}
                    >
                      {/* =============================
                          URE + MALICA
                      ============================= */}

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          alignItems:
                            "flex-end",
                          gap:
                            "4px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {/* URE */}

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "baseline",
                            gap:
                              "6px",
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

                        {/* MALICA */}

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                          }}
                        >
                          {workOrder.meal
                            ? "Malica s seboj"
                            : "Malica zunaj"}
                        </div>
                      </div>

                      {/* =============================
                          UREDI
                      ============================= */}

                      <button
                        type="button"
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

                      {/* =============================
                          IZBRIŠI
                      ============================= */}

                      <button
                        type="button"
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

                  {/* ===================================
                      SPODNJA VRSTICA
                  =================================== */}

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
                        "flex-start",
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