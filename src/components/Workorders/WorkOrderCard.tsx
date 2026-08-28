import { useState } from "react";

import type {
  WorkOrder,
} from "../../types/WorkOrder";

type WorkOrderCardProps = {
  onAddWorkOrder: (
    workOrder: WorkOrder
  ) => void;
};

const machineOptions = [
  "OKUMA MB-56VB",
  "OKUMA M460V-5AX",
  "Žična erozija",
  "Potopna erozija",
];

const timeOptions: string[] = [];

for (
  let hour = 0;
  hour < 24;
  hour++
) {
  for (
    let minute = 0;
    minute < 60;
    minute += 15
  ) {
    timeOptions.push(
      `${String(
        hour
      ).padStart(
        2,
        "0"
      )}:${String(
        minute
      ).padStart(
        2,
        "0"
      )}`
    );
  }
}

const timeToMinutes = (
  time: string
) => {
  const [
    hours,
    minutes,
  ] =
    time
      .split(":")
      .map(Number);

  return (
    hours * 60 +
    minutes
  );
};

const formatDate = (
  date: Date
) => {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}-${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}`;
};

const addDays = (
  dateString: string,
  days: number
) => {
  const date =
    new Date(
      `${dateString}T00:00:00`
    );

  date.setDate(
    date.getDate() +
      days
  );

  return formatDate(
    date
  );
};

const calculateEaster = (
  year: number
) => {
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
};

const isHoliday = (
  dateString: string
) => {
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

  return (
    fixedHolidays.includes(
      dateString
    ) ||
    dateString ===
      formatDate(
        easterMonday
      )
  );
};

const labelStyle:
  React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "7px",
};

const inputStyle:
  React.CSSProperties = {
  width: "100%",
  height: "42px",
  border:
    "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "0 12px",
  fontSize: "14px",
  boxSizing:
    "border-box",
  background:
    "#ffffff",
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
    mealType,
    setMealType,
  ] =
    useState<
      "outside" |
      "withMe"
    >("withMe");

  const [
    note,
    setNote,
  ] = useState("");

  const startMinutes =
    timeToMinutes(
      startTime
    );

  const endMinutes =
    timeToMinutes(
      endTime
    );

  const crossesMidnight =
    endMinutes <=
    startMinutes;

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

      if (
        end <= start
      ) {
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

  const calculateBreakdown =
    (
      dayDate: string,
      dayStart: string,
      dayEnd: string
    ) => {
      if (
        !dayStart ||
        !dayEnd
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
          dayStart
        );

      let end =
        timeToMinutes(
          dayEnd
        );

      if (
        end <= start
      ) {
        end +=
          24 * 60;
      }

      const selectedDate =
        new Date(
          `${dayDate}T00:00:00`
        );

      const sunday =
        selectedDate.getDay() ===
        0;

      const holiday =
        isHoliday(
          dayDate
        );

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
        let minute =
          start;
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
        regular:
          Number(
            (
              regularMinutes /
              60
            ).toFixed(2)
          ),

        night:
          Number(
            (
              nightMinutes /
              60
            ).toFixed(2)
          ),

        holiday:
          Number(
            (
              holidayMinutes /
              60
            ).toFixed(2)
          ),

        overtime:
          Number(
            (
              overtimeMinutes /
              60
            ).toFixed(2)
          ),
      };
    };

  const calculateWorkOrders =
    () => {
      if (
        !crossesMidnight
      ) {
        const breakdown =
          calculateBreakdown(
            date,
            startTime,
            endTime
          );

        return [
          {
            date,
            startTime,
            endTime,
            hours,
            breakdown,
          },
        ];
      }

      const nextDate =
        addDays(
          date,
          1
        );

      const firstHours =
        Number(
          (
            (24 * 60 -
              startMinutes) /
            60
          ).toFixed(2)
        );

      const secondHours =
        Number(
          (
            endMinutes /
            60
          ).toFixed(2)
        );

      const firstBreakdown =
        calculateBreakdown(
          date,
          startTime,
          "00:00"
        );

      const secondBreakdown =
        calculateBreakdown(
          nextDate,
          "00:00",
          endTime
        );

      return [
        {
          date,
          startTime,
          endTime:
            "00:00",
          hours:
            firstHours,
          breakdown:
            firstBreakdown,
        },

        {
          date:
            nextDate,
          startTime:
            "00:00",
          endTime,
          hours:
            secondHours,
          breakdown:
            secondBreakdown,
        },
      ];
    };

  /*
    DODATNE URE

    TOČNO 8,00 h:
    8 - 0,50 = 7,50
    7,50 / 3 = 2,50

    VSE OSTALE:
    oddelane ure / 3

    8,15 / 3 = 2,72
  */

  const additionalHours =
    machine &&
    additionalMachine &&
    machine !==
      additionalMachine
      ? Number(
          (
            (
              hours === 8
                ? hours - 0.5
                : hours
            ) / 3
          ).toFixed(2)
        )
      : 0;

  const clearForm =
    () => {
      setProject("");

      setMachine("");

      setShowAdditionalMachine(
        false
      );

      setAdditionalMachine(
        ""
      );

      setDate(today);

      setStartTime(
        "06:00"
      );

      setEndTime(
        "14:00"
      );

      setMealType(
        "withMe"
      );

      setNote("");
    };

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

      const calculatedOrders =
        calculateWorkOrders();

      calculatedOrders.forEach(
        (
          calculatedOrder,
          index
        ) => {
          const workOrder:
            WorkOrder = {
            id:
              Date.now() +
              index,

            project,

            machine,

            additionalMachine:
              additionalMachine ||
              undefined,

            quantity: 0,

            date:
              calculatedOrder.date,

            startTime:
              calculatedOrder.startTime,

            endTime:
              calculatedOrder.endTime,

            hours:
              calculatedOrder.hours,

            regularHours:
              calculatedOrder
                .breakdown
                .regular,

            nightHours:
              calculatedOrder
                .breakdown
                .night,

            holidayHours:
              calculatedOrder
                .breakdown
                .holiday,

            overtimeHours:
              calculatedOrder
                .breakdown
                .overtime,

            additionalHours:
              index === 0
                ? additionalHours
                : 0,

            mealType,

            note,
          };

          onAddWorkOrder(
            workOrder
          );
        }
      );

      clearForm();
    };

  const previewOrders =
    calculateWorkOrders();

  const totalPreviewHours =
    previewOrders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        order.hours,
      0
    );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin:
          "30px auto 50px auto",
        background:
          "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "18px",
        padding:
          "30px",
        boxShadow:
          "0 4px 12px rgba(15,23,42,0.06)",
        boxSizing:
          "border-box",
      }}
    >
      <div
        style={{
          maxWidth:
            "1080px",
          width: "100%",
          margin:
            "0 auto 30px auto",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize:
              "28px",
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
          Vnesite podatke
          delovnega naloga.
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth:
            "1080px",
          margin:
            "0 auto",
          display:
            "grid",
          gridTemplateColumns:
            "120px 120px 140px 420px 190px",
          gap:
            "18px",
          alignItems:
            "start",
        }}
      >
        <div>
          <label
            style={
              labelStyle
            }
          >
            Začetek
          </label>

          <select
            value={
              startTime
            }
            onChange={(e) =>
              setStartTime(
                e.target.value
              )
            }
            style={
              inputStyle
            }
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

        <div>
          <label
            style={
              labelStyle
            }
          >
            Končano
          </label>

          <select
            value={
              endTime
            }
            onChange={(e) =>
              setEndTime(
                e.target.value
              )
            }
            style={
              inputStyle
            }
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

        <div>
          <label
            style={
              labelStyle
            }
          >
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
            style={
              inputStyle
            }
          />
        </div>

        <div>
          <label
            style={
              labelStyle
            }
          >
            Projekt
          </label>

          <input
            type="text"
            value={
              project
            }
            onChange={(e) =>
              setProject(
                e.target.value
              )
            }
            placeholder="Izberi projekt"
            style={
              inputStyle
            }
          />
        </div>

        <div>
          <label
            style={
              labelStyle
            }
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
              value={
                machine
              }
              onChange={(e) => {
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
                style={{
                  width:
                    "42px",
                  height:
                    "42px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius:
                    "8px",
                  background:
                    "#ffffff",
                  color:
                    "#2563eb",
                  fontSize:
                    "24px",
                  cursor:
                    "pointer",
                }}
              >
                +
              </button>
            )}
          </div>

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
                onChange={(e) =>
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
                style={{
                  width:
                    "42px",
                  height:
                    "42px",
                  border:
                    "1px solid #fecaca",
                  borderRadius:
                    "8px",
                  background:
                    "#ffffff",
                  color:
                    "#dc2626",
                  fontSize:
                    "24px",
                  cursor:
                    "pointer",
                }}
              >
                −
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          maxWidth:
            "1080px",
          margin:
            "20px auto 0 auto",
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "12px",
        }}
      >
        <input
          id="meal-checkbox"
          type="checkbox"
          checked={
            mealType ===
            "outside"
          }
          onChange={(e) =>
            setMealType(
              e.target
                .checked
                ? "outside"
                : "withMe"
            )
          }
          style={{
            width:
              "18px",
            height:
              "18px",
            cursor:
              "pointer",
          }}
        />

        <label
          htmlFor="meal-checkbox"
          style={{
            fontSize:
              "14px",
            color:
              "#475569",
            cursor:
              "pointer",
          }}
        >
          {mealType ===
          "outside"
            ? "Malica zunaj"
            : "Malica s seboj"}
        </label>
      </div>

      <div
        style={{
          maxWidth:
            "1080px",
          margin:
            "20px auto 0 auto",
        }}
      >
        <label
          style={
            labelStyle
          }
        >
          Opomba
        </label>

        <textarea
          value={note}
          onChange={(e) =>
            setNote(
              e.target.value
            )
          }
          placeholder="Opomba..."
          style={{
            width:
              "100%",
            minHeight:
              "80px",
            resize:
              "vertical",
            border:
              "1px solid #cbd5e1",
            borderRadius:
              "8px",
            padding:
              "10px 12px",
            fontSize:
              "14px",
            boxSizing:
              "border-box",
            fontFamily:
              "inherit",
          }}
        />
      </div>

      <div
        style={{
          maxWidth:
            "1080px",
          margin:
            "25px auto 0 auto",
          padding:
            "15px 18px",
          background:
            "#f8fafc",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "10px",
          fontSize:
            "14px",
          color:
            "#475569",
        }}
      >
        <strong>
          Predogled:
        </strong>{" "}

        {crossesMidnight ? (
          <>
            delo bo
            avtomatsko
            razdeljeno
            na{" "}
            <strong>
              2 delovna
              naloga
            </strong>
            .
            <br />

            {previewOrders.map(
              (
                order,
                index
              ) => (
                <span
                  key={
                    index
                  }
                >
                  {index + 1}.{" "}
                  {
                    order.date
                  }{" "}
                  {
                    order.startTime
                  }{" "}
                  –{" "}
                  {
                    order.endTime
                  }{" "}
                  (
                  {
                    order.hours
                  }{" "}
                  h)
                  <br />
                </span>
              )
            )}

            Skupaj:{" "}
            <strong>
              {
                totalPreviewHours
              }{" "}
              h
            </strong>
          </>
        ) : (
          `${hours} h`
        )}
      </div>

      {additionalHours >
        0 && (
        <div
          style={{
            maxWidth:
              "1080px",
            margin:
              "12px auto 0 auto",
            fontSize:
              "14px",
            color:
              "#64748b",
          }}
        >
          Dodatne ure
          zaradi dela
          na dveh
          strojih:{" "}
          <strong>
            {
              additionalHours
            }{" "}
            h
          </strong>
        </div>
      )}

      <div
        style={{
          maxWidth:
            "1080px",
          margin:
            "25px auto 0 auto",
          display:
            "flex",
          justifyContent:
            "flex-end",
        }}
      >
        <button
          type="button"
          onClick={
            handleAddWorkOrder
          }
          style={{
            height:
              "44px",
            padding:
              "0 24px",
            border:
              "none",
            borderRadius:
              "8px",
            background:
              "#12344d",
            color:
              "#ffffff",
            fontSize:
              "14px",
            fontWeight:
              600,
            cursor:
              "pointer",
          }}
        >
          Dodaj delovni nalog
        </button>
      </div>
    </div>
  );
}

export default WorkOrderCard;