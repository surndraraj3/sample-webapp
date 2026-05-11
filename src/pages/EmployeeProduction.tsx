import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    Boxes, Package, AlertCircle, CheckCircle, Plus, Pencil, TrendingUp, Activity,
    Factory, PackageCheck, PackageMinus, PackagePlus, Warehouse
} from "lucide-react";
import { useAuth, PERMISSIONS } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/PermissionGate";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type InventoryItem = {
    id: string;
    name: string;
    quantity: number;
    minStock: number;
    unit: string;
    lastUpdated: string;
};

type RawMaterial = {
    id: string;
    name: string;
    quantity: number;
    minStock: number;
    unit: string;
    supplier: string;
    lastOrder: string;
};

type ProductionStatus = {
    id: string;
    productName: string;
    batchNumber: string;
    quantity: number;
    status: "In Progress" | "Completed" | "Quality Check" | "Packaging";
    startDate: string;
    expectedCompletion: string;
};

const initialInventory: InventoryItem[] = [
    { id: "INV001", name: "Smart Water Motor Robo", quantity: 145, minStock: 50, unit: "pcs", lastUpdated: "2026-05-10" },
    { id: "INV002", name: "Anti-Scaling Unit", quantity: 89, minStock: 30, unit: "pcs", lastUpdated: "2026-05-09" },
    { id: "INV003", name: "Water Level Controller", quantity: 234, minStock: 100, unit: "pcs", lastUpdated: "2026-05-08" },
    { id: "INV004", name: "Motor Controller Pro", quantity: 67, minStock: 40, unit: "pcs", lastUpdated: "2026-05-11" },
    { id: "INV005", name: "Smart Pump System", quantity: 28, minStock: 50, unit: "pcs", lastUpdated: "2026-05-10" },
];

const initialRawMaterials: RawMaterial[] = [
    { id: "RM001", name: "PCB Boards", quantity: 500, minStock: 100, unit: "pcs", supplier: "TechSupply Co", lastOrder: "2026-04-01" },
    { id: "RM002", name: "Microcontrollers", quantity: 300, minStock: 50, unit: "pcs", supplier: "ElectroMart", lastOrder: "2026-03-28" },
    { id: "RM003", name: "Plastic Casing", quantity: 85, minStock: 200, unit: "pcs", supplier: "PlasticWorks Ltd", lastOrder: "2026-03-15" },
    { id: "RM004", name: "Wiring Harness", quantity: 800, minStock: 300, unit: "meters", supplier: "WireSupply Inc", lastOrder: "2026-04-10" },
    { id: "RM005", name: "Sensors", quantity: 450, minStock: 150, unit: "pcs", supplier: "SensorTech", lastOrder: "2026-04-05" },
];

const initialProduction: ProductionStatus[] = [
    { id: "PROD001", productName: "Smart Water Motor Robo", batchNumber: "BATCH-2026-051", quantity: 50, status: "In Progress", startDate: "2026-05-08", expectedCompletion: "2026-05-15" },
    { id: "PROD002", productName: "Anti-Scaling Unit", batchNumber: "BATCH-2026-052", quantity: 30, status: "Quality Check", startDate: "2026-05-05", expectedCompletion: "2026-05-12" },
    { id: "PROD003", productName: "Water Level Controller", batchNumber: "BATCH-2026-053", quantity: 100, status: "Packaging", startDate: "2026-05-03", expectedCompletion: "2026-05-11" },
    { id: "PROD004", productName: "Motor Controller Pro", batchNumber: "BATCH-2026-054", quantity: 25, status: "Completed", startDate: "2026-05-01", expectedCompletion: "2026-05-09" },
];

const EmployeeProduction = () => {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(initialRawMaterials);
    const [production, setProduction] = useState<ProductionStatus[]>(initialProduction);
    const [activeTab, setActiveTab] = useState<"inventory" | "raw-materials" | "production">("inventory");
    const [editDialog, setEditDialog] = useState<{ open: boolean; item: InventoryItem | RawMaterial | null; type: "inventory" | "raw" }>({
        open: false,
        item: null,
        type: "inventory"
    });

    const lowStockInventory = inventory.filter(item => item.quantity < item.minStock);
    const lowStockMaterials = rawMaterials.filter(item => item.quantity < item.minStock);
    const activeProduction = production.filter(p => p.status !== "Completed");

    const handleUpdateQuantity = (id: string, newQuantity: number, type: "inventory" | "raw") => {
        if (type === "inventory") {
            setInventory(inventory.map(item =>
                item.id === id ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] } : item
            ));
            toast.success("Inventory updated successfully");
        } else {
            setRawMaterials(rawMaterials.map(item =>
                item.id === id ? { ...item, quantity: newQuantity, lastOrder: new Date().toISOString().split('T')[0] } : item
            ));
            toast.success("Raw material updated successfully");
        }
        setEditDialog({ open: false, item: null, type: "inventory" });
    };

    const handleUpdateProductionStatus = (id: string, newStatus: ProductionStatus["status"]) => {
        setProduction(production.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
        toast.success("Production status updated");
    };

    const getStatusColor = (status: ProductionStatus["status"]) => {
        switch (status) {
            case "In Progress": return "bg-blue-500";
            case "Quality Check": return "bg-yellow-500";
            case "Packaging": return "bg-purple-500";
            case "Completed": return "bg-green-500";
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
                            <Factory className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Production Dashboard</h1>
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
                                    <p className="text-sm text-muted-foreground">Total Inventory</p>
                                    <p className="text-2xl font-bold">{inventory.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                </div>
                                <Warehouse className="h-8 w-8 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                                    <p className="text-2xl font-bold text-red-600">{lowStockInventory.length + lowStockMaterials.length}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Production</p>
                                    <p className="text-2xl font-bold text-blue-600">{activeProduction.length}</p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed Today</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {production.filter(p => p.status === "Completed").length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
                    <TabsList className="grid grid-cols-3 w-full max-w-2xl">
                        <TabsTrigger value="inventory">
                            <Package className="h-4 w-4 mr-2" />
                            Inventory
                        </TabsTrigger>
                        <TabsTrigger value="raw-materials">
                            <Boxes className="h-4 w-4 mr-2" />
                            Raw Materials
                        </TabsTrigger>
                        <TabsTrigger value="production">
                            <Factory className="h-4 w-4 mr-2" />
                            Production Status
                        </TabsTrigger>
                    </TabsList>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory">
                        <Card className="shadow-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Product Inventory</CardTitle>
                                        <CardDescription>View and update finished goods stock levels</CardDescription>
                                    </div>
                                    {lowStockInventory.length > 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {lowStockInventory.length} Low Stock
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product Name</TableHead>
                                                <TableHead>Current Stock</TableHead>
                                                <TableHead>Min Stock</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Last Updated</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventory.map((item) => {
                                                const isLowStock = item.quantity < item.minStock;
                                                const stockPercentage = (item.quantity / item.minStock) * 100;
                                                return (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn(
                                                                    "font-semibold",
                                                                    isLowStock ? "text-red-600" : "text-green-600"
                                                                )}>
                                                                    {item.quantity} {item.unit}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{item.minStock} {item.unit}</TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <Badge variant={isLowStock ? "destructive" : "default"} className="text-xs">
                                                                    {isLowStock ? "Low Stock" : "Adequate"}
                                                                </Badge>
                                                                <Progress
                                                                    value={Math.min(stockPercentage, 100)}
                                                                    className={cn(
                                                                        "h-1.5 w-20",
                                                                        isLowStock ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"
                                                                    )}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                                                        <TableCell>
                                                            <PermissionGate requires={PERMISSIONS.UPDATE_INVENTORY}>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setEditDialog({ open: true, item, type: "inventory" })}
                                                                >
                                                                    <Pencil className="h-3 w-3 mr-1" />
                                                                    Update
                                                                </Button>
                                                            </PermissionGate>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Raw Materials Tab */}
                    <TabsContent value="raw-materials">
                        <Card className="shadow-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Raw Materials Inventory</CardTitle>
                                        <CardDescription>Manage raw materials and components stock</CardDescription>
                                    </div>
                                    {lowStockMaterials.length > 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {lowStockMaterials.length} Need Reorder
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Material Name</TableHead>
                                                <TableHead>Current Stock</TableHead>
                                                <TableHead>Min Stock</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Last Order</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rawMaterials.map((item) => {
                                                const isLowStock = item.quantity < item.minStock;
                                                return (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell>
                                                            <span className={cn(
                                                                "font-semibold",
                                                                isLowStock ? "text-red-600" : "text-green-600"
                                                            )}>
                                                                {item.quantity} {item.unit}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>{item.minStock} {item.unit}</TableCell>
                                                        <TableCell className="text-sm">{item.supplier}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{item.lastOrder}</TableCell>
                                                        <TableCell>
                                                            <PermissionGate requires={PERMISSIONS.MANAGE_RAW_MATERIALS}>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setEditDialog({ open: true, item, type: "raw" })}
                                                                >
                                                                    <Pencil className="h-3 w-3 mr-1" />
                                                                    Update
                                                                </Button>
                                                            </PermissionGate>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Production Status Tab */}
                    <TabsContent value="production">
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle>Production Status Board</CardTitle>
                                <CardDescription>Track and update manufacturing progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                                    {production.map((item) => (
                                        <Card key={item.id} className="shadow-sm">
                                            <CardContent className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-base">{item.productName}</h4>
                                                            <p className="text-xs text-muted-foreground font-mono">{item.batchNumber}</p>
                                                        </div>
                                                        <Badge className={cn("text-xs", getStatusColor(item.status))}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>

                                                    <Separator />

                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground text-xs">Quantity</p>
                                                            <p className="font-semibold">{item.quantity} units</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground text-xs">Start Date</p>
                                                            <p className="font-semibold text-xs">{item.startDate}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-muted-foreground text-xs">Expected Completion</p>
                                                            <p className="font-semibold text-xs">{item.expectedCompletion}</p>
                                                        </div>
                                                    </div>

                                                    <PermissionGate requires={PERMISSIONS.UPDATE_PRODUCTION_STATUS}>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">Update Status</Label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {(["In Progress", "Quality Check", "Packaging", "Completed"] as const).map((status) => (
                                                                    <Button
                                                                        key={status}
                                                                        size="sm"
                                                                        variant={item.status === status ? "default" : "outline"}
                                                                        className="text-xs h-8"
                                                                        onClick={() => handleUpdateProductionStatus(item.id, status)}
                                                                    >
                                                                        {status}
                                                                    </Button>
                                                                ))}
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
                </Tabs>

                {/* Edit Quantity Dialog */}
                <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update {editDialog.type === "inventory" ? "Inventory" : "Raw Material"} Quantity</DialogTitle>
                        </DialogHeader>
                        {editDialog.item && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Item Name</Label>
                                    <Input value={editDialog.item.name} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Quantity</Label>
                                    <Input
                                        type="number"
                                        defaultValue={editDialog.item.quantity}
                                        id="new-quantity"
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Minimum required: {editDialog.item.minStock} {editDialog.item.unit}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialog({ open: false, item: null, type: "inventory" })}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const input = document.getElementById("new-quantity") as HTMLInputElement;
                                    if (input && editDialog.item) {
                                        handleUpdateQuantity(editDialog.item.id, parseInt(input.value), editDialog.type);
                                    }
                                }}
                            >
                                Update Quantity
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SiteLayout>
    );
};

export default EmployeeProduction;
