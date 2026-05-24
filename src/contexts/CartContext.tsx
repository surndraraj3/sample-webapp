import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Product } from "@/data/products";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { useAuth } from "./AuthContext";
import productMotorRobo from "@/assets/product-motor-robo.jpg";
import productAntiScaling from "@/assets/product-anti-scaling.jpg";
import productSubmersible from "@/assets/product-submersible.jpg";
import productSensor from "@/assets/product-sensor.jpg";

const staticImages = [productMotorRobo, productAntiScaling, productSubmersible, productSensor];

export type CartItem = { productId: string; qty: number };

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  detailed: { product: Product; qty: number }[];
  loading: boolean;
};

const CartContext = createContext<Ctx | null>(null);
const GUEST_CART_KEY = "msi.guest.cart"; // Temporary storage for guests

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthed } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  // Helper to check if user has a valid API token
  const hasValidToken = () => {
    return !!localStorage.getItem("msi.accessToken");
  };

  // Load cart from API when user is authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthed || !hasValidToken()) {
        // Load guest cart from localStorage
        const guestCart = localStorage.getItem(GUEST_CART_KEY);
        if (guestCart) {
          const guestItems: CartItem[] = JSON.parse(guestCart);
          setItems(guestItems);

          // Fetch product details for guest cart items
          try {
            const newMap = new Map<string, Product>();
            for (let i = 0; i < guestItems.length; i++) {
              const item = guestItems[i];
              try {
                const response = await productService.getProductById(item.productId);
                const apiProduct = response.data;
                newMap.set(item.productId, {
                  id: apiProduct._id,
                  name: apiProduct.name,
                  tagline: { en: apiProduct.category, te: apiProduct.category },
                  description: apiProduct.description.en,
                  price: apiProduct.basePrice,
                  image: staticImages[i % staticImages.length],
                });
              } catch (error) {
                console.error(`Failed to fetch product ${item.productId}:`, error);
              }
            }
            setProductsMap(newMap);
          } catch (error) {
            console.error("Failed to load guest cart products:", error);
          }
        }
        return;
      }

      try {
        setLoading(true);

        // Check if we have a guest cart to sync
        const guestCart = localStorage.getItem(GUEST_CART_KEY);
        if (guestCart && !synced) {
          const guestItems = JSON.parse(guestCart);
          if (guestItems.length > 0) {
            // Sync guest cart to API
            await cartService.syncCart({ items: guestItems });
            localStorage.removeItem(GUEST_CART_KEY);
          }
          setSynced(true);
        }

        // Fetch cart from API
        const response = await cartService.getCart();
        const apiItems = response.data.items.map((item) => ({
          productId: item.productId._id,
          qty: item.quantity,
        }));
        setItems(apiItems);

        // Build products map from API response
        const newMap = new Map<string, Product>();
        response.data.items.forEach((item, index) => {
          const product: Product = {
            id: item.productId._id,
            name: item.productId.name,
            tagline: { en: item.productId.category, te: item.productId.category },
            description: item.productId.description,
            price: item.productId.basePrice,
            image: staticImages[index % staticImages.length],
          };
          newMap.set(item.productId._id, product);
        });
        setProductsMap(newMap);
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthed]);

  // Save guest cart to localStorage when not authenticated or no token
  useEffect(() => {
    if ((!isAuthed || !hasValidToken()) && items.length > 0) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  }, [items, isAuthed]);

  const add = async (productId: string, qty = 1) => {
    // Optimistically update UI
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { productId, qty }];
    });

    // Sync with API if authenticated and has token
    if (isAuthed && hasValidToken()) {
      try {
        const response = await cartService.addItem({ productId, quantity: qty });
        const apiItems = response.data.items.map((item) => ({
          productId: item.productId._id,
          qty: item.quantity,
        }));
        setItems(apiItems);

        // Update products map
        const newMap = new Map(productsMap);
        response.data.items.forEach((item, index) => {
          if (!newMap.has(item.productId._id)) {
            newMap.set(item.productId._id, {
              id: item.productId._id,
              name: item.productId.name,
              tagline: { en: item.productId.category, te: item.productId.category },
              description: item.productId.description,
              price: item.productId.basePrice,
              image: staticImages[index % staticImages.length],
            });
          }
        });
        setProductsMap(newMap);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        // Revert optimistic update on error
        setItems((prev) => prev.filter((i) => i.productId !== productId || i.qty > qty));
      }
    } else {
      // Guest user: fetch product details if not already in map
      if (!productsMap.has(productId)) {
        try {
          const response = await productService.getProductById(productId);
          const apiProduct = response.data;
          const product: Product = {
            id: apiProduct._id,
            name: apiProduct.name,
            tagline: { en: apiProduct.category, te: apiProduct.category },
            description: apiProduct.description.en,
            price: apiProduct.basePrice,
            image: staticImages[productsMap.size % staticImages.length],
          };
          setProductsMap(new Map(productsMap.set(productId, product)));
        } catch (error) {
          console.error("Failed to fetch product details:", error);
          // Revert optimistic update on error
          setItems((prev) => prev.filter((i) => i.productId !== productId));
        }
      }
    }
  };

  const remove = async (productId: string) => {
    // Optimistically update UI
    const previousItems = [...items];
    setItems((p) => p.filter((i) => i.productId !== productId));

    // Sync with API if authenticated and has token
    if (isAuthed && hasValidToken()) {
      try {
        await cartService.removeItem(productId);
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        setItems(previousItems);
      }
    }
  };

  const updateQty = async (productId: string, qty: number) => {
    // Optimistically update UI
    const previousItems = [...items];
    if (qty <= 0) {
      setItems((p) => p.filter((i) => i.productId !== productId));
    } else {
      setItems((p) => p.map((i) => (i.productId === productId ? { ...i, qty } : i)));
    }

    // Sync with API if authenticated and has token
    if (isAuthed && hasValidToken()) {
      try {
        await cartService.updateItem(productId, { quantity: qty });
      } catch (error) {
        console.error("Failed to update cart item:", error);
        setItems(previousItems);
      }
    }
  };

  const clear = async () => {
    // Optimistically update UI
    const previousItems = [...items];
    setItems([]);

    // Sync with API if authenticated and has token
    if (isAuthed && hasValidToken()) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error("Failed to clear cart:", error);
        setItems(previousItems);
      }
    } else {
      // Clear guest cart
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  const detailed = useMemo(
    () =>
      items
        .map((i) => {
          const product = productsMap.get(i.productId);
          return product ? { product, qty: i.qty } : null;
        })
        .filter(Boolean) as { product: Product; qty: number }[],
    [items, productsMap]
  );

  const subtotal = detailed.reduce((s, x) => s + x.product.price * x.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, add, remove, updateQty, clear, detailed, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
