import { supabase } from "../lib/supabase";

export type TrackingDayStatus = "none" | "progress" | "goal" | "ninja";

export type TrackingCalendarDay = {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  completedCount: number;
  status: TrackingDayStatus;
};

export type TrackingSummary = {
  monthLabel: string;
  activeDaysThisMonth: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  completedThisMonth: number;
  calendarDays: TrackingCalendarDay[];
};

type TaskCompletionRow = {
  completion_date: string;
  task_id: string;
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthBounds(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return { start, end };
}

function toDateKey(date: Date) {
  return getLocalDateString(date);
}

function formatMonthLabel(date = new Date()) {
  const label = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getDayStatus(completedCount: number): TrackingDayStatus {
  if (completedCount <= 0) return "none";
  if (completedCount === 1) return "progress";
  if (completedCount === 2) return "goal";
  return "ninja";
}

function calculateBestStreak(sortedUniqueDates: string[]) {
  if (sortedUniqueDates.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < sortedUniqueDates.length; i += 1) {
    const prev = new Date(sortedUniqueDates[i - 1]);
    const next = new Date(sortedUniqueDates[i]);

    const diffMs = next.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function calculateCurrentStreak(sortedUniqueDates: string[], todayKey: string) {
  if (sortedUniqueDates.length === 0) return 0;

  const dateSet = new Set(sortedUniqueDates);
  const cursor = new Date(todayKey);

  if (!dateSet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);

    if (!dateSet.has(toDateKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;

  while (dateSet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildCalendarDays(
  baseDate: Date,
  countByDate: Map<string, number>
): TrackingCalendarDay[] {
  const { start, end } = getMonthBounds(baseDate);
  const todayKey = getLocalDateString();

  const days: TrackingCalendarDay[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = toDateKey(cursor);
    const completedCount = countByDate.get(key) ?? 0;

    days.push({
      date: key,
      dayNumber: cursor.getDate(),
      isCurrentMonth: true,
      isToday: key === todayKey,
      completedCount,
      status: getDayStatus(completedCount),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export async function fetchTrackingSummary(baseDate = new Date()) {
  const { start, end } = getMonthBounds(baseDate);

  const startKey = toDateKey(start);
  const endKey = toDateKey(end);
  const todayKey = getLocalDateString();

  const [monthResult, allResult] = await Promise.all([
    supabase
      .from("task_completions")
      .select("completion_date, task_id")
      .gte("completion_date", startKey)
      .lte("completion_date", endKey)
      .order("completion_date", { ascending: true }),

    supabase
      .from("task_completions")
      .select("completion_date")
      .order("completion_date", { ascending: true }),
  ]);

  if (monthResult.error) {
    return { data: null, error: monthResult.error };
  }

  if (allResult.error) {
    return { data: null, error: allResult.error };
  }

  const monthRows = (monthResult.data ?? []) as TaskCompletionRow[];
  const allRows = (allResult.data ?? []) as Array<{ completion_date: string }>;

  const countByDate = new Map<string, number>();

  for (const row of monthRows) {
    const current = countByDate.get(row.completion_date) ?? 0;
    countByDate.set(row.completion_date, current + 1);
  }

  const uniqueDatesThisMonth = Array.from(countByDate.keys()).sort();

  const uniqueDatesAllTime = Array.from(
    new Set((allRows ?? []).map((row) => row.completion_date))
  ).sort();

  const completedThisMonth = monthRows.length;
  const activeDaysThisMonth = uniqueDatesThisMonth.length;
  const bestStreak = calculateBestStreak(uniqueDatesAllTime);
  const currentStreak = calculateCurrentStreak(uniqueDatesAllTime, todayKey);

  const now = new Date();
  const elapsedDaysInMonth =
    baseDate.getMonth() === now.getMonth() &&
    baseDate.getFullYear() === now.getFullYear()
      ? now.getDate()
      : end.getDate();

  const completionRate =
    elapsedDaysInMonth > 0
      ? Math.round((activeDaysThisMonth / elapsedDaysInMonth) * 100)
      : 0;

  const summary: TrackingSummary = {
    monthLabel: formatMonthLabel(baseDate),
    activeDaysThisMonth,
    currentStreak,
    bestStreak,
    completionRate,
    completedThisMonth,
    calendarDays: buildCalendarDays(baseDate, countByDate),
  };

  return { data: summary, error: null };
}