import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Package } from "lucide-react";
import { formatINR } from "@/data/products";

const Profile = () => {
  const { user, logout } = useAuth();
  const { orders } = useCart();
  const { t } = useI18n();
  const [params] = useSearchParams();
  const tab = params.get("tab") === "orders" ? "orders" : "profile";

  if (!user) return <Navigate to="/" replace />;

  return (
    <SiteLayout>
      <section className="container py-12 max-w-4xl">
        <div className="rounded-2xl bg-gradient-hero p-8 text-primary-foreground shadow-elegant mb-8">
          <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
          <p className="text-primary-foreground/85 mt-1">{t("profile.mobile")}: +91 {user.mobile}</p>
        </div>

        <Tabs defaultValue={tab}>
          <TabsList>
            <TabsTrigger value="profile">{t("nav.profile")}</TabsTrigger>
            <TabsTrigger value="orders">{t("profile.orders")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("profile.mobile")}</div>
                <div className="text-lg font-semibold">+91 {user.mobile}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Name</div>
                <div className="text-lg font-semibold">{user.name || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Role</div>
                <div className="text-lg font-semibold capitalize">{user.role}</div>
              </div>
              <Button variant="outline" onClick={logout} className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                <Package className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">{t("profile.no_orders")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
                    <div className="flex flex-wrap justify-between gap-2 mb-3">
                      <div>
                        <div className="font-semibold">{o.id}</div>
                        <div className="text-xs text-muted-foreground">{new Date(o.date).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{formatINR(o.total)}</div>
                        <div className="text-xs text-muted-foreground">Payment: {o.paymentId}</div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 space-y-1 text-sm">
                      {o.items.map((it) => (
                        <div key={it.productId} className="flex justify-between">
                          <span>{it.name} × {it.qty}</span>
                          <span className="text-muted-foreground">{formatINR(it.price * it.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
};

export default Profile;
