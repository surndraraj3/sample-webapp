import { ReactNode } from "react";
import { useAuth, Permission } from "@/contexts/AuthContext";

type PermissionGateProps = {
    requires?: Permission | Permission[];
    requiresAll?: Permission[];
    fallback?: ReactNode;
    children: ReactNode;
};

/**
 * PermissionGate - Conditionally renders children based on user permissions
 * 
 * @param requires - Single permission or array of permissions (any match)
 * @param requiresAll - Array of permissions (all must match)
 * @param fallback - Optional component to render when permission check fails
 * @param children - Content to render when permission check passes
 */
export const PermissionGate = ({
    requires,
    requiresAll,
    fallback = null,
    children
}: PermissionGateProps) => {
    const { user } = useAuth();

    // Admin always has access
    if (user?.role === "admin") {
        return <>{children}</>;
    }

    // If user is not an employee, deny access
    if (user?.role !== "employee" || !user.permissions) {
        return <>{fallback}</>;
    }

    const userPermissions = user.permissions;

    // Check if user has all required permissions (AND logic)
    if (requiresAll && requiresAll.length > 0) {
        const hasAll = requiresAll.every(permission =>
            userPermissions.includes(permission)
        );
        return hasAll ? <>{children}</> : <>{fallback}</>;
    }

    // Check if user has any of the required permissions (OR logic)
    if (requires) {
        const permissionsToCheck = Array.isArray(requires) ? requires : [requires];
        const hasAny = permissionsToCheck.some(permission =>
            userPermissions.includes(permission)
        );
        return hasAny ? <>{children}</> : <>{fallback}</>;
    }

    // If no permission requirements specified, render children
    return <>{children}</>;
};
