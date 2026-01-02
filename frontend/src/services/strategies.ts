import { apiRequest } from "./api";

export interface StrategyPayload {
  name: string;
  description?: string | null;
  config_json: Record<string, unknown>;
}

export interface StrategyUpdatePayload {
  name?: string;
  description?: string | null;
  config_json?: Record<string, unknown> | null;
  version?: number;
}

export interface StrategyResponse {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  config_json: Record<string, unknown>;
  version: number;
  created_at: string;
  updated_at: string;
}

export async function listStrategies(): Promise<StrategyResponse[]> {
  return apiRequest<StrategyResponse[]>("/strategies");
}

export async function getStrategy(id: string): Promise<StrategyResponse> {
  return apiRequest<StrategyResponse>(`/strategies/${id}`);
}

export async function createStrategy(payload: StrategyPayload): Promise<StrategyResponse> {
  return apiRequest<StrategyResponse>("/strategies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStrategy(
  id: string,
  payload: StrategyUpdatePayload
): Promise<StrategyResponse> {
  return apiRequest<StrategyResponse>(`/strategies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
