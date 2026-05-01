import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "customer" | "dealer" | "admin";
export type User = { mobile: string; name?: string; role: Role };

type Ctx = {
  user: User | null;
  isAuthed: boolean;
  sendOtp: (mobile: string) => Promise<void>;
  verifyOtp: (mobile: string, otp: string, role?: Role) => Promise<boolean>;
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
    // Dummy: always succeeds. Real impl would call SMS gateway.
    await new Promise((r) => setTimeout(r, 400));
  };

  const verifyOtp = async (mobile: string, otp: string, role: Role = "customer") => {
    await new Promise((r) => setTimeout(r, 300));
    if (otp !== DUMMY_OTP) return false;
    setUser({ mobile, role, name: `Customer ${mobile.slice(-4)}` });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
