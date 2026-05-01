import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Package, IndianRupee, TrendingUp, Plus, Check, X } from "lucide-react";
import { formatINR, products } from "@/data/products";

const dealers = [
  { id: 1, name: "Suresh Agro Distributors", city: "Warangal", status: "Pending" },
  { id: 2, name: "Krishna Pumps", city: "Vijayawada", status: "Approved" },
  { id: 3, name: "Sai Irrigation", city: "Tirupati", status: "Approved" },
  { id: 4, name: "Reddy Trade Links", city: "Nellore", status: "Pending" },
];

const Admin = () => {
  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Console</h1>
            <p className="text-muted-foreground">Manage products, dealers and orders • Demo data</p>
          </div>
          <Button className="bg-gradient-cta"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { icon: Users, label: "Active Dealers", value: "42" },
            { icon: Package, label: "SKUs", value: products.length.toString() },
            { icon: IndianRupee, label: "Revenue (MTD)", value: formatINR(1284000) },
            { icon: TrendingUp, label: "Growth", value: "+18%" },
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
            <CardHeader><CardTitle>Products Catalog</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead className="text-right">Price</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name.en}</TableCell>
                      <TableCell className="text-right">{formatINR(p.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle>Dealer Approvals</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Dealer</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {dealers.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell><div className="font-medium">{d.name}</div><div className="text-xs text-muted-foreground">{d.city}</div></TableCell>
                      <TableCell><Badge variant={d.status === "Approved" ? "secondary" : "default"} className={d.status === "Pending" ? "bg-accent text-accent-foreground" : ""}>{d.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        {d.status === "Pending" ? (
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-leaf"><Check className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
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

export default Admin;
