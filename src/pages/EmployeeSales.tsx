import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp, Users, ShoppingCart, DollarSign, Plus, Pencil, Check, X,
    Phone, Mail, MapPin, BarChart3, Target, Zap, FileText, UserPlus, Eye
} from "lucide-react";
import { useAuth, PERMISSIONS } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/PermissionGate";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatINR } from "@/data/products";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Dealer = {
    id: string;
    code: string;
    name: string;
    city: string;
    phone: string;
    email: string;
    status: "Pending" | "Approved" | "Suspended";
    creditLimit: number;
    outstanding: number;
    totalOrders: number;
    totalRevenue: number;
};

type Order = {
    id: string;
    dealerId: string;
    dealerName: string;
    items: { product: string; qty: number; price: number }[];
    total: number;
    status: "Pending" | "Approved" | "Shipped" | "Delivered" | "Rejected";
    date: string;
};

const initialDealers: Dealer[] = [
    { id: "1", code: "DLR001", name: "Suresh Agro Distributors", city: "Warangal", phone: "9876543210", email: "suresh@agro.com", status: "Approved", creditLimit: 500000, outstanding: 125000, totalOrders: 45, totalRevenue: 2340000 },
    { id: "2", code: "DLR002", name: "Krishna Pumps", city: "Vijayawada", phone: "9876500011", email: "krishna@pumps.com", status: "Approved", creditLimit: 300000, outstanding: 85000, totalOrders: 32, totalRevenue: 1650000 },
    { id: "3", code: "DLR003", name: "Sai Irrigation", city: "Tirupati", phone: "9876500022", email: "sai@irrigation.com", status: "Pending", creditLimit: 200000, outstanding: 0, totalOrders: 0, totalRevenue: 0 },
    { id: "4", code: "DLR004", name: "Reddy Trade Links", city: "Nellore", phone: "9876500033", email: "reddy@trade.com", status: "Pending", creditLimit: 250000, outstanding: 0, totalOrders: 0, totalRevenue: 0 },
    { id: "5", code: "DLR005", name: "Venkat Enterprises", city: "Guntur", phone: "9876500044", email: "venkat@ent.com", status: "Approved", creditLimit: 400000, outstanding: 156000, totalOrders: 38, totalRevenue: 1980000 },
];

const initialOrders: Order[] = [
    { id: "ORD001", dealerId: "1", dealerName: "Suresh Agro Distributors", items: [{ product: "Smart Water Motor Robo", qty: 10, price: 12500 }], total: 125000, status: "Delivered", date: "2026-04-15" },
    { id: "ORD002", dealerId: "2", dealerName: "Krishna Pumps", items: [{ product: "Anti-Scaling Unit", qty: 5, price: 8500 }], total: 42500, status: "Shipped", date: "2026-04-28" },
    { id: "ORD003", dealerId: "5", dealerName: "Venkat Enterprises", items: [{ product: "Smart Water Motor Robo", qty: 15, price: 12500 }], total: 187500, status: "Approved", date: "2026-05-02" },
    { id: "ORD004", dealerId: "1", dealerName: "Suresh Agro Distributors", items: [{ product: "Anti-Scaling Unit", qty: 8, price: 8500 }], total: 68000, status: "Pending", date: "2026-05-05" },
    { id: "ORD005", dealerId: "3", dealerName: "Sai Irrigation", items: [{ product: "Water Level Controller", qty: 12, price: 6500 }], total: 78000, status: "Pending", date: "2026-05-10" },
];

const salesData = [
    { month: "Jan", revenue: 980000, orders: 48 },
    { month: "Feb", revenue: 1450000, orders: 72 },
    { month: "Mar", revenue: 1680000, orders: 85 },
    { month: "Apr", revenue: 1920000, orders: 95 },
    { month: "May", revenue: 856000, orders: 42 },
];

const dealerPerformance = [
    { name: "Suresh Agro", value: 2340000, color: "#10b981" },
    { name: "Venkat Ent.", value: 1980000, color: "#3b82f6" },
    { name: "Krishna Pumps", value: 1650000, color: "#f59e0b" },
    { name: "Others", value: 980000, color: "#6366f1" },
];

const EmployeeSales = () => {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const [dealers, setDealers] = useState<Dealer[]>(initialDealers);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [activeTab, setActiveTab] = useState<"dealers" | "orders" | "performance">("dealers");
    const [dealerDialog, setDealerDialog] = useState<{ open: boolean; dealer: Dealer | null }>({ open: false, dealer: null });
    const [orderDialog, setOrderDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });

    const pendingDealers = dealers.filter(d => d.status === "Pending");
    const pendingOrders = orders.filter(o => o.status === "Pending");
    const totalRevenue = orders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);
    const approvedDealers = dealers.filter(d => d.status === "Approved");

    const handleApproveDealerWithPermissions = (dealerId: string) => {
        if (!hasPermission(PERMISSIONS.MANAGE_DEALERS)) {
            toast.error("You don't have permission to approve dealers");
            return;
        }
        setDealers(dealers.map(d => d.id === dealerId ? { ...d, status: "Approved" as const } : d));
        toast.success("Dealer approved successfully");
    };

    const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
        if (!hasPermission(PERMISSIONS.MANAGE_ORDERS)) {
            toast.error("You don't have permission to update orders");
            return;
        }
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success(`Order ${newStatus.toLowerCase()} successfully`);
    };

    const handleAddDealer = (newDealer: Omit<Dealer, "id" | "code" | "totalOrders" | "totalRevenue">) => {
        const newCode = `DLR${String(dealers.length + 1).padStart(3, '0')}`;
        const dealer: Dealer = {
            ...newDealer,
            id: String(dealers.length + 1),
            code: newCode,
            totalOrders: 0,
            totalRevenue: 0,
        };
        setDealers([...dealers, dealer]);
        toast.success(`Dealer added with code: ${newCode}`);
        setDealerDialog({ open: false, dealer: null });
    };

    const getStatusColor = (status: Dealer["status"] | Order["status"]) => {
        switch (status) {
            case "Pending": return "bg-yellow-500";
            case "Approved": return "bg-green-500";
            case "Suspended": return "bg-red-500";
            case "Shipped": return "bg-blue-500";
            case "Delivered": return "bg-green-500";
            case "Rejected": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <SiteLayout>
            <div className="container py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-gradient-cta flex items-center justify-center text-white">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Sales & Marketing Dashboard</h1>
                            <p className="text-muted-foreground">Welcome, {user?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Dealers</p>
                                    <p className="text-2xl font-bold">{dealers.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                                    <p className="text-2xl font-bold text-yellow-600">{pendingDealers.length}</p>
                                </div>
                                <UserPlus className="h-8 w-8 text-yellow-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                                    <p className="text-2xl font-bold text-orange-600">{pendingOrders.length}</p>
                                </div>
                                <ShoppingCart className="h-8 w-8 text-orange-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-xl font-bold text-green-600">{formatINR(totalRevenue)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
                    <TabsList className="grid grid-cols-3 w-full max-w-2xl">
                        <TabsTrigger value="dealers">
                            <Users className="h-4 w-4 mr-2" />
                            Dealers
                        </TabsTrigger>
                        <TabsTrigger value="orders">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Orders
                        </TabsTrigger>
                        <TabsTrigger value="performance">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Performance
                        </TabsTrigger>
                    </TabsList>

                    {/* Dealers Tab */}
                    <TabsContent value="dealers">
                        <Card className="shadow-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Dealer Management</CardTitle>
                                        <CardDescription>View, approve, and manage dealer profiles</CardDescription>
                                    </div>
                                    <PermissionGate requires={PERMISSIONS.MANAGE_DEALERS}>
                                        <Button onClick={() => setDealerDialog({ open: true, dealer: null })} className="bg-gradient-cta">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Dealer
                                        </Button>
                                    </PermissionGate>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Dealer Code</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>City</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Orders</TableHead>
                                                <TableHead>Revenue</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dealers.map((dealer) => (
                                                <TableRow key={dealer.id}>
                                                    <TableCell className="font-mono font-medium">{dealer.code}</TableCell>
                                                    <TableCell className="font-medium">{dealer.name}</TableCell>
                                                    <TableCell>{dealer.city}</TableCell>
                                                    <TableCell>
                                                        <div className="text-xs space-y-1">
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {dealer.phone}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                {dealer.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("text-xs", getStatusColor(dealer.status))}>
                                                            {dealer.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{dealer.totalOrders}</TableCell>
                                                    <TableCell className="font-semibold">{formatINR(dealer.totalRevenue)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {dealer.status === "Pending" && (
                                                                <PermissionGate requires={PERMISSIONS.MANAGE_DEALERS}>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 text-xs"
                                                                        onClick={() => handleApproveDealerWithPermissions(dealer.id)}
                                                                    >
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                </PermissionGate>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs"
                                                                onClick={() => setDealerDialog({ open: true, dealer })}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders">
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle>Order Management</CardTitle>
                                <CardDescription>Process and track dealer purchase orders</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <Card key={order.id} className="shadow-sm">
                                            <CardContent className="p-4">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-2 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono font-semibold text-primary">{order.id}</span>
                                                            <Badge className={cn("text-xs", getStatusColor(order.status))}>
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{order.dealerName}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {order.items.map(item => `${item.product} (${item.qty}x)`).join(", ")}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span>Date: {order.date}</span>
                                                            <span className="font-semibold text-foreground">Total: {formatINR(order.total)}</span>
                                                        </div>
                                                    </div>

                                                    <PermissionGate requires={PERMISSIONS.MANAGE_ORDERS}>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">Update Status</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {order.status === "Pending" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 text-xs"
                                                                            onClick={() => handleUpdateOrderStatus(order.id, "Approved")}
                                                                        >
                                                                            <Check className="h-3 w-3 mr-1" />
                                                                            Approve
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 text-xs text-destructive"
                                                                            onClick={() => handleUpdateOrderStatus(order.id, "Rejected")}
                                                                        >
                                                                            <X className="h-3 w-3 mr-1" />
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {order.status === "Approved" && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 text-xs"
                                                                        onClick={() => handleUpdateOrderStatus(order.id, "Shipped")}
                                                                    >
                                                                        Ship Order
                                                                    </Button>
                                                                )}
                                                                {order.status === "Shipped" && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 text-xs"
                                                                        onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                                                                    >
                                                                        Mark Delivered
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </PermissionGate>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance">
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Sales Trend */}
                            <Card className="shadow-card">
                                <CardHeader>
                                    <CardTitle>Sales Trend</CardTitle>
                                    <CardDescription>Monthly revenue and order volume</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                                            <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Dealer Performance */}
                            <Card className="shadow-card">
                                <CardHeader>
                                    <CardTitle>Top Dealers by Revenue</CardTitle>
                                    <CardDescription>Distribution of total revenue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={dealerPerformance}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => entry.name}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {dealerPerformance.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatINR(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="shadow-card lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Target className="h-4 w-4" />
                                                Active Dealers
                                            </div>
                                            <p className="text-2xl font-bold">{approvedDealers.length}</p>
                                            <Progress value={(approvedDealers.length / dealers.length) * 100} className="h-2" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Zap className="h-4 w-4" />
                                                Avg Order Value
                                            </div>
                                            <p className="text-2xl font-bold">{formatINR(Math.round(totalRevenue / orders.length))}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                Total Orders
                                            </div>
                                            <p className="text-2xl font-bold">{orders.length}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <TrendingUp className="h-4 w-4" />
                                                Growth Rate
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">+24.5%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Add/View Dealer Dialog */}
                <Dialog open={dealerDialog.open} onOpenChange={(open) => setDealerDialog({ ...dealerDialog, open })}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{dealerDialog.dealer ? "Dealer Details" : "Add New Dealer"}</DialogTitle>
                            <DialogDescription>
                                {dealerDialog.dealer ? "View dealer information" : "Register a new dealer in the system"}
                            </DialogDescription>
                        </DialogHeader>
                        {dealerDialog.dealer ? (
                            <div className="space-y-3 py-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Dealer Code:</div>
                                    <div className="font-mono font-semibold">{dealerDialog.dealer.code}</div>
                                    <div className="text-muted-foreground">Name:</div>
                                    <div className="font-medium">{dealerDialog.dealer.name}</div>
                                    <div className="text-muted-foreground">City:</div>
                                    <div>{dealerDialog.dealer.city}</div>
                                    <div className="text-muted-foreground">Phone:</div>
                                    <div>{dealerDialog.dealer.phone}</div>
                                    <div className="text-muted-foreground">Email:</div>
                                    <div className="text-xs">{dealerDialog.dealer.email}</div>
                                    <div className="text-muted-foreground">Credit Limit:</div>
                                    <div className="font-semibold">{formatINR(dealerDialog.dealer.creditLimit)}</div>
                                    <div className="text-muted-foreground">Outstanding:</div>
                                    <div className="font-semibold text-red-600">{formatINR(dealerDialog.dealer.outstanding)}</div>
                                    <div className="text-muted-foreground">Total Orders:</div>
                                    <div className="font-semibold">{dealerDialog.dealer.totalOrders}</div>
                                    <div className="text-muted-foreground">Total Revenue:</div>
                                    <div className="font-semibold text-green-600">{formatINR(dealerDialog.dealer.totalRevenue)}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Dealer Name *</Label>
                                    <Input id="dealer-name" placeholder="Enter dealer name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>City *</Label>
                                    <Input id="dealer-city" placeholder="Enter city" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone *</Label>
                                    <Input id="dealer-phone" type="tel" placeholder="9876543210" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input id="dealer-email" type="email" placeholder="dealer@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Credit Limit (₹)</Label>
                                    <Input id="dealer-credit" type="number" placeholder="500000" defaultValue="500000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select defaultValue="Pending">
                                        <SelectTrigger id="dealer-status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDealerDialog({ open: false, dealer: null })}>
                                {dealerDialog.dealer ? "Close" : "Cancel"}
                            </Button>
                            {!dealerDialog.dealer && (
                                <Button onClick={() => {
                                    const name = (document.getElementById("dealer-name") as HTMLInputElement).value;
                                    const city = (document.getElementById("dealer-city") as HTMLInputElement).value;
                                    const phone = (document.getElementById("dealer-phone") as HTMLInputElement).value;
                                    const email = (document.getElementById("dealer-email") as HTMLInputElement).value;
                                    const creditLimit = parseInt((document.getElementById("dealer-credit") as HTMLInputElement).value);
                                    const status = (document.getElementById("dealer-status") as HTMLSelectElement)?.value as Dealer["status"] || "Pending";

                                    if (name && city && phone && email) {
                                        handleAddDealer({ name, city, phone, email, status, creditLimit, outstanding: 0 });
                                    } else {
                                        toast.error("Please fill all required fields");
                                    }
                                }}>
                                    Add Dealer
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SiteLayout>
    );
};

export default EmployeeSales;
