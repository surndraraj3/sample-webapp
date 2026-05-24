import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lock, User as UserIcon, ShieldCheck, ArrowLeft, IdCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Mode = "dealer" | "admin" | "employee";

const StaffLogin = () => {
  const { user, staffLogin, employeeLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("dealer");
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "dealer") return <Navigate to="/dealer" replace />;
  if (user?.role === "employee") {
    // Redirect employee based on their role
    const roleRouteMap = {
      production: "/employee/production",
      sales: "/employee/sales",
      service: "/employee/service",
    };
    return <Navigate to={roleRouteMap[user.employeeRole!]} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "employee") {
      // Employee login
      if (!employeeId || !password) {
        toast.error("Please enter employee ID and password");
        return;
      }
      setLoading(true);
      const res = await employeeLogin(employeeId, password);
      setLoading(false);
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success(`Welcome, ${res.employeeRole} team member!`);
      const roleRouteMap = {
        production: "/employee/production",
        sales: "/employee/sales",
        service: "/employee/service",
      };
      navigate(roleRouteMap[res.employeeRole]);
    } else {
      // Staff login (admin/dealer)
      if (!username || !password) {
        toast.error("Please enter both fields");
        return;
      }
      setLoading(true);
      const userType = mode as "dealer" | "admin";
      const res = await staffLogin(username, password, userType);
      setLoading(false);
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      const role: typeof res.role = res.role;
      if (role !== mode) {
        toast.warning(`Logged in as ${role}. Redirecting to your dashboard.`);
      } else {
        toast.success(`Welcome, ${mode === "admin" ? "Admin" : "Dealer"}!`);
      }
      navigate(role === "admin" ? "/admin" : "/dealer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <header className="container py-5 flex items-center justify-between">
        <Logo className="h-10" />
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to site</Link>
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant border-border/60 overflow-hidden">
            <div className="bg-gradient-hero p-6 text-primary-foreground text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold">Staff Portal</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">Dealer, Admin & Employee sign-in</p>
            </div>

            <CardContent className="p-6">
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid grid-cols-3 w-full mb-6">
                  <TabsTrigger value="dealer">Dealer</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="employee">Employee</TabsTrigger>
                </TabsList>

                <TabsContent value={mode}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "employee" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="employeeId">Employee ID</Label>
                          <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="employeeId"
                              value={employeeId}
                              onChange={(e) => setEmployeeId(e.target.value)}
                              placeholder="Enter employee ID"
                              className="pl-9 h-11"
                              autoComplete="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="pl-9 h-11"
                              autoComplete="current-password"
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-cta">
                          {loading ? "Signing in..." : "Sign in as Employee"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="username">{mode === "dealer" ? "Dealer Code / Username" : "Admin Username"}</Label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder={mode === "dealer" ? "Enter dealer code or username" : "Enter admin username"}
                              className="pl-9 h-11"
                              autoComplete="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="pl-9 h-11"
                              autoComplete="current-password"
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-cta">
                          {loading ? "Signing in..." : `Sign in as ${mode === "dealer" ? "Dealer" : "Admin"}`}
                        </Button>
                      </>
                    )}
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StaffLogin;
