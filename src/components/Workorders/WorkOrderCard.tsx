import {
  useState,
  useRef,
  useEffect,
} from "react";

import type { WorkOrder } from "../../types/WorkOrder";

import {
  useAdmin,
} from "../../context/AdminContext";

type InputFieldProps = {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (
    value: string
  ) => void;
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
    <div
      style={{
        width,
      }}
    >
      <label
        style={
          labelStyle
        }
      >
        {label}
      </label>

      <input
        type={
          type
        }
        placeholder={
          placeholder
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange?.(
            event.target.value
          )
        }
        style={
          inputStyle
        }
      />
    </div>
  );
}

/* =====================================================
   URE NA 15 MINUT
===================================================== */

function createTimeOptions() {
  const options:
    string[] = [];

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
      options.push(
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
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    const handleClickOutside =
      (
        event:
          MouseEvent
      ) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target as
              Node
          )
        ) {
          setOpen(
            false
          );
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
      setTimeout(
        () => {
          const selectedElement =
            containerRef.current?.querySelector(
              `[data-time="${value}"]`
            ) as
              HTMLElement |
              null;

          selectedElement?.scrollIntoView(
            {
              block:
                "center",
            }
          );
        },
        0
      );
    }
  }, [
    open,
    value,
  ]);

  return (
    <div
      ref={
        containerRef
      }
      style={{
        position:
          "relative",

        width:
          "100%",
      }}
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              previous
            ) =>
              !previous
          )
        }
        style={{
          ...inputStyle,

          textAlign:
            "left",

          cursor:
            "pointer",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",
        }}
      >
        <span>
          {value}
        </span>

        <span
          style={{
            fontSize:
              "12px",

            color:
              "#64748b",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            position:
              "absolute",

            top:
              "calc(100% + 4px)",

            left:
              0,

            width:
              "100%",

            height:
              "252px",

            background:
              "#ffffff",

            border:
              "1px solid #d1d5db",

            borderRadius:
              "10px",

            boxShadow:
              "0 10px 25px rgba(0,0,0,0.15)",

            zIndex:
              1000,

            overflowY:
              "auto",
          }}
        >
          {timeOptions.map(
            (
              time
            ) => (
              <div
                key={
                  time
                }
                data-time={
                  time
                }
                onClick={() => {
                  onChange(
                    time
                  );

                  setOpen(
                    false
                  );
                }}
                style={{
                  height:
                    "36px",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  padding:
                    "0 14px",

                  boxSizing:
                    "border-box",

                  cursor:
                    "pointer",

                  background:
                    time ===
                    value
                      ? "#eff6ff"
                      : "#ffffff",

                  color:
                    time ===
                    value
                      ? "#2563eb"
                      : "#334155",

                  fontWeight:
                    time ===
                    value
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
      .map(
        Number
      );

  return (
    hour *
      60 +
    minute
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
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function calculateEaster(
  year: number
) {
  const a =
    year % 19;

  const b =
    Math.floor(
      year /
        100
    );

  const c =
    year %
    100;

  const d =
    Math.floor(
      b /
        4
    );

  const e =
    b %
    4;

  const f =
    Math.floor(
      (b +
        8) /
        25
    );

  const g =
    Math.floor(
      (b -
        f +
        1) /
        3
    );

  const h =
    (19 *
      a +
      b -
      d -
      g +
      15) %
    30;

  const i =
    Math.floor(
      c /
        4
    );

  const k =
    c %
    4;

  const l =
    (32 +
      2 *
        e +
      2 *
        i -
      h -
      k) %
    7;

  const m =
    Math.floor(
      (a +
        11 *
          h +
        22 *
          l) /
        451
    );

  const month =
    Math.floor(
      (h +
        l -
        7 *
          m +
        114) /
        31
    );

  const day =
    ((h +
      l -
      7 *
        m +
      114) %
      31) +
    1;

  return new Date(
    year,
    month -
      1,
    day
  );
}

function isHoliday(
  dateString:
    string
) {
  if (
    !dateString
  ) {
    return false;
  }

  const year =
    Number(
      dateString.substring(
        0,
        4
      )
    );

  const fixedHolidays =
    [
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
    new Date(
      easter
    );

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
   ISKANJE PROJEKTOV
===================================================== */

type ProjectSearchProps = {
  value: string;

  onChange: (
    value: string
  ) => void;

  showLabel?: boolean;
};

function ProjectSearch({
  value,
  onChange,
  showLabel = true,
}: ProjectSearchProps) {
  const {
    projects,
  } =
    useAdmin();

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const activeProjects =
    projects.filter(
      (
        project
      ) =>
        project.active
    );

  const search =
    value
      .trim()
      .toLowerCase();

  const searchTokens = search
    .split(/\s+/)
    .filter(Boolean);

  const matchesProjectSearch = (
    project: (typeof activeProjects)[number]
  ) => {
    const haystack = [
      project.name,
      project.serialNumber ?? "",
    ].join(" ").toLowerCase();

    return searchTokens.every((token) => {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Iskanje zadetkov na začetku besede ali številčne serije.
      return new RegExp(`(?:^|[^a-z0-9])${escaped}`, "i").test(haystack);
    });
  };

  const filteredProjects =
    search.length === 0
      ? []
      : activeProjects.filter(matchesProjectSearch);

  useEffect(() => {
    const handleClickOutside =
      (
        event:
          MouseEvent
      ) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target as
              Node
          )
        ) {
          setOpen(
            false
          );
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

  const renderProjectName = (
    projectName:
      string
  ) => {
    const match =
      projectName.substring(
        0,
        search.length
      );

    const rest =
      projectName.substring(
        search.length
      );

    return (
      <>
        <span
          style={{
            fontWeight:
              700,

            fontSize:
              "15px",

            color:
              "#1e293b",
          }}
        >
          {match}
        </span>

        <span
          style={{
            fontWeight:
              400,

            fontSize:
              "14px",

            color:
              "#64748b",
          }}
        >
          {rest}
        </span>
      </>
    );
  };

  return (
    <div
      ref={
        containerRef
      }
      style={{
        position:
          "relative",

        width:
          "100%",
      }}
    >
      {showLabel && (
        <label
          style={
            labelStyle
          }
        >
          Projekt
        </label>
      )}

      <input
        type="text"
        placeholder="Išči projekt..."
        value={
          value
        }
        onFocus={() => {
          if (
            value.trim()
          ) {
            setOpen(
              true
            );
          }
        }}
        onChange={(
          event
        ) => {
          onChange(
            event.target.value
          );

          if (
            event.target.value.trim()
          ) {
            setOpen(
              true
            );
          } else {
            setOpen(
              false
            );
          }
        }}
        style={
          inputStyle
        }
      />

      {open &&
        search.length >
          0 &&
        filteredProjects.length >
          0 && (
          <div
            style={{
              position:
                "absolute",

              top:
                "calc(100% + 4px)",

              left:
                0,

              width:
                "100%",

              maxHeight:
                "220px",

              overflowY:
                "auto",

              background:
                "#ffffff",

              border:
                "1px solid #d1d5db",

              borderRadius:
                "10px",

              boxShadow:
                "0 10px 25px rgba(0,0,0,0.15)",

              zIndex:
                1100,
            }}
          >
            {filteredProjects.map(
              (
                project
              ) => (
                <div
                  key={
                    project.id
                  }
                  onMouseDown={(
                    event
                  ) => {
                    event.preventDefault();

                    onChange(
                      project.name
                    );

                    setOpen(
                      false
                    );
                  }}
                  style={{
                    minHeight:
                      "42px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    padding:
                      "0 14px",

                    boxSizing:
                      "border-box",

                    cursor:
                      "pointer",

                    borderBottom:
                      "1px solid #f1f5f9",
                  }}
                  onMouseEnter={(
                    event
                  ) => {
                    event.currentTarget.style.background =
                      "#eff6ff";
                  }}
                  onMouseLeave={(
                    event
                  ) => {
                    event.currentTarget.style.background =
                      "#ffffff";
                  }}
                >
                  <div>
                    {renderProjectName(
                      project.name
                    )}
                    {project.serialNumber && (
                      <div
                        style={{
                          marginTop: "2px",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        Serijska št.: {project.serialNumber}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}

/* =====================================================
   WORK ORDER CARD
===================================================== */

type WorkOrderCardProps = {
  onAddWorkOrder: (
    workOrder:
      WorkOrder
  ) => void;
};

function WorkOrderCard({
  onAddWorkOrder,
}: WorkOrderCardProps) {
  const {
    machines,
  } =
    useAdmin();

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const [
    project,
    setProject,
  ] =
    useState("");

  const [
    secondProject,
    setSecondProject,
  ] =
    useState("");

  const [
    machine,
    setMachine,
  ] =
    useState("");

  const [
    showAdditionalMachine,
    setShowAdditionalMachine,
  ] =
    useState(false);

  const [
    additionalMachine,
    setAdditionalMachine,
  ] =
    useState("");

  const [
    showSecondProject,
    setShowSecondProject,
  ] =
    useState(false);

  const [
    date,
    setDate,
  ] =
    useState(
      today
    );

  const [
    startTime,
    setStartTime,
  ] =
    useState(
      "06:00"
    );

  const [
    endTime,
    setEndTime,
  ] =
    useState(
      "14:00"
    );

  const [
    secondStartTime,
    setSecondStartTime,
  ] =
    useState(
      "06:00"
    );

  const [
    secondEndTime,
    setSecondEndTime,
  ] =
    useState(
      "14:00"
    );

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    meal,
    setMeal,
  ] =
    useState(false);

  const activeMachines =
    machines.filter(
      (
        item
      ) =>
        item.active
    );

  useEffect(() => {
    if (
      machine &&
      !activeMachines.some(
        (
          item
        ) =>
          item.name ===
          machine
      )
    ) {
      setMachine(
        ""
      );
    }
  }, [
    machines,
    machine,
  ]);

  useEffect(() => {
    if (
      additionalMachine &&
      !activeMachines.some(
        (
          item
        ) =>
          item.name ===
          additionalMachine
      )
    ) {
      setAdditionalMachine(
        ""
      );

      setShowSecondProject(
        false
      );

      setSecondProject(
        ""
      );
    }
  }, [
    machines,
    additionalMachine,
  ]);

  useEffect(() => {
    if (
      !additionalMachine
    ) {
      setShowSecondProject(
        false
      );

      setSecondProject(
        ""
      );
    }
  }, [
    additionalMachine,
  ]);

  const calculateHoursForTimes =
    (
      startValue:
        string,

      endValue:
        string
    ) => {
      if (
        !startValue ||
        !endValue
      ) {
        return 0;
      }

      let start =
        timeToMinutes(
          startValue
        );

      let end =
        timeToMinutes(
          endValue
        );

      if (
        end <=
        start
      ) {
        end +=
          24 *
          60;
      }

      return Number(
        (
          (end -
            start) /
          60
        ).toFixed(
          2
        )
      );
    };

  const calculateBreakdown =
    (
      dayDate:
        string,

      dayStart:
        string,

      dayEnd:
        string
    ) => {
      if (
        !dayStart ||
        !dayEnd
      ) {
        return {
          regular:
            0,

          night:
            0,

          holiday:
            0,

          overtime:
            0,

          overtimeSpecial:
            0,

          overtimeNormal:
            0,
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
        end <=
        start
      ) {
        end +=
          24 *
          60;
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

      let overtimeSpecialMinutes =
        0;

      let overtimeNormalMinutes =
        0;

      let workedMinutes =
        0;

      for (
        let minute =
          start;
        minute <
        end;
        minute++
      ) {
        const minuteOfDay =
          minute %
          (24 *
            60);

        const hour =
          Math.floor(
            minuteOfDay /
              60
          );

        const isNight =
          hour >=
            22 ||
          hour <
            6;

        const isSpecialDay =
          sunday ||
          holiday;

        if (
          workedMinutes >=
          8 *
            60
        ) {
          overtimeMinutes++;

          if (isSpecialDay || isNight) {
            overtimeSpecialMinutes++;
          } else {
            overtimeNormalMinutes++;
          }
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
            ).toFixed(
              2
            )
          ),

        night:
          Number(
            (
              nightMinutes /
              60
            ).toFixed(
              2
            )
          ),

        holiday:
          Number(
            (
              holidayMinutes /
              60
            ).toFixed(
              2
            )
          ),

        overtime:
          Number(
            (
              overtimeMinutes /
              60
            ).toFixed(
              2
            )
          ),

        overtimeSpecial:
          Number(
            (
              overtimeSpecialMinutes /
              60
            ).toFixed(
              2
            )
          ),

        overtimeNormal:
          Number(
            (
              overtimeNormalMinutes /
              60
            ).toFixed(
              2
            )
          ),
      };
    };

  const addDays = (
    dateString:
      string,

    days:
      number
  ) => {
    const dateValue =
      new Date(
        `${dateString}T00:00:00`
      );

    dateValue.setDate(
      dateValue.getDate() +
        days
    );

    return `${dateValue.getFullYear()}-${String(
      dateValue.getMonth() +
        1
    ).padStart(
      2,
      "0"
    )}-${String(
      dateValue.getDate()
    ).padStart(
      2,
      "0"
    )}`;
  };

  type CalculatedOrder = {
    date:
      string;

    startTime:
      string;

    endTime:
      string;

    hours:
      number;

    breakdown:
      ReturnType<
        typeof calculateBreakdown
      >;

    project:
      string;

    machine:
      string;

    additionalMachine?:
      string;

    additionalHours:
      number;
  };

  const calculateOrdersForProject =
    (
      projectName:
        string,

      machineName:
        string,

      projectStart:
        string,

      projectEnd:
        string,

      projectAdditionalMachine?:
        string,

      projectAdditionalHours =
        0
    ):
      CalculatedOrder[] => {
      if (
        !projectName ||
        !machineName
      ) {
        return [];
      }

      const startMinutes =
        timeToMinutes(
          projectStart
        );

      const endMinutes =
        timeToMinutes(
          projectEnd
        );

      const crossesMidnight =
        endMinutes <=
        startMinutes;

      if (
        !crossesMidnight
      ) {
        return [
          {
            date,

            startTime:
              projectStart,

            endTime:
              projectEnd,

            hours:
              calculateHoursForTimes(
                projectStart,
                projectEnd
              ),

            breakdown:
              calculateBreakdown(
                date,
                projectStart,
                projectEnd
              ),

            project:
              projectName,

            machine:
              machineName,

            additionalMachine:
              projectAdditionalMachine,

            additionalHours:
              projectAdditionalHours,
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
            (24 *
              60 -
              startMinutes) /
            60
          ).toFixed(
            2
          )
        );

      const secondHours =
        Number(
          (
            endMinutes /
            60
          ).toFixed(
            2
          )
        );

      return [
        {
          date,

          startTime:
            projectStart,

          endTime:
            "00:00",

          hours:
            firstHours,

          breakdown:
            calculateBreakdown(
              date,
              projectStart,
              "00:00"
            ),

          project:
            projectName,

          machine:
            machineName,

          additionalMachine:
            projectAdditionalMachine,

          additionalHours:
            projectAdditionalHours,
        },

        {
          date:
            nextDate,

          startTime:
            "00:00",

          endTime:
            projectEnd,

          hours:
            secondHours,

          breakdown:
            calculateBreakdown(
              nextDate,
              "00:00",
              projectEnd
            ),

          project:
            projectName,

          machine:
            machineName,

          additionalMachine:
            projectAdditionalMachine,

          additionalHours:
            0,
        },
      ];
    };

  const calculateOverlapHours =
    () => {
      if (!additionalMachine) {
        return 0;
      }

      // Če je na isti kartici določen drugi stroj, sta oba stroja
      // aktivna ves čas prvega projekta. Celoten interval je zato
      // dodatni čas, ne pa tretjina časa.
      if (!showSecondProject || !secondProject) {
        return Number(
          (calculateHoursForTimes(startTime, endTime) / 3).toFixed(2)
        );
      }

      let firstStart =
        timeToMinutes(
          startTime
        );

      let firstEnd =
        timeToMinutes(
          endTime
        );

      let secondStart =
        timeToMinutes(
          secondStartTime
        );

      let secondEnd =
        timeToMinutes(
          secondEndTime
        );

      if (
        firstEnd <=
        firstStart
      ) {
        firstEnd +=
          24 *
          60;
      }

      if (
        secondEnd <=
        secondStart
      ) {
        secondEnd +=
          24 *
          60;
      }

      const overlapStart =
        Math.max(
          firstStart,
          secondStart
        );

      const overlapEnd =
        Math.min(
          firstEnd,
          secondEnd
        );

      if (
        overlapEnd <=
        overlapStart
      ) {
        return 0;
      }

      return Number(
        (
          (overlapEnd -
            overlapStart) /
          60 /
          3
        ).toFixed(
          2
        )
      );
    };

  const additionalHours =
    machine &&
    additionalMachine
      ? Number(
          (
            calculateOverlapHours()
          ).toFixed(
            2
          )
        )
      : 0;

  const previewOrders:
    CalculatedOrder[] =
    [
      ...calculateOrdersForProject(
        project,
        machine,
        startTime,
        endTime,
        showSecondProject
          ? undefined
          : additionalMachine ||
              undefined,
        additionalHours
      ),

      ...(showSecondProject &&
      secondProject &&
      additionalMachine
        ? calculateOrdersForProject(
            secondProject,
            additionalMachine,
            secondStartTime,
            secondEndTime,
            undefined,
            0
          )
        : []),
    ];

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

  const clearForm =
    () => {
      setProject(
        ""
      );

      setSecondProject(
        ""
      );

      setMachine(
        ""
      );

      setShowAdditionalMachine(
        false
      );

      setAdditionalMachine(
        ""
      );

      setShowSecondProject(
        false
      );

      setDate(
        today
      );

      setStartTime(
        "06:00"
      );

      setEndTime(
        "14:00"
      );

      setSecondStartTime(
        "06:00"
      );

      setSecondEndTime(
        "14:00"
      );

      setNote(
        ""
      );

      setMeal(
        false
      );
    };

  const handleAddWorkOrder =
    () => {
      if (
        !project
      ) {
        alert(
          "Izberi projekt."
        );

        return;
      }

      if (
        !machine
      ) {
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

      if (
        showSecondProject &&
        !secondProject
      ) {
        alert(
          "Izberi drugi projekt."
        );

        return;
      }

      if (
        showSecondProject &&
        !additionalMachine
      ) {
        alert(
          "Za drugi projekt izberi drugi stroj."
        );

        return;
      }

      if (
        showSecondProject &&
        project ===
          secondProject
      ) {
        alert(
          "Prvi in drugi projekt ne smeta biti enak."
        );

        return;
      }

      const orders =
        previewOrders;

      const timestamp =
        Date.now();

      orders.forEach(
        (
          calculatedOrder,
          index
        ) => {
          const workOrder:
            WorkOrder =
            {
              id:
                timestamp +
                index,

              project:
                calculatedOrder.project,

              machine:
                calculatedOrder.machine,

              additionalMachine:
                calculatedOrder.additionalMachine ||
                undefined,

              quantity:
                0,

              date:
                calculatedOrder.date,

              startTime:
                calculatedOrder.startTime,

              endTime:
                calculatedOrder.endTime,

              hours:
                calculatedOrder.hours,

              regularHours:
                calculatedOrder.breakdown.regular,

              nightHours:
                calculatedOrder.breakdown.night,

              holidayHours:
                calculatedOrder.breakdown.holiday,

              overtimeHours:
                calculatedOrder.breakdown.overtime,

              overtimeNormalHours:
                calculatedOrder.breakdown.overtimeNormal,

              overtimeSpecialHours:
                calculatedOrder.breakdown.overtimeSpecial,

              additionalHours:
                calculatedOrder.additionalHours,

              note,

              meal,
            };

          onAddWorkOrder(
            workOrder
          );
        }
      );

      clearForm();
    };

  const canAddSecondProject =
    Boolean(
      machine &&
        additionalMachine &&
        machine !==
          additionalMachine
    );

  return (
    <div
      style={{
        width:
          "calc(100% - 40px)",

        maxWidth:
          "1400px",

        margin:
          "30px auto 0 auto",

        background:
          "#ffffff",

        border:
          "1px solid #e5e7eb",

        borderRadius:
          "18px",

        padding:
          "30px",

        boxShadow:
          "0 4px 12px rgba(0,0,0,0.05)",

        boxSizing:
          "border-box",
      }}
    >
      {/* =====================================================
          NASLOV
      ===================================================== */}

      <div
        style={{
          marginBottom:
            "30px",
        }}
      >
        <h2
          style={{
            margin:
              0,

            fontSize:
              "28px",

            fontWeight:
              700,

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

      {/* =====================================================
          GLAVNA VRSTICA
      ===================================================== */}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "258px 140px minmax(240px, 1fr) 240px",

          gap:
            "18px",

          alignItems:
            "start",
        }}
      >
        {/* ===================================================
            ČASI
        =================================================== */}

        <div
          style={{
            display:
              "flex",

            flexDirection:
              "column",

            gap:
              "10px",

            minWidth:
              0,
          }}
        >
          {/* PRVI PROJEKT */}

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap:
                "18px",
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

              <TimeSelect
                value={
                  startTime
                }
                onChange={
                  setStartTime
                }
              />
            </div>

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Končano
              </label>

              <TimeSelect
                value={
                  endTime
                }
                onChange={
                  setEndTime
                }
              />
            </div>
          </div>

          {/* DRUGI PROJEKT - URE POD PRVIMI URAMI */}

          {showSecondProject &&
            canAddSecondProject && (
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap:
                  "18px",
              }}
            >
              <div>
                <label
                  style={
                    smallLabelStyle
                  }
                >
                  Začetek 2
                </label>

                <TimeSelect
                  value={
                    secondStartTime
                  }
                  onChange={
                    setSecondStartTime
                  }
                />
              </div>

              <div>
                <label
                  style={
                    smallLabelStyle
                  }
                >
                  Končano 2
                </label>

                <TimeSelect
                  value={
                    secondEndTime
                  }
                  onChange={
                    setSecondEndTime
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            DATUM
        =================================================== */}

        <InputField
          label="Datum"
          placeholder=""
          value={
            date
          }
          onChange={
            setDate
          }
          type="date"
        />

        {/* ===================================================
            PROJEKT / DRUGI PROJEKT
        =================================================== */}

        <div
          style={{
            minWidth:
              0,
          }}
        >
          <div
            style={{
              display:
                "flex",

              gap:
                "8px",

              alignItems:
                "flex-start",
            }}
          >
            <div
              style={{
                flex:
                  1,

                minWidth:
                  0,
              }}
            >
              <ProjectSearch
                value={
                  project
                }
                onChange={
                  setProject
                }
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (
                  !canAddSecondProject
                ) {
                  return;
                }

                setShowSecondProject(
                  (
                    previous
                  ) =>
                    !previous
                );

                if (
                  showSecondProject
                ) {
                  setSecondProject(
                    ""
                  );
                }
              }}
              disabled={
                !canAddSecondProject
              }
              style={{
                ...plusButtonStyle,

                color:
                  canAddSecondProject
                    ? "#2563eb"
                    : "#94a3b8",

                background:
                  canAddSecondProject
                    ? "#ffffff"
                    : "#f1f5f9",

                cursor:
                  canAddSecondProject
                    ? "pointer"
                    : "not-allowed",

                flexShrink:
                  0,

                marginTop:
                  "30px",
              }}
              title={
                canAddSecondProject
                  ? "Dodaj drugi projekt"
                  : "Najprej izberi dva različna stroja"
              }
            >
              {showSecondProject
                ? "−"
                : "+"}
            </button>
          </div>

          {showSecondProject &&
            canAddSecondProject && (
            <div
              style={{
                marginTop:
                  "10px",

                paddingTop:
                  "10px",

                borderTop:
                  "1px solid #e5e7eb",

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "10px",
              }}
            >
              <label
                style={{
                  ...smallLabelStyle,

                  marginBottom:
                    0,

                  flexShrink:
                    0,
                }}
              >
                Projekt
              </label>

              <div
                style={{
                  flex:
                    1,

                  minWidth:
                    0,
                }}
              >
                <ProjectSearch
                  value={
                    secondProject
                  }
                  onChange={
                    setSecondProject
                  }
                  showLabel={
                    false
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            STROJ
        =================================================== */}

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

              gap:
                "8px",
            }}
          >
            <select
              value={
                machine
              }
              onChange={(
                event
              ) => {
                const selected =
                  event.target.value;

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

                  setShowSecondProject(
                    false
                  );

                  setSecondProject(
                    ""
                  );
                }
              }}
              style={{
                ...inputStyle,

                flex:
                  1,
              }}
            >
              <option value="">
                Izberi stroj
              </option>

              {activeMachines.map(
                (
                  machineItem
                ) => (
                  <option
                    key={
                      machineItem.id
                    }
                    value={
                      machineItem.name
                    }
                  >
                    {
                      machineItem.name
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

          {showAdditionalMachine && (
            <div
              style={{
                display:
                  "flex",

                gap:
                  "8px",

                marginTop:
                  "8px",
              }}
            >
              <select
                value={
                  additionalMachine
                }
                onChange={(
                  event
                ) =>
                  setAdditionalMachine(
                    event.target.value
                  )
                }
                style={{
                  ...inputStyle,

                  flex:
                    1,
                }}
              >
                <option value="">
                  Izberi drugi stroj
                </option>

                {activeMachines.map(
                  (
                    machineItem
                  ) => (
                    <option
                      key={
                        machineItem.id
                      }
                      value={
                        machineItem.name
                      }
                      disabled={
                        machineItem.name ===
                        machine
                      }
                    >
                      {
                        machineItem.name
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

                  setShowSecondProject(
                    false
                  );

                  setSecondProject(
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

      {/* =====================================================
          MALICA
      ===================================================== */}

      <div
        style={{
          marginTop:
            "25px",
        }}
      >
        <label
          style={
            labelStyle
          }
        >
          Malica
        </label>

        <label
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              "10px",

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
            checked={
              meal
            }
            onChange={(
              event
            ) =>
              setMeal(
                event.target.checked
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

      {/* =====================================================
          OPIS DELA
      ===================================================== */}

      <div
        style={{
          marginTop:
            "25px",

          marginBottom:
            "30px",
        }}
      >
        <label
          style={
            labelStyle
          }
        >
          Opis dela
        </label>

        <textarea
          value={
            note
          }
          onChange={(
            event
          ) =>
            setNote(
              event.target.value
            )
          }
          rows={
            4
          }
          placeholder="Vnesite opis opravljenega dela..."
          style={
            textareaStyle
          }
        />
      </div>

      {/* =====================================================
          PREDOGLED
      ===================================================== */}

      <div
        style={{
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

          marginBottom:
            "18px",
        }}
      >
        <strong>
          Predogled:
        </strong>

        {previewOrders.length ===
        0 ? (
          <div
            style={{
              marginTop:
                "5px",
            }}
          >
            Izberi projekt in stroj.
          </div>
        ) : (
          <div
            style={{
              marginTop:
                "7px",
            }}
          >
            {previewOrders.map(
              (
                order,
                index
              ) => (
                <div
                  key={`${order.project}-${order.date}-${index}`}
                  style={{
                    marginTop:
                      index
                        ? "5px"
                        : 0,
                  }}
                >
                  <strong>
                    {
                      order.project
                    }
                  </strong>
                  {" · "}
                  {
                    order.machine
                  }

                  {order.additionalMachine
                    ? ` + ${order.additionalMachine}`
                    : ""}

                  <br />

                  {
                    order.date
                  }
                  {" · "}
                  {
                    order.startTime
                  }
                  {" – "}
                  {
                    order.endTime
                  }
                  {" · "}
                  {order.hours.toFixed(
                    2
                  )}{" "}
                  h
                </div>
              )
            )}

            {previewOrders.length >
              1 && (
              <div
                style={{
                  marginTop:
                    "7px",
                }}
              >
                Skupaj:{" "}
                <strong>
                  {totalPreviewHours.toFixed(
                    2
                  )}{" "}
                  h
                </strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          DODATNE URE
      ===================================================== */}

      {additionalHours >
        0 && (
        <div
          style={{
            marginBottom:
              "18px",

            fontSize:
              "14px",

            color:
              "#64748b",
          }}
        >
          Dodatne ure zaradi dela na dveh strojih:{" "}
          <strong>
            {additionalHours.toFixed(
              2
            )}{" "}
            h
          </strong>
        </div>
      )}

      {/* =====================================================
          GUMBI
      ===================================================== */}

      <div
        style={{
          display:
            "flex",

          justifyContent:
            "flex-end",

          gap:
            "15px",
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

const smallLabelStyle = {
  display:
    "block",

  marginBottom:
    "5px",

  fontSize:
    "11px",

  fontWeight:
    600,

  color:
    "#64748b",
};

const labelStyle = {
  display:
    "block",

  marginBottom:
    "8px",

  fontSize:
    "14px",

  fontWeight:
    600,

  color:
    "#334155",
};

const inputStyle = {
  width:
    "100%",

  height:
    "46px",

  border:
    "1px solid #d1d5db",

  borderRadius:
    "10px",

  padding:
    "0 14px",

  fontSize:
    "15px",

  outline:
    "none",

  boxSizing:
    "border-box" as const,

  background:
    "#ffffff",
};

const textareaStyle = {
  width:
    "100%",

  border:
    "1px solid #d1d5db",

  borderRadius:
    "10px",

  padding:
    "14px",

  fontSize:
    "15px",

  outline:
    "none",

  resize:
    "none" as const,

  boxSizing:
    "border-box" as const,

  fontFamily:
    "inherit",
};

const plusButtonStyle = {
  width:
    "46px",

  height:
    "46px",

  border:
    "1px solid #d1d5db",

  borderRadius:
    "10px",

  background:
    "#ffffff",

  color:
    "#2563eb",

  fontSize:
    "24px",

  cursor:
    "pointer",
};

const minusButtonStyle = {
  width:
    "46px",

  height:
    "46px",

  border:
    "1px solid #d1d5db",

  borderRadius:
    "10px",

  background:
    "#ffffff",

  color:
    "#dc2626",

  fontSize:
    "24px",

  cursor:
    "pointer",
};

const cancelButtonStyle = {
  height:
    "48px",

  padding:
    "0 28px",

  borderRadius:
    "10px",

  border:
    "1px solid #cbd5e1",

  background:
    "#ffffff",

  color:
    "#334155",

  fontSize:
    "15px",

  fontWeight:
    600,

  cursor:
    "pointer",
};

const saveButtonStyle = {
  height:
    "48px",

  padding:
    "0 30px",

  border:
    "none",

  borderRadius:
    "10px",

  background:
    "#2563eb",

  color:
    "#ffffff",

  fontSize:
    "15px",

  fontWeight:
    600,

  cursor:
    "pointer",

  boxShadow:
    "0 4px 10px rgba(37,99,235,0.25)",
};

export default WorkOrderCard;