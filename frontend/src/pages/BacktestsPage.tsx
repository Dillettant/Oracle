import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createBacktest,
  listBacktests,
  runBacktest,
  type BacktestResponse,
} from "../services/backtests";
import { listStrategies, type StrategyResponse } from "../services/strategies";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function BacktestsPage() {
  const [backtests, setBacktests] = useState<BacktestResponse[]>([]);
  const [strategies, setStrategies] = useState<StrategyResponse[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatDate(date);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [initialCapital, setInitialCapital] = useState(10000);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const selectedStrategyName = useMemo(
    () => strategies.find((strategy) => strategy.id === selectedStrategy)?.name,
    [selectedStrategy, strategies]
  );

  const refreshData = async () => {
    const [strategyData, backtestData] = await Promise.all([listStrategies(), listBacktests()]);
    setStrategies(strategyData);
    setBacktests(backtestData);
    if (!selectedStrategy && strategyData.length > 0) {
      setSelectedStrategy(strategyData[0].id);
    }
  };

  useEffect(() => {
    let isMounted = true;
    refreshData()
      .catch((error) => {
        if (!isMounted) return;
        setMessage(error instanceof Error ? error.message : "Unable to load backtests.");
      })
      .finally(() => {
        if (!isMounted) return;
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPolling) return;
    const timer = window.setInterval(() => {
      refreshData().catch(() => undefined);
    }, 4000);
    return () => {
      window.clearInterval(timer);
    };
  }, [isPolling]);

  useEffect(() => {
    if (backtests.some((item) => item.status === "running")) {
      setIsPolling(true);
    } else if (isPolling) {
      setIsPolling(false);
    }
  }, [backtests, isPolling]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!selectedStrategy) {
      setMessage("Select a strategy to run.");
      return;
    }
    setIsBusy(true);
    try {
      const created = await createBacktest({
        strategy_id: selectedStrategy,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        initial_capital: initialCapital,
      });
      setBacktests((current) => [created, ...current]);
      setMessage("Backtest created. Run it to generate results.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create backtest.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleRun = async (backtestId: string) => {
    setMessage(null);
    setIsBusy(true);
    try {
      const updated = await runBacktest(backtestId);
      setBacktests((current) =>
        current.map((item) =>
          item.id === backtestId ? { ...item, status: updated.status } : item
        )
      );
      setIsPolling(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to run backtest.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="grid w-full gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink">Backtest Launcher</h2>
        <p className="mt-2 text-sm text-slate-500">
          Pick a strategy, set a window, and generate results.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Strategy</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={selectedStrategy}
              onChange={(event) => setSelectedStrategy(event.target.value)}
            >
              {strategies.length === 0 ? (
                <option value="">No strategies yet</option>
              ) : (
                strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Start Date
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                End Date
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Initial Capital
            </label>
            <input
              type="number"
              min="1000"
              step="100"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={initialCapital}
              onChange={(event) => setInitialCapital(Number(event.target.value))}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60"
            disabled={isBusy}
          >
            Create Backtest
          </button>
          {message ? <p className="text-sm text-amber-700">{message}</p> : null}
          {selectedStrategyName ? (
            <p className="text-xs text-slate-400">
              Selected: <span className="font-semibold">{selectedStrategyName}</span>
            </p>
          ) : null}
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Recent Backtests</h2>
            <p className="mt-2 text-sm text-slate-500">
              Run history and performance snapshots.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {backtests.length === 0 ? (
            <p className="text-sm text-slate-500">No backtests created yet.</p>
          ) : (
            backtests.map((backtest) => {
              const summary = backtest.results_json?.summary as
                | {
                    total_return_pct?: number;
                    sharpe?: number;
                    max_drawdown_pct?: number;
                  }
                | undefined;
              return (
                <div
                  key={backtest.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Status
                      </p>
                      <p className="mt-1 text-lg font-semibold text-ink">{backtest.status}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                      onClick={() => handleRun(backtest.id)}
                      disabled={isBusy || backtest.status === "completed" || backtest.status === "running"}
                    >
                      {backtest.status === "completed"
                        ? "Completed"
                        : backtest.status === "running"
                        ? "Running..."
                        : "Run Backtest"}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Window
                      </p>
                      <p className="mt-1">
                        {backtest.start_date.slice(0, 10)} to {backtest.end_date.slice(0, 10)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Return
                      </p>
                      <p className="mt-1">
                        {summary?.total_return_pct !== undefined
                          ? `${summary.total_return_pct}%`
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sharpe</p>
                      <p className="mt-1">{summary?.sharpe ?? "Pending"}</p>
                    </div>
                  </div>
                  {summary ? (
                    <div className="mt-4 text-xs text-slate-500">
                      Max drawdown: {summary.max_drawdown_pct ?? "-"}%
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
