import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Boxes, Package, ClipboardList, Wrench, IndianRupee, Plus, UserPlus, MessageSquarePlus } from "lucide-react";
import { formatINR, products } from "@/data/products";
import { toast } from "sonner";

type StockRow = { id: string; name: string; price: number; stock: number };
type Installation = { id: number; customer: string; phone: string; location: string; product: string; date: string };
type Ticket = { id: string; customer: string; issue: string; status: "Open" | "In Progress" | "Resolved" };
type Order = { id: string; product: string; qty: number; total: number; date: string; status: "Placed" | "Dispatched" };

const initialStock: StockRow[] = products.map((p, i) => ({
  id: p.id, name: p.name.en, price: p.price, stock: [12, 5, 2, 18][i],
}));

const initialInstalls: Installation[] = [
  { id: 1, customer: "Ravi Kumar", phone: "98765 43210", location: "Warangal, TS", product: "Smart Motor Robo", date: "2026-04-22" },
  { id: 2, customer: "Lakshmi Devi", phone: "99887 11223", location: "Khammam, TS", product: "Submersible Pump", date: "2026-04-18" },
];

const initialTickets: Ticket[] = [
  { id: "T-1041", customer: "Ravi Kumar", issue: "Display flickering", status: "Open" },
  { id: "T-1038", customer: "Anita S.", issue: "Pump tripping at midnight", status: "In Progress" },
  { id: "T-1029", customer: "Manohar", issue: "Sensor not pairing", status: "Resolved" },
];

const Dealer = () => {
  const [stock, setStock] = useState<StockRow[]>(initialStock);
  const [installs, setInstalls] = useState<Installation[]>(initialInstalls);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [orders, setOrders] = useState<Order[]>([]);

  // Order form
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState(products[0].id);
  const [orderQty, setOrderQty] = useState(1);

  // Installation form
  const [instOpen, setInstOpen] = useState(false);
  const [inst, setInst] = useState({ customer: "", phone: "", location: "", product: products[0].name.en });

  // Ticket form
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticket, setTicket] = useState({ customer: "", issue: "" });

  const placeOrder = () => {
    const p = products.find((x) => x.id === orderProduct)!;
    if (orderQty < 1) { toast.error("Quantity must be at least 1"); return; }
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      product: p.name.en, qty: orderQty, total: p.price * orderQty,
      date: new Date().toISOString().slice(0, 10), status: "Placed",
    };
    setOrders((o) => [newOrder, ...o]);
    setStock((s) => s.map((r) => r.id === p.id ? { ...r, stock: r.stock + orderQty } : r));
    setOrderOpen(false); setOrderQty(1);
    toast.success(`Order ${newOrder.id} placed for ${orderQty} × ${p.name.en}`);
  };

  const addInstallation = () => {
    if (!inst.customer || !/^\d{10}$/.test(inst.phone.replace(/\s/g, "")) || !inst.location) {
      toast.error("Fill all fields. Phone must be 10 digits."); return;
    }
    const row: Installation = {
      id: Date.now(), ...inst, date: new Date().toISOString().slice(0, 10),
    };
    setInstalls((i) => [row, ...i]);
    setStock((s) => s.map((r) => r.name === inst.product && r.stock > 0 ? { ...r, stock: r.stock - 1 } : r));
    setInstOpen(false); setInst({ customer: "", phone: "", location: "", product: products[0].name.en });
    toast.success("Installation recorded & warranty registered");
  };

  const addTicket = () => {
    if (!ticket.customer || !ticket.issue) { toast.error("Customer and issue required"); return; }
    const t: Ticket = { id: `T-${Math.floor(1000 + Math.random() * 9000)}`, ...ticket, status: "Open" };
    setTickets((arr) => [t, ...arr]);
    setTicketOpen(false); setTicket({ customer: "", issue: "" });
    toast.success(`Ticket ${t.id} created`);
  };

  const updateTicketStatus = (id: string, status: Ticket["status"]) => {
    setTickets((arr) => arr.map((t) => t.id === id ? { ...t, status } : t));
  };

  const totalUnits = stock.reduce((a, b) => a + b.stock, 0);
  const mtdSales = installs.length * 28450;

  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Dealer Dashboard</h1>
            <p className="text-muted-foreground">Hyderabad Territory • Demo data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={instOpen} onOpenChange={setInstOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Installation Entry</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Installation Entry</DialogTitle>
                  <DialogDescription>Capture customer details for warranty tracking.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div className="space-y-1.5">
                    <Label>Customer Name</Label>
                    <Input value={inst.customer} onChange={(e) => setInst({ ...inst, customer: e.target.value })} placeholder="Ravi Kumar" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input value={inst.phone} onChange={(e) => setInst({ ...inst, phone: e.target.value.replace(/\D/g, "") })} maxLength={10} placeholder="98765 43210" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input value={inst.location} onChange={(e) => setInst({ ...inst, location: e.target.value })} placeholder="Village, District, State" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Product</Label>
                    <Select value={inst.product} onValueChange={(v) => setInst({ ...inst, product: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => <SelectItem key={p.id} value={p.name.en}>{p.name.en}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addInstallation} className="bg-gradient-cta">Save Installation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><MessageSquarePlus className="mr-2 h-4 w-4" /> New Service Request</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Raise Service Request</DialogTitle>
                  <DialogDescription>Log a customer complaint from your territory.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div className="space-y-1.5">
                    <Label>Customer Name</Label>
                    <Input value={ticket.customer} onChange={(e) => setTicket({ ...ticket, customer: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Issue Description</Label>
                    <Textarea value={ticket.issue} onChange={(e) => setTicket({ ...ticket, issue: e.target.value })} rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addTicket} className="bg-gradient-cta">Create Ticket</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-cta"><Plus className="mr-2 h-4 w-4" /> Place New Order</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Order Stock from MSI</DialogTitle>
                  <DialogDescription>Replenish inventory for your territory.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div className="space-y-1.5">
                    <Label>Product</Label>
                    <Select value={orderProduct} onValueChange={setOrderProduct}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name.en} — {formatINR(p.price)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input type="number" min={1} value={orderQty} onChange={(e) => setOrderQty(parseInt(e.target.value || "1"))} />
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                    Total: <span className="font-bold text-primary">
                      {formatINR((products.find((p) => p.id === orderProduct)?.price || 0) * orderQty)}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={placeOrder} className="bg-gradient-cta">Place Order</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { icon: Boxes, label: "Stock on hand", value: `${totalUnits} units` },
            { icon: Package, label: "Open orders", value: String(orders.filter(o => o.status === "Placed").length) },
            { icon: IndianRupee, label: "MTD Sales", value: formatINR(mtdSales) },
            { icon: Wrench, label: "Active tickets", value: String(tickets.filter(t => t.status !== "Resolved").length) },
          ].map((s, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-bold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5 text-primary" /> Inventory Tracking</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Stock</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{formatINR(s.price)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={s.stock < 5 ? "destructive" : "secondary"}>{s.stock}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> My Orders to MSI</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No orders placed yet. Click "Place New Order" to restock.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Order #</TableHead><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id}</TableCell>
                        <TableCell>{o.product}</TableCell>
                        <TableCell>{o.qty}</TableCell>
                        <TableCell>{formatINR(o.total)}</TableCell>
                        <TableCell><Badge>{o.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Installation Entries (Warranty Register)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>Location</TableHead><TableHead>Product</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {installs.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.customer}</TableCell>
                      <TableCell>{i.phone}</TableCell>
                      <TableCell>{i.location}</TableCell>
                      <TableCell>{i.product}</TableCell>
                      <TableCell>{i.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-card lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> Service Requests</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Issue</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell>{t.customer}</TableCell>
                      <TableCell>{t.issue}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Resolved" ? "secondary" : t.status === "Open" ? "destructive" : "default"}>{t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select value={t.status} onValueChange={(v) => updateTicketStatus(t.id, v as Ticket["status"])}>
                          <SelectTrigger className="h-8 w-36 ml-auto"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Dealer;
