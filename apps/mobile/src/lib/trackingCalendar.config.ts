// src/features/home/utils/trackingCalendar.ts

export const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export type MonthCalendarCell = {
  date: Date;
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function getCurrentMonthAnchorDate(referenceDate = new Date()) {
  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
    12,
    0,
    0,
    0
  );
}

export function addMonthsToAnchor(anchorDate: Date, amount: number) {
  return new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth() + amount,
    1,
    12,
    0,
    0,
    0
  );
}

export function formatMonthLabel(anchorDate: Date) {
  return `${MONTHS_ES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
}

function getGridStartDate(anchorDate: Date) {
  const firstDayOfMonth = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    1,
    12,
    0,
    0,
    0
  );

  // JS: domingo=0 ... sábado=6
  // Queremos semana empezando en lunes.
  const jsDay = firstDayOfMonth.getDay();
  const diffToMonday = (jsDay + 6) % 7;

  firstDayOfMonth.setDate(firstDayOfMonth.getDate() - diffToMonday);
  return firstDayOfMonth;
}

export function buildMonthCalendarCells(anchorDate: Date): MonthCalendarCell[] {
  const startDate = getGridStartDate(anchorDate);
  const todayKey = formatDateKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + index,
      12,
      0,
      0,
      0
    );

    const isoDate = formatDateKey(date);

    return {
      date,
      isoDate,
      dayNumber: date.getDate(),
      isCurrentMonth:
        date.getMonth() === anchorDate.getMonth() &&
        date.getFullYear() === anchorDate.getFullYear(),
      isToday: isoDate === todayKey,
    };
  });
}