import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { fetchGoogleAuthUrl, login } from "../services/auth";
import { useAuthStore } from "../store/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      const token = await login(email, password);
      setTokens(token.access_token, token.refresh_token);
      navigate("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setMessage(null);
    try {
      const url = await fetchGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google auth failed");
    }
  };

  return (
    <div className="glass-card animate-rise rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
      <p className="mt-2 text-sm text-white/60">Log in to keep building your strategy stack.</p>
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
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60">Password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ember"
            placeholder="••••••••"
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
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <button
        type="button"
        onClick={handleGoogle}
        className="mt-4 w-full rounded-xl border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white"
      >
        Continue with Google
      </button>
      {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}
      <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/50">
        <Link to="/forgot" className="hover:text-white">
          Forgot Password
        </Link>
        <Link to="/register" className="hover:text-white">
          Create Account
        </Link>
      </div>
    </div>
  );
}
