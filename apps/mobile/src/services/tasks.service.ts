import { supabase } from "../lib/supabase";

export type TaskType = "one_time" | "daily";
export type TaskPriority = "low" | "medium" | "high";
export type TaskEnergyLevel = "low" | "medium" | "high";
export type TaskClarityLevel = "clear" | "somewhat_clear" | "blocked";
export type TaskDifficultyLevel = "light" | "medium" | "hard";
export type TaskDayMoment = "morning" | "afternoon" | "evening" | "any";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  is_done: boolean;
  done_at: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;

  task_type: TaskType;
  estimated_minutes: number | null;
  priority: TaskPriority;
  energy_level: TaskEnergyLevel;
  clarity_level: TaskClarityLevel;
  difficulty_level: TaskDifficultyLevel;
  day_moment: TaskDayMoment | null;
};

export type CreateTaskInput = {
  title: string;
  notes: string | null;
  due_date: string | null;

  task_type: TaskType;
  estimated_minutes: number | null;
  priority: TaskPriority;
  energy_level: TaskEnergyLevel;
  clarity_level: TaskClarityLevel;
  difficulty_level: TaskDifficultyLevel;
  day_moment: TaskDayMoment | null;
};

export type UpdateTaskInput = {
  title: string;
  notes: string | null;
  due_date: string | null;

  estimated_minutes: number | null;
  priority: TaskPriority;
  energy_level: TaskEnergyLevel;
  clarity_level: TaskClarityLevel;
  difficulty_level: TaskDifficultyLevel;
  day_moment: TaskDayMoment | null;
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function fetchTasks() {
  return supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const payload = {
    user_id: userId,
    title: input.title.trim(),
    notes: input.notes ?? null,
    due_date: input.task_type === "one_time" ? input.due_date ?? null : null,

    task_type: input.task_type,
    estimated_minutes: input.estimated_minutes ?? null,
    priority: input.priority,
    energy_level: input.energy_level,
    clarity_level: input.clarity_level,
    difficulty_level: input.difficulty_level,
    day_moment: input.task_type === "daily" ? input.day_moment ?? null : null,
  };

  return supabase.from("tasks").insert([payload]).select().single();
}

export async function updateTask(id: string, taskType: TaskType, input: UpdateTaskInput) {
  const payload = {
    title: input.title.trim(),
    notes: input.notes ?? null,
    due_date: taskType === "one_time" ? input.due_date ?? null : null,

    estimated_minutes: input.estimated_minutes ?? null,
    priority: input.priority,
    energy_level: input.energy_level,
    clarity_level: input.clarity_level,
    difficulty_level: input.difficulty_level,
    day_moment: taskType === "daily" ? input.day_moment ?? "any" : null,
  };

  return supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
}

export async function toggleTaskDone(id: string, isDone: boolean) {
  const now = new Date();

  const { error: rpcError } = await supabase.rpc("toggle_task_done", {
    p_task_id: id,
    p_next_done: isDone,
    p_completion_date: getLocalDateString(now),
    p_completed_at: now.toISOString(),
  });

  if (rpcError) {
    return {
      data: null,
      error: rpcError,
    };
  }

  return supabase
    .from("tasks")
    .select("id, is_done, done_at")
    .eq("id", id)
    .single();
}

export async function deleteTask(id: string) {
  return supabase.from("tasks").delete().eq("id", id);
}