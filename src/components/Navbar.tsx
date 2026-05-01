import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User as UserIcon, LogOut, Globe } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";

export const Navbar = () => {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/products", label: t("nav.products") },
    { to: "/about", label: t("nav.about") },
    ...(user?.role === "dealer" ? [{ to: "/dealer", label: t("nav.dealer") }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: t("nav.admin") }, { to: "/dealer", label: t("nav.dealer") }] : []),
  ];

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-smooth hover:text-primary ${isActive ? "text-primary" : "text-foreground/70"}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo className="h-10" />

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{lang.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("te")}>తెలుగు</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} aria-label="Cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1.5 bg-accent text-accent-foreground hover:bg-accent">
                {count}
              </Badge>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Profile">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs text-muted-foreground">{user.mobile}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>{t("nav.profile")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile?tab=orders")}>{t("nav.orders")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => setAuthOpen(true)} className="hidden sm:inline-flex bg-gradient-cta">
              {t("nav.login")}
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-base font-medium py-2 border-b border-border/50">
                    {l.label}
                  </Link>
                ))}
                {!user && (
                  <Button onClick={() => { setOpen(false); setAuthOpen(true); }} className="bg-gradient-cta mt-4">
                    {t("nav.login")}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
};
