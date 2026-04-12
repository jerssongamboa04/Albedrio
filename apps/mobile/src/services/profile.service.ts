import { supabase } from "../lib/supabase";
import type { Profile, UpdateProfilePayload } from "../types/profile";

export class ProfileService {
  static async getMyProfile(): Promise<Profile | null> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, bio, avatar_url, created_at, updated_at")
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return data as Profile;
  }

  static async updateMyProfile(payload: UpdateProfilePayload): Promise<Profile> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("No hay usuario autenticado");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select("id, display_name, bio, avatar_url, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return data as Profile;
  }
}