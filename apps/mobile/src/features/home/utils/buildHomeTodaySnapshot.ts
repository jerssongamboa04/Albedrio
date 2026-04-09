import type { TrackingSummary } from "../../../services/progress.service";
import type { Task } from "../../../services/tasks.service";

type BuildHomeTodaySnapshotParams = {
  tasks: Task[];
  completedTodayTaskIds: string[];
  trackingSummary: TrackingSummary | null;
  todayDate?: string;
};

export type HomeTodayTaskItem = Task & {
  effectiveIsDone: boolean;
  belongsToToday: boolean;
};

export type HomeTodaySnapshot = {
  todayDate: string;
  todayTasks: HomeTodayTaskItem[];
  pendingTodayTasks: HomeTodayTaskItem[];
  completedTodayTasks: HomeTodayTaskItem[];
  doneTodayCount: number;
  totalTodayCount: number;
  currentStreak: number;
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function belongsToToday(task: Task, todayDate: string) {
  if (task.task_type === "daily") {
    return true;
  }

  if (task.task_type === "one_time") {
    return task.due_date === todayDate;
  }

  return false;
}

function getEffectiveIsDone(task: Task, completedTodaySet: Set<string>) {
  if (task.task_type === "daily") {
    return completedTodaySet.has(task.id);
  }

  return task.is_done;
}

export function buildHomeTodaySnapshot({
  tasks,
  completedTodayTaskIds,
  trackingSummary,
  todayDate = getLocalDateString(),
}: BuildHomeTodaySnapshotParams): HomeTodaySnapshot {
  const completedTodaySet = new Set(completedTodayTaskIds);

  const todayTasks = tasks
    .filter((task) => belongsToToday(task, todayDate))
    .map<HomeTodayTaskItem>((task) => ({
      ...task,
      belongsToToday: true,
      effectiveIsDone: getEffectiveIsDone(task, completedTodaySet),
    }));

  const pendingTodayTasks = todayTasks.filter((task) => !task.effectiveIsDone);
  const completedTodayTasks = todayTasks.filter((task) => task.effectiveIsDone);

  return {
    todayDate,
    todayTasks,
    pendingTodayTasks,
    completedTodayTasks,
    doneTodayCount: completedTodayTasks.length,
    totalTodayCount: todayTasks.length,
    currentStreak: trackingSummary?.currentStreak ?? 0,
  };
}