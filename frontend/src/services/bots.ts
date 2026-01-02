import { apiRequest } from "./api";

export interface BotPayload {
  strategy_id: string;
  name: string;
  schedule: string;
  status?: string;
}

export interface BotResponse {
  id: string;
  user_id: string;
  strategy_id: string;
  name: string;
  schedule: string;
  status: string;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function listBots(): Promise<BotResponse[]> {
  return apiRequest<BotResponse[]>("/bots");
}

export async function createBot(payload: BotPayload): Promise<BotResponse> {
  return apiRequest<BotResponse>("/bots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBot(id: string, payload: Partial<BotPayload>): Promise<BotResponse> {
  return apiRequest<BotResponse>(`/bots/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function startBot(id: string): Promise<BotResponse> {
  return apiRequest<BotResponse>(`/bots/${id}/start`, { method: "POST" });
}

export async function stopBot(id: string): Promise<BotResponse> {
  return apiRequest<BotResponse>(`/bots/${id}/stop`, { method: "POST" });
}

export async function deleteBot(id: string): Promise<void> {
  await apiRequest(`/bots/${id}`, { method: "DELETE" });
}
