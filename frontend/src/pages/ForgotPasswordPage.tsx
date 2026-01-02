import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return (
    <div className="glass-card animate-rise rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-white">Reset password</h2>
      <p className="mt-2 text-sm text-white/60">We will send a reset link to your inbox.</p>
      <form className="mt-8 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60">Email</label>
          <input
            type="email"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ember"
            placeholder="you@oracle.ai"
          />
        </div>
        <button
          type="button"
          className="w-full rounded-xl bg-ember py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-glow"
        >
          Send Reset Link
        </button>
      </form>
      <div className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-white/50">
        Remembered?{" "}
        <Link to="/login" className="hover:text-white">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
