import { apiRequest } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export async function fetchProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/me");
}

export async function updateProfile(payload: UserProfileUpdate): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
