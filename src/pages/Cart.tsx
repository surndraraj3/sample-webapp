import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from "lucide-react";
import { formatINR } from "@/data/products";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";

const Cart = () => {
  const { detailed, subtotal, updateQty, remove, clear, loading } = useCart();
  const { isAuthed, user } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const startPayment = async () => {
    if (!isAuthed) { setAuthOpen(true); return; }
    setPaying(true);

    try {
      // Prepare order items with all required fields
      const orderItems = detailed.map(d => {
        const unitPrice = d.product.price;
        const quantity = d.qty;
        const taxRate = 18; // GST 18%
        const lineTotal = unitPrice * quantity; // Subtotal WITHOUT tax
        const taxAmount = (lineTotal * taxRate) / 100;

        return {
          productId: d.product.id,
          productName: typeof d.product.name === 'string' ? d.product.name : d.product.name?.en || 'Product',
          quantity: quantity,
          unitPrice: unitPrice,
          taxRate: taxRate,
          taxAmount: taxAmount,
          lineTotal: lineTotal  // Without tax
        };
      });

      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const totalTax = orderItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const grandTotal = subtotal + totalTax;

      // Create order via API first
      const orderData = {
        orderType: "retail",
        items: orderItems,
        customerName: user?.name || "Customer",
        customerPhone: user?.mobile || "9999999999",
        shippingAddress: {
          line1: user?.address || "Customer Address",
          city: user?.city || "Hyderabad",
          state: "Telangana",
          pincode: "500001"
        },
        subtotal: subtotal,
        totalTax: totalTax,
        grandTotal: grandTotal,
        paymentMethod: "upi",
        notes: "Customer order from web"
      };

      const orderResponse = await orderService.createOrder(orderData);
      const createdOrder = orderResponse.data.order;  // Fix: order is nested inside data

      // Create payment for the order
      const paymentResponse = await paymentService.createPayment({
        orderId: createdOrder._id,
        amount: createdOrder.grandTotal,
        paymentMethod: "upi",  // Valid: upi, netbanking, card, wallet, credit, cod
        paymentGateway: "razorpay"
      });

      // Razorpay integration
      const RAZORPAY_KEY = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
      if (RAZORPAY_KEY && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay({
          key: RAZORPAY_KEY,
          amount: createdOrder.grandTotal * 100,
          currency: "INR",
          name: "MSI Innovations",
          description: `Order ${createdOrder.orderNumber}`,
          order_id: paymentResponse.data.razorpayOrder?.id,
          handler: async (res: any) => {
            try {
              // Verify payment
              await paymentService.verifyPayment({
                transactionId: paymentResponse.data._id,
                razorpayOrderId: res.razorpay_order_id,
                razorpayPaymentId: res.razorpay_payment_id,
                razorpaySignature: res.razorpay_signature
              });
              clear();
              toast.success(`Payment successful • ${createdOrder.orderNumber}`);
              navigate("/profile?tab=orders");
            } catch (error) {
              toast.error("Payment verification failed");
            }
          },
          theme: {
            color: "#1565d8"
          },
        });
        rzp.open();
        setPaying(false);
      } else {
        // Mock payment for demo
        await new Promise((r) => setTimeout(r, 900));
        clear();
        toast.success(`Payment successful (demo) • ${createdOrder.orderNumber}`);
        setPaying(false);
        navigate("/profile?tab=orders");
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to place order');
      setPaying(false);
    }
  };

  // Show loading state while fetching products
  if (loading) {
    return (
      <SiteLayout>
        <section className="container py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary animate-pulse">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Loading cart...</h1>
        </section>
      </SiteLayout>
    );
  }

  if (detailed.length === 0) {
    return (
      <SiteLayout>
        <section className="container py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">{t("cart.empty")}</h1>
          <Button asChild className="mt-6 bg-gradient-cta">
            <Link to="/products">{t("cart.continue")}</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{t("cart.title")}</h1>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {detailed.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
                <img src={product.image} alt={product.name.en} className="h-24 w-24 rounded-xl object-cover" loading="lazy" width={200} height={200} />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name[lang]}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.tagline[lang]}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(product.id, qty - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center font-medium">{qty}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(product.id, qty + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <div className="font-semibold text-primary">{formatINR(product.price * qty)}</div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(product.id)} aria-label={t("cart.remove")}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <aside className="rounded-2xl border border-border/60 bg-card p-6 shadow-card h-fit sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>{t("cart.subtotal")}</span><span className="font-medium">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Free</span></div>
            </div>
            <div className="my-4 h-px bg-border" />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{formatINR(subtotal)}</span></div>
            <Button onClick={startPayment} disabled={paying} className="mt-6 w-full h-12 bg-gradient-cta">
              {paying ? "Processing..." : t("cart.checkout")}
            </Button>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Secure checkout via Razorpay
            </div>
          </aside>
        </div>
      </section>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} onSuccess={startPayment} />
    </SiteLayout>
  );
};

export default Cart;
