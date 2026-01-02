import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login, register } from "../services/auth";
import { useAuthStore } from "../store/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      await register(email, password, username, fullName);
      const token = await login(email, password);
      setTokens(token.access_token, token.refresh_token);
      navigate("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card animate-rise rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-white">Create your account</h2>
      <p className="mt-2 text-sm text-white/60">Start with a plan and backtest in minutes.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60">Email</label>
          <input
            type="email"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ember"
            placeholder="you@oracle.ai"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/60">Username</label>
            <input
              type="text"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ember"
              placeholder="alphaqueen"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/60">Full Name</label>
            <input
              type="text"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ember"
              placeholder="Alex Morgan"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60">Password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ember"
            placeholder="Create a strong password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-ember py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-glow disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </form>
      {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}
      <div className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-white/50">
        Already have an account?{" "}
        <Link to="/login" className="hover:text-white">
          Sign In
        </Link>
      </div>
    </div>
  );
}
