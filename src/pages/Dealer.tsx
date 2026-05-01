import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Boxes, Package, ClipboardList, Wrench, IndianRupee, Plus } from "lucide-react";
import { formatINR, products } from "@/data/products";

const stockData = products.map((p, i) => ({ ...p, stock: [12, 5, 2, 18][i] }));

const installations = [
  { id: 1, customer: "Ravi Kumar", phone: "98765 43210", location: "Warangal, TS", product: "Smart Motor Robo", date: "2026-04-22" },
  { id: 2, customer: "Lakshmi Devi", phone: "99887 11223", location: "Khammam, TS", product: "Submersible Pump", date: "2026-04-18" },
  { id: 3, customer: "Suresh Reddy", phone: "97000 55667", location: "Nalgonda, TS", product: "Smart Sensor", date: "2026-04-10" },
];

const tickets = [
  { id: "T-1041", customer: "Ravi Kumar", issue: "Display flickering", status: "Open" },
  { id: "T-1038", customer: "Anita S.", issue: "Pump tripping at midnight", status: "In Progress" },
  { id: "T-1029", customer: "Manohar", issue: "Sensor not pairing", status: "Resolved" },
];

const Dealer = () => {
  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Dealer Dashboard</h1>
            <p className="text-muted-foreground">Hyderabad Territory • Demo data</p>
          </div>
          <Button className="bg-gradient-cta"><Plus className="mr-2 h-4 w-4" /> Place New Order</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { icon: Boxes, label: "Stock on hand", value: "37 units" },
            { icon: Package, label: "Open orders", value: "3" },
            { icon: IndianRupee, label: "MTD Sales", value: formatINR(284500) },
            { icon: Wrench, label: "Active tickets", value: "2" },
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5 text-primary" /> Inventory</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Stock</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name.en}</TableCell>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Recent Installations</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Customer</TableHead><TableHead>Product</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {installations.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell><div className="font-medium">{i.customer}</div><div className="text-xs text-muted-foreground">{i.phone}</div></TableCell>
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
                  <TableRow><TableHead>Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Issue</TableHead><TableHead>Status</TableHead></TableRow>
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
