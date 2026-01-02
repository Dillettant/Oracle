import { apiRequest } from "./api";

export interface BacktestPayload {
  strategy_id: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
}

export interface BacktestResponse {
  id: string;
  user_id: string;
  strategy_id: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  status: string;
  results_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export async function listBacktests(): Promise<BacktestResponse[]> {
  return apiRequest<BacktestResponse[]>("/backtests");
}

export async function createBacktest(payload: BacktestPayload): Promise<BacktestResponse> {
  return apiRequest<BacktestResponse>("/backtests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runBacktest(id: string): Promise<BacktestResponse> {
  return apiRequest<BacktestResponse>(`/backtests/${id}/run`, {
    method: "POST",
  });
}
