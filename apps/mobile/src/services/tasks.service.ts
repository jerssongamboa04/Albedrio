import { supabase } from "../lib/supabase";

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
