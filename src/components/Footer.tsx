import { Logo } from "./Logo";
import { useI18n } from "@/contexts/I18nContext";
import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-20">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Logo className="h-12" />
          <p className="text-sm text-muted-foreground italic">{t("footer.tag")}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/products" className="hover:text-primary transition-smooth">{t("nav.products")}</a></li>
            <li><a href="/about" className="hover:text-primary transition-smooth">{t("nav.about")}</a></li>
            <li><a href="/dealer" className="hover:text-primary transition-smooth">{t("nav.dealer")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> support@msiinnovations.in</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Hyderabad, India</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Newsletter</h4>
          <p className="text-sm text-muted-foreground">Tips for farmers, in Telugu & English.</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MSI Innovations. {t("footer.rights")}
      </div>
    </footer>
  );
};
