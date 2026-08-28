export type MealType =
  | "outside"
  | "withMe";

export type DayStatus =
  | "none"
  | "work"
  | "twoMachines"
  | "sick"
  | "vacation"
  | "holiday";

export type WorkOrder = {
  id: number;

  project: string;

  machine: string;

  additionalMachine?: string;

  quantity: number;

  date: string;

  startTime: string;

  endTime: string;

  // Vse dejansko oddelane ure
  hours: number;

  // Razdelitev ur
  regularHours: number;
  nightHours: number;
  holidayHours: number;
  overtimeHours: number;

  // 1/3 ur zaradi dela na dveh strojih
  additionalHours: number;

  // Malica: zunaj ali s seboj
  mealType?: MealType;

  note: string;
};