import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { products as catalog, Product } from "@/data/products";

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
  orders: Order[];
  placeOrder: (paymentId: string) => Order;
};

export type Order = {
  id: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  total: number;
  paymentId: string;
  date: string;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "msi.cart";
const ORDERS_KEY = "msi.orders";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }, [orders]);

  const add = (productId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { productId, qty }];
    });
  };
  const remove = (productId: string) => setItems((p) => p.filter((i) => i.productId !== productId));
  const updateQty = (productId: string, qty: number) =>
    setItems((p) => (qty <= 0 ? p.filter((i) => i.productId !== productId) : p.map((i) => (i.productId === productId ? { ...i, qty } : i))));
  const clear = () => setItems([]);

  const detailed = useMemo(
    () =>
      items
        .map((i) => {
          const product = catalog.find((p) => p.id === i.productId);
          return product ? { product, qty: i.qty } : null;
        })
        .filter(Boolean) as { product: Product; qty: number }[],
    [items]
  );

  const subtotal = detailed.reduce((s, x) => s + x.product.price * x.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const placeOrder = (paymentId: string): Order => {
    const order: Order = {
      id: `MSI-${Date.now()}`,
      items: detailed.map((d) => ({ productId: d.product.id, name: d.product.name.en, qty: d.qty, price: d.product.price })),
      total: subtotal,
      paymentId,
      date: new Date().toISOString(),
    };
    setOrders((p) => [order, ...p]);
    setItems([]);
    return order;
  };

  return (
    <CartContext.Provider value={{ items, count, subtotal, add, remove, updateQty, clear, detailed, orders, placeOrder }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
