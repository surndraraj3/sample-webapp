import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Role, useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ allow, children }: { allow: Role[]; children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/staff-login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};
