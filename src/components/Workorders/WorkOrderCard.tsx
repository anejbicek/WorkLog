import { useState, useRef, useEffect } from "react";
import type { WorkOrder } from "../../types/WorkOrder";

type InputFieldProps = {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  width?: string;
  type?: string;
};

function InputField({
  label,
  placeholder,
  value = "",
  onChange,
  width = "100%",
  type = "text",
}: InputFieldProps) {
  return (
    <div style={{ width }}>
      <label style={labelStyle}>{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}

/* =====================================================
   URE NA 15 MINUT
===================================================== */

function createTimeOptions() {
  const options: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      options.push(
        `${String(hour).padStart(
          2,
          "0"
        )}:${String(minute).padStart(
          2,
          "0"
        )}`
      );
    }
  }

  return options;
}

const timeOptions =
  createTimeOptions();

/* =====================================================
   LASTEN SPUSTNI SEZNAM ZA URE
===================================================== */

type TimeSelectProps = {
  value: string;
  onChange: (
    value: string
  ) => void;
};

function TimeSelect({
  value,
  onChange,
}: TimeSelectProps) {
  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    const handleClickOutside =
      (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target as Node
          )
        ) {
          setOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const selectedElement =
          containerRef.current?.querySelector(
            `[data-time="${value}"]`
          ) as HTMLElement | null;

        selectedElement?.scrollIntoView(
          {
            block: "center",
          }
        );
      }, 0);
    }
  }, [open, value]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (previous) =>
              !previous
          )
        }
        style={{
          ...inputStyle,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
        }}
      >
        <span>{value}</span>

        <span
          style={{
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width: "100%",
            height: "252px",
            background:
              "#ffffff",
            border:
              "1px solid #d1d5db",
            borderRadius: "10px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          {timeOptions.map(
            (time) => (
              <div
                key={time}
                data-time={time}
                onClick={() => {
                  onChange(time);
                  setOpen(false);
                }}
                style={{
                  height: "36px",
                  display: "flex",
                  alignItems:
                    "center",
                  padding:
                    "0 14px",
                  boxSizing:
                    "border-box",
                  cursor:
                    "pointer",
                  background:
                    time === value
                      ? "#eff6ff"
                      : "#ffffff",
                  color:
                    time === value
                      ? "#2563eb"
                      : "#334155",
                  fontWeight:
                    time === value
                      ? 600
                      : 400,
                }}
              >
                {time}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   PRETVORBA ČASA
===================================================== */

function timeToMinutes(
  time: string
) {
  const [
    hour,
    minute,
  ] =
    time
      .split(":")
      .map(Number);

  return (
    hour * 60 + minute
  );
}

/* =====================================================
   PRAZNIKI
===================================================== */

function formatDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateEaster(
  year: number
) {
  const a =
    year % 19;

  const b =
    Math.floor(
      year / 100
    );

  const c =
    year % 100;

  const d =
    Math.floor(
      b / 4
    );

  const e =
    b % 4;

  const f =
    Math.floor(
      (b + 8) / 25
    );

  const g =
    Math.floor(
      (b - f + 1) / 3
    );

  const h =
    (19 * a +
      b -
      d -
      g +
      15) %
    30;

  const i =
    Math.floor(
      c / 4
    );

  const k =
    c % 4;

  const l =
    (32 +
      2 * e +
      2 * i -
      h -
      k) %
    7;

  const m =
    Math.floor(
      (a +
        11 * h +
        22 * l) /
        451
    );

  const month =
    Math.floor(
      (h +
        l -
        7 * m +
        114) /
        31
    );

  const day =
    ((h +
      l -
      7 * m +
      114) %
      31) +
    1;

  return new Date(
    year,
    month - 1,
    day
  );
}

function isHoliday(
  dateString: string
) {
  if (!dateString) {
    return false;
  }

  const year =
    Number(
      dateString.substring(
        0,
        4
      )
    );

  const fixedHolidays = [
    `${year}-01-01`,
    `${year}-01-02`,
    `${year}-02-08`,
    `${year}-04-27`,
    `${year}-05-01`,
    `${year}-05-02`,
    `${year}-06-25`,
    `${year}-08-15`,
    `${year}-10-31`,
    `${year}-11-01`,
    `${year}-12-25`,
    `${year}-12-26`,
  ];

  const easter =
    calculateEaster(
      year
    );

  const easterMonday =
    new Date(easter);

  easterMonday.setDate(
    easterMonday.getDate() +
      1
  );

  const easterMondayString =
    formatDate(
      easterMonday
    );

  return (
    fixedHolidays.includes(
      dateString
    ) ||
    dateString ===
      easterMondayString
  );
}

/* =====================================================
   WORK ORDER CARD
===================================================== */

type WorkOrderCardProps = {
  onAddWorkOrder: (
    workOrder: WorkOrder
  ) => void;
};

function WorkOrderCard({
  onAddWorkOrder,
}: WorkOrderCardProps) {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const [
    project,
    setProject,
  ] = useState("");

  const [
    machine,
    setMachine,
  ] = useState("");

  const [
    showAdditionalMachine,
    setShowAdditionalMachine,
  ] = useState(false);

  const [
    additionalMachine,
    setAdditionalMachine,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState(today);

  const [
    startTime,
    setStartTime,
  ] = useState("06:00");

  const [
    endTime,
    setEndTime,
  ] = useState("14:00");

  const [
    note,
    setNote,
  ] = useState("");

  /*
    MALICA

    false = jedel zunaj
    true  = imel malico s seboj

    Napis je vedno enak:
    "Malico sem imel s seboj"
  */

  const [
    meal,
    setMeal,
  ] = useState(false);

  const machineOptions = [
    "HAAS VF-2",
    "HAAS VF-4",
    "DMG Mori",
    "Okuma",
  ];

  /* =================================================
     IZRAČUN SKUPNIH UR
  ================================================= */

  const calculateHours =
    () => {
      if (
        !startTime ||
        !endTime
      ) {
        return 0;
      }

      let start =
        timeToMinutes(
          startTime
        );

      let end =
        timeToMinutes(
          endTime
        );

      if (end <= start) {
        end +=
          24 * 60;
      }

      return Number(
        (
          (end - start) /
          60
        ).toFixed(2)
      );
    };

  const hours =
    calculateHours();

  /* =================================================
     RAZDELITEV UR
  ================================================= */

  const calculateBreakdown =
    () => {
      if (
        !startTime ||
        !endTime
      ) {
        return {
          regular: 0,
          night: 0,
          holiday: 0,
          overtime: 0,
        };
      }

      let start =
        timeToMinutes(
          startTime
        );

      let end =
        timeToMinutes(
          endTime
        );

      if (end <= start) {
        end +=
          24 * 60;
      }

      const selectedDate =
        new Date(
          `${date}T00:00:00`
        );

      const sunday =
        selectedDate.getDay() ===
        0;

      const holiday =
        isHoliday(date);

      let regularMinutes =
        0;

      let nightMinutes =
        0;

      let holidayMinutes =
        0;

      let overtimeMinutes =
        0;

      let workedMinutes =
        0;

      for (
        let minute = start;
        minute < end;
        minute++
      ) {
        const minuteOfDay =
          minute %
          (24 * 60);

        const hour =
          Math.floor(
            minuteOfDay /
              60
          );

        const isNight =
          hour >= 22 ||
          hour < 6;

        const isSpecialDay =
          sunday ||
          holiday;

        if (
          workedMinutes >=
          8 * 60
        ) {
          overtimeMinutes++;
        } else if (
          isSpecialDay
        ) {
          holidayMinutes++;
        } else if (
          isNight
        ) {
          nightMinutes++;
        } else {
          regularMinutes++;
        }

        workedMinutes++;
      }

      return {
        regular: Number(
          (
            regularMinutes /
            60
          ).toFixed(2)
        ),

        night: Number(
          (
            nightMinutes /
            60
          ).toFixed(2)
        ),

        holiday: Number(
          (
            holidayMinutes /
            60
          ).toFixed(2)
        ),

        overtime: Number(
          (
            overtimeMinutes /
            60
          ).toFixed(2)
        ),
      };
    };

  const breakdown =
    calculateBreakdown();

  /* =================================================
     DODATNE URE
  ================================================= */

  const additionalHours =
    machine &&
    additionalMachine
      ? Number(
          (
            hours / 3
          ).toFixed(2)
        )
      : 0;

  /* =================================================
     POČISTI
  ================================================= */

  const clearForm =
    () => {
      setProject("");

      setMachine("");

      setShowAdditionalMachine(
        false
      );

      setAdditionalMachine("");

      setDate(today);

      setStartTime("06:00");

      setEndTime("14:00");

      setNote("");

      /*
        Privzeto:
        jedel zunaj
      */
      setMeal(false);
    };

  /* =================================================
     DODAJ DELOVNI NALOG
  ================================================= */

  const handleAddWorkOrder =
    () => {
      if (!project) {
        alert(
          "Izberi projekt."
        );

        return;
      }

      if (!machine) {
        alert(
          "Izberi stroj."
        );

        return;
      }

      if (
        showAdditionalMachine &&
        !additionalMachine
      ) {
        alert(
          "Izberi drugi stroj."
        );

        return;
      }

      if (
        showAdditionalMachine &&
        machine ===
          additionalMachine
      ) {
        alert(
          "Prvi in drugi stroj ne smeta biti enak."
        );

        return;
      }

      const workOrder:
        WorkOrder = {
        id: Date.now(),

        project,

        machine,

        additionalMachine:
          additionalMachine ||
          undefined,

        date,

        startTime,

        endTime,

        hours,

        regularHours:
          breakdown.regular,

        nightHours:
          breakdown.night,

        holidayHours:
          breakdown.holiday,

        overtimeHours:
          breakdown.overtime,

        additionalHours,

        note,

        /*
          false = zunaj
          true = s seboj
        */
        meal,
      };

      onAddWorkOrder(
        workOrder
      );

      clearForm();
    };

  return (
    <div
      style={{
        marginTop: "30px",
        background:
          "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius:
          "18px",
        padding: "30px",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* =================================================
          NASLOV
      ================================================= */}

      <div
        style={{
          marginBottom:
            "30px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            color:
              "#12344d",
          }}
        >
          Nov delovni nalog
        </h2>

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
          Vnesite podatke delovnega naloga.
        </p>
      </div>

      {/* =================================================
          PRVA VRSTICA
      ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "120px 120px 140px 1fr 240px",
          gap: "18px",
          alignItems:
            "start",
        }}
      >
        {/* ZAČETEK */}

        <div>
          <label
            style={labelStyle}
          >
            Začetek
          </label>

          <TimeSelect
            value={startTime}
            onChange={
              setStartTime
            }
          />
        </div>

        {/* KONČANO */}

        <div>
          <label
            style={labelStyle}
          >
            Končano
          </label>

          <TimeSelect
            value={endTime}
            onChange={
              setEndTime
            }
          />
        </div>

        {/* DATUM */}

        <InputField
          label="Datum"
          placeholder=""
          value={date}
          onChange={
            setDate
          }
          type="date"
        />

        {/* PROJEKT */}

        <InputField
          label="Projekt"
          placeholder="Izberi projekt"
          value={project}
          onChange={
            setProject
          }
        />

        {/* STROJ */}

        <div>
          <label
            style={labelStyle}
          >
            Stroj
          </label>

          <div
            style={{
              display:
                "flex",
              gap: "8px",
            }}
          >
            <select
              value={machine}
              onChange={(
                e
              ) => {
                const selected =
                  e.target
                    .value;

                setMachine(
                  selected
                );

                if (
                  selected ===
                  additionalMachine
                ) {
                  setAdditionalMachine(
                    ""
                  );
                }
              }}
              style={{
                ...inputStyle,
                flex: 1,
              }}
            >
              <option value="">
                Izberi stroj
              </option>

              {machineOptions.map(
                (
                  machineName
                ) => (
                  <option
                    key={
                      machineName
                    }
                    value={
                      machineName
                    }
                  >
                    {
                      machineName
                    }
                  </option>
                )
              )}
            </select>

            {!showAdditionalMachine && (
              <button
                type="button"
                onClick={() =>
                  setShowAdditionalMachine(
                    true
                  )
                }
                style={
                  plusButtonStyle
                }
              >
                +
              </button>
            )}
          </div>

          {/* DRUGI STROJ */}

          {showAdditionalMachine && (
            <div
              style={{
                display:
                  "flex",
                gap: "8px",
                marginTop:
                  "8px",
              }}
            >
              <select
                value={
                  additionalMachine
                }
                onChange={(
                  e
                ) =>
                  setAdditionalMachine(
                    e.target
                      .value
                  )
                }
                style={{
                  ...inputStyle,
                  flex: 1,
                }}
              >
                <option value="">
                  Izberi drugi stroj
                </option>

                {machineOptions.map(
                  (
                    machineName
                  ) => (
                    <option
                      key={
                        machineName
                      }
                      value={
                        machineName
                      }
                      disabled={
                        machineName ===
                        machine
                      }
                    >
                      {
                        machineName
                      }
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={() => {
                  setShowAdditionalMachine(
                    false
                  );

                  setAdditionalMachine(
                    ""
                  );
                }}
                style={
                  minusButtonStyle
                }
              >
                −
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          MALICA

          Napis je VEDNO enak.

          NEoznačeno:
          jedel zunaj

          Označeno:
          malico imel s seboj
      ================================================= */}

      <div
        style={{
          marginTop:
            "25px",
        }}
      >
        <label
          style={labelStyle}
        >
          Malica
        </label>

        <label
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap: "10px",
            cursor:
              "pointer",
            width:
              "fit-content",
            userSelect:
              "none",
          }}
        >
          <input
            type="checkbox"
            checked={meal}
            onChange={(
              e
            ) =>
              setMeal(
                e.target
                  .checked
              )
            }
            style={{
              width:
                "20px",
              height:
                "20px",
              cursor:
                "pointer",
            }}
          />

          <span
            style={{
              fontSize:
                "15px",
              color:
                "#334155",
            }}
          >
            Malico sem imel s seboj
          </span>
        </label>
      </div>

      {/* =================================================
          OPIS DELA
      ================================================= */}

      <div
        style={{
          marginTop:
            "25px",
          marginBottom:
            "30px",
        }}
      >
        <label
          style={labelStyle}
        >
          Opis dela
        </label>

        <textarea
          value={note}
          onChange={(
            e
          ) =>
            setNote(
              e.target
                .value
            )
          }
          rows={4}
          placeholder="Vnesite opis opravljenega dela..."
          style={
            textareaStyle
          }
        />
      </div>

      {/* =================================================
          GUMBI
      ================================================= */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "flex-end",
          gap: "15px",
        }}
      >
        <button
          type="button"
          onClick={
            clearForm
          }
          style={
            cancelButtonStyle
          }
        >
          Počisti
        </button>

        <button
          type="button"
          onClick={
            handleAddWorkOrder
          }
          style={
            saveButtonStyle
          }
        >
          Dodaj nalog
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   STILI
===================================================== */

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: "46px",
  border:
    "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "0 14px",
  fontSize: "15px",
  outline: "none",
  boxSizing:
    "border-box" as const,
  background:
    "#ffffff",
};

const textareaStyle = {
  width: "100%",
  border:
    "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "14px",
  fontSize: "15px",
  outline: "none",
  resize:
    "none" as const,
  boxSizing:
    "border-box" as const,
  fontFamily:
    "inherit",
};

const plusButtonStyle = {
  width: "46px",
  height: "46px",
  border:
    "1px solid #d1d5db",
  borderRadius: "10px",
  background:
    "#ffffff",
  color:
    "#2563eb",
  fontSize: "24px",
  cursor:
    "pointer",
};

const minusButtonStyle = {
  width: "46px",
  height: "46px",
  border:
    "1px solid #d1d5db",
  borderRadius: "10px",
  background:
    "#ffffff",
  color:
    "#dc2626",
  fontSize: "24px",
  cursor:
    "pointer",
};

const cancelButtonStyle = {
  height: "48px",
  padding: "0 28px",
  borderRadius:
    "10px",
  border:
    "1px solid #cbd5e1",
  background:
    "#ffffff",
  color:
    "#334155",
  fontSize: "15px",
  fontWeight: 600,
  cursor:
    "pointer",
};

const saveButtonStyle = {
  height: "48px",
  padding: "0 30px",
  border: "none",
  borderRadius:
    "10px",
  background:
    "#2563eb",
  color:
    "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
  cursor:
    "pointer",
  boxShadow:
    "0 4px 10px rgba(37,99,235,0.25)",
};

export default WorkOrderCard;