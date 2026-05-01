import { Product, formatINR } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const { t, lang } = useI18n();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product.id);
    setAdded(true);
    toast.success(`${product.name[lang]} ${t("products.added")}`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <img
          src={product.image}
          alt={product.name.en}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-soft">
          MSI
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-tight">{product.name[lang]}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.tagline[lang]}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-primary">{formatINR(product.price)}</div>
            <div className="text-xs text-muted-foreground">incl. all taxes</div>
          </div>
        </div>
        <Button onClick={handleAdd} className="mt-4 w-full bg-gradient-cta" disabled={added}>
          {added ? (<><Check className="mr-2 h-4 w-4" /> {t("products.added")}</>) : (<><ShoppingCart className="mr-2 h-4 w-4" /> {t("products.add")}</>)}
        </Button>
      </div>
    </article>
  );
};
