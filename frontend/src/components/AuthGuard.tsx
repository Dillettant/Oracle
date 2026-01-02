import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/auth";

export default function AuthGuard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
