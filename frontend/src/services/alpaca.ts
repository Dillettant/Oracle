import { apiRequest } from "./api";

export type AlpacaEnv = "paper" | "live";

export interface AlpacaConnectionStatus {
  connected: boolean;
  env?: AlpacaEnv;
  scope?: string | null;
  created_at?: string | null;
}

export interface AlpacaBar {
  timestamp: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  trade_count: number | null;
  vwap: number | null;
}

export interface AlpacaBarsResponse {
  bars: AlpacaBar[];
  raw: Record<string, unknown>;
}

interface AlpacaAuthorizeResponse {
  auth_url: string;
}

export async function fetchAlpacaStatus(env: AlpacaEnv): Promise<AlpacaConnectionStatus> {
  return apiRequest<AlpacaConnectionStatus>(`/alpaca/status?env=${env}`);
}

export async function fetchAlpacaAuthUrl(env: AlpacaEnv): Promise<string> {
  const response = await apiRequest<AlpacaAuthorizeResponse>(`/alpaca/authorize?env=${env}`);
  return response.auth_url;
}

export async function disconnectAlpaca(env: AlpacaEnv): Promise<AlpacaConnectionStatus> {
  return apiRequest<AlpacaConnectionStatus>(`/alpaca/disconnect?env=${env}`, {
    method: "DELETE",
  });
}

export async function fetchBars(payload: {
  symbol: string;
  timeframe: string;
  start?: string;
  end?: string;
  limit?: number;
  env?: AlpacaEnv;
}): Promise<AlpacaBarsResponse> {
  const envParam = payload.env ? `?env=${payload.env}` : "";
  const { env, ...body } = payload;
  return apiRequest<AlpacaBarsResponse>(`/market/bars${envParam}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface AlpacaQuote {
  timestamp: string | null;
  ask_price: number | null;
  bid_price: number | null;
  ask_size: number | null;
  bid_size: number | null;
}

export interface AlpacaQuotesResponse {
  quotes: AlpacaQuote[];
  raw: Record<string, unknown>;
}

export interface AlpacaAsset {
  id?: string | null;
  symbol: string;
  name?: string | null;
  exchange?: string | null;
  status?: string | null;
  tradable?: boolean | null;
}

export interface AlpacaAssetsResponse {
  assets: AlpacaAsset[];
}

export async function fetchQuotes(payload: {
  symbol: string;
  start?: string;
  end?: string;
  limit?: number;
  env?: AlpacaEnv;
}): Promise<AlpacaQuotesResponse> {
  const envParam = payload.env ? `?env=${payload.env}` : "";
  const { env, ...body } = payload;
  return apiRequest<AlpacaQuotesResponse>(`/market/quotes${envParam}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function searchAssets(query: string, env?: AlpacaEnv): Promise<AlpacaAssetsResponse> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (env) params.set("env", env);
  const queryString = params.toString();
  return apiRequest<AlpacaAssetsResponse>(`/market/assets${queryString ? `?${queryString}` : ""}`);
}
