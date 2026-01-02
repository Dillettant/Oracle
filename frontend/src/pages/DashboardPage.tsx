import { Link } from "react-router-dom";

const stats = [
  { label: "Strategies", value: "03" },
  { label: "Active Bots", value: "01" },
  { label: "Backtests", value: "08" },
  { label: "Win Rate", value: "63%" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1">
      <div className="w-full space-y-6">
      <section className="rounded-3xl bg-ink p-8 text-mist shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Oracle Control</p>
            <h1 className="mt-3 text-3xl font-semibold">Good evening, strategist.</h1>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Your MVP stack is online. Build a new flow, backtest faster, and schedule a bot from
              the next tab.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/strategy"
              className="rounded-full bg-ember px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-glow"
            >
              Open Builder
            </Link>
            <button className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Schedule Bot
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
            <p className="mt-4 text-3xl font-semibold text-ink">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Latest Activity</p>
          <ul className="mt-5 space-y-4 text-sm text-slate-600">
            <li className="flex items-center justify-between">
              <span>RSI breakout strategy backtested</span>
              <span className="text-slate-400">2h ago</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Bot schedule updated to 15m</span>
              <span className="text-slate-400">6h ago</span>
            </li>
            <li className="flex items-center justify-between">
              <span>New strategy draft saved</span>
              <span className="text-slate-400">1d ago</span>
            </li>
          </ul>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Next Actions</p>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-mist p-4">
              <p className="font-semibold text-slate-700">Connect broker</p>
              <p className="mt-2 text-xs text-slate-500">
                Alpaca credentials missing. Add keys before going live.
              </p>
              <Link
                to="/settings"
                className="mt-3 inline-flex rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600"
              >
                Open Settings
              </Link>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="font-semibold text-slate-700">Review backtest metrics</p>
              <p className="mt-2 text-xs text-slate-500">
                Sharpe below target. Try a tighter stop loss.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
