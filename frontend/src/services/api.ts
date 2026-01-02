const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1";
const ACCESS_KEY = "oracle.accessToken";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem(ACCESS_KEY) : null;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
}
