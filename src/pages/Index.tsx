import { SiteLayout } from "@/components/SiteLayout";
import { HeroCarousel, FeatureStrip } from "@/components/Hero";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/contexts/I18nContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <HeroCarousel />
      <FeatureStrip />

      <section className="container pb-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{t("products.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("products.sub")}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/products">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-primary-foreground shadow-elegant">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold">Become a Dealer</h2>
            <p className="mt-3 text-primary-foreground/85">Join our growing network of dealers across India. Get exclusive pricing, training, and dedicated support.</p>
            <Button asChild size="lg" className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/dealer">Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
