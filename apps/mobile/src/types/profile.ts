export type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateProfilePayload = {
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};