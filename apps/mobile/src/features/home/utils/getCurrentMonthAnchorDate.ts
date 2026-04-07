import type { TrackingSummary } from "../../../services/progress.service";
import { getTodayLocalDateString } from "../../../services/taskCompletions.service";

export function getCurrentMonthAnchorDate(summary: TrackingSummary): string {
  const today = summary.calendarDays.find((day) => day.isToday)?.date;
  if (today) return today;

  const firstDay = summary.calendarDays.find((day) => !!day.date)?.date;
  if (firstDay) return firstDay;

  return getTodayLocalDateString();
}