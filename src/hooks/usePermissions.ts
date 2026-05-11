import { useAuth, Permission } from "@/contexts/AuthContext";

/**
 * usePermissions hook - Provides utilities for checking user permissions
 *
 * @returns Object with permission checking functions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    // Admin always has all permissions
    if (user?.role === "admin") {
      return true;
    }

    // Only employees have granular permissions
    if (user?.role !== "employee" || !user.permissions) {
      return false;
    }

    return user.permissions.includes(permission);
  };

  /**
   * Check if user has ANY of the specified permissions (OR logic)
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    // Admin always has all permissions
    if (user?.role === "admin") {
      return true;
    }

    // Only employees have granular permissions
    if (user?.role !== "employee" || !user.permissions) {
      return false;
    }

    return permissions.some((permission) =>
      user.permissions!.includes(permission),
    );
  };

  /**
   * Check if user has ALL of the specified permissions (AND logic)
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    // Admin always has all permissions
    if (user?.role === "admin") {
      return true;
    }

    // Only employees have granular permissions
    if (user?.role !== "employee" || !user.permissions) {
      return false;
    }

    return permissions.every((permission) =>
      user.permissions!.includes(permission),
    );
  };

  /**
   * Get all permissions for the current user
   */
  const getUserPermissions = (): Permission[] => {
    if (user?.role === "employee" && user.permissions) {
      return user.permissions;
    }
    return [];
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    isAdmin: user?.role === "admin",
    isEmployee: user?.role === "employee",
  };
};
