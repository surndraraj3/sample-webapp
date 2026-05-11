import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Role, useAuth, Permission } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  allow?: Role[];
  requiresPermission?: Permission | Permission[];
  requiresAllPermissions?: Permission[];
  children: ReactNode;
};

export const ProtectedRoute = ({
  allow,
  requiresPermission,
  requiresAllPermissions,
  children
}: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/staff-login" replace state={{ from: location.pathname }} />;
  }

  // Check role-based access
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/staff-login" replace state={{ from: location.pathname }} />;
  }

  // Admin always has access to everything
  if (user.role === "admin") {
    return <>{children}</>;
  }

  // Check permission-based access for employees
  if (user.role === "employee" && user.permissions) {
    // Check if ALL permissions are required
    if (requiresAllPermissions && requiresAllPermissions.length > 0) {
      const hasAll = requiresAllPermissions.every(permission =>
        user.permissions!.includes(permission)
      );
      if (!hasAll) {
        return <Navigate to="/staff-login" replace state={{ from: location.pathname }} />;
      }
    }

    // Check if ANY permission is required
    if (requiresPermission) {
      const permissionsToCheck = Array.isArray(requiresPermission)
        ? requiresPermission
        : [requiresPermission];

      const hasAny = permissionsToCheck.some(permission =>
        user.permissions!.includes(permission)
      );

      if (!hasAny) {
        return <Navigate to="/staff-login" replace state={{ from: location.pathname }} />;
      }
    }
  }

  return <>{children}</>;
};
