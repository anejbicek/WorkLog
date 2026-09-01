export type DayStatus =
  | "none"
  | "dopust"
  | "bolniška"
  | "praznik"
  | "prost_dan";

export type WorkOrder = {
  id: number;

  userId?: string;

  project: string;

  machine: string;

  additionalMachine?: string;

  quantity?: number;

  date: string;

  startTime: string;

  endTime: string;

  hours: number;

  regularHours: number;

  nightHours: number;

  holidayHours: number;

  overtimeHours: number;

  additionalHours: number;

  meal?: boolean;

  note: string;
};