import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "customer" | "dealer" | "admin";
export type User = {
  role: Role;
  name?: string;
  mobile?: string;   // customers
  username?: string; // dealers / admin
  code?: string;     // dealer code
};

// Demo credentials for staff logins (shown on the staff login screen).
export const STAFF_CREDENTIALS = [
  { role: "admin" as Role,  username: "admin",  password: "admin@123",  name: "MSI Admin" },
  { role: "dealer" as Role, username: "DLR001", password: "dealer@123", name: "Suresh Agro Distributors", code: "DLR001" },
  { role: "dealer" as Role, username: "DLR002", password: "dealer@123", name: "Krishna Pumps",            code: "DLR002" },
];

type Ctx = {
  user: User | null;
  isAuthed: boolean;
  sendOtp: (mobile: string) => Promise<void>;
  verifyOtp: (mobile: string, otp: string) => Promise<boolean>;
  staffLogin: (username: string, password: string) => Promise<{ ok: true; role: Role } | { ok: false; error: string }>;
  logout: () => void;
};

const AuthContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "msi.user";
const DUMMY_OTP = "123456";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const sendOtp = async (_mobile: string) => {
    await new Promise((r) => setTimeout(r, 400));
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    await new Promise((r) => setTimeout(r, 300));
    if (otp !== DUMMY_OTP) return false;
    setUser({ role: "customer", mobile, name: `Customer ${mobile.slice(-4)}` });
    return true;
  };

  const staffLogin: Ctx["staffLogin"] = async (username, password) => {
    await new Promise((r) => setTimeout(r, 350));
    const match = STAFF_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === username.trim().toLowerCase() && c.password === password
    );
    if (!match) return { ok: false, error: "Invalid username or password" };
    setUser({ role: match.role, name: match.name, username: match.username, code: match.code });
    return { ok: true, role: match.role };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, sendOtp, verifyOtp, staffLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
