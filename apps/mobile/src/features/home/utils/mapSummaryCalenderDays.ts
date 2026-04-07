import type {
  TrackingSummary,
  TrackingDayStatus,
} from "../../../services/progress.service";
import type {
  TrackingCalendarDayMap,
  TrackingCalendarStatus,
} from "../types/trackingCalendar.types";

function normalizeTrackingStatus(
  status: TrackingDayStatus
): TrackingCalendarStatus {
  switch (status) {
    case "progress":
    case "goal":
      return "goal";
    case "ninja":
      return "ninja";
    case "none":
    default:
      return "none";
  }
}

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function mapSummaryCalendarDaysToTrackingCalendarDayMap(
  calendarDays: TrackingSummary["calendarDays"]
): TrackingCalendarDayMap {
  return calendarDays.reduce<TrackingCalendarDayMap>((acc, day) => {
    if (!day?.date || !isValidDateKey(day.date)) {
      return acc;
    }

    acc[day.date] = {
      date: day.date,
      status: normalizeTrackingStatus(day.status),
      isToday: !!day.isToday,
    };

    return acc;
  }, {});
}