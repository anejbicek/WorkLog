import { useState } from "react";
import type { WorkOrder } from "../../types/WorkOrder";

type WorkOrderEditModalProps = {
  workOrder: WorkOrder;
  onSave: (workOrder: WorkOrder) => void;
  onClose: () => void;
};

/* =====================================================
   URE NA 15 MINUT
===================================================== */

function createTimeOptions() {
  const options: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      options.push(
        `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`
      );
    }
  }

  return options;
}

const timeOptions = createTimeOptions();

/* =====================================================
   PRETVORBA ČASA
===================================================== */

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

/* =====================================================
   PRAZNIKI
===================================================== */

function formatDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateEaster(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);

  const h =
    (19 * a +
      b -
      d -
      g +
      15) %
    30;

  const i = Math.floor(c / 4);
  const k = c % 4;

  const l =
    (32 +
      2 * e +
      2 * i -
      h -
      k) %
    7;

  const m = Math.floor(
    (a + 11 * h + 22 * l) / 451
  );

  const month = Math.floor(
    (h + l - 7 * m + 114) / 31
  );

  const day =
    ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(
    year,
    month - 1,
    day
  );
}

function isHoliday(dateString: string) {
  if (!dateString) {
    return false;
  }

  const year = Number(
    dateString.substring(0, 4)
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

  const easter = calculateEaster(year);

  const easterMonday = new Date(easter);

  easterMonday.setDate(
    easterMonday.getDate() + 1
  );

  const easterMondayString =
    formatDate(easterMonday);

  return (
    fixedHolidays.includes(dateString) ||
    dateString === easterMondayString
  );
}

/* =====================================================
   KOMPONENTA
===================================================== */

function WorkOrderEditModal({
  workOrder,
  onSave,
  onClose,
}: WorkOrderEditModalProps) {
  /* ---------------------------------------------------
     OSNOVNI PODATKI
  --------------------------------------------------- */

  const [project, setProject] = useState(
    workOrder.project
  );

  const [machine, setMachine] = useState(
    workOrder.machine
  );

  const [additionalMachine, setAdditionalMachine] =
    useState(
      workOrder.additionalMachine || ""
    );

  const [showAdditionalMachine, setShowAdditionalMachine] =
    useState(
      Boolean(workOrder.additionalMachine)
    );

  const [quantity, setQuantity] = useState(
    workOrder.quantity.toString()
  );

  const [date, setDate] = useState(
    workOrder.date
  );

  const [startTime, setStartTime] = useState(
    workOrder.startTime || "06:00"
  );

  const [endTime, setEndTime] = useState(
    workOrder.endTime || "14:00"
  );

  const [note, setNote] = useState(
    workOrder.note
  );

  /* ---------------------------------------------------
     STROJI
  --------------------------------------------------- */

  const machines = [
    "OKUMA MB-56VB",
    "OKUMA M460V-5AX",
    "žična erozija",
    "potopna erozija",
  ];

  /* ---------------------------------------------------
     IZRAČUN SKUPNIH UR
  --------------------------------------------------- */

  const calculateHours = () => {
    if (!startTime || !endTime) {
      return 0;
    }

    let start = timeToMinutes(startTime);
    let end = timeToMinutes(endTime);

    // Če delo traja čez polnoč
    if (end <= start) {
      end += 24 * 60;
    }

    const difference = end - start;

    return Number(
      (difference / 60).toFixed(2)
    );
  };

  const hours = calculateHours();

  /* ---------------------------------------------------
     IZRAČUN REDNIH / NOČNIH / PRAZNIKOV / NADUR
  --------------------------------------------------- */

  const calculateBreakdown = () => {
    if (!startTime || !endTime) {
      return {
        regular: 0,
        night: 0,
        holiday: 0,
        overtime: 0,
      };
    }

    let start = timeToMinutes(startTime);
    let end = timeToMinutes(endTime);

    if (end <= start) {
      end += 24 * 60;
    }

    const selectedDate =
      new Date(`${date}T00:00:00`);

    const isSunday =
      selectedDate.getDay() === 0;

    const isHolidayDate =
      isHoliday(date);

    let regularMinutes = 0;
    let nightMinutes = 0;
    let holidayMinutes = 0;
    let overtimeMinutes = 0;

    let workedMinutes = 0;

    for (
      let minute = start;
      minute < end;
      minute++
    ) {
      const minuteOfDay =
        minute % (24 * 60);

      const hour = Math.floor(
        minuteOfDay / 60
      );

      const isNight =
        hour >= 22 || hour < 6;

      const isSpecialDay =
        isSunday || isHolidayDate;

      /*
        Nadure:
        vse kar je nad 8 ur.
      */

      if (workedMinutes >= 8 * 60) {
        overtimeMinutes++;
      }

      /*
        Nedelja ali praznik
      */

      else if (isSpecialDay) {
        holidayMinutes++;
      }

      /*
        Nočne:
        22:00 - 06:00
      */

      else if (isNight) {
        nightMinutes++;
      }

      /*
        Redne
      */

      else {
        regularMinutes++;
      }

      workedMinutes++;
    }

    return {
      regular: Number(
        (regularMinutes / 60).toFixed(2)
      ),

      night: Number(
        (nightMinutes / 60).toFixed(2)
      ),

      holiday: Number(
        (holidayMinutes / 60).toFixed(2)
      ),

      overtime: Number(
        (overtimeMinutes / 60).toFixed(2)
      ),
    };
  };

  const breakdown = calculateBreakdown();

  /* ---------------------------------------------------
     DODATNE URE

     Če sta izbrana dva različna stroja:
     dodatne ure = 1/3 vseh opravljenih ur
  --------------------------------------------------- */

  const additionalHours =
    machine &&
    additionalMachine &&
    machine !== additionalMachine
      ? Number(
          (hours / 3).toFixed(2)
        )
      : 0;

  /* ---------------------------------------------------
     SKUPAJ ZA EVIDENCO

     To so ure, ki se bodo zapisale v WorkOrder.
  --------------------------------------------------- */


  /* ---------------------------------------------------
     SHRANI SPREMEMBE
  --------------------------------------------------- */

  const handleSave = () => {
    if (!project) {
      alert("Izberi projekt.");
      return;
    }

    if (!machine) {
      alert("Izberi stroj.");
      return;
    }

    if (
      showAdditionalMachine &&
      !additionalMachine
    ) {
      alert("Izberi drugi stroj.");
      return;
    }

    if (
      showAdditionalMachine &&
      machine === additionalMachine
    ) {
      alert(
        "Prvi in drugi stroj ne smeta biti enak."
      );

      return;
    }

    const updatedWorkOrder: WorkOrder = {
      ...workOrder,

      id: workOrder.id,

      project,

      machine,

      additionalMachine:
        additionalMachine || undefined,

      quantity: Number(quantity),

      date,

      startTime,

      endTime,

      /*
        Osnovne ure naloga.
      */

      hours,

      /*
        Razdelitev ur.
      */

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
    };

    onSave(updatedWorkOrder);
  };

  /* ===================================================
     IZPIS
  =================================================== */

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width:
            "min(1100px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "30px",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.2)",
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* NASLOV */}

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            color: "#12344d",
          }}
        >
          Uredi delovni nalog
        </h2>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Spremenite podatke delovnega naloga.
        </p>

        {/* =================================================
            PRVA VRSTICA
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "140px 140px 160px 1fr 260px 120px",
            gap: "18px",
            marginTop: "30px",
          }}
        >
          {/* ZAČETEK */}

          <div>
            <label style={labelStyle}>
              Začetek
            </label>

            <select
              value={startTime}
              onChange={(e) =>
                setStartTime(
                  e.target.value
                )
              }
              style={inputStyle}
            >
              {timeOptions.map(
                (time) => (
                  <option
                    key={time}
                    value={time}
                  >
                    {time}
                  </option>
                )
              )}
            </select>
          </div>

          {/* KONČANO */}

          <div>
            <label style={labelStyle}>
              Končano
            </label>

            <select
              value={endTime}
              onChange={(e) =>
                setEndTime(
                  e.target.value
                )
              }
              style={inputStyle}
            >
              {timeOptions.map(
                (time) => (
                  <option
                    key={time}
                    value={time}
                  >
                    {time}
                  </option>
                )
              )}
            </select>
          </div>

          {/* DATUM */}

          <div>
            <label style={labelStyle}>
              Datum
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              style={inputStyle}
            />
          </div>

          {/* PROJEKT */}

          <div>
            <label style={labelStyle}>
              Projekt
            </label>

            <input
              type="text"
              value={project}
              onChange={(e) =>
                setProject(
                  e.target.value
                )
              }
              placeholder="Izberi projekt"
              style={inputStyle}
            />
          </div>

          {/* STROJ */}

          <div>
            <label style={labelStyle}>
              Stroj
            </label>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <select
                value={machine}
                onChange={(e) => {
                  const selected =
                    e.target.value;

                  setMachine(selected);

                  /*
                    Če je bil drugi stroj
                    enak novemu prvemu,
                    ga odstranimo.
                  */

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

                {machines.map(
                  (machineName) => (
                    <option
                      key={machineName}
                      value={machineName}
                    >
                      {machineName}
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
                  style={plusButtonStyle}
                >
                  +
                </button>
              )}
            </div>

            {/* DRUGI STROJ */}

            {showAdditionalMachine && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <select
                  value={
                    additionalMachine
                  }
                  onChange={(e) =>
                    setAdditionalMachine(
                      e.target.value
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

                  {machines.map(
                    (machineName) => (
                      <option
                        key={machineName}
                        value={machineName}
                        disabled={
                          machineName ===
                          machine
                        }
                      >
                        {machineName}
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
                  style={minusButtonStyle}
                >
                  −
                </button>
              </div>
            )}
          </div>

          {/* KOLIČINA */}

          <div>
            <label style={labelStyle}>
              Količina
            </label>

            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              style={inputStyle}
            />
          </div>
        </div>

        {/* =================================================
            OPIS DELA
        ================================================= */}

        <div
          style={{
            marginTop: "25px",
          }}
        >
          <label style={labelStyle}>
            Opis dela
          </label>

          <textarea
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            rows={4}
            placeholder="Vnesite opis opravljenega dela..."
            style={textareaStyle}
          />
        </div>

        {/* =================================================
            GUMBI
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: "12px",
            marginTop: "25px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={
              cancelButtonStyle
            }
          >
            Prekliči
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={
              saveButtonStyle
            }
          >
            Shrani spremembe
          </button>
        </div>
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
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "0 14px",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box" as const,
  background: "#ffffff",
};

const textareaStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "14px",
  fontSize: "15px",
  outline: "none",
  resize: "none" as const,
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
};

const plusButtonStyle = {
  width: "46px",
  height: "46px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#2563eb",
  fontSize: "24px",
  cursor: "pointer",
};

const minusButtonStyle = {
  width: "46px",
  height: "46px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#dc2626",
  fontSize: "24px",
  cursor: "pointer",
};

const cancelButtonStyle = {
  height: "48px",
  padding: "0 24px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#334155",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
};

const saveButtonStyle = {
  height: "48px",
  padding: "0 28px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow:
    "0 4px 10px rgba(37,99,235,0.25)",
};

export default WorkOrderEditModal;