export type TrackingCalendarStatus = "none" | "goal" | "ninja";

export type TrackingCalendarDay = {
  date: string; // YYYY-MM-DD
  status: TrackingCalendarStatus;
  isToday?: boolean;
};

export type TrackingCalendarDayMap = Record<string, TrackingCalendarDay>;