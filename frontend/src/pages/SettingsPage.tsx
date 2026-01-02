import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  disconnectAlpaca,
  fetchAlpacaAuthUrl,
  fetchAlpacaStatus,
  fetchBars,
  type AlpacaBar,
  type AlpacaConnectionStatus,
  type AlpacaEnv,
} from "../services/alpaca";

const timeframes = ["1Min", "5Min", "15Min", "1Hour", "1Day"];

export default function SettingsPage() {
  const location = useLocation();
  const [env, setEnv] = useState<AlpacaEnv>("paper");
  const [status, setStatus] = useState<AlpacaConnectionStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1Day");
  const [latestBar, setLatestBar] = useState<AlpacaBar | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  const queryMessage = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const alpaca = params.get("alpaca");
    const detail = params.get("detail");
    if (alpaca === "connected") {
      return "Alpaca connected. Market data is now available.";
    }
    if (alpaca === "error") {
      return detail ? `Alpaca connection failed: ${detail}` : "Alpaca connection failed.";
    }
    return null;
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const envParam = params.get("env");
    if (envParam === "paper" || envParam === "live") {
      setEnv(envParam);
    }
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;
    setStatusMessage(null);
    fetchAlpacaStatus(env)
      .then((data) => {
        if (!isMounted) return;
        setStatus(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setStatusMessage(error instanceof Error ? error.message : "Unable to load status.");
      });
    return () => {
      isMounted = false;
    };
  }, [env]);

  const handleConnect = async () => {
    setStatusMessage(null);
    setIsBusy(true);
    try {
      const authUrl = await fetchAlpacaAuthUrl(env);
      window.location.href = authUrl;
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to start OAuth flow.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setStatusMessage(null);
    setIsBusy(true);
    try {
      const data = await disconnectAlpaca(env);
      setStatus(data);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to disconnect.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleFetchBars = async () => {
    setDataMessage(null);
    setLatestBar(null);
    setIsBusy(true);
    try {
      const response = await fetchBars({
        symbol: symbol.trim().toUpperCase(),
        timeframe,
        limit: 1,
        env,
      });
      const bar = response.bars.at(-1) ?? null;
      setLatestBar(bar);
      if (!bar) {
        setDataMessage("No bars returned for that symbol.");
      }
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : "Unable to fetch market data.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="w-full space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink">Settings Center</h2>
        <p className="mt-2 text-sm text-slate-500">
          Connect services, validate data feeds, and keep the stack synced.
        </p>
        {queryMessage ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {queryMessage}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Broker Connection</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">Alpaca API</h3>
            <p className="mt-2 text-sm text-slate-500">
              Authorize Alpaca to pull market data and run backtests against live feeds.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
            <select
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-600"
              value={env}
              onChange={(event) => setEnv(event.target.value as AlpacaEnv)}
            >
              <option value="paper">Paper</option>
              <option value="live">Live</option>
            </select>
            {status?.connected ? (
              <button
                type="button"
                className="rounded-full border border-rose-200 px-4 py-2 text-rose-600"
                onClick={handleDisconnect}
                disabled={isBusy}
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                className="rounded-full bg-ink px-4 py-2 text-white disabled:opacity-60"
                onClick={handleConnect}
                disabled={isBusy}
              >
                Connect Alpaca
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {status?.connected ? "Connected" : "Not connected"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {status?.connected
                ? `Scope: ${status.scope ?? "default"} - Env: ${status.env ?? env}`
                : "Authorize to unlock market data APIs."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last Sync</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {status?.created_at ?? "Awaiting connection"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {status?.connected
                ? "OAuth token stored. Market data calls are authorized."
                : "Once connected, we will store your token for data queries."}
            </p>
          </div>
        </div>
        {statusMessage ? <p className="mt-4 text-sm text-amber-700">{statusMessage}</p> : null}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Market Data</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">Connection Check</h3>
            <p className="mt-2 text-sm text-slate-500">
              Pull a quick bar snapshot to verify your data feed is live.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60"
            onClick={handleFetchBars}
            disabled={!status?.connected || isBusy}
          >
            Fetch Latest Bar
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Symbol</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="AAPL"
              disabled={!status?.connected}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Timeframe
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={timeframe}
              onChange={(event) => setTimeframe(event.target.value)}
              disabled={!status?.connected}
            >
              {timeframes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            {latestBar ? (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Latest Close</p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {latestBar.close ?? "-"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {latestBar.timestamp ?? "Timestamp unavailable"}
                </p>
              </div>
            ) : (
              <p>Awaiting data snapshot.</p>
            )}
          </div>
        </div>
        {dataMessage ? <p className="mt-4 text-sm text-amber-700">{dataMessage}</p> : null}
      </section>
      </div>
    </div>
  );
}
