import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  LayoutDashboard, Boxes, ListPlus, Users, ImagePlus,
  Plus, Pencil, Trash2, IndianRupee, Package, TrendingUp, Check, X, Upload, Film, Image as ImageIcon
} from "lucide-react";
import { formatINR, products as seedProducts } from "@/data/products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Section = "dashboard" | "menu" | "stock" | "dealers" | "media";

type MenuItem = { id: string; name: string; price: number; description?: string };
type StockEntry = { id: string; product: string; qty: number; type: "in" | "out"; date: string; note?: string };
type Dealer = { id: string; code: string; name: string; city: string; phone: string; status: "Pending" | "Approved" | "Suspended" };
type MediaAsset = { id: string; name: string; url: string; kind: "image" | "video" };

const initialMenu: MenuItem[] = seedProducts.map((p) => ({
  id: p.id, name: p.name.en, price: p.price, description: p.tagline.en,
}));

const initialDealers: Dealer[] = [
  { id: "1", code: "DLR001", name: "Suresh Agro Distributors", city: "Warangal", phone: "9876543210", status: "Approved" },
  { id: "2", code: "DLR002", name: "Krishna Pumps", city: "Vijayawada", phone: "9876500011", status: "Approved" },
  { id: "3", code: "DLR003", name: "Sai Irrigation", city: "Tirupati", phone: "9876500022", status: "Pending" },
  { id: "4", code: "DLR004", name: "Reddy Trade Links", city: "Nellore", phone: "9876500033", status: "Pending" },
];

const initialStock: StockEntry[] = [
  { id: "s1", product: "Smart Water Motor Robo", qty: 50, type: "in", date: "2026-04-20", note: "Initial stock" },
  { id: "s2", product: "Anti-Scaling Unit", qty: 30, type: "in", date: "2026-04-21" },
];

const navItems: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Menu Items", icon: ListPlus },
  { id: "stock", label: "Stock Entry", icon: Boxes },
  { id: "dealers", label: "Dealers", icon: Users },
  { id: "media", label: "Media Library", icon: ImagePlus },
];

const Admin = () => {
  const [section, setSection] = useState<Section>("dashboard");
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [stock, setStock] = useState<StockEntry[]>(initialStock);
  const [dealers, setDealers] = useState<Dealer[]>(initialDealers);
  const [media, setMedia] = useState<MediaAsset[]>([]);

  return (
    <SiteLayout>
      <div className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 self-start">
            <Card className="shadow-card overflow-hidden">
              <div className="bg-gradient-hero p-4 text-primary-foreground">
                <div className="text-xs uppercase tracking-wider opacity-80">Admin Console</div>
                <div className="text-lg font-semibold">MSI Innovations</div>
              </div>
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
            </Card>
          </aside>

          {/* Content */}
          <div>
            {section === "dashboard" && <Dashboard dealers={dealers} menu={menu} />}
            {section === "menu" && <MenuSection items={menu} setItems={setMenu} />}
            {section === "stock" && <StockSection stock={stock} setStock={setStock} menu={menu} />}
            {section === "dealers" && <DealersSection dealers={dealers} setDealers={setDealers} />}
            {section === "media" && <MediaSection media={media} setMedia={setMedia} />}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

const SectionHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    <div className="flex gap-2">{children}</div>
  </div>
);

/* ------------------------- Dashboard ------------------------- */
const Dashboard = ({ dealers, menu }: { dealers: Dealer[]; menu: MenuItem[] }) => (
  <>
    <SectionHeader title="Dashboard" subtitle="Quick overview of your business" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {[
        { icon: Users, label: "Active Dealers", value: dealers.filter(d => d.status === "Approved").length.toString() },
        { icon: Package, label: "Menu Items", value: menu.length.toString() },
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
    <Card className="shadow-card">
      <CardHeader><CardTitle>Pending Dealer Approvals</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Dealer</TableHead><TableHead>City</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {dealers.filter(d => d.status === "Pending").map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.city}</TableCell>
                <TableCell><Badge className="bg-accent text-accent-foreground">{d.status}</Badge></TableCell>
              </TableRow>
            ))}
            {dealers.filter(d => d.status === "Pending").length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No pending approvals</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </>
);

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

/* ------------------------- Stock Entry ------------------------- */
const StockSection = ({ stock, setStock, menu }: { stock: StockEntry[]; setStock: (s: StockEntry[]) => void; menu: MenuItem[] }) => {
  const [form, setForm] = useState({ product: "", qty: "", type: "in" as "in" | "out", note: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product || !form.qty) return toast.error("Product and quantity required");
    setStock([
      { id: `s${Date.now()}`, product: form.product, qty: Number(form.qty), type: form.type, date: new Date().toISOString().slice(0, 10), note: form.note },
      ...stock,
    ]);
    setForm({ product: "", qty: "", type: "in", note: "" });
    toast.success("Stock entry recorded");
  };

  const balance = (product: string) =>
    stock.filter(s => s.product === product).reduce((acc, s) => acc + (s.type === "in" ? s.qty : -s.qty), 0);

  return (
    <>
      <SectionHeader title="Stock Entry" subtitle="Record inward and outward stock movements" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="shadow-card">
          <CardHeader><CardTitle>New Entry</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={submit}>
              <div>
                <Label>Product</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })}>
                  <option value="">Select product</option>
                  {menu.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
                </div>
                <div>
                  <Label>Type</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "in" | "out" })}>
                    <option value="in">Stock In</option>
                    <option value="out">Stock Out</option>
                  </select>
                </div>
              </div>
              <div><Label>Note (optional)</Label><Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
              <Button type="submit" className="w-full bg-gradient-cta">Record Entry</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Recent Movements</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Product</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader>
              <TableBody>
                {stock.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs">{s.date}</TableCell>
                    <TableCell className="font-medium">{s.product}</TableCell>
                    <TableCell><Badge variant="secondary" className={s.type === "in" ? "bg-leaf/15 text-leaf" : "bg-destructive/15 text-destructive"}>{s.type === "in" ? "IN" : "OUT"}</Badge></TableCell>
                    <TableCell className="text-right">{s.qty}</TableCell>
                    <TableCell className="text-right font-semibold">{balance(s.product)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

/* ------------------------- Dealers CRUD ------------------------- */
const DealersSection = ({ dealers, setDealers }: { dealers: Dealer[]; setDealers: (d: Dealer[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [form, setForm] = useState<Omit<Dealer, "id">>({ code: "", name: "", city: "", phone: "", status: "Pending" });

  const openCreate = () => { setEditing(null); setForm({ code: "", name: "", city: "", phone: "", status: "Pending" }); setOpen(true); };
  const openEdit = (d: Dealer) => { setEditing(d); setForm({ code: d.code, name: d.name, city: d.city, phone: d.phone, status: d.status }); setOpen(true); };

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

  const remove = (id: string) => { setDealers(dealers.filter(d => d.id !== id)); toast.success("Dealer removed"); };
  const setStatus = (id: string, status: Dealer["status"]) => setDealers(dealers.map(d => d.id === id ? { ...d, status } : d));

  return (
    <>
      <SectionHeader title="Dealers" subtitle="Manage dealer network">
        <Button onClick={openCreate} className="bg-gradient-cta"><Plus className="mr-2 h-4 w-4" /> Add Dealer</Button>
      </SectionHeader>
      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>City</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {dealers.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.code}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.city}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>
                    <Badge className={
                      d.status === "Approved" ? "bg-leaf/15 text-leaf hover:bg-leaf/15" :
                      d.status === "Pending" ? "bg-accent text-accent-foreground" :
                      "bg-destructive/15 text-destructive hover:bg-destructive/15"
                    }>{d.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {d.status === "Pending" && (
                      <>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-leaf" onClick={() => setStatus(d.id, "Approved")}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setStatus(d.id, "Suspended")}><X className="h-4 w-4" /></Button>
                      </>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Dealer</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dealer Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Status</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Dealer["status"] })}>
                <option>Pending</option><option>Approved</option><option>Suspended</option>
              </select>
            </div>
            <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
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

export default Admin;
