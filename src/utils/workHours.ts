import type { WorkOrder } from "../types/WorkOrder";

type Interval = {
  start: number;
  end: number;
};

type DailyBreakdown = {
  regular: number;
  night: number;
  holiday: number;
  overtime: number;
  overtimeSpecial: number;
  overtimeNormal: number;
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return 0;
  }

  return hours * 60 + minutes;
}

function getInterval(
  order: Pick<
    WorkOrder,
    "startTime" | "endTime"
  >
): Interval {
  const start = timeToMinutes(
    order.startTime
  );

  let end = timeToMinutes(
    order.endTime
  );

  /*
   * Če je konec enak ali pred začetkom,
   * pomeni, da delo poteka čez polnoč.
   */
  if (end <= start) {
    end += 24 * 60;
  }

  return {
    start,
    end,
  };
}

function splitIntervalByDate(
  date: string,
  interval: Interval
): Array<{
  date: string;
  start: number;
  end: number;
}> {
  const result: Array<{
    date: string;
    start: number;
    end: number;
  }> = [];

  let currentDate = date;
  let start = interval.start;
  let end = interval.end;

  /*
   * Če interval preseže polnoč,
   * ga razdelimo na posamezne dni.
   */
  while (end > 24 * 60) {
    result.push({
      date: currentDate,
      start,
      end: 24 * 60,
    });

    currentDate = addDays(
      currentDate,
      1
    );

    start = 0;
    end -= 24 * 60;
  }

  result.push({
    date: currentDate,
    start,
    end,
  });

  return result.filter(
    (item) =>
      item.end > item.start
  );
}

function addDays(
  dateString: string,
  days: number
): string {
  const value = new Date(
    `${dateString}T00:00:00`
  );

  value.setDate(
    value.getDate() + days
  );

  return `${value.getFullYear()}-${String(
    value.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}-${String(
    value.getDate()
  ).padStart(
    2,
    "0"
  )}`;
}

function mergeIntervals(
  intervals: Interval[]
): Interval[] {
  if (!intervals.length) {
    return [];
  }

  const sorted = [...intervals]
    .filter(
      (item) =>
        item.end > item.start
    )
    .sort(
      (a, b) =>
        a.start - b.start ||
        a.end - b.end
    );

  if (!sorted.length) {
    return [];
  }

  const merged: Interval[] = [
    {
      ...sorted[0],
    },
  ];

  for (
    let i = 1;
    i < sorted.length;
    i += 1
  ) {
    const current =
      sorted[i];

    const last =
      merged[
        merged.length - 1
      ];

    if (
      current.start <=
      last.end
    ) {
      last.end = Math.max(
        last.end,
        current.end
      );
    } else {
      merged.push({
        ...current,
      });
    }
  }

  return merged;
}

function calculateEaster(
  year: number
): Date {
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
): boolean {
  if (!dateString) {
    return false;
  }

  const year = Number(
    dateString.slice(0, 4)
  );

  const fixed = [
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

  /*
   * Velikonočni ponedeljek.
   */
  const easterMonday =
    calculateEaster(year);

  easterMonday.setDate(
    easterMonday.getDate() +
      1
  );

  const easter =
    `${easterMonday.getFullYear()}-${String(
      easterMonday.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}-${String(
      easterMonday.getDate()
    ).padStart(
      2,
      "0"
    )}`;

  return (
    fixed.includes(
      dateString
    ) ||
    easter === dateString
  );
}

function getDateIntervals(
  workOrders: WorkOrder[]
): Record<
  string,
  Interval[]
> {
  const byDate: Record<
    string,
    Interval[]
  > = {};

  for (
    const order of workOrders
  ) {
    if (!order.date) {
      continue;
    }

    for (
      const part of
        splitIntervalByDate(
          order.date,
          getInterval(order)
        )
    ) {
      (
        byDate[
          part.date
        ] ??= []
      ).push({
        start:
          part.start,
        end:
          part.end,
      });
    }
  }

  return byDate;
}

/**
 * Dejanski delovni čas.
 *
 * Za vsak dan združimo dejanske
 * delovne intervale.
 *
 * Primer:
 *
 * 00:00–01:00 = 1 h
 * 13:00–20:00 = 7 h
 *
 * Skupaj = 8 h
 *
 * Čas med 01:00 in 13:00 se NE šteje.
 *
 * Če se intervali prekrivajo, se
 * prekrivajoči čas šteje samo enkrat.
 */
export function calculateUniqueWorkHours(
  workOrders: WorkOrder[]
): number {
  const byDate =
    getDateIntervals(
      workOrders
    );

  let minutes = 0;

  for (
    const intervals of
      Object.values(byDate)
  ) {
    if (!intervals.length) {
      continue;
    }

    /*
     * Združimo prekrivajoče se
     * intervale.
     *
     * Primer:
     *
     * 13:00–18:00
     * 16:00–20:00
     *
     * postane:
     *
     * 13:00–20:00
     */
    const merged =
      mergeIntervals(
        intervals
      );

    for (
      const interval of merged
    ) {
      if (
        interval.end >
        interval.start
      ) {
        minutes +=
          interval.end -
          interval.start;
      }
    }
  }

  return Number(
    (
      minutes / 60
    ).toFixed(2)
  );
}

/**
 * Dodatne ure zaradi prekrivanja
 * različnih aktivnih strojev/projektov.
 *
 * Prekrivanje se šteje samo enkrat.
 *
 * Primer:
 *
 * Stroj 1:
 * 14:00–22:00
 *
 * Stroj 2:
 * 16:00–23:00
 *
 * Prekrivanje:
 * 16:00–22:00 = 6 ur
 *
 * Dodatne ure:
 * 6 / 3 = 2 uri
 */
export function calculateOverlapHours(
  workOrders: WorkOrder[]
): number {
  const byDate: Record<
    string,
    Interval[]
  > = {};

  for (
    const order of workOrders
  ) {
    if (!order.date) {
      continue;
    }

    const parts =
      splitIntervalByDate(
        order.date,
        getInterval(order)
      );

    for (
      const part of parts
    ) {
      (
        byDate[
          part.date
        ] ??= []
      ).push({
        start:
          part.start,
        end:
          part.end,
      });

      /*
       * Če ima ista kartica dodatni stroj,
       * sta v istem intervalu aktivna dva
       * stroja.
       */
      if (
        order.additionalMachine
      ) {
        (
          byDate[
            part.date
          ] ??= []
        ).push({
          start:
            part.start,
          end:
            part.end,
        });
      }
    }
  }

  let overlapMinutes = 0;

  for (
    const intervals of
      Object.values(byDate)
  ) {
    if (
      intervals.length < 2
    ) {
      continue;
    }

    const events: Array<{
      minute: number;
      delta: number;
    }> = [];

    for (
      const interval of intervals
    ) {
      if (
        interval.end <=
        interval.start
      ) {
        continue;
      }

      events.push({
        minute:
          interval.start,
        delta: 1,
      });

      events.push({
        minute:
          interval.end,
        delta: -1,
      });
    }

    events.sort(
      (a, b) =>
        a.minute -
          b.minute ||
        a.delta -
          b.delta
    );

    let active = 0;

    let previous =
      events[0]?.minute ??
      0;

    for (
      const event of events
    ) {
      /*
       * Če sta aktivna vsaj dva
       * stroja/projekta, gre za
       * prekrivanje.
       *
       * Čas dodamo samo enkrat,
       * tudi če se prekrivajo trije
       * ali več intervalov.
       */
      if (
        event.minute >
          previous &&
        active > 1
      ) {
        overlapMinutes +=
          event.minute -
          previous;
      }

      active +=
        event.delta;

      previous =
        event.minute;
    }
  }

  /*
   * Prekrivanje se deli s 3.
   *
   * 6 h / 3 = 2 h.
   */
  return Number(
    (
      overlapMinutes /
      60 /
      3
    ).toFixed(2)
  );
}

/** Dnevne dejanske ure. */
export function calculateDailyUniqueWorkHours(
  workOrders: WorkOrder[],
  date: string
): number {
  return calculateUniqueWorkHours(
    workOrders.filter(
      (order) =>
        order.date === date
    )
  );
}

/** Dnevne dodatne ure zaradi prekrivanja. */
export function calculateDailyOverlapHours(
  workOrders: WorkOrder[],
  date: string
): number {
  return calculateOverlapHours(
    workOrders.filter(
      (order) =>
        order.date === date
    )
  );
}

/**
 * Razvrstitev dejanskega časa dneva.
 *
 * Za vsak dan združimo dejanske
 * delovne intervale.
 *
 * Prvih 8 dejansko opravljenih ur:
 * - redne
 * - nočne
 * - praznične
 *
 * Vse po 8 urah:
 * - nadure
 * - navadne nadure
 * - posebne nadure
 *
 * Pomembno:
 * Čas med dvema ločenima karticama
 * se ne šteje kot delo.
 */
export function calculateUniqueHourBreakdown(
  workOrders: WorkOrder[]
): DailyBreakdown {
  const byDate =
    getDateIntervals(
      workOrders
    );

  let regular = 0;
  let night = 0;
  let holiday = 0;
  let overtime = 0;
  let overtimeSpecial = 0;
  let overtimeNormal = 0;

  for (
    const [
      date,
      intervals,
    ] of Object.entries(byDate)
  ) {
    if (!intervals.length) {
      continue;
    }

    /*
     * Združimo prekrivajoče se
     * intervale.
     */
    const merged =
      mergeIntervals(
        intervals
      );

    let uniqueWorkedMinutes =
      0;

    const sunday =
      new Date(
        `${date}T00:00:00`
      ).getDay() === 0;

    const holidayDay =
      isHoliday(date);

    /*
     * Gremo samo čez dejanske
     * delovne intervale.
     *
     * Ne več čez celoten razpon
     * prvega prihoda do zadnjega odhoda.
     */
    for (
      const interval of merged
    ) {
      for (
        let minute =
          interval.start;
        minute <
          interval.end;
        minute += 1
      ) {
        const hour =
          Math.floor(
            (
              minute %
              (24 * 60)
            ) / 60
          );

        const nightMinute =
          hour >= 22 ||
          hour < 6;

        const special =
          sunday ||
          holidayDay ||
          nightMinute;

        /*
         * Prvih 8 dejansko opravljenih
         * ur so redne, vse nadaljnje
         * minute pa nadure.
         */
        if (
          uniqueWorkedMinutes >=
          8 * 60
        ) {
          overtime += 1;

          if (special) {
            overtimeSpecial +=
              1;
          } else {
            overtimeNormal +=
              1;
          }
        } else if (
          holidayDay ||
          sunday
        ) {
          holiday += 1;
        } else if (
          nightMinute
        ) {
          night += 1;
        } else {
          regular += 1;
        }

        uniqueWorkedMinutes +=
          1;
      }
    }
  }

  return {
    regular: Number(
      (
        regular / 60
      ).toFixed(2)
    ),

    night: Number(
      (
        night / 60
      ).toFixed(2)
    ),

    holiday: Number(
      (
        holiday / 60
      ).toFixed(2)
    ),

    overtime: Number(
      (
        overtime / 60
      ).toFixed(2)
    ),

    overtimeSpecial:
      Number(
        (
          overtimeSpecial /
          60
        ).toFixed(2)
      ),

    overtimeNormal:
      Number(
        (
          overtimeNormal /
          60
        ).toFixed(2)
      ),
  };
}

export function calculateMealCounts(
  workOrders: WorkOrder[]
): {
  outside: number;
  withSelf: number;
} {
  const dates = [
    ...new Set(
      workOrders
        .map(
          (order) =>
            order.date
        )
        .filter(Boolean)
    ),
  ];

  let outside = 0;
  let withSelf = 0;

  for (
    const date of dates
  ) {
    const dayOrders =
      workOrders.filter(
        (order) =>
          order.date === date
      );

    /*
     * Ena izmena / do 14 ur = ena malica.
     * Nad 14 ur = dve malici.
     *
     * Število kartic istega dne
     * ne vpliva na število malic.
     */
    const count =
      calculateDailyUniqueWorkHours(
        dayOrders,
        date
      ) > 14
        ? 2
        : 1;

    if (
      dayOrders.some(
        (order) =>
          Boolean(
            order.meal
          )
      )
    ) {
      withSelf +=
        count;
    } else {
      outside +=
        count;
    }
  }

  return {
    outside,
    withSelf,
  };
}