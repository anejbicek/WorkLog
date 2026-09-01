import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { WorkOrder } from "../../types/WorkOrder";

import { supabase } from "../../services/supabase";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* =========================================================
   PROPS
========================================================= */

type AdminUserStatisticsProps = {
  userName: string;
  authUserId?: string;
  onBack: () => void;
};

/* =========================================================
   ADMIN STATUS DNEVA
========================================================= */

type AdminDayStatus =
  | "none"
  | "work"
  | "sick"
  | "vacation"
  | "holiday";

/* =========================================================
   DNEVNI PODATKI
========================================================= */

type DailyData = {
  orders: WorkOrder[];
  hours: number;
  additionalHours: number;
  twoMachines: boolean;
};

/* =========================================================
   GLAVNA KOMPONENTA
========================================================= */

function AdminUserStatistics({
  userName,
  authUserId,
  onBack,
}: AdminUserStatisticsProps) {
  /* =======================================================
     DELOVNI NALOGI
  ======================================================= */

  const [
    workOrders,
    setWorkOrders,
  ] = useState<WorkOrder[]>([]);

  /* =======================================================
     STATUSI DNI
  ======================================================= */

  const [
    dayStatuses,
    setDayStatuses,
  ] = useState<
    Record<string, AdminDayStatus>
  >({});

  /* =======================================================
     LOADING
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     NAPAKA
  ======================================================= */

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* =======================================================
     IZBRANI MESEC
  ======================================================= */

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

  /* =======================================================
     NAČIN UREJANJA
  ======================================================= */

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  /* =======================================================
     IZBRANI DAN
  ======================================================= */

  const [
    selectedDay,
    setSelectedDay,
  ] = useState<string | null>(
    null
  );

  /* =======================================================
     PDF
  ======================================================= */

  const pdfDocumentRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =======================================================
     LETO / MESEC
  ======================================================= */

  const [
    yearString,
    monthString,
  ] =
    selectedMonth.split(
      "-"
    );

  const year =
    Number(yearString);

  const month =
    Number(monthString);

  /* =======================================================
     NALOŽI STATISTIKO
  ======================================================= */

  useEffect(() => {
    const loadStatistics =
      async () => {
        setLoading(true);
        setErrorMessage("");

        if (!authUserId) {
          setWorkOrders([]);
          setDayStatuses({});

          setErrorMessage(
            "Ta uporabnik še nima povezanega Supabase User ID."
          );

          setLoading(false);

          return;
        }

        /* -------------------------------------------------
           DELOVNI NALOGI
        ------------------------------------------------- */

        const {
          data,
          error,
        } =
          await supabase
            .from("work_orders")
            .select("*")
            .eq(
              "user_id",
              authUserId
            )
            .order(
              "date",
              {
                ascending:
                  false,
              }
            );

        if (error) {
          console.error(
            "Napaka pri nalaganju statistike uporabnika:",
            error
          );

          setErrorMessage(
            "Statistike uporabnika ni bilo mogoče naložiti."
          );

          setWorkOrders([]);

          setLoading(false);

          return;
        }

        const mappedWorkOrders: WorkOrder[] =
          (
            data ?? []
          ).map(
            (row: any) => ({
              id: Number(
                row.id
              ),

              userId:
                row.user_id ??
                undefined,

              project:
                row.project ??
                "",

              machine:
                row.machine ??
                "",

              additionalMachine:
                row.additional_machine ??
                undefined,

              quantity:
                Number(
                  row.quantity ??
                    0
                ),

              date:
                row.date ??
                "",

              startTime:
                row.start_time ??
                "",

              endTime:
                row.end_time ??
                "",

              hours:
                Number(
                  row.hours ??
                    0
                ),

              regularHours:
                Number(
                  row.regular_hours ??
                    0
                ),

              nightHours:
                Number(
                  row.night_hours ??
                    0
                ),

              holidayHours:
                Number(
                  row.holiday_hours ??
                    0
                ),

              overtimeHours:
                Number(
                  row.overtime_hours ??
                    0
                ),

              additionalHours:
                Number(
                  row.additional_hours ??
                    0
                ),

              meal:
                row.meal_type ===
                "withMe",

              note:
                row.note ??
                "",
            })
          );

        setWorkOrders(
          mappedWorkOrders
        );

        /* -------------------------------------------------
           STATUSI DNI
        ------------------------------------------------- */

        const {
          data:
            statusData,
          error:
            statusError,
        } =
          await supabase
            .from(
              "work_day_statuses"
            )
            .select("*")
            .eq(
              "user_id",
              authUserId
            );

        if (statusError) {
          console.error(
            "Napaka pri nalaganju statusov dni:",
            statusError
          );
        } else {
          const statuses:
            Record<
              string,
              AdminDayStatus
            > = {};

          (
            statusData ??
            []
          ).forEach(
            (
              row: any
            ) => {
              const value =
                row.status;

              if (
                value ===
                  "sick" ||
                value ===
                  "vacation" ||
                value ===
                  "holiday" ||
                value ===
                  "work"
              ) {
                statuses[
                  row.date
                ] =
                  value;
              }
            }
          );

          setDayStatuses(
            statuses
          );
        }

        setLoading(false);
      };

    loadStatistics();
  }, [authUserId]);

  /* =======================================================
     DELOVNI NALOGI IZBRANEGA MESECA
  ======================================================= */

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

  /* =======================================================
     DNEVNA STATISTIKA
  ======================================================= */

  const dailyData =
    useMemo(
      () => {
        const days:
          Record<
            string,
            DailyData
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
                additionalHours:
                  0,
                twoMachines:
                  false,
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
      [
        monthWorkOrders,
      ]
    );

  /* =======================================================
     SEŠTEVKI
  ======================================================= */

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

  /* =======================================================
     STROJI
  ======================================================= */

  const machineTotals =
    useMemo(() => {
      const totals: Record<
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
            totals[
              workOrder.machine
            ] =
              (
                totals[
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
            totals[
              workOrder.additionalMachine
            ] =
              (
                totals[
                  workOrder
                    .additionalMachine
                ] || 0
              ) +
              Number(
                workOrder.hours ||
                  0
              );
          }
        }
      );

      return totals;
    }, [
      monthWorkOrders,
    ]);

  /* =======================================================
     PROJEKTI
  ======================================================= */

  const projectTotals =
    useMemo(() => {
      const totals: Record<
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

          totals[
            workOrder.project
          ] =
            (
              totals[
                workOrder.project
              ] || 0
            ) +
            Number(
              workOrder.hours ||
                0
            );
        }
      );

      return totals;
    }, [
      monthWorkOrders,
    ]);

  /* =======================================================
     KOLEDAR
  ======================================================= */

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

  /* =======================================================
     IME MESECA
  ======================================================= */

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

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusText =
    (
      status:
        | AdminDayStatus
        | undefined,
      data:
        | DailyData
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

  /* =======================================================
     BARVE
  ======================================================= */

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

      /* BOLNIŠKA */

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

      /* DOPUST */

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

      /* PRAZNIK */

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

      /* 2 STROJA */

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

      /* 1 STROJ */

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

      /* PRAZEN DAN */

      return {
        background:
          "#ffffff",
        border:
          "#e2e8f0",
        text:
          "#64748b",
      };
    };

  /* =======================================================
     KLIK NA DAN
  ======================================================= */

  const handleDayClick =
    (
      dateString: string
    ) => {
      setSelectedDay(
        dateString
      );
    };

  /* =======================================================
     SHRANI STATUS
  ======================================================= */

  const handleStatusSave =
    async (
      status: AdminDayStatus
    ) => {
      if (
        !selectedDay ||
        !authUserId
      ) {
        return;
      }

      setErrorMessage("");

      try {
        /* -------------------------------------------------
           IZBRIŠI STATUS
        ------------------------------------------------- */

        if (
          status ===
          "none"
        ) {
          const {
            error,
          } =
            await supabase
              .from(
                "work_day_statuses"
              )
              .delete()
              .eq(
                "user_id",
                authUserId
              )
              .eq(
                "date",
                selectedDay
              );

          if (error) {
            throw error;
          }

          setDayStatuses(
            (
              previous
            ) => {
              const next = {
                ...previous,
              };

              delete next[
                selectedDay
              ];

              return next;
            }
          );
        } else {
          /* -------------------------------------------------
             SHRANI STATUS
          ------------------------------------------------- */

          const {
            error,
          } =
            await supabase
              .from(
                "work_day_statuses"
              )
              .upsert(
                {
                  user_id:
                    authUserId,

                  date:
                    selectedDay,

                  status,
                },
                {
                  onConflict:
                    "user_id,date",
                }
              );

          if (error) {
            throw error;
          }

          setDayStatuses(
            (
              previous
            ) => ({
              ...previous,

              [selectedDay]:
                status,
            })
          );
        }

        setSelectedDay(
          null
        );
      } catch (
        error
      ) {
        console.error(
          "Napaka pri shranjevanju statusa dneva:",
          error
        );

        setErrorMessage(
          "Status dneva ni bilo mogoče shraniti."
        );
      }
    };

  /* =======================================================
     SPREMEMBA MESECA
  ======================================================= */

  const changeMonth =
    (
      offset: number
    ) => {
      const date =
        new Date(
          year,
          month - 1 + offset,
          1
        );

      setSelectedMonth(
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(
          2,
          "0"
        )}`
      );
    };

  /* =======================================================
     PDF
  ======================================================= */

  const exportPDF =
    async () => {
      if (
        !pdfDocumentRef.current
      ) {
        return;
      }

      try {
        const element =
          pdfDocumentRef.current;

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

        const pdf =
          new jsPDF({
            orientation:
              "portrait",
            unit: "mm",
            format: "a4",
          });

        const pageWidth =
          pdf.internal.pageSize.getWidth();

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        const pageCanvasHeight =
          Math.floor(
            (canvas.width *
              pageHeight) /
              pageWidth
          );

        let sourceY = 0;
        let pageNumber = 0;

        while (
          sourceY <
          canvas.height
        ) {
          const remainingHeight =
            canvas.height -
            sourceY;

          const currentHeight =
            Math.min(
              pageCanvasHeight,
              remainingHeight
            );

          const pageCanvas =
            document.createElement(
              "canvas"
            );

          pageCanvas.width =
            canvas.width;

          pageCanvas.height =
            currentHeight;

          const context =
            pageCanvas.getContext(
              "2d"
            );

          if (!context) {
            return;
          }

          context.fillStyle =
            "#ffffff";

          context.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          context.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            currentHeight,
            0,
            0,
            canvas.width,
            currentHeight
          );

          const image =
            pageCanvas.toDataURL(
              "image/png"
            );

          const imageHeight =
            (currentHeight *
              pageWidth) /
            canvas.width;

          if (
            pageNumber >
            0
          ) {
            pdf.addPage();
          }

          pdf.addImage(
            image,
            "PNG",
            0,
            0,
            pageWidth,
            imageHeight,
            undefined,
            "FAST"
          );

          sourceY +=
            currentHeight;

          pageNumber++;
        }

        pdf.save(
          `ZustAI_Statistika_${userName.replace(
            /\s+/g,
            "_"
          )}_${selectedMonth}.pdf`
        );
      } catch (
        error
      ) {
        console.error(
          "Napaka pri izvozu PDF:",
          error
        );

        alert(
          "PDF-ja ni bilo mogoče izvoziti."
        );
      }
    };

  /* =======================================================
     PRIKAZ
  ======================================================= */

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
      {/* ===================================================
          ANIMACIJA
      =================================================== */}

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

      {/* ===================================================
          GLAVA
      =================================================== */}

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
          <h1
            style={{
              margin: 0,
              fontSize:
                "28px",
              fontWeight:
                700,
              color:
                "#12344d",
            }}
          >
            Statistika uporabnika
          </h1>

          <p
            style={{
              margin:
                "8px 0 0",
              fontSize:
                "15px",
              color:
                "#64748b",
            }}
          >
            {userName}
          </p>
        </div>

        <button
          type="button"
          onClick={
            onBack
          }
          style={
            secondaryButtonStyle
          }
        >
          ← Nazaj
        </button>
      </div>

      {/* ===================================================
          MESEC
      =================================================== */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "16px",
          padding:
            "16px 18px",
          marginBottom:
            "20px",
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "12px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            changeMonth(
              -1
            )
          }
          style={
            monthButtonStyle
          }
        >
          ←
        </button>

        <div
          style={{
            flex:
              1,
            textAlign:
              "center",
            fontSize:
              "18px",
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
          style={
            monthInputStyle
          }
        />

        <button
          type="button"
          onClick={() =>
            changeMonth(
              1
            )
          }
          style={
            monthButtonStyle
          }
        >
          →
        </button>

        <button
          type="button"
          onClick={
            exportPDF
          }
          style={
            pdfButtonStyle
          }
        >
          📄 Izvozi PDF
        </button>
      </div>

      {/* ===================================================
          NAPAKA
      =================================================== */}

      {errorMessage && (
        <div
          style={{
            background:
              "#fff7ed",
            border:
              "1px solid #fed7aa",
            borderRadius:
              "12px",
            padding:
              "16px 18px",
            marginBottom:
              "20px",
            color:
              "#9a3412",
            fontSize:
              "14px",
          }}
        >
          {
            errorMessage
          }
        </div>
      )}

      {/* ===================================================
          GLAVNI PDF KONTAINER
      =================================================== */}

      {loading ? (
        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              "16px",
            padding:
              "30px",
            color:
              "#64748b",
            textAlign:
              "center",
          }}
        >
          Nalagam statistiko ...
        </div>
      ) : (
        <div
          ref={
            pdfDocumentRef
          }
        >
          {/* =================================================
              NASLOV
          ================================================= */}

          <div
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                "16px",
              padding:
                "20px 24px",
              marginBottom:
                "20px",
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
                  Mesečna statistika
                </div>

                <div
                  style={{
                    fontSize:
                      "22px",
                    fontWeight:
                      700,
                    color:
                      "#12344d",
                  }}
                >
                  {userName}
                </div>
              </div>

              <div
                style={{
                  fontSize:
                    "18px",
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
          </div>

          {/* =================================================
              KOLEDAR
          ================================================= */}

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
                    : "Klikni dan za prikaz podatkov dneva."}
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

            {/* DNEVI TEDNA */}

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

            {/* CELICE */}

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
                          : "Prikaži podatke dneva"
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
                            {data.hours.toFixed(
                              2
                            )}{" "}
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
                              {data.additionalHours.toFixed(
                                2
                              )}{" "}
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
                              data
                                .orders
                                .length
                            }{" "}
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

            {/* =================================================
                LEGENDA
            ================================================= */}

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

          {/* =================================================
              STATISTIČNE KARTICE
          ================================================= */}

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

          {/* =================================================
              STROJI
          ================================================= */}

          <StatisticsList
            title="Statistika strojev"
            subtitle="Pregled opravljenih ur po strojih."
            data={
              machineTotals
            }
          />

          {/* =================================================
              PROJEKTI
          ================================================= */}

          <StatisticsList
            title="Statistika projektov"
            subtitle="Pregled opravljenih ur po projektih."
            data={
              projectTotals
            }
          />
        </div>
      )}

      {/* =====================================================
          KARTICA DNEVA
      ===================================================== */}

      {selectedDay && (
        <DayDetailsModal
          date={
            selectedDay
          }
          workOrders={
            dailyData[
              selectedDay
            ]?.orders ??
            []
          }
          status={
            dayStatuses[
              selectedDay
            ]
          }
          editMode={
            editMode
          }
          onClose={() =>
            setSelectedDay(
              null
            )
          }
          onEnableEdit={() =>
            setEditMode(
              true
            )
          }
          onSaveStatus={
            handleStatusSave
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   KARTICA DNEVA
========================================================= */

function DayDetailsModal({
  date,
  workOrders,
  status,
  editMode,
  onClose,
  onEnableEdit,
  onSaveStatus,
}: {
  date: string;
  workOrders: WorkOrder[];
  status:
    | AdminDayStatus
    | undefined;
  editMode: boolean;
  onClose: () => void;
  onEnableEdit: () => void;
  onSaveStatus: (
    status: AdminDayStatus
  ) => Promise<void>;
}) {
  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<AdminDayStatus>(
      status ||
        "none"
    );

  useEffect(() => {
    setSelectedStatus(
      status ||
        "none"
    );
  }, [status]);

  const totalHours =
    workOrders.reduce(
      (
        sum,
        workOrder
      ) =>
        sum +
        Number(
          workOrder.hours ||
            0
        ),
      0
    );

  const formattedDate =
    new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "sl-SI",
      {
        weekday:
          "long",
        day:
          "numeric",
        month:
          "long",
        year:
          "numeric",
      }
    );

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
            "min(620px, 100%)",
          maxHeight:
            "90vh",
          overflowY:
            "auto",
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
        {/* NASLOV */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color:
                  "#12344d",
                fontSize:
                  "22px",
              }}
            >
              Podatki dneva
            </h2>

            <p
              style={{
                color:
                  "#64748b",
                margin:
                  "7px 0 0",
                textTransform:
                  "capitalize",
              }}
            >
              {
                formattedDate
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            style={
              closeButtonStyle
            }
          >
            ×
          </button>
        </div>

        {/* STATUS */}

        <div
          style={{
            marginTop:
              "20px",
            padding:
              "15px",
            borderRadius:
              "10px",
            background:
              getStatusBackground(
                status
              ),
            border:
              `1px solid ${getStatusBorder(
                status
              )}`,
          }}
        >
          <div
            style={{
              fontSize:
                "12px",
              color:
                "#64748b",
              marginBottom:
                "4px",
            }}
          >
            Status dneva
          </div>

          <strong
            style={{
              color:
                getStatusTextColor(
                  status
                ),
              fontSize:
                "15px",
            }}
          >
            {getStatusLabel(
              status
            )}
          </strong>
        </div>

        {/* DELOVNE KARTICE */}

        <div
          style={{
            marginTop:
              "20px",
          }}
        >
          <h3
            style={{
              margin:
                "0 0 12px",
              fontSize:
                "17px",
              color:
                "#12344d",
            }}
          >
            Delovne kartice
          </h3>

          {workOrders.length ===
          0 ? (
            <div
              style={{
                padding:
                  "18px",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "10px",
                color:
                  "#64748b",
                fontSize:
                  "14px",
              }}
            >
              Ta dan ni bilo
              vnesene delovne
              kartice.
            </div>
          ) : (
            <>
              {workOrders.map(
                (
                  workOrder
                ) => (
                  <div
                    key={
                      workOrder.id
                    }
                    style={{
                      border:
                        "1px solid #e2e8f0",
                      borderRadius:
                        "10px",
                      padding:
                        "15px",
                      marginBottom:
                        "10px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap:
                          "12px",
                      }}
                    >
                      <InfoItem
                        label="Projekt"
                        value={
                          workOrder.project ||
                          "—"
                        }
                      />

                      <InfoItem
                        label="Stroj"
                        value={
                          workOrder.machine ||
                          "—"
                        }
                      />

                      <InfoItem
                        label="Začetek"
                        value={
                          workOrder.startTime ||
                          "—"
                        }
                      />

                      <InfoItem
                        label="Konec"
                        value={
                          workOrder.endTime ||
                          "—"
                        }
                      />

                      <InfoItem
                        label="Ure"
                        value={`${Number(
                          workOrder.hours ||
                            0
                        ).toFixed(
                          2
                        )} h`}
                      />

                      <InfoItem
                        label="Dodatne ure"
                        value={`${Number(
                          workOrder.additionalHours ||
                            0
                        ).toFixed(
                          2
                        )} h`}
                      />
                    </div>

                    {workOrder.additionalMachine && (
                      <div
                        style={{
                          marginTop:
                            "12px",
                        }}
                      >
                        <InfoItem
                          label="Dodatni stroj"
                          value={
                            workOrder.additionalMachine
                          }
                        />
                      </div>
                    )}

                    {workOrder.note && (
                      <div
                        style={{
                          marginTop:
                            "12px",
                        }}
                      >
                        <InfoItem
                          label="Opis dela"
                          value={
                            workOrder.note
                          }
                        />
                      </div>
                    )}
                  </div>
                )
              )}

              <div
                style={{
                  textAlign:
                    "right",
                  fontWeight:
                    700,
                  color:
                    "#12344d",
                  marginTop:
                    "12px",
                }}
              >
                Skupaj:{" "}
                {totalHours.toFixed(
                  2
                )}{" "}
                h
              </div>
            </>
          )}
        </div>

        {/* =================================================
            ADMIN UREJANJE
        ================================================= */}

        {editMode && (
          <div
            style={{
              marginTop:
                "20px",
              paddingTop:
                "20px",
              borderTop:
                "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                margin:
                  "0 0 10px",
                fontSize:
                  "17px",
                color:
                  "#12344d",
              }}
            >
              Uredi status dneva
            </h3>

            <select
              value={
                selectedStatus
              }
              onChange={(
                event
              ) =>
                setSelectedStatus(
                  event.target
                    .value as AdminDayStatus
                )
              }
              style={
                statusSelectStyle
              }
            >
              <option value="none">
                Brez vnosa
              </option>

              <option value="work">
                Delal
              </option>

              <option value="sick">
                Bolniška
              </option>

              <option value="vacation">
                Dopust
              </option>

              <option value="holiday">
                Praznik
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                onSaveStatus(
                  selectedStatus
                )
              }
              style={
                saveButtonStyle
              }
            >
              Shrani status
            </button>
          </div>
        )}

        {/* GUMBI */}

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
          {!editMode && (
            <button
              type="button"
              onClick={
                onEnableEdit
              }
              style={
                editButtonStyle
              }
            >
              ✏️ Uredi
            </button>
          )}

          <button
            type="button"
            onClick={
              onClose
            }
            style={
              secondaryModalButtonStyle
            }
          >
            Zapri
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize:
            "11px",
          color:
            "#64748b",
          marginBottom:
            "3px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            "14px",
          fontWeight:
            600,
          color:
            "#334155",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   LEGENDA
========================================================= */

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

/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(
  status:
    | AdminDayStatus
    | undefined
) {
  switch (status) {
    case "sick":
      return "Bolniška";

    case "vacation":
      return "Dopust";

    case "holiday":
      return "Praznik";

    case "work":
      return "Delal";

    default:
      return "Brez vnosa";
  }
}

/* =========================================================
   STATUS BACKGROUND
========================================================= */

function getStatusBackground(
  status:
    | AdminDayStatus
    | undefined
) {
  switch (status) {
    case "sick":
      return "#fee2e2";

    case "vacation":
      return "#fef3c7";

    case "holiday":
      return "#e0e7ff";

    case "work":
      return "#dcfce7";

    default:
      return "#f8fafc";
  }
}

/* =========================================================
   STATUS BORDER
========================================================= */

function getStatusBorder(
  status:
    | AdminDayStatus
    | undefined
) {
  switch (status) {
    case "sick":
      return "#ef4444";

    case "vacation":
      return "#f59e0b";

    case "holiday":
      return "#6366f1";

    case "work":
      return "#15803d";

    default:
      return "#e2e8f0";
  }
}

/* =========================================================
   STATUS TEXT COLOR
========================================================= */

function getStatusTextColor(
  status:
    | AdminDayStatus
    | undefined
) {
  switch (status) {
    case "sick":
      return "#991b1b";

    case "vacation":
      return "#92400e";

    case "holiday":
      return "#3730a3";

    case "work":
      return "#166534";

    default:
      return "#64748b";
  }
}

/* =========================================================
   STATISTIČNA KARTICA
========================================================= */

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

/* =========================================================
   STATISTIKA LIST
========================================================= */

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

/* =========================================================
   FORMAT UR
========================================================= */

function formatHours(
  value: number
) {
  return `${value.toFixed(
    2
  )} h`;
}

/* =========================================================
   STILI
========================================================= */

const secondaryButtonStyle = {
  height:
    "38px",
  padding:
    "0 14px",
  border:
    "1px solid #dbe3e8",
  borderRadius:
    "8px",
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
};

const monthButtonStyle = {
  width:
    "42px",
  height:
    "42px",
  border:
    "1px solid #dbe3e8",
  borderRadius:
    "9px",
  background:
    "#ffffff",
  color:
    "#12344d",
  fontSize:
    "20px",
  fontWeight:
    600,
  cursor:
    "pointer",
};

const monthInputStyle = {
  width:
    "170px",
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
    "border-box" as const,
};

const pdfButtonStyle = {
  height:
    "42px",
  padding:
    "0 18px",
  border:
    "none",
  borderRadius:
    "9px",
  background:
    "#1d526b",
  color:
    "#ffffff",
  fontSize:
    "13px",
  fontWeight:
    600,
  cursor:
    "pointer",
};

const closeButtonStyle = {
  width:
    "34px",
  height:
    "34px",
  border:
    "1px solid #e2e8f0",
  borderRadius:
    "8px",
  background:
    "#ffffff",
  color:
    "#64748b",
  fontSize:
    "22px",
  lineHeight:
    "1",
  cursor:
    "pointer",
};

const statusSelectStyle = {
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
  color:
    "#334155",
};

const saveButtonStyle = {
  width:
    "100%",
  height:
    "42px",
  marginTop:
    "10px",
  border:
    "none",
  borderRadius:
    "9px",
  background:
    "#12344d",
  color:
    "#ffffff",
  fontSize:
    "13px",
  fontWeight:
    600,
  cursor:
    "pointer",
};

const editButtonStyle = {
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
  fontSize:
    "13px",
  fontWeight:
    600,
  cursor:
    "pointer",
};

const secondaryModalButtonStyle = {
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
  fontSize:
    "13px",
  fontWeight:
    600,
  cursor:
    "pointer",
};

export default AdminUserStatistics;