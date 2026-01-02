import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createBot,
  deleteBot,
  listBots,
  startBot,
  stopBot,
  type BotResponse,
} from "../services/bots";
import { listStrategies, type StrategyResponse } from "../services/strategies";

export default function BotsPage() {
  const [bots, setBots] = useState<BotResponse[]>([]);
  const [strategies, setStrategies] = useState<StrategyResponse[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [name, setName] = useState("Momentum Runner");
  const [schedule, setSchedule] = useState("0 */6 * * *");
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const strategyOptions = useMemo(
    () => strategies.map((strategy) => ({ id: strategy.id, name: strategy.name })),
    [strategies]
  );

  useEffect(() => {
    let isMounted = true;
    Promise.all([listStrategies(), listBots()])
      .then(([strategyData, botData]) => {
        if (!isMounted) return;
        setStrategies(strategyData);
        setBots(botData);
        if (!selectedStrategy && strategyData.length > 0) {
          setSelectedStrategy(strategyData[0].id);
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        setMessage(error instanceof Error ? error.message : "Unable to load bots.");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!selectedStrategy) {
      setMessage("Select a strategy before creating a bot.");
      return;
    }
    setIsBusy(true);
    try {
      const created = await createBot({
        strategy_id: selectedStrategy,
        name,
        schedule,
        status: "stopped",
      });
      setBots((current) => [created, ...current]);
      setMessage("Bot created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create bot.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleToggle = async (bot: BotResponse) => {
    setMessage(null);
    setIsBusy(true);
    try {
      const updated =
        bot.status === "running" ? await stopBot(bot.id) : await startBot(bot.id);
      setBots((current) => current.map((item) => (item.id === bot.id ? updated : item)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update bot.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (botId: string) => {
    setMessage(null);
    setIsBusy(true);
    try {
      await deleteBot(botId);
      setBots((current) => current.filter((item) => item.id !== botId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete bot.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="grid w-full gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink">Bot Scheduler</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create a bot and define its execution cadence.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Strategy</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={selectedStrategy}
              onChange={(event) => setSelectedStrategy(event.target.value)}
            >
              {strategyOptions.length === 0 ? (
                <option value="">No strategies yet</option>
              ) : (
                strategyOptions.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Schedule</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
            />
            <p className="mt-2 text-xs text-slate-400">Cron format. Example: 0 */6 * * *</p>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60"
            disabled={isBusy}
          >
            Create Bot
          </button>
          {message ? <p className="text-sm text-amber-700">{message}</p> : null}
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink">Active Bots</h2>
        <p className="mt-2 text-sm text-slate-500">Start, stop, and monitor runs.</p>
        <div className="mt-6 space-y-4">
          {bots.length === 0 ? (
            <p className="text-sm text-slate-500">No bots created yet.</p>
          ) : (
            bots.map((bot) => (
              <div
                key={bot.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {bot.name}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">{bot.status}</p>
                  </div>
                  <div className="flex gap-2 text-xs uppercase tracking-[0.2em]">
                    <button
                      type="button"
                      onClick={() => handleToggle(bot)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
                      disabled={isBusy}
                    >
                      {bot.status === "running" ? "Stop" : "Start"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(bot.id)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-rose-600"
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Schedule
                    </p>
                    <p className="mt-1">{bot.schedule}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Strategy</p>
                    <p className="mt-1">
                      {strategies.find((strategy) => strategy.id === bot.strategy_id)?.name ??
                        "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last Run</p>
                    <p className="mt-1">{bot.last_run_at ?? "Not run yet"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
