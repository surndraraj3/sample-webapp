import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lock, User as UserIcon, ShieldCheck, ArrowLeft, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { STAFF_CREDENTIALS, useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Mode = "dealer" | "admin";

const StaffLogin = () => {
  const { user, staffLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("dealer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "dealer") return <Navigate to="/dealer" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error("Please enter both fields"); return; }
    setLoading(true);
    const res = await staffLogin(username, password);
    setLoading(false);
    if (!res.ok) { toast.error(res.error); return; }
    if (res.role !== mode) {
      toast.warning(`Logged in as ${res.role}. Redirecting to your dashboard.`);
    } else {
      toast.success(`Welcome, ${mode === "admin" ? "Admin" : "Dealer"}!`);
    }
    navigate(res.role === "admin" ? "/admin" : "/dealer");
  };

  const useCred = (u: string, p: string) => { setUsername(u); setPassword(p); };
  const copy = (txt: string) => { navigator.clipboard.writeText(txt); toast.success("Copied"); };

  const demoForMode = STAFF_CREDENTIALS.filter((c) => c.role === mode);

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
              <p className="text-primary-foreground/80 text-sm mt-1">Dealer & Admin sign-in</p>
            </div>

            <CardContent className="p-6">
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="dealer">Dealer</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                <TabsContent value={mode}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">{mode === "dealer" ? "Dealer Code / Username" : "Admin Username"}</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                          placeholder={mode === "dealer" ? "DLR001" : "admin"} className="pl-9 h-11" autoComplete="username" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" className="pl-9 h-11" autoComplete="current-password" />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-cta">
                      {loading ? "Signing in..." : `Sign in as ${mode === "dealer" ? "Dealer" : "Admin"}`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo credentials panel */}
          <div className="mt-6 rounded-2xl border border-dashed border-accent/50 bg-accent/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-accent">Demo credentials</div>
                <div className="text-xs text-muted-foreground">For testing • Click a row to autofill</div>
              </div>
            </div>
            <div className="space-y-2">
              {demoForMode.map((c) => (
                <button key={c.username} type="button" onClick={() => useCred(c.username, c.password)}
                  className="w-full text-left rounded-lg border border-border/60 bg-card p-3 hover:border-primary hover:shadow-card transition-smooth">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      <div className="font-mono text-xs text-muted-foreground mt-0.5">
                        <span className="text-foreground">{c.username}</span>
                        <span className="mx-1.5 text-border">•</span>
                        <span>{c.password}</span>
                      </div>
                    </div>
                    <span onClick={(e) => { e.stopPropagation(); copy(`${c.username} / ${c.password}`); }}
                      className="text-muted-foreground hover:text-primary cursor-pointer">
                      <Copy className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffLogin;
