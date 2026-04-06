import { supabase } from "../lib/supabase";

export type TaskCompletion = {
  id: string;
  task_id: string;
  user_id: string;
  completion_date: string;
  completed_at: string;
  created_at: string;
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayLocalDateString() {
  return getLocalDateString();
}

export async function fetchCompletedTaskIdsForDate(date: string) {
  return supabase
    .from("task_completions")
    .select("task_id")
    .eq("completion_date", date);
}

export async function fetchTodayCompletedTaskIds() {
  return fetchCompletedTaskIdsForDate(getTodayLocalDateString());
}