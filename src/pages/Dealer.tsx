import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, Boxes, Package, ClipboardList, Wrench, IndianRupee, Plus, UserPlus, MessageSquarePlus,
  TrendingUp, ShoppingCart, Truck, FileText, CreditCard, Download, Bell, Video, Image as ImageIcon,
  Phone, Mail, Search, Filter, Eye, ExternalLink, AlertCircle, CheckCircle, Calendar, MapPin,
  DollarSign, Package2, Users, BarChart3, Activity, ArrowUpRight, ArrowDownRight, Star, Zap,
  FileSpreadsheet, Receipt, Wallet, Send, Upload, PlayCircle, HelpCircle, MessageCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR, products } from "@/data/products";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { customerService } from "@/services/customer.service";
import { ticketService } from "@/services/ticket.service";
import productMotorRobo from "@/assets/product-motor-robo.jpg";
import productAntiScaling from "@/assets/product-anti-scaling.jpg";
import productSubmersible from "@/assets/product-submersible.jpg";
import productSensor from "@/assets/product-sensor.jpg";

const staticImages = [productMotorRobo, productAntiScaling, productSubmersible, productSensor];
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

// Type Definitions
type Tab = "dashboard" | "inventory" | "orders" | "crm" | "payments" | "marketing" | "notifications";

type DealerStock = {
  id: string;
  name: string;
  price: number;
  localStock: number;
  parentStock: number;
  minStock: number;
  category: string;
  image: string;
};

type DealerOrder = {
  id: string;
  products: { id: string; name: string; qty: number; price: number }[];
  total: number;
  gst: number;
  grandTotal: number;
  status: "Pending" | "Approved" | "Shipped" | "Delivered";
  date: string;
  trackingId?: string;
  courier?: string;
  eta?: string;
  shippingStatus?: string;
  invoiceId?: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  totalPurchases: number;
  lastPurchase?: string;
  warranties: Warranty[];
};

type Warranty = {
  id: string;
  productName: string;
  serialNumber: string;
  purchaseDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Claimed";
};

type ServiceRequest = {
  id: string;
  customerId: string;
  customerName: string;
  type: "Complaint" | "Warranty Claim" | "Installation" | "Repair";
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  date: string;
  resolvedDate?: string;
};

type PaymentTransaction = {
  id: string;
  type: "Payment" | "Order" | "Commission";
  amount: number;
  date: string;
  method: "UPI" | "Net Banking" | "Credit" | "Cash";
  status: "Success" | "Pending" | "Failed";
  orderId?: string;
  reference?: string;
};

type CreditInfo = {
  totalLimit: number;
  outstanding: number;
  available: number;
};

type PromotionalAsset = {
  id: string;
  title: string;
  type: "Poster" | "Video" | "Brochure";
  category: "Product" | "Seasonal" | "Scheme";
  thumbnail: string;
  downloadUrl: string;
  date: string;
};

type TrainingResource = {
  id: string;
  title: string;
  category: "Installation" | "Troubleshooting" | "Repair" | "Product Features";
  duration: string;
  thumbnail: string;
  videoUrl: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "Promo" | "Alert" | "Update" | "Scheme";
  date: string;
  read: boolean;
};

// Type Definitions

// Chart Data
const salesTrendData = [
  { month: "Nov", sales: 285000, target: 300000 },
  { month: "Dec", sales: 420000, target: 400000 },
  { month: "Jan", sales: 365000, target: 380000 },
  { month: "Feb", sales: 510000, target: 450000 },
  { month: "Mar", sales: 585000, target: 520000 },
  { month: "Apr", sales: 642000, target: 600000 },
];

const commissionData = [
  { month: "Nov", commission: 14250 },
  { month: "Dec", commission: 21000 },
  { month: "Jan", commission: 18250 },
  { month: "Feb", commission: 25500 },
  { month: "Mar", commission: 29250 },
  { month: "Apr", commission: 32100 },
];

const Dealer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);

  // State Management
  const [stock, setStock] = useState<DealerStock[]>([]);
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [creditInfo, setCreditInfo] = useState<CreditInfo>({
    totalLimit: 500000,
    outstanding: 221250,
    available: 278750,
  });
  const [promotionalAssets] = useState<PromotionalAsset[]>([]);
  const [trainingResources] = useState<TrainingResource[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Dialog States
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [warrantyDialogOpen, setWarrantyDialogOpen] = useState(false);

  // Form States
  const [orderCart, setOrderCart] = useState<{ id: string; qty: number }[]>([]);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [newServiceRequest, setNewServiceRequest] = useState({ customerId: "", type: "Complaint" as const, description: "", priority: "Medium" as const });
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "UPI" as const, orderId: "" });
  const [selectedTracking, setSelectedTracking] = useState<DealerOrder | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<DealerOrder | null>(null);
  const [warrantySearch, setWarrantySearch] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  // Load customers when CRM tab is activated or service dialog opened
  useEffect(() => {
    if ((activeTab === "crm" || serviceDialogOpen) && customers.length === 0) {
      loadCustomers();
    }
  }, [activeTab, serviceDialogOpen]);

  const loadCustomers = async () => {
    try {
      const customersResponse = await customerService.getCustomers({ limit: 100 });
      console.log('Customers API response:', customersResponse);
      if (customersResponse && customersResponse.data) {
        setCustomers(customersResponse.data.map(c => ({
          id: c._id,
          name: c.name,
          phone: c.mobile,
          email: c.email || "",
          address: c.address || "",
          city: c.city || "",
          totalPurchases: 0,
          warranties: [],
        })));
        console.log('Customers loaded:', customersResponse.data.length);
      }
    } catch (error: any) {
      console.error('Failed to load customers:', error);
      console.error('Customer error details:', error.response?.data);
      toast.error('Failed to load customers');
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Load products/stock from API
      const productsResponse = await productService.getProducts({ limit: 100 });
      setStock(productsResponse.data.map((p, i) => ({
        id: p._id,
        name: p.name.en,
        price: p.dealerPrice,
        localStock: Math.floor(Math.random() * 20),
        parentStock: p.inventory?.currentStock || 0,
        minStock: p.minStockLevel || 10,
        category: p.category,
        image: staticImages[i % staticImages.length]
      })));

      // Load orders from API
      const ordersResponse = await orderService.getOrders({ limit: 100 });
      setOrders(ordersResponse.data.map(o => ({
        id: o._id,
        products: o.items.map(item => ({
          id: item.productId?._id || item.productId,
          name: item.productName || item.productId?.name?.en || 'Product',
          qty: item.quantity,
          price: item.unitPrice
        })),
        total: o.subtotal,
        gst: o.totalTax,
        grandTotal: o.grandTotal,
        status: o.status as "Pending" | "Approved" | "Shipped" | "Delivered",
        date: new Date(o.createdAt).toISOString().split('T')[0],
        trackingId: o.orderNumber
      })));

      // Load payments from API
      const paymentsResponse = await paymentService.getPayments({ limit: 50 });
      setTransactions(paymentsResponse.data.map(p => ({
        id: p.transactionId,
        type: "Payment" as const,
        amount: p.amount,
        date: new Date(p.createdAt).toISOString().split('T')[0],
        method: p.paymentMethod as "UPI" | "Net Banking" | "Credit" | "Cash",
        status: p.paymentStatus === "PAID" ? "Success" : p.paymentStatus === "PENDING" ? "Pending" : "Failed" as "Success" | "Pending" | "Failed",
        orderId: p.orderId?._id
      })));

      // Load customers from API
      await loadCustomers();

    } catch (error: any) {
      console.error('Failed to load dealer data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalLocalStock = stock.reduce((sum, item) => sum + item.localStock, 0);
  const lowStockItems = stock.filter(item => item.localStock < item.minStock);
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Approved");
  const activeServiceRequests = serviceRequests.filter(s => s.status === "Open" || s.status === "In Progress");
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const currentMonthSales = salesTrendData[salesTrendData.length - 1].sales;
  const currentMonthCommission = commissionData[commissionData.length - 1].commission;

  // Handlers
  const addToCart = (productId: string) => {
    const existing = orderCart.find(item => item.id === productId);
    if (existing) {
      setOrderCart(orderCart.map(item =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setOrderCart([...orderCart, { id: productId, qty: 1 }]);
    }
    toast.success("Added to cart");
  };

  const removeFromCart = (productId: string) => {
    setOrderCart(orderCart.filter(item => item.id !== productId));
    toast.success("Removed from cart");
  };

  const updateCartQty = (productId: string, qty: number) => {
    setOrderCart(orderCart.map(item =>
      item.id === productId ? { ...item, qty: Math.max(1, qty) } : item
    ));
  };

  const placeOrder = async () => {
    if (orderCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      // Prepare order items with all required fields
      const orderItems = orderCart.map(item => {
        const product = stock.find(p => p.id === item.id)!;
        const unitPrice = product.price;
        const quantity = item.qty;
        const taxRate = 18; // GST 18%
        const taxAmount = (unitPrice * quantity * taxRate) / 100;
        const lineTotal = (unitPrice * quantity) + taxAmount;

        return {
          productId: product.id,
          productName: typeof product.name === 'string' ? product.name : product.name?.en || 'Product',
          quantity: quantity,
          unitPrice: unitPrice,
          taxRate: taxRate,
          taxAmount: taxAmount,
          lineTotal: lineTotal
        };
      });

      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const totalTax = orderItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const grandTotal = subtotal + totalTax;

      // Create order via API
      const orderData = {
        orderType: "dealer",
        items: orderItems,
        customerName: user?.name || user?.dealerInfo?.businessName || "Dealer",
        customerPhone: user?.mobile || "9999999999",
        shippingAddress: {
          line1: "Dealer Address",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500001"
        },
        subtotal: subtotal,
        totalTax: totalTax,
        grandTotal: grandTotal,
        paymentMethod: "credit_terms",
        notes: "Dealer bulk order"
      };

      const response = await orderService.createOrder(orderData);

      // Reload orders to show the new one
      const ordersResponse = await orderService.getOrders({ limit: 100 });
      setOrders(ordersResponse.data.map(o => ({
        id: o._id,
        products: o.items.map(item => ({
          id: item.productId?._id || item.productId,
          name: item.productName || item.productId?.name?.en || 'Product',
          qty: item.quantity,
          price: item.unitPrice
        })),
        total: o.subtotal,
        gst: o.totalTax,
        grandTotal: o.grandTotal,
        status: o.status as "Pending" | "Approved" | "Shipped" | "Delivered",
        date: new Date(o.createdAt).toISOString().split('T')[0],
        trackingId: o.orderNumber
      })));

      setOrderCart([]);
      setOrderDialogOpen(false);
      toast.success(`Order ${response.data.orderNumber} placed successfully! Total: ${formatINR(response.data.grandTotal)}`);
    } catch (error: any) {
      console.error('Failed to place order:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to place order');
    }
  };

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.city) {
      toast.error("Name, phone, and city are required");
      return;
    }

    if (!/^\d{10}$/.test(newCustomer.phone)) {
      toast.error("Phone must be 10 digits");
      return;
    }

    try {
      const response = await customerService.createCustomer({
        name: newCustomer.name,
        mobile: newCustomer.phone,
        email: newCustomer.email || undefined,
        address: newCustomer.address || undefined,
        city: newCustomer.city,
      });

      if (response.success) {
        // Reload customers from API to ensure we have the latest data
        await loadCustomers();
        setNewCustomer({ name: "", phone: "", email: "", address: "", city: "" });
        setCustomerDialogOpen(false);
        toast.success(`Customer ${response.data.customer.name} added successfully!`);
      }
    } catch (error: any) {
      console.error("Error adding customer:", error);
      toast.error(error.response?.data?.message || "Failed to add customer");
    }
  };

  const addServiceRequest = async () => {
    if (!newServiceRequest.customerId || !newServiceRequest.description) {
      toast.error("Customer and description are required");
      return;
    }

    const customer = customers.find(c => c.id === newServiceRequest.customerId);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }

    try {
      // Map form values to API format
      const typeMap: Record<string, "complaint" | "warranty" | "query" | "return" | "installation" | "repair"> = {
        "Complaint": "complaint",
        "Warranty Claim": "warranty",
        "Installation": "installation",
        "Repair": "repair",
      };

      const priorityMap: Record<string, "low" | "medium" | "high" | "critical"> = {
        "Low": "low",
        "Medium": "medium",
        "High": "high",
      };

      const response = await ticketService.createTicket({
        type: typeMap[newServiceRequest.type] || "complaint",
        subject: `${newServiceRequest.type} - ${customer.name}`,
        description: newServiceRequest.description,
        priority: priorityMap[newServiceRequest.priority] || "medium",
        customerId: newServiceRequest.customerId, // Pass the actual customer ID
      });

      if (response.success) {
        // Add the new service request to the local list
        const newRequest: ServiceRequest = {
          id: response.data.ticketNumber,
          customerId: newServiceRequest.customerId,
          customerName: customer.name,
          type: newServiceRequest.type,
          description: newServiceRequest.description,
          priority: newServiceRequest.priority,
          status: response.data.status === "open" ? "Open" : "Closed",
          date: new Date().toISOString().slice(0, 10),
        };

        setServiceRequests([newRequest, ...serviceRequests]);
        setNewServiceRequest({ customerId: "", type: "Complaint" as const, description: "", priority: "Medium" as const });
        setServiceDialogOpen(false);
        toast.success("Service request created successfully!");
      }
    } catch (error: any) {
      console.error("Error creating service request:", error);
      toast.error(error.response?.data?.message || "Failed to create service request");
    }
  };

  const makePayment = () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    const amount = parseFloat(paymentForm.amount);

    const transaction: PaymentTransaction = {
      id: `TXN-${Math.floor(5000 + Math.random() * 5000)}`,
      type: "Payment",
      amount,
      date: new Date().toISOString().slice(0, 10),
      method: paymentForm.method,
      status: "Success",
      orderId: paymentForm.orderId || undefined,
      reference: `${paymentForm.method}${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setTransactions([transaction, ...transactions]);
    setCreditInfo(prev => ({
      ...prev,
      outstanding: Math.max(0, prev.outstanding - amount),
      available: Math.min(prev.totalLimit, prev.available + amount),
    }));

    setPaymentForm({ amount: "", method: "UPI", orderId: "" });
    setPaymentDialogOpen(false);
    toast.success(`Payment of ${formatINR(amount)} successful!`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  return (
    <SiteLayout>
      <div className="container py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dealer Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.name || "Dealer Portal"} • Code: {user?.code || "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge className="ml-2 h-5 min-w-5 rounded-full px-1.5 bg-red-500 text-white">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-4">
          <Select value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </div>
              </SelectItem>
              <SelectItem value="inventory">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4" />
                  Inventory
                </div>
              </SelectItem>
              <SelectItem value="orders">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </div>
              </SelectItem>
              <SelectItem value="crm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  CRM
                </div>
              </SelectItem>
              <SelectItem value="payments">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Payments
                </div>
              </SelectItem>
              <SelectItem value="marketing">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Marketing
                </div>
              </SelectItem>
              <SelectItem value="notifications">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop/Mobile Layout */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-20 self-start">
            <Card className="shadow-card">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <nav className="p-2">
                  {[
                    { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
                    { id: "inventory" as Tab, label: "Inventory", icon: Boxes },
                    { id: "orders" as Tab, label: "Orders", icon: ShoppingCart },
                    { id: "crm" as Tab, label: "CRM", icon: Users },
                    { id: "payments" as Tab, label: "Payments", icon: Wallet },
                    { id: "marketing" as Tab, label: "Marketing", icon: Star },
                    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    const badge = item.id === "notifications" ? unreadNotifications :
                      item.id === "orders" ? pendingOrders.length :
                        item.id === "crm" ? activeServiceRequests.length : 0;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                          active
                            ? "bg-gradient-cta text-primary-foreground shadow-soft"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </div>
                        {badge > 0 && (
                          <Badge variant={active ? "secondary" : "default"} className="h-5 min-w-5 rounded-full px-1.5">
                            {badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="min-w-0">
            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <DashboardTab
                stock={stock}
                orders={orders}
                serviceRequests={serviceRequests}
                creditInfo={creditInfo}
                lowStockItems={lowStockItems}
                currentMonthSales={currentMonthSales}
                currentMonthCommission={currentMonthCommission}
                salesTrendData={salesTrendData}
                commissionData={commissionData}
              />
            )}

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <InventoryTab
                stock={stock}
                lowStockItems={lowStockItems}
                addToCart={addToCart}
              />
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                orderCart={orderCart}
                orderDialogOpen={orderDialogOpen}
                setOrderDialogOpen={setOrderDialogOpen}
                setSelectedTracking={setSelectedTracking}
                setTrackingDialogOpen={setTrackingDialogOpen}
                setSelectedInvoice={setSelectedInvoice}
                setInvoiceDialogOpen={setInvoiceDialogOpen}
                stock={stock}
                removeFromCart={removeFromCart}
                updateCartQty={updateCartQty}
                placeOrder={placeOrder}
              />
            )}

            {/* CRM TAB */}
            {activeTab === "crm" && (
              <CRMTab
                customers={customers}
                serviceRequests={serviceRequests}
                setServiceRequests={setServiceRequests}
                customerDialogOpen={customerDialogOpen}
                setCustomerDialogOpen={setCustomerDialogOpen}
                serviceDialogOpen={serviceDialogOpen}
                setServiceDialogOpen={setServiceDialogOpen}
                warrantyDialogOpen={warrantyDialogOpen}
                setWarrantyDialogOpen={setWarrantyDialogOpen}
                newCustomer={newCustomer}
                setNewCustomer={setNewCustomer}
                newServiceRequest={newServiceRequest}
                setNewServiceRequest={setNewServiceRequest}
                warrantySearch={warrantySearch}
                setWarrantySearch={setWarrantySearch}
                addCustomer={addCustomer}
                addServiceRequest={addServiceRequest}
              />
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <PaymentsTab
                creditInfo={creditInfo}
                transactions={transactions}
                orders={orders}
                paymentDialogOpen={paymentDialogOpen}
                setPaymentDialogOpen={setPaymentDialogOpen}
                paymentForm={paymentForm}
                setPaymentForm={setPaymentForm}
                makePayment={makePayment}
              />
            )}

            {/* MARKETING TAB */}
            {activeTab === "marketing" && (
              <MarketingTab
                promotionalAssets={promotionalAssets}
                trainingResources={trainingResources}
              />
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <NotificationsTab
                notifications={notifications}
                markNotificationRead={markNotificationRead}
                markAllNotificationsRead={markAllNotificationsRead}
              />
            )}
          </div>
        </div>

        {/* Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shipping Tracking - {selectedTracking?.id}</DialogTitle>
              <DialogDescription>Track your order shipment in real-time</DialogDescription>
            </DialogHeader>
            {selectedTracking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tracking ID</Label>
                    <p className="font-mono font-semibold">{selectedTracking.trackingId || "Not assigned yet"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Courier</Label>
                    <p className="font-semibold">{selectedTracking.courier || "Not assigned yet"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge>{selectedTracking.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ETA</Label>
                    <p className="font-semibold">{selectedTracking.eta || "Calculating..."}</p>
                  </div>
                </div>

                {selectedTracking.shippingStatus && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Truck className="h-5 w-5" />
                        <span className="font-medium">{selectedTracking.shippingStatus}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Order Details</Label>
                  <div className="space-y-2">
                    {selectedTracking.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>{product.name} × {product.qty}</span>
                        <span className="font-semibold">{formatINR(product.price * product.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Grand Total (incl. GST)</span>
                    <span>{formatINR(selectedTracking.grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>Close</Button>
              {selectedTracking?.trackingId && (
                <Button
                  onClick={() => {
                    window.open(`https://www.google.com/search?q=${selectedTracking.trackingId}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track on Courier Website
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice - {selectedInvoice?.invoiceId || selectedInvoice?.id}</DialogTitle>
              <DialogDescription>Download or view your invoice</DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Invoice Number:</span>
                    <span className="font-mono font-semibold">{selectedInvoice.invoiceId || selectedInvoice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Invoice Date:</span>
                    <span className="font-semibold">{selectedInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Due Date:</span>
                    <span className="font-semibold">{new Date(new Date(selectedInvoice.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.products.map((product, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">{product.qty}</TableCell>
                          <TableCell className="text-right">{formatINR(product.price)}</TableCell>
                          <TableCell className="text-right">{formatINR(product.price * product.qty)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatINR(selectedInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%):</span>
                    <span>{formatINR(selectedInvoice.gst)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Grand Total:</span>
                    <span>{formatINR(selectedInvoice.grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>Close</Button>
              <Button onClick={() => toast.success("Invoice downloaded!")}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SiteLayout>
  );
};

// Dashboard Tab Component
const DashboardTab = ({
  stock, orders, serviceRequests, creditInfo, lowStockItems,
  currentMonthSales, currentMonthCommission, salesTrendData, commissionData
}: any) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-card">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12%
            </Badge>
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">MTD Sales</div>
          <div className="text-xl md:text-2xl font-bold">{formatINR(currentMonthSales)}</div>
          <p className="text-xs text-muted-foreground mt-1">Target: ₹6.00L</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground">
              <IndianRupee className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              5%
            </Badge>
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Commission</div>
          <div className="text-xl md:text-2xl font-bold">{formatINR(currentMonthCommission)}</div>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground">
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            {orders.filter((o: any) => o.status === "Pending").length > 0 && (
              <Badge variant="destructive">{orders.filter((o: any) => o.status === "Pending").length} Pending</Badge>
            )}
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Orders</div>
          <div className="text-xl md:text-2xl font-bold">{orders.length}</div>
          <p className="text-xs text-muted-foreground mt-1">{orders.filter((o: any) => o.status === "Delivered").length} delivered</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground">
              <Boxes className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            {lowStockItems.length > 0 && (
              <Badge variant="destructive">{lowStockItems.length} Low</Badge>
            )}
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Stock Status</div>
          <div className="text-xl md:text-2xl font-bold">{stock.reduce((sum: number, item: any) => sum + item.localStock, 0)} units</div>
          <p className="text-xs text-muted-foreground mt-1">{stock.length} products</p>
        </CardContent>
      </Card>
    </div>

    {/* Charts Row */}
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sales Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesTrendData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: any) => formatINR(value)}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
              <Area type="monotone" dataKey="target" stroke="#f59e0b" fillOpacity={0} strokeDasharray="5 5" name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <IndianRupee className="h-5 w-5 text-primary" />
            Commission Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={commissionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: any) => formatINR(value)}
              />
              <Legend />
              <Bar dataKey="commission" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Commission" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Credit & Alerts */}
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Credit Limit Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Credit Limit</span>
              <span className="font-semibold">{formatINR(creditInfo.totalLimit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Outstanding</span>
              <span className="font-semibold text-orange-600">{formatINR(creditInfo.outstanding)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-semibold text-green-600">{formatINR(creditInfo.available)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Credit Utilization</span>
              <span>{Math.round((creditInfo.outstanding / creditInfo.totalLimit) * 100)}%</span>
            </div>
            <Progress
              value={(creditInfo.outstanding / creditInfo.totalLimit) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <AlertCircle className="h-5 w-5 text-primary" />
            Alerts & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lowStockItems.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Low Stock Alert</p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {lowStockItems.length} products below minimum stock level
                </p>
              </div>
            </div>
          )}

          {serviceRequests.filter((s: any) => s.status === "Open").length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <Wrench className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">Pending Service Requests</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {serviceRequests.filter((s: any) => s.status === "Open").length} open requests need attention
                </p>
              </div>
            </div>
          )}

          {creditInfo.outstanding > creditInfo.totalLimit * 0.8 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <CreditCard className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Credit Limit Alert</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  You've used over 80% of your credit limit
                </p>
              </div>
            </div>
          )}

          {lowStockItems.length === 0 && serviceRequests.filter((s: any) => s.status === "Open").length === 0 && creditInfo.outstanding < creditInfo.totalLimit * 0.8 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">All Systems Good</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  No urgent actions required
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

// Inventory Tab Component
const InventoryTab = ({ stock, lowStockItems, addToCart }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Inventory & Stock Management</h2>
        <p className="text-sm text-muted-foreground mt-1">View company stock and manage your local inventory</p>
      </div>
      {lowStockItems.length > 0 && (
        <Badge variant="destructive" className="hidden sm:flex">
          <AlertCircle className="h-3 w-3 mr-1" />
          {lowStockItems.length} Low Stock
        </Badge>
      )}
    </div>

    {/* Stock Overview Cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Local Stock</div>
          <div className="text-2xl font-bold">{stock.reduce((sum: number, item: any) => sum + item.localStock, 0)}</div>
          <p className="text-xs text-muted-foreground mt-1">units on hand</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Parent Stock</div>
          <div className="text-2xl font-bold">{stock.reduce((sum: number, item: any) => sum + item.parentStock, 0)}</div>
          <p className="text-xs text-muted-foreground mt-1">available to order</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Low Stock Items</div>
          <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
          <p className="text-xs text-muted-foreground mt-1">need reordering</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Products</div>
          <div className="text-2xl font-bold">{stock.length}</div>
          <p className="text-xs text-muted-foreground mt-1">in catalog</p>
        </CardContent>
      </Card>
    </div>

    {/* Product Catalog */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-primary" />
          Digital Product Catalog
        </CardTitle>
        <CardDescription>View detailed specifications and order products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stock.map((product: any) => {
            const isLowStock = product.localStock < product.minStock;
            const stockPercentage = (product.localStock / product.minStock) * 100;

            return (
              <Card key={product.id} className={cn("shadow-sm", isLowStock && "border-orange-300 dark:border-orange-800")}>
                <CardContent className="p-4">
                  <div className="aspect-video bg-secondary/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                  <p className="text-lg font-bold text-primary mb-2">{formatINR(product.price)}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Your Stock:</span>
                      <span className={cn("font-semibold", isLowStock && "text-orange-600")}>
                        {product.localStock} units
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Company Stock:</span>
                      <span className="font-semibold text-green-600">{product.parentStock} units</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Min Stock:</span>
                      <span className="font-semibold">{product.minStock} units</span>
                    </div>
                  </div>

                  {isLowStock && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Stock Level</span>
                        <span>{Math.min(100, Math.round(stockPercentage))}%</span>
                      </div>
                      <Progress value={Math.min(100, stockPercentage)} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => addToCart(product.id)}
                      disabled={product.parentStock === 0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Order
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>

                  {isLowStock && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Low stock - reorder soon</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Orders Tab Component (continued in next message due to length)
const OrdersTab = ({
  orders, orderCart, orderDialogOpen, setOrderDialogOpen,
  setSelectedTracking, setTrackingDialogOpen,
  setSelectedInvoice, setInvoiceDialogOpen,
  stock, removeFromCart, updateCartQty, placeOrder
}: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Orders & Tracking</h2>
        <p className="text-sm text-muted-foreground mt-1">Place bulk orders and track shipments</p>
      </div>
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-cta">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Place Bulk Order</DialogTitle>
            <DialogDescription>Add products to your cart and place order</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {orderCart.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Your cart is empty. Add products from the catalog.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderCart.map((item: any) => {
                  const product = stock.find((p: any) => p.id === item.id);
                  if (!product) return null;

                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-secondary rounded flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{formatINR(product.price)} per unit</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => updateCartQty(item.id, parseInt(e.target.value) || 1)}
                              className="w-20 h-8"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className="font-semibold">{formatINR(product.price * item.qty)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <Separator />

                <div className="space-y-2 bg-secondary/30 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">
                      {formatINR(orderCart.reduce((sum: number, item: any) => {
                        const product = stock.find((p: any) => p.id === item.id);
                        return sum + (product ? product.price * item.qty : 0);
                      }, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%):</span>
                    <span className="font-semibold">
                      {formatINR(Math.round(orderCart.reduce((sum: number, item: any) => {
                        const product = stock.find((p: any) => p.id === item.id);
                        return sum + (product ? product.price * item.qty : 0);
                      }, 0) * 0.18))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-primary">
                      {formatINR(Math.round(orderCart.reduce((sum: number, item: any) => {
                        const product = stock.find((p: any) => p.id === item.id);
                        return sum + (product ? product.price * item.qty : 0);
                      }, 0) * 1.18))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={placeOrder}
              disabled={orderCart.length === 0}
              className="bg-gradient-cta"
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    {/* Orders List */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Your Orders
        </CardTitle>
        <CardDescription>Track all your orders and shipments</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No orders yet. Place your first order to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-mono font-semibold">{order.id}</h4>
                        <Badge
                          variant={
                            order.status === "Delivered" ? "secondary" :
                              order.status === "Shipped" ? "default" :
                                order.status === "Approved" ? "outline" : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Ordered on {order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatINR(order.grandTotal)}</p>
                      <p className="text-xs text-muted-foreground">Incl. GST</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {order.products.map((product: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{product.name} × {product.qty}</span>
                        <span className="font-semibold">{formatINR(product.price * product.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex flex-wrap gap-2">
                    {order.trackingId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTracking(order);
                          setTrackingDialogOpen(true);
                        }}
                      >
                        <Truck className="h-3 w-3 mr-2" />
                        Track Shipment
                      </Button>
                    )}
                    {order.invoiceId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(order);
                          setInvoiceDialogOpen(true);
                        }}
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        View Invoice
                      </Button>
                    )}
                    {order.status === "Delivered" && !order.invoiceId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(order);
                          setInvoiceDialogOpen(true);
                        }}
                      >
                        <Download className="h-3 w-3 mr-2" />
                        Download Invoice
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

// CRM Tab Component
const CRMTab = ({
  customers, serviceRequests, setServiceRequests,
  customerDialogOpen, setCustomerDialogOpen,
  serviceDialogOpen, setServiceDialogOpen,
  warrantyDialogOpen, setWarrantyDialogOpen,
  newCustomer, setNewCustomer,
  newServiceRequest, setNewServiceRequest,
  warrantySearch, setWarrantySearch,
  addCustomer, addServiceRequest
}: any) => {
  const foundWarranty = warrantySearch ?
    customers.flatMap((c: any) => c.warranties).find((w: any) =>
      w.serialNumber.toLowerCase().includes(warrantySearch.toLowerCase())
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Customer Relationship Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage customers, warranties, and service requests</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={warrantyDialogOpen} onOpenChange={setWarrantyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Check Warranty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Warranty Lookup</DialogTitle>
                <DialogDescription>Search warranty by serial number</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={warrantySearch}
                    onChange={(e) => setWarrantySearch(e.target.value)}
                    placeholder="SN123456789"
                  />
                </div>

                {foundWarranty && (
                  <Card className={cn(
                    "border-2",
                    foundWarranty.status === "Active" ? "border-green-500 bg-green-50 dark:bg-green-950" :
                      foundWarranty.status === "Expired" ? "border-orange-500 bg-orange-50 dark:bg-orange-950" :
                        "border-red-500 bg-red-50 dark:bg-red-950"
                  )}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Product:</span>
                        <span className="font-semibold">{foundWarranty.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Purchase Date:</span>
                        <span className="font-semibold">{foundWarranty.purchaseDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expiry Date:</span>
                        <span className="font-semibold">{foundWarranty.expiryDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={foundWarranty.status === "Active" ? "default" : "destructive"}>
                          {foundWarranty.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {warrantySearch && !foundWarranty && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No warranty found for this serial number</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setWarrantyDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-cta">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Customer Registration</DialogTitle>
                <DialogDescription>Register a new customer for warranty tracking</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Ravi Kumar"
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value.replace(/\D/g, "") })}
                    maxLength={10}
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    placeholder="Plot No, Street, Area"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="Warangal"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCustomerDialogOpen(false)}>Cancel</Button>
                <Button onClick={addCustomer} className="bg-gradient-cta">Add Customer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customer List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Customer Database
          </CardTitle>
          <CardDescription>View and manage your customer base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Total Purchases</TableHead>
                  <TableHead className="text-right">Warranties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{customer.phone}</p>
                        {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell className="text-right font-semibold">{formatINR(customer.totalPurchases)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{customer.warranties.length}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Service Requests
              </CardTitle>
              <CardDescription>Manage customer complaints and service tickets</CardDescription>
            </div>
            <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-cta">
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Service Request</DialogTitle>
                  <DialogDescription>Log a customer complaint or service need</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label>Customer *</Label>
                    <Select
                      value={newServiceRequest.customerId}
                      onValueChange={(v) => setNewServiceRequest({ ...newServiceRequest, customerId: v })}
                      onOpenChange={(open) => {
                        if (open && customers.length === 0) {
                          console.log('Dropdown opened, loading customers...');
                          loadCustomers();
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No customers found. Add a customer first.
                          </div>
                        ) : (
                          <>
                            {console.log('Rendering customers in dropdown:', customers.length)}
                            {customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} - {customer.phone}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type *</Label>
                    <Select
                      value={newServiceRequest.type}
                      onValueChange={(v: any) => setNewServiceRequest({ ...newServiceRequest, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Complaint">Complaint</SelectItem>
                        <SelectItem value="Warranty Claim">Warranty Claim</SelectItem>
                        <SelectItem value="Installation">Installation Request</SelectItem>
                        <SelectItem value="Repair">Repair Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority *</Label>
                    <Select
                      value={newServiceRequest.priority}
                      onValueChange={(v: any) => setNewServiceRequest({ ...newServiceRequest, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={newServiceRequest.description}
                      onChange={(e) => setNewServiceRequest({ ...newServiceRequest, description: e.target.value })}
                      placeholder="Describe the issue or request..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
                  <Button onClick={addServiceRequest} className="bg-gradient-cta">Create Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceRequests.map((request: any) => (
              <Card key={request.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-sm">{request.id}</span>
                        <Badge variant="outline">{request.type}</Badge>
                        <Badge
                          variant={
                            request.priority === "High" ? "destructive" :
                              request.priority === "Medium" ? "default" : "secondary"
                          }
                        >
                          {request.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{request.customerName}</p>
                      <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={request.status}
                        onValueChange={(v: any) => {
                          setServiceRequests(serviceRequests.map((sr: any) =>
                            sr.id === request.id ? { ...sr, status: v } : sr
                          ));
                          toast.success(`Request ${request.id} status updated`);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {request.date}</span>
                    {request.resolvedDate && (
                      <>
                        <span>•</span>
                        <CheckCircle className="h-3 w-3" />
                        <span>Resolved: {request.resolvedDate}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Payments Tab Component
const PaymentsTab = ({
  creditInfo, transactions, orders,
  paymentDialogOpen, setPaymentDialogOpen,
  paymentForm, setPaymentForm, makePayment
}: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Payments & Ledger</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage payments and view transaction history</p>
      </div>
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-cta">
            <Send className="h-4 w-4 mr-2" />
            Make Payment
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment to MSI</DialogTitle>
            <DialogDescription>Pay via UPI or Net Banking</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                min={1}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="10000"
              />
            </div>
            <div>
              <Label>Payment Method *</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(v: any) => setPaymentForm({ ...paymentForm, method: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order ID (Optional)</Label>
              <Select
                value={paymentForm.orderId}
                onValueChange={(v) => setPaymentForm({ ...paymentForm, orderId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {orders.filter((o: any) => o.status !== "Pending").map((order: any) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {formatINR(order.grandTotal)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-semibold">Credit Status</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Outstanding:</span>
                    <span className="font-semibold">{formatINR(creditInfo.outstanding)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Credit:</span>
                    <span className="font-semibold">{formatINR(creditInfo.available)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={makePayment} className="bg-gradient-cta">
              <Send className="h-4 w-4 mr-2" />
              Proceed to Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    {/* Credit Overview */}
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Credit Limit</div>
          <div className="text-2xl font-bold">{formatINR(creditInfo.totalLimit)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total available</p>
        </CardContent>
      </Card>

      <Card className="shadow-card border-orange-300 dark:border-orange-800">
        <CardContent className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-orange-600">{formatINR(creditInfo.outstanding)}</div>
          <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
        </CardContent>
      </Card>

      <Card className="shadow-card border-green-300 dark:border-green-800">
        <CardContent className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Available</div>
          <div className="text-2xl font-bold text-green-600">{formatINR(creditInfo.available)}</div>
          <p className="text-xs text-muted-foreground mt-1">Can be used</p>
        </CardContent>
      </Card>
    </div>

    {/* Credit Utilization */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Credit Utilization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used</span>
            <span className="font-semibold">{Math.round((creditInfo.outstanding / creditInfo.totalLimit) * 100)}%</span>
          </div>
          <Progress value={(creditInfo.outstanding / creditInfo.totalLimit) * 100} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {formatINR(creditInfo.outstanding)} of {formatINR(creditInfo.totalLimit)} used
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Transaction History */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Payment History
        </CardTitle>
        <CardDescription>Complete transaction ledger</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction: any) => (
            <Card key={transaction.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      transaction.type === "Payment" && transaction.amount > 0 ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" :
                        transaction.type === "Order" ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" :
                          "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                    )}>
                      {transaction.type === "Payment" ? <Receipt className="h-5 w-5" /> :
                        transaction.type === "Order" ? <ShoppingCart className="h-5 w-5" /> :
                          <IndianRupee className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{transaction.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.method}
                      </p>
                      {transaction.reference && (
                        <p className="text-xs text-muted-foreground font-mono">{transaction.reference}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      transaction.amount > 0 ? "text-green-600" : "text-orange-600"
                    )}>
                      {transaction.amount > 0 ? "+" : ""}{formatINR(Math.abs(transaction.amount))}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "Success" ? "secondary" :
                          transaction.status === "Pending" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Marketing Tab Component
const MarketingTab = ({ promotionalAssets, trainingResources }: any) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl md:text-2xl font-bold">Marketing & Support</h2>
      <p className="text-sm text-muted-foreground mt-1">Access promotional materials and training resources</p>
    </div>

    {/* Promotional Assets */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Promotional Assets Library
        </CardTitle>
        <CardDescription>Download marketing materials for your territory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotionalAssets.map((asset: any) => (
            <Card key={asset.id} className="shadow-sm overflow-hidden">
              <div className="aspect-video bg-secondary flex items-center justify-center">
                {asset.type === "Video" ? (
                  <PlayCircle className="h-12 w-12 text-muted-foreground" />
                ) : asset.type === "Poster" ? (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm line-clamp-2">{asset.title}</h4>
                  <Badge variant="outline" className="flex-shrink-0 text-xs">{asset.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {asset.category} • {asset.date}
                </p>
                <Button size="sm" className="w-full" onClick={() => toast.success("Download started!")}>
                  <Download className="h-3 w-3 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Training Resources */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Training Resources
        </CardTitle>
        <CardDescription>Video tutorials and product guides</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainingResources.map((resource: any) => (
            <Card key={resource.id} className="shadow-sm overflow-hidden">
              <div className="aspect-video bg-secondary flex items-center justify-center relative">
                <PlayCircle className="h-16 w-16 text-primary cursor-pointer hover:scale-110 transition-transform" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm line-clamp-2">{resource.title}</h4>
                  <Badge variant="outline" className="flex-shrink-0 text-xs">{resource.duration}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{resource.category}</p>
                <Button size="sm" className="w-full" onClick={() => toast.success("Opening video...")}>
                  <PlayCircle className="h-3 w-3 mr-2" />
                  Watch Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Help Desk */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Help Desk Integration
        </CardTitle>
        <CardDescription>Get support from MSI technical team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button className="h-auto py-6 flex-col gap-2" variant="outline">
            <Phone className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="font-semibold">Call Support</p>
              <p className="text-xs text-muted-foreground">1800-123-4567</p>
            </div>
          </Button>

          <Button className="h-auto py-6 flex-col gap-2" variant="outline">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="font-semibold">Live Chat</p>
              <p className="text-xs text-muted-foreground">Chat with expert</p>
            </div>
          </Button>

          <Button className="h-auto py-6 flex-col gap-2" variant="outline">
            <Mail className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="font-semibold">Email Support</p>
              <p className="text-xs text-muted-foreground">support@msi.com</p>
            </div>
          </Button>

          <Button className="h-auto py-6 flex-col gap-2" variant="outline">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="font-semibold">FAQs</p>
              <p className="text-xs text-muted-foreground">Common questions</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Notifications Tab Component
const NotificationsTab = ({ notifications, markNotificationRead, markAllNotificationsRead }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">Stay updated with latest news and alerts</p>
      </div>
      {notifications.some((n: any) => !n.read) && (
        <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      )}
    </div>

    <div className="space-y-3">
      {notifications.map((notification: any) => (
        <Card
          key={notification.id}
          className={cn(
            "shadow-sm cursor-pointer transition-all",
            !notification.read && "border-l-4 border-l-primary bg-secondary/30"
          )}
          onClick={() => !notification.read && markNotificationRead(notification.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0",
                notification.type === "Promo" ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" :
                  notification.type === "Alert" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" :
                    notification.type === "Update" ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" :
                      "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
              )}>
                {notification.type === "Promo" ? <Star className="h-5 w-5" /> :
                  notification.type === "Alert" ? <AlertCircle className="h-5 w-5" /> :
                    notification.type === "Update" ? <Bell className="h-5 w-5" /> :
                      <Zap className="h-5 w-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{notification.date}</span>
                  <Badge variant="outline" className="text-xs">{notification.type}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {notifications.length === 0 && (
      <Card className="shadow-card">
        <CardContent className="p-12 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notifications yet</p>
        </CardContent>
      </Card>
    )}
  </div>
);

export default Dealer;
