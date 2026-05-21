import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/contexts/I18nContext";
import { useState, useEffect } from "react";
import { productService, Product as APIProduct } from "@/services/product.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import productMotorRobo from "@/assets/product-motor-robo.jpg";
import productAntiScaling from "@/assets/product-anti-scaling.jpg";
import productSubmersible from "@/assets/product-submersible.jpg";
import productSensor from "@/assets/product-sensor.jpg";

// Static images array - use these for all products
const staticImages = [
  productMotorRobo,
  productAntiScaling,
  productSubmersible,
  productSensor,
];

// Transform API product to match local Product type
const transformProduct = (apiProduct: APIProduct, index: number) => ({
  id: apiProduct._id,
  name: apiProduct.name,
  tagline: { en: apiProduct.category, te: apiProduct.category },
  description: apiProduct.description,
  price: apiProduct.basePrice,
  image: staticImages[index % staticImages.length],
});

const Products = () => {
  const { t } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page,
        limit: 12,
        search: search || undefined,
      });
      setProducts(response.data.map((product, index) => transformProduct(product, index)));
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold">{t("products.title")}</h1>
          <p className="mt-3 text-primary-foreground/85 max-w-xl">{t("products.sub")}</p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-white/90"
            />
            <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
      <section className="container py-12">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
};

export default Products;
