import { apiRequest } from "./api";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface AuthUrlResponse {
  auth_url: string;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  username?: string,
  fullName?: string
): Promise<void> {
  await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      username: username || null,
      full_name: fullName || null,
    }),
  });
}

export async function fetchGoogleAuthUrl(): Promise<string> {
  const response = await apiRequest<AuthUrlResponse>("/auth/google/authorize");
  return response.auth_url;
}
