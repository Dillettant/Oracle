import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Strategy Builder", path: "/strategy" },
  { label: "Backtests", path: "/backtests" },
  { label: "Bots", path: "/bots" },
  { label: "Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const handleSignOut = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-mist text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-xl font-semibold">
            Oracle
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              MVP
            </span>
            <span>Alpha build</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col px-6 py-8">
        <div className="grid h-full items-stretch gap-6 md:grid-cols-[220px_1fr]">
          <aside className="flex h-full flex-col space-y-3 rounded-3xl bg-white p-5 shadow-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Navigate</div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-ink text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          </aside>
          <main className="flex min-h-0 flex-col space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
