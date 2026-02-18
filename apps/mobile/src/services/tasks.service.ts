import { supabase } from "../lib/supabase";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  is_done: boolean;
  due_date: string | null; // viene como string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
};

export async function fetchTasks() {
  return supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createTask(userId: string, title: string) {
  return supabase.from("tasks").insert([{ user_id: userId, title }]).select().single();
}

export async function toggleTaskDone(id: string, isDone: boolean) {
  return supabase.from("tasks").update({ is_done: isDone }).eq("id", id);
}

export async function deleteTask(id: string) {
  return supabase.from("tasks").delete().eq("id", id);
}
