export type DayStatus =
  | "none"
  | "work"
  | "sick"
  | "vacation"
  | "holiday";
  
export type WorkOrder = {
  id: number;

  project: string;

  machine: string;

  additionalMachine?: string;

  date: string;

  startTime: string;

  endTime: string;

  hours: number;

  regularHours: number;

  nightHours: number;

  holidayHours: number;

  overtimeHours: number;

  additionalHours: number;

  note: string;

  /*
    false = jedel zunaj
    true  = imel malico s seboj
  */

  meal: boolean;
};