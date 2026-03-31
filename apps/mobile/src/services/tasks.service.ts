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

export async function toggleTaskDone(id: string, isDone: boolean) {
  const payload = {
    is_done: isDone,
    done_at: isDone ? new Date().toISOString() : null,
  };

  return supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select("id, is_done, done_at")
    .single();
}

export async function deleteTask(id: string) {
  return supabase.from("tasks").delete().eq("id", id);
}