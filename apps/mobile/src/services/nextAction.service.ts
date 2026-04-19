import type { RecommendationContext, UserEnergyLevel } from "../store/context.store";
import type { HomeTodayTaskItem } from "../features/home/utils/buildHomeTodaySnapshot";
import type {
  TaskDayMoment,
  TaskDifficultyLevel,
  TaskEnergyLevel,
  TaskPriority,
  TaskClarityLevel,
} from "./tasks.service";

export type RecommendationReason =
  | "fits_time"
  | "fits_energy"
  | "high_priority"
  | "urgent"
  | "clear_enough"
  | "easy_to_start"
  | "good_moment";

export type RecommendedTaskResult = {
  task: HomeTodayTaskItem | null;
  score: number;
  reasons: RecommendationReason[];
};

function getPriorityScore(priority: TaskPriority): number {
  switch (priority) {
    case "high":
      return 30;
    case "medium":
      return 20;
    case "low":
    default:
      return 10;
  }
}

function getTimeFitScore(
  estimatedMinutes: number | null,
  availableTime: RecommendationContext["availableTime"]
): number {
  if (!availableTime) return 0;
  if (!estimatedMinutes || estimatedMinutes <= 0) return 8;

  if (estimatedMinutes <= availableTime) return 25;
  if (estimatedMinutes <= availableTime + 10) return 10;

  return -15;
}

function getEnergyFitScore(
  taskEnergy: TaskEnergyLevel,
  userEnergy: UserEnergyLevel | null
): number {
  if (!userEnergy) return 0;
  if (taskEnergy === userEnergy) return 20;

  if (taskEnergy === "low" && (userEnergy === "medium" || userEnergy === "high")) {
    return 12;
  }

  if (taskEnergy === "medium" && userEnergy === "high") {
    return 10;
  }

  if (taskEnergy === "medium" && userEnergy === "low") {
    return -10;
  }

  if (taskEnergy === "high" && userEnergy === "medium") {
    return -4;
  }

  if (taskEnergy === "high" && userEnergy === "low") {
    return -20;
  }

  return 0;
}

function getClarityScore(clarity: TaskClarityLevel): number {
  switch (clarity) {
    case "clear":
      return 14;
    case "somewhat_clear":
      return 6;
    case "blocked":
      return -25;
    default:
      return 0;
  }
}

function getDifficultyScore(
  difficulty: TaskDifficultyLevel,
  userEnergy: UserEnergyLevel | null
): number {
  if (!userEnergy) return 0;

  if (difficulty === "light" && userEnergy === "low") return 12;
  if (difficulty === "light") return 8;

  if (difficulty === "medium" && userEnergy === "medium") return 10;
  if (difficulty === "medium" && userEnergy === "high") return 8;
  if (difficulty === "medium" && userEnergy === "low") return -4;

  if (difficulty === "hard" && userEnergy === "high") return 12;
  if (difficulty === "hard" && userEnergy === "medium") return 2;
  if (difficulty === "hard" && userEnergy === "low") return -15;

  return 0;
}

function getCurrentDayMoment(now = new Date()): TaskDayMoment {
  const hour = now.getHours();

  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 19) return "afternoon";
  if (hour >= 19 && hour < 24) return "evening";

  return "any";
}

function getDayMomentScore(
  taskMoment: TaskDayMoment | null,
  now = new Date()
): number {
  if (!taskMoment || taskMoment === "any") return 4;

  const currentMoment = getCurrentDayMoment(now);
  return taskMoment === currentMoment ? 8 : -4;
}

function getUrgencyScore(dueDate: string | null, now = new Date()): number {
  if (!dueDate) return 0;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 18;
  if (diffDays === 0) return 14;
  if (diffDays === 1) return 8;

  return 0;
}

function getRecommendationPool(tasks: HomeTodayTaskItem[]) {
  const candidates = tasks.filter((task) => !task.effectiveIsDone);
  const nonBlocked = candidates.filter((task) => task.clarity_level !== "blocked");

  return nonBlocked.length > 0 ? nonBlocked : candidates;
}

function getPriorityOrder(priority: TaskPriority): number {
  switch (priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
    default:
      return 1;
  }
}

export function getRecommendedTask(
  tasks: HomeTodayTaskItem[],
  context: Pick<RecommendationContext, "availableTime" | "energyLevel">,
  now = new Date()
): RecommendedTaskResult {
  if (!tasks.length || !context.availableTime || !context.energyLevel) {
    return {
      task: null,
      score: 0,
      reasons: [],
    };
  }

  const pool = getRecommendationPool(tasks);

  if (!pool.length) {
    return {
      task: null,
      score: 0,
      reasons: [],
    };
  }

  const ranked = pool.map((task) => {
    const scoreParts = {
      priority: getPriorityScore(task.priority),
      time: getTimeFitScore(task.estimated_minutes, context.availableTime),
      energy: getEnergyFitScore(task.energy_level, context.energyLevel),
      clarity: getClarityScore(task.clarity_level),
      difficulty: getDifficultyScore(task.difficulty_level, context.energyLevel),
      dayMoment: getDayMomentScore(task.day_moment, now),
      urgency: getUrgencyScore(task.due_date, now),
    };

    const score = Object.values(scoreParts).reduce((total, value) => total + value, 0);

    const reasons: RecommendationReason[] = [];

    if (scoreParts.time >= 20) reasons.push("fits_time");
    if (scoreParts.energy >= 15) reasons.push("fits_energy");
    if (scoreParts.priority >= 30) reasons.push("high_priority");
    if (scoreParts.urgency >= 14) reasons.push("urgent");
    if (scoreParts.clarity >= 10) reasons.push("clear_enough");
    if (scoreParts.difficulty >= 10) reasons.push("easy_to_start");
    if (scoreParts.dayMoment >= 8) reasons.push("good_moment");

    return {
      task,
      score,
      reasons,
    };
  });

  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const priorityDiff =
      getPriorityOrder(b.task.priority) - getPriorityOrder(a.task.priority);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const aEstimatedMinutes = a.task.estimated_minutes ?? Number.MAX_SAFE_INTEGER;
    const bEstimatedMinutes = b.task.estimated_minutes ?? Number.MAX_SAFE_INTEGER;

    if (aEstimatedMinutes !== bEstimatedMinutes) {
      return aEstimatedMinutes - bEstimatedMinutes;
    }

    return (
      new Date(a.task.created_at).getTime() -
      new Date(b.task.created_at).getTime()
    );
  });

  return ranked[0] ?? { task: null, score: 0, reasons: [] };
}

export function getRecommendationReasonText(
  reasons: RecommendationReason[]
): string {
  if (reasons.includes("fits_time") && reasons.includes("fits_energy")) {
    return "Encaja con el tiempo que tienes y con cómo vienes ahora.";
  }

  if (reasons.includes("urgent")) {
    return "Conviene resolverla pronto y ahora mismo te encaja bien.";
  }

  if (reasons.includes("high_priority")) {
    return "Es una tarea importante y asumible en este momento.";
  }

  if (reasons.includes("easy_to_start")) {
    return "Es una buena forma de avanzar sin saturarte.";
  }

  if (reasons.includes("good_moment")) {
    return "Ahora es un buen momento del día para abordarla.";
  }

  if (reasons.includes("clear_enough")) {
    return "Está lo bastante clara como para empezar sin fricción.";
  }

  return "Es el siguiente paso más razonable para avanzar ahora.";
}