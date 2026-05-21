import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export type Role = "customer" | "dealer" | "admin" | "employee";
export type EmployeeRole = "production" | "sales" | "service";
export type Permission = string;

export type User = {
  role: Role;
  name?: string;
  mobile?: string;   // customers
  username?: string; // dealers / admin
  code?: string;     // dealer code
  employeeId?: string; // employee ID (e.g., MS-001)
  employeeRole?: EmployeeRole; // employee specific role
  permissions?: Permission[]; // employee permissions
};

// Permission definitions
export const PERMISSIONS = {
  // Production Team
  VIEW_INVENTORY: "view_inventory",
  UPDATE_INVENTORY: "update_inventory",
  VIEW_RAW_MATERIALS: "view_raw_materials",
  MANAGE_RAW_MATERIALS: "manage_raw_materials",
  VIEW_PRODUCTION_STATUS: "view_production_status",
  UPDATE_PRODUCTION_STATUS: "update_production_status",
  // Sales & Marketing Team
  VIEW_DEALERS: "view_dealers",
  MANAGE_DEALERS: "manage_dealers",
  VIEW_ORDERS: "view_orders",
  MANAGE_ORDERS: "manage_orders",
  VIEW_DEALER_PERFORMANCE: "view_dealer_performance",
  // Service Technicians
  VIEW_TICKETS: "view_tickets",
  MANAGE_TICKETS: "manage_tickets",
  VIEW_WARRANTY_CLAIMS: "view_warranty_claims",
  UPDATE_WARRANTY_CLAIMS: "update_warranty_claims",
  VIEW_CUSTOMER_COMPLAINTS: "view_customer_complaints",
} as const;

// Role-based permission presets
export const ROLE_PERMISSIONS: Record<EmployeeRole, Permission[]> = {
  production: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.VIEW_RAW_MATERIALS,
    PERMISSIONS.MANAGE_RAW_MATERIALS,
    PERMISSIONS.VIEW_PRODUCTION_STATUS,
    PERMISSIONS.UPDATE_PRODUCTION_STATUS,
  ],
  sales: [
    PERMISSIONS.VIEW_DEALERS,
    PERMISSIONS.MANAGE_DEALERS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_DEALER_PERFORMANCE,
  ],
  service: [
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.MANAGE_TICKETS,
    PERMISSIONS.VIEW_WARRANTY_CLAIMS,
    PERMISSIONS.UPDATE_WARRANTY_CLAIMS,
    PERMISSIONS.VIEW_CUSTOMER_COMPLAINTS,
  ],
};

// Demo credentials for staff logins (shown on the staff login screen).
export const STAFF_CREDENTIALS = [
  { role: "admin" as Role, username: "admin", password: "admin@123", name: "MSI Admin" },
  { role: "dealer" as Role, username: "DLR001", password: "dealer@123", name: "Suresh Agro Distributors", code: "DLR001" },
  { role: "dealer" as Role, username: "DLR002", password: "dealer@123", name: "Krishna Pumps", code: "DLR002" },
];

// Demo employee credentials
export const EMPLOYEE_CREDENTIALS = [
  {
    employeeId: "MS-001",
    password: "employee@123",
    name: "Rajesh Kumar",
    employeeRole: "production" as EmployeeRole,
    email: "rajesh@msi.com",
    phone: "9876501111"
  },
  {
    employeeId: "MS-002",
    password: "employee@123",
    name: "Priya Sharma",
    employeeRole: "sales" as EmployeeRole,
    email: "priya@msi.com",
    phone: "9876502222"
  },
  {
    employeeId: "MS-003",
    password: "employee@123",
    name: "Anil Reddy",
    employeeRole: "service" as EmployeeRole,
    email: "anil@msi.com",
    phone: "9876503333"
  },
];

type Ctx = {
  user: User | null;
  isAuthed: boolean;
  sendOtp: (mobile: string) => Promise<void>;
  verifyOtp: (mobile: string, otp: string) => Promise<boolean>;
  staffLogin: (username: string, password: string) => Promise<{ ok: true; role: Role } | { ok: false; error: string }>;
  employeeLogin: (employeeId: string, password: string) => Promise<{ ok: true; employeeRole: EmployeeRole } | { ok: false; error: string }>;
  logout: () => void;
};

const AuthContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "msi.user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [lastUserType, setLastUserType] = useState<"customer" | "dealer">("customer");

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const sendOtp = async (mobile: string) => {
    try {
      const userType = "customer"; // For now, always customer. Can be extended later.
      setLastUserType(userType);
      await authService.sendOTP({ mobile, userType });
      toast.success("OTP sent successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      throw error;
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    try {
      const response = await authService.verifyOTP({ mobile, otp, userType: lastUserType });
      if (response.success) {
        const userData = response.data.user;
        setUser({
          role: userData.userType as Role,
          mobile: userData.mobile,
          name: userData.name,
          code: userData.userCode,
        });
        toast.success("Login successful");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      return false;
    }
  };

  const staffLogin = async (
    username: string,
    password: string
  ): Promise<{ ok: true; role: Role } | { ok: false; error: string }> => {
    await new Promise((r) => setTimeout(r, 350));
    const match = STAFF_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === username.trim().toLowerCase() && c.password === password
    );
    if (!match) return { ok: false, error: "Invalid username or password" };
    setUser({ role: match.role, name: match.name, username: match.username, code: match.code });
    return { ok: true, role: match.role };
  };

  const employeeLogin = async (
    employeeId: string,
    password: string
  ): Promise<{ ok: true; employeeRole: EmployeeRole } | { ok: false; error: string }> => {
    await new Promise((r) => setTimeout(r, 350));
    const match = EMPLOYEE_CREDENTIALS.find(
      (c) => c.employeeId.toUpperCase() === employeeId.trim().toUpperCase() && c.password === password
    );
    if (!match) return { ok: false, error: "Invalid employee ID or password" };

    const permissions = ROLE_PERMISSIONS[match.employeeRole];
    setUser({
      role: "employee",
      name: match.name,
      employeeId: match.employeeId,
      employeeRole: match.employeeRole,
      permissions
    });
    return { ok: true, employeeRole: match.employeeRole };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error, just clear local state
    }
    setUser(null);
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, sendOtp, verifyOtp, staffLogin, employeeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
