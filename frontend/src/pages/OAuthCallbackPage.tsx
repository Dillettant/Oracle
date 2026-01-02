import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/auth";

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState("Finalizing sign-in...");
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const error = params.get("error");

    if (error) {
      setStatus(`Google sign-in failed: ${error}`);
      return;
    }

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      navigate("/dashboard", { replace: true });
      return;
    }

    setStatus("Missing OAuth tokens. Please try again.");
  }, [navigate, setTokens]);

  return (
    <div className="glass-card animate-rise rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-white">Signing you in</h2>
      <p className="mt-2 text-sm text-white/60">{status}</p>
    </div>
  );
}
