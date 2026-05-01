import { SiteLayout } from "@/components/SiteLayout";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/contexts/I18nContext";

const Products = () => {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold">{t("products.title")}</h1>
          <p className="mt-3 text-primary-foreground/85 max-w-xl">{t("products.sub")}</p>
        </div>
      </section>
      <section className="container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Products;
