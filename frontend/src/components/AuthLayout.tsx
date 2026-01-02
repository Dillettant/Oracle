import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="oracle-gradient min-h-screen text-mist">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.2em] text-white/70">
            Oracle MVP
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Build strategies with conviction, then let the bots run the night shift.
          </h1>
          <p className="max-w-xl text-lg text-white/70">
            Design a trading flow, backtest instantly, and deploy with a single schedule. Keep the
            system lean, clean, and built for speed.
          </p>
          <div className="flex flex-wrap gap-6 text-sm uppercase tracking-[0.18em] text-white/60">
            <span>Strategy Builder</span>
            <span>Backtesting</span>
            <span>Bot Scheduler</span>
          </div>
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
