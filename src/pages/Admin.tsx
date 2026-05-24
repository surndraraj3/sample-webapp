import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, Boxes, ListPlus, Users, ImagePlus, ShoppingCart, DollarSign, Headphones, Bell,
  Plus, Pencil, Trash2, IndianRupee, Package, TrendingUp, Check, X, Upload, Film, Image as ImageIcon,
  FileText, BarChart3, Settings, UserCog, CreditCard, Truck, Package2, ReceiptText, Calculator,
  FileSpreadsheet, MessageSquare, Clock, AlertCircle, CheckCircle, XCircle, UserPlus, Shield,
  Download, Search, Filter, Eye, Send, Calendar, MapPin, Phone, Mail, FileCheck, Wrench, Star,
  ArrowUpRight, ArrowDownRight, Activity, RefreshCw, ExternalLink, ClipboardList, Target, Zap
} from "lucide-react";
import { formatINR, products as seedProducts } from "@/data/products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { productService } from "@/services/product.service";
import { dealerService } from "@/services/dealer.service";
import { orderService } from "@/services/order.service";
import { inventoryService } from "@/services/inventory.service";
import { ticketService } from "@/services/ticket.service";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { EmployeeRole, ROLE_PERMISSIONS } from "@/contexts/AuthContext";

type Section = "dashboard" | "menu" | "stock" | "dealers" | "media" | "orders" | "finance" | "support" | "marketing" | "users" | "employees" | "reports";

// Type Definitions
type MenuItem = { id: string; name: string; price: number; description?: string; stock?: number; category?: string };
type StockEntry = { id: string; product: string; qty: number; type: "in" | "out"; date: string; note?: string; reference?: string };
type Dealer = {
  id: string; code: string; name: string; city: string; phone: string; email?: string;
  status: "Pending" | "Approved" | "Suspended";
  creditLimit?: number; outstanding?: number; kycStatus?: "Pending" | "Verified" | "Rejected";
  kycDocs?: string[]; joinDate?: string; totalOrders?: number; totalRevenue?: number;
};
type MediaAsset = { id: string; name: string; url: string; kind: "image" | "video"; category?: "banner" | "product" | "promo" };
type Order = {
  id: string; dealerId: string; dealerName: string; items: { product: string; qty: number; price: number }[];
  total: number; status: "Pending" | "Approved" | "Shipped" | "Delivered" | "Rejected";
  date: string; shippingStatus?: string; trackingId?: string; notes?: string;
};
type Invoice = {
  id: string; orderId: string; dealerId: string; dealerName: string; amount: number;
  gst: number; total: number; date: string; status: "Draft" | "Sent" | "Paid" | "Overdue";
  dueDate?: string; paymentDate?: string;
};
type Ticket = {
  id: string; type: "Complaint" | "Warranty" | "Query" | "Return";
  subject: string; description: string; status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  customerId?: string; dealerId?: string; productId?: string; serialNo?: string;
  assignedTo?: string; date: string; resolvedDate?: string; comments?: { by: string; text: string; date: string }[];
};
type TeamMember = {
  id: string; name: string; username: string; role: "Production Manager" | "Accountant" | "Sales Manager" | "Support Staff" | "Admin";
  permissions: string[]; email: string; phone: string; status: "Active" | "Inactive";
};
type Employee = {
  id: string;
  employeeId: string; // MS-001, MS-002, etc.
  name: string;
  email: string;
  phone: string;
  role: "Production Team" | "Sales & Marketing Team" | "Service Technicians";
  employeeRole: "production" | "sales" | "service";
  permissions: string[];
  status: "Active" | "Inactive";
  password: string;
  createdDate: string;
};
type Notification = {
  id: string; title: string; message: string; type: "promo" | "alert" | "update";
  recipients: "all" | "dealers" | "customers"; date: string; status: "Draft" | "Sent";
};
type RawMaterial = {
  id: string; name: string; unit: string; quantity: number; minStock: number; supplier: string; lastOrder?: string;
};

// Chart Data for Dashboard
const salesTrendData = [
  { month: "Nov", sales: 850000, orders: 42 },
  { month: "Dec", sales: 1200000, orders: 58 },
  { month: "Jan", sales: 980000, orders: 48 },
  { month: "Feb", sales: 1450000, orders: 72 },
  { month: "Mar", sales: 1680000, orders: 85 },
  { month: "Apr", sales: 1920000, orders: 95 },
];

const dealerPerformanceData = [
  { name: "Suresh Agro", revenue: 2340000, orders: 45 },
  { name: "Krishna Pumps", revenue: 1650000, orders: 32 },
  { name: "Venkat Enterprises", revenue: 1980000, orders: 38 },
  { name: "Others", revenue: 980000, orders: 22 },
];

const productDistributionData = [
  { name: "Smart Motor Robo", value: 45, color: "#10b981" },
  { name: "Anti-Scaling Unit", value: 30, color: "#3b82f6" },
  { name: "Water Level Controller", value: 15, color: "#f59e0b" },
  { name: "Others", value: 10, color: "#6366f1" },
];

const revenueData = [
  { month: "Nov", revenue: 850000, expenses: 420000, profit: 430000 },
  { month: "Dec", revenue: 1200000, expenses: 550000, profit: 650000 },
  { month: "Jan", revenue: 980000, expenses: 480000, profit: 500000 },
  { month: "Feb", revenue: 1450000, expenses: 680000, profit: 770000 },
  { month: "Mar", revenue: 1680000, expenses: 780000, profit: 900000 },
  { month: "Apr", revenue: 1920000, expenses: 850000, profit: 1070000 },
];

const navItems: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "menu", label: "Products", icon: ListPlus },
  { id: "stock", label: "Inventory", icon: Boxes },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "support", label: "Support", icon: Headphones },
  { id: "marketing", label: "Marketing", icon: Bell },
  { id: "employees", label: "Employees", icon: UserPlus },
  { id: "users", label: "Team", icon: UserCog },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "media", label: "Media", icon: ImagePlus },
];

const Admin = () => {
  const [section, setSection] = useState<Section>("dashboard");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from APIs
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Load products/menu
      const productsResponse = await productService.getProducts({ limit: 100 });
      setMenu(productsResponse.data.map(p => ({
        id: p._id,
        name: p.name.en,
        price: p.basePrice,
        description: p.description.en,
        stock: p.inventory?.currentStock || 0,
        category: p.category
      })));

      // Load dealers
      const dealersResponse = await dealerService.getDealers({ limit: 100 });
      setDealers(dealersResponse.data.map(d => ({
        id: d._id,
        code: d.dealerCode,
        name: d.name,
        city: d.address?.city || '',
        phone: d.mobile,
        email: d.email,
        status: d.approvalStatus as "Pending" | "Approved" | "Suspended",
        creditLimit: d.creditLimit,
        outstanding: d.outstandingAmount || 0,
        kycStatus: d.kycStatus as "Pending" | "Verified" | "Rejected",
        joinDate: new Date(d.createdAt).toISOString().split('T')[0],
        totalOrders: 0,
        totalRevenue: 0
      })));

      // Load orders
      const ordersResponse = await orderService.getOrders({ limit: 100 });
      setOrders(ordersResponse.data.map(o => ({
        id: o._id,
        dealerId: o.userId,
        dealerName: 'Dealer',
        items: o.items.map(item => ({
          product: item.productId.name?.en || 'Product',
          qty: item.quantity,
          price: item.price
        })),
        total: o.totalAmount,
        status: o.status as "Pending" | "Approved" | "Shipped" | "Delivered" | "Rejected",
        date: new Date(o.createdAt).toISOString().split('T')[0],
        trackingId: o.orderNumber
      })));

      // Load inventory
      const inventoryResponse = await inventoryService.getAllInventory({ limit: 100 });
      setStock(inventoryResponse.data.map((inv, idx) => ({
        id: `s${idx}`,
        product: inv.productId.name?.en || 'Product',
        qty: inv.currentStock,
        type: "in" as "in" | "out",
        date: new Date(inv.lastUpdated).toISOString().split('T')[0],
        reference: inv._id
      })));

      // Load tickets
      const ticketsResponse = await ticketService.getTickets({ limit: 100 });
      setTickets(ticketsResponse.data.map(t => ({
        id: t._id,
        type: t.category as "Complaint" | "Warranty" | "Query" | "Return",
        subject: t.subject,
        description: t.description,
        status: t.status as "Open" | "In Progress" | "Resolved" | "Closed",
        priority: t.priority as "Low" | "Medium" | "High" | "Critical",
        date: new Date(t.createdAt).toISOString().split('T')[0],
        comments: t.comments?.map(c => ({
          by: c.commentedBy,
          text: c.comment,
          date: new Date(c.commentedAt).toISOString().split('T')[0]
        })) || []
      })));

      // TODO: Fetch employees from API
      // For now, initialize with empty array - employees should be created via API
      setEmployees([]);

    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load some data. Using demo data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="container py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container py-4 md:py-6">
        {/* Mobile Section Selector */}
        <div className="lg:hidden mb-4">
          <Select value={section} onValueChange={(value) => setSection(value as Section)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {navItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:sticky lg:top-20 self-start">
            <Card className="shadow-card overflow-hidden">
              <div className="bg-gradient-hero p-4 text-primary-foreground">
                <div className="text-xs uppercase tracking-wider opacity-80">Admin Console</div>
                <div className="text-lg font-semibold">MSI Innovations</div>
              </div>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <nav className="p-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = section === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                          active
                            ? "bg-gradient-cta text-primary-foreground shadow-soft"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </Card>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {section === "dashboard" && <Dashboard dealers={dealers} menu={menu} orders={orders} tickets={tickets} />}
            {section === "orders" && <OrdersSection orders={orders} setOrders={setOrders} dealers={dealers} />}
            {section === "dealers" && <DealersSection dealers={dealers} setDealers={setDealers} />}
            {section === "menu" && <MenuSection items={menu} setItems={setMenu} />}
            {section === "stock" && <StockSection stock={stock} setStock={setStock} menu={menu} rawMaterials={rawMaterials} setRawMaterials={setRawMaterials} />}
            {section === "finance" && <FinanceSection invoices={invoices} setInvoices={setInvoices} orders={orders} dealers={dealers} />}
            {section === "support" && <SupportSection tickets={tickets} setTickets={setTickets} dealers={dealers} />}
            {section === "marketing" && <MarketingSection notifications={notifications} setNotifications={setNotifications} media={media} />}
            {section === "employees" && <EmployeeSection employees={employees} setEmployees={setEmployees} />}
            {section === "users" && <UsersSection teamMembers={teamMembers} setTeamMembers={setTeamMembers} />}
            {section === "reports" && <ReportsSection orders={orders} dealers={dealers} invoices={invoices} />}
            {section === "media" && <MediaSection media={media} setMedia={setMedia} />}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

const SectionHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
    <div>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

/* ------------------------- ENHANCED DASHBOARD ------------------------- */
const Dashboard = ({ dealers, menu, orders, tickets }: { dealers: Dealer[]; menu: MenuItem[]; orders: Order[]; tickets: Ticket[] }) => {
  const totalRevenue = orders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);
  const monthlyRevenue = 1920000; // April revenue from chart data
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const activeTickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length;
  const approvedDealers = dealers.filter(d => d.status === "Approved").length;
  const pendingDealers = dealers.filter(d => d.status === "Pending").length;
  const totalStock = menu.reduce((sum, m) => sum + (m.stock || 0), 0);
  const lowStockItems = menu.filter(m => (m.stock || 0) < 20).length;

  return (
    <>
      <SectionHeader title="Dashboard" subtitle="Real-time business analytics and insights" />

      {/* Key Metrics */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 md:mb-6">
        {[
          { icon: IndianRupee, label: "Revenue (MTD)", value: formatINR(monthlyRevenue), change: "+18%", trend: "up", color: "text-leaf" },
          { icon: ShoppingCart, label: "Total Orders", value: orders.length.toString(), subtext: `${pendingOrders} pending`, color: "text-blue-600" },
          { icon: Users, label: "Active Dealers", value: approvedDealers.toString(), subtext: `${pendingDealers} pending`, color: "text-purple-600" },
          { icon: Package, label: "Stock Units", value: totalStock.toString(), subtext: lowStockItems ? `${lowStockItems} low stock` : "All good", color: lowStockItems > 0 ? "text-orange-600" : "text-leaf" },
        ].map((s, i) => (
          <Card key={i} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-5">
              <div className="flex items-start justify-between mb-2">
                <div className={cn("flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground", s.color)}>
                  <s.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                {s.change && (
                  <Badge variant="secondary" className={cn("text-xs", s.trend === "up" ? "bg-leaf/15 text-leaf" : "bg-destructive/15 text-destructive")}>
                    {s.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {s.change}
                  </Badge>
                )}
              </div>
              <div>
                <div className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold">{s.value}</div>
                {s.subtext && <div className="text-[10px] md:text-xs text-muted-foreground">{s.subtext}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 mb-4 md:mb-6">
        {/* Sales Trend Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Sales Trend (6 Months)</CardTitle>
            <CardDescription>Revenue and order volume over time</CardDescription>
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
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any) => formatINR(value)}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dealer Performance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Top Dealer Performance</CardTitle>
            <CardDescription>Revenue contribution by dealer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dealerPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" angle={-15} textAnchor="end" height={60} />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any) => formatINR(value)}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Distribution & Revenue Breakdown */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 mb-4 md:mb-6">
        {/* Product Distribution Pie Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Product Distribution</CardTitle>
            <CardDescription>Sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={productDistributionData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {productDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Expenses */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Revenue & Profit Analysis</CardTitle>
            <CardDescription>Financial performance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any) => formatINR(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3 mb-4 md:mb-6">
        {/* Pending Approvals */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDealers > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium text-sm">Dealer Approvals</div>
                      <div className="text-xs text-muted-foreground">{pendingDealers} dealers awaiting verification</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => window.scrollTo(0, 0)}>Review</Button>
                </div>
              )}
              {pendingOrders > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Order Approvals</div>
                      <div className="text-xs text-muted-foreground">{pendingOrders} orders need approval</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              )}
              {activeTickets > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <div className="flex items-center gap-3">
                    <Headphones className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-sm">Support Tickets</div>
                      <div className="text-xs text-muted-foreground">{activeTickets} tickets require attention</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              )}
              {lowStockItems > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-sm">Low Stock Alert</div>
                      <div className="text-xs text-muted-foreground">{lowStockItems} products below threshold</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Check</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Order Completion</span>
                <span className="text-xs font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Dealer Satisfaction</span>
                <span className="text-xs font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Ticket Resolution</span>
                <span className="text-xs font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Order Value</span>
                <span className="font-medium">{formatINR(85600)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Growth</span>
                <span className="font-medium text-leaf">+18.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { icon: CheckCircle, text: "Order ORD001 delivered to Suresh Agro Distributors", time: "2 hours ago", color: "text-leaf" },
              { icon: ShoppingCart, text: "New order ORD004 placed by Suresh Agro", time: "5 hours ago", color: "text-blue-600" },
              { icon: UserPlus, text: "New dealer registration: Sai Irrigation", time: "1 day ago", color: "text-purple-600" },
              { icon: AlertCircle, text: "Low stock alert: Plastic Casing below minimum", time: "2 days ago", color: "text-orange-600" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <activity.icon className={cn("h-5 w-5 mt-0.5", activity.color)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{activity.text}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

/* ------------------------- ORDER MANAGEMENT & SUPPLY CHAIN ------------------------- */
const OrdersSection = ({ orders, setOrders, dealers }: { orders: Order[]; setOrders: (o: Order[]) => void; dealers: Dealer[] }) => {
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [trackingDialog, setTrackingDialog] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Order["status"]>("all");

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Order ${status.toLowerCase()}`);
  };

  const updateTracking = (id: string, trackingId: string, shippingStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, trackingId, shippingStatus, status: "Shipped" } : o));
    toast.success("Tracking information updated");
    setTrackingDialog(null);
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <>
      <SectionHeader title="Order Management" subtitle="Approve orders, manage shipping, and track deliveries">
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </SectionHeader>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5 mb-4 md:mb-6">
        {[
          { label: "Total Orders", value: orders.length.toString(), status: "all", color: "bg-blue-500" },
          { label: "Pending", value: orders.filter(o => o.status === "Pending").length.toString(), status: "Pending", color: "bg-orange-500" },
          { label: "Approved", value: orders.filter(o => o.status === "Approved").length.toString(), status: "Approved", color: "bg-purple-500" },
          { label: "Shipped", value: orders.filter(o => o.status === "Shipped").length.toString(), status: "Shipped", color: "bg-cyan-500" },
          { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length.toString(), status: "Delivered", color: "bg-leaf" },
        ].map((stat, i) => (
          <Card
            key={i}
            className="shadow-card cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setFilterStatus(stat.status as any)}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("h-2 w-2 rounded-full", stat.color)}></div>
                <div className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Tracking</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.dealerName}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{order.date}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{order.date}</TableCell>
                    <TableCell className="text-right font-semibold">{formatINR(order.total)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        order.status === "Delivered" ? "bg-leaf/15 text-leaf" :
                          order.status === "Shipped" ? "bg-cyan-500/15 text-cyan-600" :
                            order.status === "Approved" ? "bg-purple-500/15 text-purple-600" :
                              order.status === "Pending" ? "bg-orange-500/15 text-orange-600" :
                                "bg-destructive/15 text-destructive"
                      )}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {order.trackingId ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setTrackingDialog(order)}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          {order.trackingId}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => setTrackingDialog(order)}
                        >
                          Add Tracking
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {order.status === "Pending" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-leaf"
                              onClick={() => updateOrderStatus(order.id, "Approved")}
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => updateOrderStatus(order.id, "Rejected")}
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {order.status === "Approved" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-cyan-600"
                            onClick={() => setTrackingDialog(order)}
                            title="Ship Order"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === "Shipped" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-leaf"
                            onClick={() => updateOrderStatus(order.id, "Delivered")}
                            title="Mark Delivered"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setViewOrder(order)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Details Dialog */}
      {viewOrder && (
        <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {viewOrder.id}</DialogTitle>
              <DialogDescription>Complete order information and items</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Dealer</div>
                  <div className="font-medium">{viewOrder.dealerName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Order Date</div>
                  <div className="font-medium">{viewOrder.date}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge className="mt-1">{viewOrder.status}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Amount</div>
                  <div className="font-bold text-lg">{formatINR(viewOrder.total)}</div>
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-3">Order Items</div>
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
                    {viewOrder.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">{formatINR(item.price)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatINR(item.qty * item.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {viewOrder.trackingId && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-2">Shipping Information</div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Truck className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Tracking ID: {viewOrder.trackingId}</div>
                        {viewOrder.shippingStatus && (
                          <div className="text-xs text-muted-foreground">{viewOrder.shippingStatus}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {viewOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-2">Notes</div>
                    <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted">
                      {viewOrder.notes}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOrder(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Tracking Dialog */}
      {trackingDialog && (
        <Dialog open={!!trackingDialog} onOpenChange={() => setTrackingDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Shipping Information</DialogTitle>
              <DialogDescription>Add tracking details for order {trackingDialog.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tracking ID</Label>
                <Input id="trackingId" defaultValue={trackingDialog.trackingId || ""} placeholder="TRK123456" />
              </div>
              <div>
                <Label>Shipping Status</Label>
                <Input id="shippingStatus" defaultValue={trackingDialog.shippingStatus || ""} placeholder="In Transit / Out for Delivery" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTrackingDialog(null)} className="flex-1">Cancel</Button>
                <Button
                  onClick={() => {
                    const trackingId = (document.getElementById("trackingId") as HTMLInputElement).value;
                    const shippingStatus = (document.getElementById("shippingStatus") as HTMLInputElement).value;
                    if (!trackingId) return toast.error("Tracking ID is required");
                    updateTracking(trackingDialog.id, trackingId, shippingStatus);
                  }}
                  className="flex-1 bg-gradient-cta"
                >
                  Update Tracking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

/* ------------------------- Menu Items ------------------------- */
const MenuSection = ({ items, setItems }: { items: MenuItem[]; setItems: (i: MenuItem[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  const openCreate = () => { setEditing(null); setForm({ name: "", price: "", description: "" }); setOpen(true); };
  const openEdit = (m: MenuItem) => { setEditing(m); setForm({ name: m.name, price: m.price.toString(), description: m.description || "" }); setOpen(true); };

  const save = () => {
    if (!form.name.trim() || !form.price) return toast.error("Name and price are required");
    const price = Number(form.price);
    if (editing) {
      setItems(items.map(i => i.id === editing.id ? { ...editing, name: form.name, price, description: form.description } : i));
      toast.success("Menu item updated");
    } else {
      setItems([...items, { id: `m${Date.now()}`, name: form.name, price, description: form.description }]);
      toast.success("Menu item added");
    }
    setOpen(false);
  };

  const remove = (id: string) => { setItems(items.filter(i => i.id !== id)); toast.success("Item removed"); };

  return (
    <>
      <SectionHeader title="Menu Items" subtitle="Manage products / catalog">
        <Button onClick={openCreate} className="bg-gradient-cta"><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
      </SectionHeader>
      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="w-[120px] text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{m.description}</TableCell>
                  <TableCell className="text-right">{formatINR(m.price)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Menu Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Price (INR)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-cta">{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ------------------------- ENHANCED INVENTORY & PRODUCTION CONTROL ------------------------- */
const StockSection = ({ stock, setStock, menu, rawMaterials, setRawMaterials }: {
  stock: StockEntry[]; setStock: (s: StockEntry[]) => void; menu: MenuItem[];
  rawMaterials: RawMaterial[]; setRawMaterials: (r: RawMaterial[]) => void;
}) => {
  const [form, setForm] = useState({ product: "", qty: "", type: "in" as "in" | "out", note: "", reference: "" });
  const [rawMaterialForm, setRawMaterialForm] = useState({ id: "", name: "", unit: "pcs", quantity: "", minStock: "", supplier: "" });
  const [rmDialog, setRmDialog] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product || !form.qty) return toast.error("Product and quantity required");
    setStock([
      { id: `s${Date.now()}`, product: form.product, qty: Number(form.qty), type: form.type, date: new Date().toISOString().slice(0, 10), note: form.note, reference: form.reference },
      ...stock,
    ]);
    setForm({ product: "", qty: "", type: "in", note: "", reference: "" });
    toast.success("Stock entry recorded");
  };

  const balance = (product: string) =>
    stock.filter(s => s.product === product).reduce((acc, s) => acc + (s.type === "in" ? s.qty : -s.qty), 0);

  const saveRawMaterial = () => {
    if (!rawMaterialForm.name || !rawMaterialForm.quantity) return toast.error("Name and quantity required");
    if (rawMaterialForm.id) {
      setRawMaterials(rawMaterials.map(rm => rm.id === rawMaterialForm.id ? { ...rm, ...rawMaterialForm, quantity: Number(rawMaterialForm.quantity), minStock: Number(rawMaterialForm.minStock) } : rm));
      toast.success("Raw material updated");
    } else {
      setRawMaterials([...rawMaterials, {
        id: `rm${Date.now()}`,
        name: rawMaterialForm.name,
        unit: rawMaterialForm.unit,
        quantity: Number(rawMaterialForm.quantity),
        minStock: Number(rawMaterialForm.minStock),
        supplier: rawMaterialForm.supplier,
        lastOrder: new Date().toISOString().slice(0, 10)
      }]);
      toast.success("Raw material added");
    }
    setRmDialog(false);
    setRawMaterialForm({ id: "", name: "", unit: "pcs", quantity: "", minStock: "", supplier: "" });
  };

  const editRawMaterial = (rm: RawMaterial) => {
    setRawMaterialForm({ id: rm.id, name: rm.name, unit: rm.unit, quantity: rm.quantity.toString(), minStock: rm.minStock.toString(), supplier: rm.supplier });
    setRmDialog(true);
  };

  const lowStockMaterials = rawMaterials.filter(rm => rm.quantity < rm.minStock);

  return (
    <>
      <SectionHeader title="Inventory & Production Control" subtitle="Manage finished goods and raw materials" />

      {/* Alert for low stock raw materials */}
      {lowStockMaterials.length > 0 && (
        <Card className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm text-orange-900 dark:text-orange-100">Low Stock Alert</div>
                <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {lowStockMaterials.length} raw material(s) below minimum stock level: {lowStockMaterials.map(rm => rm.name).join(", ")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="finished" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="finished">Finished Goods</TabsTrigger>
          <TabsTrigger value="raw">Raw Materials</TabsTrigger>
        </TabsList>

        {/* Finished Goods Tab */}
        <TabsContent value="finished" className="space-y-4">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_1.5fr]">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base md:text-lg">New Stock Entry</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={submit}>
                  <div>
                    <Label>Product</Label>
                    <Select value={form.product} onValueChange={(value) => setForm({ ...form, product: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {menu.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Quantity</Label>
                      <Input type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as "in" | "out" })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">Stock In</SelectItem>
                          <SelectItem value="out">Stock Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Reference (PO/SO)</Label>
                    <Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="PO-001" />
                  </div>
                  <div>
                    <Label>Note (optional)</Label>
                    <Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-cta">Record Entry</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base md:text-lg">Recent Movements</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stock.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs">{s.date}</TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{s.product}</div>
                            {s.reference && <div className="text-xs text-muted-foreground">{s.reference}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={s.type === "in" ? "bg-leaf/15 text-leaf" : "bg-destructive/15 text-destructive"}>
                              {s.type === "in" ? "IN" : "OUT"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{s.qty}</TableCell>
                          <TableCell className="text-right font-semibold">{balance(s.product)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Current Stock Summary */}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base md:text-lg">Current Stock Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {menu.map(product => {
                  const currentBalance = balance(product.name);
                  const isLow = currentBalance < 20;
                  return (
                    <div key={product.id} className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{product.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{product.category || "Electronics"}</div>
                        </div>
                        {isLow && <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />}
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className={cn("text-2xl font-bold", isLow ? "text-orange-600" : "text-leaf")}>{currentBalance}</span>
                        <span className="text-xs text-muted-foreground">units</span>
                      </div>
                      {isLow && <div className="text-xs text-orange-600 mt-1">Low stock</div>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Materials Tab */}
        <TabsContent value="raw" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setRawMaterialForm({ id: "", name: "", unit: "pcs", quantity: "", minStock: "", supplier: "" }); setRmDialog(true); }} className="bg-gradient-cta">
              <Plus className="mr-2 h-4 w-4" /> Add Raw Material
            </Button>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Min Stock</TableHead>
                    <TableHead className="hidden md:table-cell">Last Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawMaterials.map(rm => {
                    const isLow = rm.quantity < rm.minStock;
                    return (
                      <TableRow key={rm.id} className={isLow ? "bg-orange-50/50 dark:bg-orange-950/10" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isLow && <AlertCircle className="h-4 w-4 text-orange-600" />}
                            <div>
                              <div className="font-medium">{rm.name}</div>
                              <div className="text-xs text-muted-foreground">Unit: {rm.unit}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{rm.supplier}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn("font-semibold", isLow ? "text-orange-600" : "text-leaf")}>
                            {rm.quantity} {rm.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{rm.minStock} {rm.unit}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{rm.lastOrder}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => editRawMaterial(rm)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Raw Material Dialog */}
      <Dialog open={rmDialog} onOpenChange={setRmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rawMaterialForm.id ? "Edit" : "Add"} Raw Material</DialogTitle>
            <DialogDescription>Manage raw material inventory details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Material Name *</Label>
              <Input value={rawMaterialForm.name} onChange={e => setRawMaterialForm({ ...rawMaterialForm, name: e.target.value })} placeholder="PCB Boards" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Select value={rawMaterialForm.unit} onValueChange={(value) => setRawMaterialForm({ ...rawMaterialForm, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input type="number" value={rawMaterialForm.quantity} onChange={e => setRawMaterialForm({ ...rawMaterialForm, quantity: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Minimum Stock Level</Label>
              <Input type="number" value={rawMaterialForm.minStock} onChange={e => setRawMaterialForm({ ...rawMaterialForm, minStock: e.target.value })} />
            </div>
            <div>
              <Label>Supplier</Label>
              <Input value={rawMaterialForm.supplier} onChange={e => setRawMaterialForm({ ...rawMaterialForm, supplier: e.target.value })} placeholder="Supplier name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRmDialog(false)}>Cancel</Button>
            <Button onClick={saveRawMaterial} className="bg-gradient-cta">{rawMaterialForm.id ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ------------------------- ENHANCED DEALERS SECTION WITH KYC & CREDIT CONTROL ------------------------- */
const DealersSection = ({ dealers, setDealers }: { dealers: Dealer[]; setDealers: (d: Dealer[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [form, setForm] = useState<Omit<Dealer, "id">>({
    code: "", name: "", city: "", phone: "", email: "", status: "Pending",
    creditLimit: 0, outstanding: 0, kycStatus: "Pending", joinDate: new Date().toISOString().slice(0, 10),
    totalOrders: 0, totalRevenue: 0
  });
  const [kycDialog, setKycDialog] = useState<Dealer | null>(null);
  const [creditDialog, setCreditDialog] = useState<Dealer | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Dealer["status"]>("all");

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: "", name: "", city: "", phone: "", email: "", status: "Pending",
      creditLimit: 200000, outstanding: 0, kycStatus: "Pending", joinDate: new Date().toISOString().slice(0, 10),
      totalOrders: 0, totalRevenue: 0
    });
    setOpen(true);
  };

  const openEdit = (d: Dealer) => {
    setEditing(d);
    setForm({
      code: d.code, name: d.name, city: d.city, phone: d.phone, email: d.email || "",
      status: d.status, creditLimit: d.creditLimit || 0, outstanding: d.outstanding || 0,
      kycStatus: d.kycStatus || "Pending", joinDate: d.joinDate || "",
      totalOrders: d.totalOrders || 0, totalRevenue: d.totalRevenue || 0
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.code || !form.name) return toast.error("Code and name required");
    if (editing) {
      setDealers(dealers.map(d => d.id === editing.id ? { ...editing, ...form } : d));
      toast.success("Dealer updated");
    } else {
      setDealers([...dealers, { id: `d${Date.now()}`, ...form }]);
      toast.success("Dealer added");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    setDealers(dealers.filter(d => d.id !== id));
    toast.success("Dealer removed");
  };

  const setStatus = (id: string, status: Dealer["status"]) => {
    setDealers(dealers.map(d => d.id === id ? { ...d, status } : d));
    toast.success(`Dealer ${status.toLowerCase()}`);
  };

  const updateKycStatus = (id: string, kycStatus: "Verified" | "Rejected") => {
    setDealers(dealers.map(d => d.id === id ? { ...d, kycStatus } : d));
    toast.success(`KYC ${kycStatus.toLowerCase()}`);
    setKycDialog(null);
  };

  const updateCreditLimit = (id: string, creditLimit: number) => {
    setDealers(dealers.map(d => d.id === id ? { ...d, creditLimit } : d));
    toast.success("Credit limit updated");
    setCreditDialog(null);
  };

  const filteredDealers = filterStatus === "all" ? dealers : dealers.filter(d => d.status === filterStatus);

  return (
    <>
      <SectionHeader title="Dealer Management" subtitle="Manage dealer network, KYC, and credit control">
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dealers</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="bg-gradient-cta">
            <Plus className="mr-2 h-4 w-4" /> Add Dealer
          </Button>
        </div>
      </SectionHeader>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4 mb-4 md:mb-6">
        {[
          { label: "Total Dealers", value: dealers.length.toString(), icon: Users, color: "text-blue-600" },
          { label: "Approved", value: dealers.filter(d => d.status === "Approved").length.toString(), icon: CheckCircle, color: "text-leaf" },
          { label: "Pending KYC", value: dealers.filter(d => d.kycStatus === "Pending").length.toString(), icon: Clock, color: "text-orange-600" },
          { label: "Total Credit", value: formatINR(dealers.reduce((sum, d) => sum + (d.creditLimit || 0), 0)), icon: CreditCard, color: "text-purple-600" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <div className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
              <div className="text-lg md:text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">City</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">KYC</TableHead>
                  <TableHead className="hidden xl:table-cell text-right">Credit</TableHead>
                  <TableHead className="hidden xl:table-cell text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDealers.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{d.city}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{d.city}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-xs">{d.phone}</div>
                      {d.email && <div className="text-xs text-muted-foreground">{d.email}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        d.status === "Approved" ? "bg-leaf/15 text-leaf hover:bg-leaf/15" :
                          d.status === "Pending" ? "bg-accent text-accent-foreground" :
                            "bg-destructive/15 text-destructive hover:bg-destructive/15"
                      )}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(
                          "cursor-pointer",
                          d.kycStatus === "Verified" ? "text-leaf border-leaf" :
                            d.kycStatus === "Rejected" ? "text-destructive border-destructive" :
                              "text-orange-600 border-orange-600"
                        )}
                        onClick={() => setKycDialog(d)}
                      >
                        {d.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setCreditDialog(d)}
                      >
                        {formatINR(d.creditLimit || 0)}
                      </Button>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-right">
                      <span className={cn("text-sm", (d.outstanding || 0) > (d.creditLimit || 0) * 0.8 ? "text-destructive font-medium" : "")}>
                        {formatINR(d.outstanding || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {d.status === "Pending" && (
                          <>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-leaf" onClick={() => setStatus(d.id, "Approved")} title="Approve">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setStatus(d.id, "Suspended")} title="Reject">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(d)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(d.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDealers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No dealers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dealer Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Dealer</DialogTitle>
            <DialogDescription>Fill in dealer information and set credit limits</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dealer Code *</Label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Enter dealer code" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as Dealer["status"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Business Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ABC Distributors" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Hyderabad" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
            </div>
            <div className="col-span-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="dealer@example.com" />
            </div>
            <div>
              <Label>Credit Limit (₹)</Label>
              <Input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: Number(e.target.value) })} />
            </div>
            <div>
              <Label>KYC Status</Label>
              <Select value={form.kycStatus} onValueChange={(value) => setForm({ ...form, kycStatus: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-cta">{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Verification Dialog */}
      {kycDialog && (
        <Dialog open={!!kycDialog} onOpenChange={() => setKycDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>KYC Verification</DialogTitle>
              <DialogDescription>Verify dealer documents and approve/reject KYC</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Dealer: {kycDialog.name}</div>
                <div className="text-xs text-muted-foreground">Code: {kycDialog.code}</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Documents</div>
                <div className="p-4 border rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                  GST Certificate, PAN Card, Address Proof
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-leaf hover:bg-leaf/90"
                  onClick={() => updateKycStatus(kycDialog.id, "Verified")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify KYC
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => updateKycStatus(kycDialog.id, "Rejected")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject KYC
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Credit Limit Dialog */}
      {creditDialog && (
        <Dialog open={!!creditDialog} onOpenChange={() => setCreditDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Credit Control</DialogTitle>
              <DialogDescription>Manage credit limit for {creditDialog.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Limit</div>
                  <div className="text-lg font-bold">{formatINR(creditDialog.creditLimit || 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
                  <div className="text-lg font-bold text-destructive">{formatINR(creditDialog.outstanding || 0)}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Credit Utilization</span>
                  <span className="text-sm font-medium">
                    {((creditDialog.outstanding || 0) / (creditDialog.creditLimit || 1) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(creditDialog.outstanding || 0) / (creditDialog.creditLimit || 1) * 100} />
              </div>
              <Separator />
              <div>
                <Label>New Credit Limit (₹)</Label>
                <Input
                  type="number"
                  defaultValue={creditDialog.creditLimit}
                  id="newCreditLimit"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCreditDialog(null)} className="flex-1">Cancel</Button>
                <Button
                  onClick={() => {
                    const input = document.getElementById("newCreditLimit") as HTMLInputElement;
                    updateCreditLimit(creditDialog.id, Number(input.value));
                  }}
                  className="flex-1 bg-gradient-cta"
                >
                  Update Limit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

/* ------------------------- FINANCIAL REPORTING & ANALYTICS ------------------------- */
const FinanceSection = ({ invoices, setInvoices, orders, dealers }: {
  invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; orders: Order[]; dealers: Dealer[];
}) => {
  const [generateDialog, setGenerateDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const generateInvoice = () => {
    if (!selectedOrder) return;
    const dealer = dealers.find(d => d.id === selectedOrder.dealerId);
    if (!dealer) return toast.error("Dealer not found");

    const gst = selectedOrder.total * 0.18; // 18% GST
    const total = selectedOrder.total + gst;

    const newInvoice: Invoice = {
      id: `INV${String(invoices.length + 1).padStart(3, '0')}`,
      orderId: selectedOrder.id,
      dealerId: selectedOrder.dealerId,
      dealerName: selectedOrder.dealerName,
      amount: selectedOrder.total,
      gst,
      total,
      date: new Date().toISOString().slice(0, 10),
      status: "Draft",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    };

    setInvoices([newInvoice, ...invoices]);
    toast.success("Invoice generated successfully");
    setGenerateDialog(false);
    setSelectedOrder(null);
  };

  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status, ...(status === "Paid" ? { paymentDate: new Date().toISOString().slice(0, 10) } : {}) } : inv));
    toast.success(`Invoice ${status.toLowerCase()}`);
  };

  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = invoices.filter(i => i.status === "Sent" || i.status === "Overdue").reduce((sum, i) => sum + i.total, 0);
  const gstCollected = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.gst, 0);

  const eligibleOrders = orders.filter(o =>
    (o.status === "Delivered" || o.status === "Shipped") &&
    !invoices.some(inv => inv.orderId === o.id)
  );

  return (
    <>
      <SectionHeader title="Financial Reporting" subtitle="Invoicing, GST, and financial analytics">
        <Button onClick={() => setGenerateDialog(true)} className="bg-gradient-cta">
          <Plus className="mr-2 h-4 w-4" /> Generate Invoice
        </Button>
      </SectionHeader>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4 mb-4 md:mb-6">
        {[
          { label: "Total Revenue", value: formatINR(totalRevenue), icon: IndianRupee, color: "text-leaf" },
          { label: "Pending Payments", value: formatINR(pendingAmount), icon: Clock, color: "text-orange-600" },
          { label: "GST Collected", value: formatINR(gstCollected), icon: FileText, color: "text-blue-600" },
          { label: "Total Invoices", value: invoices.length.toString(), icon: ReceiptText, color: "text-purple-600" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <div className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
              <div className="text-lg md:text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission Calculator */}
      <Card className="shadow-card mb-4 md:mb-6">
        <CardHeader>
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dealer Commission Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dealers.filter(d => d.status === "Approved" && (d.totalRevenue || 0) > 0).map(dealer => {
              const commission = (dealer.totalRevenue || 0) * 0.05; // 5% commission
              return (
                <div key={dealer.id} className="p-4 rounded-lg border bg-card">
                  <div className="font-medium text-sm mb-1">{dealer.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">Total Revenue: {formatINR(dealer.totalRevenue || 0)}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-leaf">{formatINR(commission)}</span>
                    <span className="text-xs text-muted-foreground">commission @ 5%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">GST</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-medium">{inv.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{inv.dealerName}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{inv.date}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{inv.date}</TableCell>
                    <TableCell className="text-right">{formatINR(inv.amount)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-muted-foreground">{formatINR(inv.gst)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatINR(inv.total)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        inv.status === "Paid" ? "bg-leaf/15 text-leaf" :
                          inv.status === "Sent" ? "bg-blue-500/15 text-blue-600" :
                            inv.status === "Overdue" ? "bg-destructive/15 text-destructive" :
                              "bg-accent text-accent-foreground"
                      )}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {inv.status === "Draft" && (
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateInvoiceStatus(inv.id, "Sent")}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {(inv.status === "Sent" || inv.status === "Overdue") && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-leaf" onClick={() => updateInvoiceStatus(inv.id, "Paid")}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No invoices generated yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Generate Invoice Dialog */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>Select an order to generate GST-compliant invoice</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Order</Label>
              <Select value={selectedOrder?.id || ""} onValueChange={(value) => setSelectedOrder(orders.find(o => o.id === value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an order" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleOrders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.dealerName} - {formatINR(order.total)}
                    </SelectItem>
                  ))}
                  {eligibleOrders.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No eligible orders
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedOrder && (
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Amount:</span>
                  <span className="font-medium">{formatINR(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%):</span>
                  <span className="font-medium">{formatINR(selectedOrder.total * 0.18)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span className="text-leaf">{formatINR(selectedOrder.total * 1.18)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialog(false)}>Cancel</Button>
            <Button onClick={generateInvoice} disabled={!selectedOrder} className="bg-gradient-cta">
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ------------------------- CUSTOMER SUPPORT & TICKETING ------------------------- */
const SupportSection = ({ tickets, setTickets, dealers }: {
  tickets: Ticket[]; setTickets: (t: Ticket[]) => void; dealers: Dealer[];
}) => {
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | Ticket["status"]>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | Ticket["priority"]>("all");
  const [form, setForm] = useState<Partial<Ticket>>({
    type: "Complaint",
    subject: "",
    description: "",
    priority: "Medium",
    status: "Open"
  });

  const createTicket = () => {
    if (!form.subject || !form.description) return toast.error("Subject and description required");

    const newTicket: Ticket = {
      id: `TCK${String(tickets.length + 1).padStart(3, '0')}`,
      type: form.type as Ticket["type"],
      subject: form.subject,
      description: form.description,
      status: "Open",
      priority: form.priority as Ticket["priority"],
      date: new Date().toISOString().slice(0, 10),
      comments: []
    };

    setTickets([newTicket, ...tickets]);
    toast.success("Ticket created successfully");
    setCreateDialog(false);
    setForm({ type: "Complaint", subject: "", description: "", priority: "Medium", status: "Open" });
  };

  const updateTicketStatus = (id: string, status: Ticket["status"]) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status, ...(status === "Resolved" || status === "Closed" ? { resolvedDate: new Date().toISOString().slice(0, 10) } : {}) } : t));
    toast.success(`Ticket ${status.toLowerCase()}`);
  };

  const addComment = (ticketId: string, comment: string) => {
    if (!comment.trim()) return;
    setTickets(tickets.map(t => t.id === ticketId ? {
      ...t,
      comments: [...(t.comments || []), { by: "Admin", text: comment, date: new Date().toISOString().slice(0, 10) }]
    } : t));
    toast.success("Comment added");
  };

  const filteredTickets = tickets.filter(t =>
    (filterStatus === "all" || t.status === filterStatus) &&
    (filterPriority === "all" || t.priority === filterPriority)
  );

  const openTickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length;
  const criticalTickets = tickets.filter(t => t.priority === "Critical").length;

  return (
    <>
      <SectionHeader title="Customer Support & Ticketing" subtitle="Manage complaints, warranty claims, and service requests">
        <div className="flex gap-2">
          <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateDialog(true)} className="bg-gradient-cta">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Button>
        </div>
      </SectionHeader>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4 mb-4 md:mb-6">
        {[
          { label: "Total Tickets", value: tickets.length.toString(), icon: MessageSquare, color: "text-blue-600" },
          { label: "Open Tickets", value: openTickets.toString(), icon: AlertCircle, color: "text-orange-600" },
          { label: "Critical", value: criticalTickets.toString(), icon: XCircle, color: "text-destructive" },
          { label: "Resolved", value: tickets.filter(t => t.status === "Resolved").length.toString(), icon: CheckCircle, color: "text-leaf" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <div className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tickets Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Ticket ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate">{ticket.subject}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{ticket.date}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{ticket.date}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        ticket.priority === "Critical" ? "bg-destructive/15 text-destructive" :
                          ticket.priority === "High" ? "bg-orange-500/15 text-orange-600" :
                            ticket.priority === "Medium" ? "bg-blue-500/15 text-blue-600" :
                              "bg-accent text-accent-foreground"
                      )}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        ticket.status === "Resolved" || ticket.status === "Closed" ? "bg-leaf/15 text-leaf" :
                          ticket.status === "In Progress" ? "bg-blue-500/15 text-blue-600" :
                            "bg-orange-500/15 text-orange-600"
                      )}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {ticket.status === "Open" && (
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateTicketStatus(ticket.id, "In Progress")}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        {ticket.status === "In Progress" && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-leaf" onClick={() => updateTicketStatus(ticket.id, "Resolved")}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewTicket(ticket)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No tickets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      {viewTicket && (
        <Dialog open={!!viewTicket} onOpenChange={() => setViewTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ticket Details - {viewTicket.id}</DialogTitle>
              <DialogDescription>{viewTicket.type} • {viewTicket.priority} Priority</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge className="mt-1">{viewTicket.status}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="font-medium">{viewTicket.date}</div>
                </div>
                {viewTicket.serialNo && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Serial Number</div>
                    <div className="font-mono font-medium">{viewTicket.serialNo}</div>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">Subject</div>
                <div className="text-base">{viewTicket.subject}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Description</div>
                <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted">
                  {viewTicket.description}
                </div>
              </div>
              {viewTicket.comments && viewTicket.comments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-3">Comments</div>
                    <div className="space-y-2">
                      {viewTicket.comments.map((comment, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{comment.by}</span>
                            <span className="text-xs text-muted-foreground">{comment.date}</span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {viewTicket.status !== "Closed" && (
                <>
                  <Separator />
                  <div>
                    <Label>Add Comment</Label>
                    <Textarea id="newComment" placeholder="Type your comment here..." />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const comment = (document.getElementById("newComment") as HTMLTextAreaElement).value;
                        addComment(viewTicket.id, comment);
                        (document.getElementById("newComment") as HTMLTextAreaElement).value = "";
                      }}
                    >
                      Add Comment
                    </Button>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewTicket(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Log a new customer issue or service request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as Ticket["type"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Complaint">Complaint</SelectItem>
                    <SelectItem value="Warranty">Warranty</SelectItem>
                    <SelectItem value="Query">Query</SelectItem>
                    <SelectItem value="Return">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value as Ticket["priority"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of the issue" />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={createTicket} className="bg-gradient-cta">Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ------------------------- MARKETING & COMMUNICATION ------------------------- */
const MarketingSection = ({ notifications, setNotifications, media }: {
  notifications: Notification[]; setNotifications: (n: Notification[]) => void; media: MediaAsset[];
}) => {
  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState<Partial<Notification>>({
    title: "",
    message: "",
    type: "promo",
    recipients: "all",
    status: "Draft"
  });

  const createNotification = () => {
    if (!form.title || !form.message) return toast.error("Title and message required");

    const newNotification: Notification = {
      id: `NOT${String(notifications.length + 1).padStart(3, '0')}`,
      title: form.title,
      message: form.message,
      type: form.type as Notification["type"],
      recipients: form.recipients as Notification["recipients"],
      date: new Date().toISOString().slice(0, 10),
      status: "Draft"
    };

    setNotifications([newNotification, ...notifications]);
    toast.success("Notification created");
    setCreateDialog(false);
    setForm({ title: "", message: "", type: "promo", recipients: "all", status: "Draft" });
  };

  const sendNotification = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, status: "Sent" } : n));
    toast.success("Notification sent successfully!");
  };

  const banners = media.filter(m => m.category === "banner");

  return (
    <>
      <SectionHeader title="Marketing & Communication" subtitle="Push notifications and banner management">
        <Button onClick={() => setCreateDialog(true)} className="bg-gradient-cta">
          <Plus className="mr-2 h-4 w-4" /> Create Notification
        </Button>
      </SectionHeader>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 mb-4">
            {[
              { label: "Total Sent", value: notifications.filter(n => n.status === "Sent").length.toString(), icon: Send },
              { label: "Drafts", value: notifications.filter(n => n.status === "Draft").length.toString(), icon: FileText },
              { label: "This Month", value: notifications.filter(n => n.date.startsWith("2026-05") || n.date.startsWith("2026-04")).length.toString(), icon: Calendar },
            ].map((stat, i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4">
            {notifications.map(notification => (
              <Card key={notification.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={notification.type === "promo" ? "default" : notification.type === "alert" ? "destructive" : "secondary"}>
                          {notification.type}
                        </Badge>
                        <Badge variant="outline">{notification.recipients}</Badge>
                        <span className="text-xs text-muted-foreground">{notification.date}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.status === "Draft" ? (
                        <Button size="sm" onClick={() => sendNotification(notification.id)} className="bg-gradient-cta">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      ) : (
                        <Badge className="bg-leaf/15 text-leaf">Sent</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {notifications.length === 0 && (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No notifications created yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Promotional Banners</CardTitle>
              <CardDescription>Manage banners displayed on the app home screen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Upload images in the Media Library and mark them as "banner" category</p>
                <Button variant="outline" className="mt-4" onClick={() => { /* Switch to media tab */ }}>
                  Go to Media Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Notification Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Push Notification</DialogTitle>
            <DialogDescription>Broadcast message to dealers or customers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as Notification["type"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promo">Promotion</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recipients</Label>
                <Select value={form.recipients} onValueChange={(value) => setForm({ ...form, recipients: value as Notification["recipients"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="dealers">Dealers Only</SelectItem>
                    <SelectItem value="customers">Customers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Notification message..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={createNotification} className="bg-gradient-cta">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ------------------------- TEAM MANAGEMENT (RBAC) ------------------------- */
const UsersSection = ({ teamMembers, setTeamMembers }: { teamMembers: TeamMember[]; setTeamMembers: (t: TeamMember[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<Omit<TeamMember, "id">>({
    name: "", username: "", role: "Support Staff", permissions: [], email: "", phone: "", status: "Active"
  });

  const allPermissions = [
    "view_dashboard", "view_orders", "manage_orders", "view_dealers", "manage_dealers",
    "view_inventory", "manage_stock", "view_finance", "generate_invoices", "view_support",
    "manage_tickets", "view_marketing", "send_notifications", "view_reports", "manage_team"
  ];

  const rolePermissionPresets: Record<TeamMember["role"], string[]> = {
    "Admin": allPermissions,
    "Production Manager": ["view_dashboard", "view_inventory", "manage_stock", "view_orders", "view_reports"],
    "Accountant": ["view_dashboard", "view_finance", "generate_invoices", "view_orders", "view_reports"],
    "Sales Manager": ["view_dashboard", "view_dealers", "manage_dealers", "view_orders", "manage_orders", "view_reports"],
    "Support Staff": ["view_dashboard", "view_support", "manage_tickets", "view_dealers"]
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", username: "", role: "Support Staff", permissions: rolePermissionPresets["Support Staff"], email: "", phone: "", status: "Active" });
    setOpen(true);
  };

  const openEdit = (tm: TeamMember) => {
    setEditing(tm);
    setForm({ name: tm.name, username: tm.username, role: tm.role, permissions: tm.permissions, email: tm.email, phone: tm.phone, status: tm.status });
    setOpen(true);
  };

  const save = () => {
    if (!form.name || !form.username) return toast.error("Name and username required");
    if (editing) {
      setTeamMembers(teamMembers.map(tm => tm.id === editing.id ? { ...editing, ...form } : tm));
      toast.success("Team member updated");
    } else {
      setTeamMembers([...teamMembers, { id: `TM${String(teamMembers.length + 1).padStart(3, '0')}`, ...form }]);
      toast.success("Team member added");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    setTeamMembers(teamMembers.filter(tm => tm.id !== id));
    toast.success("Team member removed");
  };

  const togglePermission = (permission: string) => {
    if (form.permissions.includes(permission)) {
      setForm({ ...form, permissions: form.permissions.filter(p => p !== permission) });
    } else {
      setForm({ ...form, permissions: [...form.permissions, permission] });
    }
  };

  return (
    <>
      <SectionHeader title="Team Management (RBAC)" subtitle="Manage team members and their access permissions">
        <Button onClick={openCreate} className="bg-gradient-cta">
          <Plus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      </SectionHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map(member => (
          <Card key={member.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-xs text-muted-foreground">@{member.username}</div>
                  </div>
                </div>
                <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                  {member.status}
                </Badge>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">{member.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-xs">{member.phone}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {member.permissions.length} permissions assigned
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(member)}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => remove(member.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Team Member Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Team Member</DialogTitle>
            <DialogDescription>Configure user details and access permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <Label>Username *</Label>
                <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="johndoe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value) => {
                  const role = value as TeamMember["role"];
                  setForm({ ...form, role, permissions: rolePermissionPresets[role] });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Production Manager">Production Manager</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                    <SelectItem value="Support Staff">Support Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as TeamMember["status"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-base">Permissions</Label>
              <p className="text-xs text-muted-foreground mb-3">Select specific permissions for this user</p>
              <div className="grid grid-cols-2 gap-2">
                {allPermissions.map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={permission}
                      checked={form.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={permission} className="text-sm cursor-pointer">
                      {permission.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-cta">{editing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ------------------------- REPORTS & ANALYTICS ------------------------- */
const ReportsSection = ({ orders, dealers, invoices }: {
  orders: Order[]; dealers: Dealer[]; invoices: Invoice[];
}) => {
  const generateReport = (type: string) => {
    toast.success(`Generating ${type} report...`);
    // In a real app, this would trigger a download
  };

  const totalSales = orders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);
  const totalGST = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.gst, 0);
  const topDealer = dealers.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))[0];

  return (
    <>
      <SectionHeader title="Reports & Analytics" subtitle="Download business reports and analytics" />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "Total Sales", value: formatINR(totalSales), icon: TrendingUp, color: "text-leaf" },
          { label: "GST Collected", value: formatINR(totalGST), icon: FileText, color: "text-blue-600" },
          { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, color: "text-purple-600" },
          { label: "Active Dealers", value: dealers.filter(d => d.status === "Approved").length.toString(), icon: Users, color: "text-orange-600" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performer */}
      {topDealer && (
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performing Dealer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
              <div>
                <div className="font-semibold text-lg">{topDealer.name}</div>
                <div className="text-sm text-muted-foreground">{topDealer.city} • {topDealer.code}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-leaf">{formatINR(topDealer.totalRevenue || 0)}</div>
                <div className="text-xs text-muted-foreground">{topDealer.totalOrders} orders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Downloads */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "Sales Report", description: "Monthly sales summary with order details", icon: BarChart3, action: "sales" },
          { title: "GST Report", description: "Tax collected and payable for compliance", icon: FileSpreadsheet, action: "gst" },
          { title: "Dealer Performance", description: "Detailed dealer-wise sales analysis", icon: Target, action: "dealer" },
          { title: "Inventory Report", description: "Current stock levels and movements", icon: Package, action: "inventory" },
          { title: "Financial Summary", description: "Revenue, expenses, and profit analysis", icon: IndianRupee, action: "financial" },
          { title: "Support Tickets", description: "Customer service and warranty claims", icon: Headphones, action: "support" },
        ].map((report, i) => (
          <Card key={i} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cta text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <report.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold mb-1">{report.title}</div>
                  <div className="text-sm text-muted-foreground mb-3">{report.description}</div>
                  <Button size="sm" variant="outline" onClick={() => generateReport(report.title)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

/* ------------------------- Media ------------------------- */
const MediaSection = ({ media, setMedia }: { media: MediaAsset[]; setMedia: (m: MediaAsset[]) => void }) => {
  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next: MediaAsset[] = [];
    Array.from(files).forEach((f) => {
      const kind: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      next.push({ id: `${Date.now()}-${f.name}`, name: f.name, url: URL.createObjectURL(f), kind });
    });
    setMedia([...next, ...media]);
    toast.success(`${next.length} file(s) uploaded`);
  };

  const remove = (id: string) => { setMedia(media.filter(m => m.id !== id)); };

  return (
    <>
      <SectionHeader title="Media Library" subtitle="Upload photos and videos for your storefront">
        <label className="inline-flex">
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => onFiles(e.target.files)} />
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gradient-cta text-primary-foreground cursor-pointer shadow-soft hover:opacity-90 transition-smooth">
            <Upload className="h-4 w-4" /> Upload Files
          </span>
        </label>
      </SectionHeader>

      <label className="block">
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => onFiles(e.target.files)} />
        <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:bg-muted/40 transition-smooth cursor-pointer mb-6">
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <div className="font-medium">Drop files here or click to browse</div>
          <div className="text-sm text-muted-foreground">Images (JPG, PNG) and videos (MP4) up to 50 MB</div>
        </div>
      </label>

      {media.length === 0 ? (
        <Card className="shadow-card"><CardContent className="p-10 text-center text-muted-foreground">No media uploaded yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map(m => (
            <Card key={m.id} className="overflow-hidden shadow-card group">
              <div className="aspect-video bg-muted relative">
                {m.kind === "image" ? (
                  <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <video src={m.url} className="h-full w-full object-cover" muted />
                )}
                <button onClick={() => remove(m.id)} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 text-destructive opacity-0 group-hover:opacity-100 transition-smooth inline-flex items-center justify-center">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <CardContent className="p-3 flex items-center gap-2">
                {m.kind === "image" ? <ImageIcon className="h-4 w-4 text-primary" /> : <Film className="h-4 w-4 text-primary" />}
                <div className="text-xs truncate">{m.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

/* ------------------------- EMPLOYEE MANAGEMENT (RBAC) ------------------------- */
const EmployeeSection = ({ employees, setEmployees }: { employees: Employee[]; setEmployees: (e: Employee[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id" | "employeeId" | "permissions" | "createdDate">>({
    name: "",
    email: "",
    phone: "",
    role: "Production Team",
    employeeRole: "production",
    status: "Active",
    password: "employee@123"
  });

  const roleMapping: Record<Employee["role"], EmployeeRole> = {
    "Production Team": "production",
    "Sales & Marketing Team": "sales",
    "Service Technicians": "service"
  };

  const reverseRoleMapping: Record<EmployeeRole, Employee["role"]> = {
    "production": "Production Team",
    "sales": "Sales & Marketing Team",
    "service": "Service Technicians"
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Production Team",
      employeeRole: "production",
      status: "Active",
      password: "employee@123"
    });
    setOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      employeeRole: emp.employeeRole,
      status: emp.status,
      password: emp.password
    });
    setOpen(true);
  };

  const generateEmployeeId = () => {
    const maxId = employees.reduce((max, emp) => {
      const num = parseInt(emp.employeeId.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `MS-${String(maxId + 1).padStart(3, '0')}`;
  };

  const save = () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }

    if (editing) {
      // Update existing employee
      const permissions = ROLE_PERMISSIONS[form.employeeRole];
      setEmployees(employees.map(emp =>
        emp.id === editing.id
          ? { ...emp, ...form, permissions }
          : emp
      ));
      toast.success("Employee updated successfully");
    } else {
      // Create new employee
      const newEmployeeId = generateEmployeeId();
      const permissions = ROLE_PERMISSIONS[form.employeeRole];
      const newEmployee: Employee = {
        id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        employeeId: newEmployeeId,
        ...form,
        permissions,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setEmployees([...employees, newEmployee]);
      toast.success(`Employee created with ID: ${newEmployeeId}`);
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast.success("Employee removed successfully");
  };

  const toggleStatus = (id: string) => {
    setEmployees(employees.map(emp =>
      emp.id === id
        ? { ...emp, status: emp.status === "Active" ? "Inactive" : "Active" }
        : emp
    ));
  };

  const handleRoleChange = (role: Employee["role"]) => {
    const employeeRole = roleMapping[role];
    setForm({ ...form, role, employeeRole });
  };

  const getRoleBadgeColor = (role: Employee["role"]) => {
    switch (role) {
      case "Production Team": return "bg-blue-500";
      case "Sales & Marketing Team": return "bg-green-500";
      case "Service Technicians": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <>
      <SectionHeader
        title="Employee Management"
        subtitle="Manage employees with role-based access control. Each employee has a unique ID for login."
      >
        <Button onClick={openCreate} className="bg-gradient-cta">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </SectionHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter(e => e.status === "Active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Production Team</p>
                <p className="text-2xl font-bold text-blue-600">
                  {employees.filter(e => e.employeeRole === "production").length}
                </p>
              </div>
              <Boxes className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sales & Service</p>
                <p className="text-2xl font-bold text-purple-600">
                  {employees.filter(e => e.employeeRole === "sales" || e.employeeRole === "service").length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map(employee => (
          <Card key={employee.id} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg",
                    getRoleBadgeColor(employee.role)
                  )}>
                    {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{employee.name}</div>
                    <div className="text-sm font-mono text-primary font-medium">{employee.employeeId}</div>
                  </div>
                </div>
                <Badge variant={employee.status === "Active" ? "default" : "secondary"} className="text-xs">
                  {employee.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getRoleBadgeColor(employee.role))}>
                    {employee.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-xs truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-xs">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="text-xs">{employee.permissions.length} permissions</span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => openEdit(employee)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => toggleStatus(employee.id)}
                >
                  {employee.status === "Active" ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive h-8 text-xs"
                  onClick={() => remove(employee.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update employee information and role assignment."
                : "Create a new employee with auto-generated employee ID. Default password: employee@123"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emp-name">Full Name *</Label>
              <Input
                id="emp-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-email">Email *</Label>
              <Input
                id="emp-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="employee@msi.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-phone">Phone *</Label>
              <Input
                id="emp-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-role">Role *</Label>
              <Select value={form.role} onValueChange={handleRoleChange}>
                <SelectTrigger id="emp-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production Team">Production Team</SelectItem>
                  <SelectItem value="Sales & Marketing Team">Sales & Marketing Team</SelectItem>
                  <SelectItem value="Service Technicians">Service Technicians</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Permissions will be auto-assigned based on role
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-password">Password</Label>
              <Input
                id="emp-password"
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="employee@123"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.status === "Active"}
                  onCheckedChange={(checked) => setForm({ ...form, status: checked ? "Active" : "Inactive" })}
                />
                <span className="text-sm">{form.status}</span>
              </div>
            </div>

            {/* Permissions Preview */}
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <Label className="text-xs font-semibold">Assigned Permissions:</Label>
              <div className="flex flex-wrap gap-1">
                {ROLE_PERMISSIONS[form.employeeRole].map(permission => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-cta">
              {editing ? "Update Employee" : "Create Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Admin;
