import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  useWorkOrders,
} from "../context/WorkOrderContext";

import { supabase } from "../services/supabase";

/* =====================================================
   KONSTANTE
===================================================== */

const ROWS_PER_PAGE = 25;

/* =====================================================
   PDF
===================================================== */

function PDF() {
  const {
    workOrders,
  } = useWorkOrders();

  const [userName, setUserName] = useState("Uporabnik");

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("name")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (mounted && profile?.name) {
        setUserName(profile.name);
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const today =
    new Date();

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`
  );

  /*
    Reference na vse A4 strani.
  */
  const pageRefs =
    useRef<
      Array<HTMLDivElement | null>
    >([]);

  /* =========================================
     NALOGI IZBRANEGA MESECA
  ========================================= */

  const monthWorkOrders =
    useMemo(() => {
      return [
        ...workOrders,
      ]
        .filter(
          (workOrder) =>
            workOrder.date.startsWith(
              selectedMonth
            )
        )
        .sort(
          (a, b) => {
            const dateComparison =
              a.date.localeCompare(
                b.date
              );

            if (
              dateComparison !==
              0
            ) {
              return dateComparison;
            }

            return a.id - b.id;
          }
        );
    }, [
      workOrders,
      selectedMonth,
    ]);

  /* =========================================
     URE
  ========================================= */

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

  /* =========================================
     MALICA
  ========================================= */

  /*
    false = jedel zunaj
    true  = imel malico s seboj
  */

  const mealOutside =
    monthWorkOrders.filter(
      (workOrder) =>
        !workOrder.meal
    ).length;

  const mealWithSelf =
    monthWorkOrders.filter(
      (workOrder) =>
        Boolean(
          workOrder.meal
        )
    ).length;

  /* =========================================
     MESEC
  ========================================= */

  const [
    year,
    month,
  ] =
    selectedMonth.split("-");

  const monthName =
    new Date(
      Number(year),
      Number(month) - 1
    ).toLocaleDateString(
      "sl-SI",
      {
        month: "long",
        year: "numeric",
      }
    );

  /* =========================================
     STRANI

     Največ 25 delovnih nalogov
     na eno stran.
  ========================================= */

  const pages =
    useMemo(() => {
      const result =
        [];

      for (
        let i = 0;
        i <
        monthWorkOrders.length;
        i += ROWS_PER_PAGE
      ) {
        result.push(
          monthWorkOrders.slice(
            i,
            i +
              ROWS_PER_PAGE
          )
        );
      }

      /*
        Če ni nalogov,
        vseeno prikažemo
        eno prazno stran.
      */

      if (
        result.length === 0
      ) {
        result.push([]);
      }

      return result;
    }, [
      monthWorkOrders,
    ]);

  /* =========================================
     IZVOZ PDF
  ========================================= */

  const exportPDF =
    async () => {
      const pdf =
        new jsPDF({
          orientation:
            "portrait",
          unit: "mm",
          format: "a4",
        });

      let firstPage =
        true;

      for (
        let pageIndex = 0;
        pageIndex <
        pages.length;
        pageIndex++
      ) {
        const element =
          pageRefs.current[
            pageIndex
          ];

        if (!element) {
          continue;
        }

        const canvas =
          await html2canvas(
            element,
            {
              scale: 2,
              useCORS: true,
              backgroundColor:
                "#ffffff",
              logging: false,
            }
          );

        const pageWidth =
          pdf.internal.pageSize.getWidth();

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        const imageWidth =
          pageWidth;

        const imageHeight =
          (canvas.height *
            imageWidth) /
          canvas.width;

        if (
          !firstPage
        ) {
          pdf.addPage();
        }

        /*
          Stran je že A4,
          zato jo samo
          prilepimo na A4.
        */

        pdf.addImage(
          canvas.toDataURL(
            "image/png"
          ),
          "PNG",
          0,
          0,
          imageWidth,
          Math.min(
            imageHeight,
            pageHeight
          ),
          undefined,
          "FAST"
        );

        firstPage =
          false;
      }

      pdf.save(
        `ZustAI_WorkLog_${selectedMonth}.pdf`
      );
    };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
      }}
    >
      {/* =====================================
          NASLOV STRANI
      ===================================== */}

      <div
        style={{
          marginBottom:
            "20px",
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
          PDF
        </h1>

        <p
          style={{
            marginTop: "6px",
            fontSize: "15px",
            color: "#64748b",
          }}
        >
          Priprava mesečne evidence
          za izvoz v PDF.
        </p>
      </div>

      {/* =====================================
          IZBIRA MESECA
      ===================================== */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "18px",
          marginBottom:
            "20px",
          display:
            "flex",
          alignItems:
            "flex-end",
          justifyContent:
            "space-between",
        }}
      >
        <div>
          <label
            style={{
              display:
                "block",
              marginBottom:
                "7px",
              fontSize:
                "14px",
              fontWeight: 600,
              color:
                "#334155",
            }}
          >
            Mesec
          </label>

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
                "220px",
              height:
                "44px",
              border:
                "1px solid #d1d5db",
              borderRadius:
                "10px",
              padding:
                "0 14px",
              fontSize:
                "15px",
              background:
                "#ffffff",
              boxSizing:
                "border-box",
            }}
          />
        </div>

        <button
          onClick={
            exportPDF
          }
          style={{
            height:
              "44px",
            padding:
              "0 24px",
            border:
              "none",
            borderRadius:
              "10px",
            background:
              "#1d526b",
            color:
              "#ffffff",
            fontSize:
              "15px",
            fontWeight: 600,
            cursor:
              "pointer",
          }}
        >
          Izvozi PDF
        </button>
      </div>

      {/* =====================================
          A4 STRANI

          Vsaka stran ima največ 25 vrstic.
      ===================================== */}

      <div>
        {pages.map(
          (
            pageWorkOrders,
            pageIndex
          ) => (
            <div
              key={
                pageIndex
              }
              ref={(
                element
              ) => {
                pageRefs.current[
                  pageIndex
                ] =
                  element;
              }}
              style={{
                width:
                  "210mm",
                height:
                  "297mm",
                margin:
                  "0 auto 20px auto",
                padding:
                  "11mm 14mm 12mm 14mm",
                boxSizing:
                  "border-box",
                background:
                  "#ffffff",
                color:
                  "#000000",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                overflow:
                  "hidden",
              }}
            >
              {/* ===================================
                  KOMPAKTNA GLAVA
              =================================== */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  paddingBottom:
                    "5mm",
                  borderBottom:
                    "1.5px solid #17465d",
                }}
              >
                {/* LOGO */}

                <div
                  style={{
                    width:
                      "30mm",
                    height:
                      "20mm",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "flex-start",
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="Logo"
                    crossOrigin="anonymous"
                    style={{
                      maxWidth:
                        "30mm",
                      maxHeight:
                        "20mm",
                      objectFit:
                        "contain",
                    }}
                  />
                </div>

                {/* UPORABNIK */}

                <div
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "9px",
                      color:
                        "#64748b",
                      marginBottom:
                        "1mm",
                    }}
                  >
                    Uporabnik
                  </div>

                  <div
                    style={{
                      fontSize:
                        "13px",
                      fontWeight: 700,
                      color:
                        "#12344d",
                    }}
                  >
                    {userName}
                  </div>
                </div>
              </div>

              {/* ===================================
                  NASLOV
              =================================== */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-end",
                  marginTop:
                    "4mm",
                  marginBottom:
                    "4mm",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "18px",
                    fontWeight: 700,
                    color:
                      "#12344d",
                  }}
                >
                  Mesečna evidenca
                </h2>

                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#64748b",
                    textTransform:
                      "capitalize",
                  }}
                >
                  {monthName}
                </div>
              </div>

              {/* ===================================
                  POVZETEK UR
              =================================== */}

              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  tableLayout:
                    "fixed",
                  fontSize:
                    "8.5px",
                  marginBottom:
                    "3mm",
                }}
              >
                <tbody>
                  <tr>
                    <PdfSummaryCell
                      label="Redne ure"
                      value={
                        regularHours
                      }
                    />

                    <PdfSummaryCell
                      label="Nočne ure"
                      value={
                        nightHours
                      }
                    />

                    <PdfSummaryCell
                      label="Nedelje / prazniki"
                      value={
                        holidayHours
                      }
                    />

                    <PdfSummaryCell
                      label="Dodatne ure"
                      value={
                        additionalHours
                      }
                    />

                    <PdfSummaryCell
                      label="Nadure"
                      value={
                        overtimeHours
                      }
                    />

                    <td
                      style={{
                        padding:
                          "2.5mm 2mm",
                        background:
                          "#17465d",
                        color:
                          "#ffffff",
                        textAlign:
                          "center",
                        fontWeight: 700,
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "7.5px",
                          marginBottom:
                            "1mm",
                        }}
                      >
                        SKUPAJ
                      </div>

                      <div
                        style={{
                          fontSize:
                            "10px",
                        }}
                      >
                        {totalHours.toFixed(
                          2
                        )}{" "}
                        h
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ===================================
                  POVZETEK MALIC
              =================================== */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "18px",
                  marginBottom:
                    "4mm",
                  fontSize:
                    "8px",
                  color:
                    "#475569",
                }}
              >
                <span>
                  <strong>
                    Malica zunaj:
                  </strong>{" "}
                  {mealOutside}×
                </span>

                <span>
                  <strong>
                    Malica s seboj:
                  </strong>{" "}
                  {mealWithSelf}×
                </span>
              </div>

              {/* ===================================
                  DNEVNA EVIDENCA
              =================================== */}

              <div
                style={{
                  fontSize:
                    "13px",
                  fontWeight: 700,
                  color:
                    "#12344d",
                  marginBottom:
                    "2mm",
                }}
              >
                Dnevna evidenca
              </div>

              {pageWorkOrders.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "5mm",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "2mm",
                    textAlign:
                      "center",
                    fontSize:
                      "10px",
                  }}
                >
                  Za izbrani mesec ni
                  vpisanih delovnih
                  nalogov.
                </div>
              ) : (
                <table
                  style={{
                    width:
                      "100%",
                    borderCollapse:
                      "collapse",
                    tableLayout:
                      "fixed",
                    fontSize:
                      "8.5px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "#17465d",
                        color:
                          "#ffffff",
                      }}
                    >
                      {/* DATUM */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "12%",
                        }}
                      >
                        Datum
                      </th>

                      {/* PROJEKT */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "18%",
                        }}
                      >
                        Projekt
                      </th>

                      {/* STROJ */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "21%",
                        }}
                      >
                        Stroj
                      </th>

                      {/* ZAČETEK */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "10%",
                        }}
                      >
                        Začetek
                      </th>

                      {/* KONEC */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "10%",
                        }}
                      >
                        Konec
                      </th>

                      {/* URE */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "9%",
                          textAlign:
                            "right",
                        }}
                      >
                        Ure
                      </th>

                      {/* DODATNE */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "10%",
                          textAlign:
                            "right",
                        }}
                      >
                        Dodatne
                      </th>

                      {/* MALICA */}

                      <th
                        style={{
                          ...headerCell,
                          width:
                            "10%",
                          textAlign:
                            "center",
                        }}
                      >
                        Malica
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageWorkOrders.map(
                      (
                        workOrder,
                        index
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
                          <tr
                            key={
                              workOrder.id
                            }
                            style={{
                              background:
                                index %
                                  2 ===
                                0
                                  ? "#f8fafc"
                                  : "#ffffff",
                            }}
                          >
                            {/* DATUM */}

                            <td
                              style={
                                bodyCell
                              }
                            >
                              {
                                workOrder.date
                              }
                            </td>

                            {/* PROJEKT */}

                            <td
                              style={
                                bodyCell
                              }
                            >
                              {
                                workOrder.project
                              }
                            </td>

                            {/* STROJ */}

                            <td
                              style={{
                                ...bodyCell,
                                whiteSpace:
                                  "normal",
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {
                                machineText
                              }
                            </td>

                            {/* ZAČETEK */}

                            <td
                              style={
                                bodyCell
                              }
                            >
                              {
                                workOrder.startTime
                              }
                            </td>

                            {/* KONEC */}

                            <td
                              style={
                                bodyCell
                              }
                            >
                              {
                                workOrder.endTime
                              }
                            </td>

                            {/* URE */}

                            <td
                              style={{
                                ...bodyCell,
                                textAlign:
                                  "right",
                                fontWeight:
                                  600,
                              }}
                            >
                              {Number(
                                workOrder.hours ||
                                  0
                              ).toFixed(
                                2
                              )}{" "}
                              h
                            </td>

                            {/* DODATNE URE */}

                            <td
                              style={{
                                ...bodyCell,
                                textAlign:
                                  "right",
                                fontWeight:
                                  600,
                              }}
                            >
                              {Number(
                                workOrder.additionalHours ||
                                  0
                              ).toFixed(
                                2
                              )}{" "}
                              h
                            </td>

                            {/* MALICA */}

                            <td
                              style={{
                                ...bodyCell,
                                textAlign:
                                  "center",
                                fontSize:
                                  "10px",
                                fontWeight:
                                  700,
                              }}
                            >
                              {workOrder.meal
                                ? "✓"
                                : ""}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              )}

              {/* ===================================
                  INFORMACIJA O STRANI
              =================================== */}

              <div
                style={{
                  marginTop:
                    "4mm",
                  paddingTop:
                    "2.5mm",
                  borderTop:
                    "1px solid #e5e7eb",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  fontSize:
                    "7px",
                  color:
                    "#64748b",
                }}
              >
                <span>
                  Mesečna evidenca
                </span>

                <span>
                  {monthName}
                </span>

                <span>
                  Stran{" "}
                  {pageIndex +
                    1}{" "}
                  /{" "}
                  {pages.length}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =====================================================
   POVZETEK – POSAMEZNA CELICA
===================================================== */

function PdfSummaryCell({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <td
      style={{
        padding:
          "2.5mm 2mm",
        background:
          "#f1f5f9",
        color:
          "#000000",
        textAlign:
          "center",
        borderRight:
          "1px solid #ffffff",
      }}
    >
      <div
        style={{
          fontSize:
            "7.5px",
          marginBottom:
            "1mm",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            "10px",
          fontWeight: 700,
        }}
      >
        {value.toFixed(
          2
        )}{" "}
        h
      </div>
    </td>
  );
}

/* =====================================================
   TABELE
===================================================== */

const headerCell = {
  padding:
    "1.7mm 1.5mm",
  textAlign:
    "left" as const,
  fontWeight: 700,
  borderRight:
    "1px solid rgba(255,255,255,0.25)",
};

const bodyCell = {
  padding:
    "1.7mm 1.5mm",
  borderBottom:
    "1px solid #e5e7eb",
  overflow:
    "hidden",
  textOverflow:
    "ellipsis",
  whiteSpace:
    "nowrap" as const,
};

export default PDF;