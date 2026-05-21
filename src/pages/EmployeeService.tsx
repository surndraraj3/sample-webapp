import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Headphones, AlertCircle, CheckCircle, Clock, MessageSquare, Wrench,
    FileCheck, Plus, Eye, Calendar, User, Package, Hash
} from "lucide-react";
import { useAuth, PERMISSIONS } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/PermissionGate";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ticketService } from "@/services/ticket.service";

type Ticket = {
    id: string;
    type: "Complaint" | "Warranty" | "Query" | "Return";
    subject: string;
    description: string;
    status: "Open" | "In Progress" | "Resolved" | "Closed";
    priority: "Low" | "Medium" | "High" | "Critical";
    customerId?: string;
    customerName?: string;
    dealerId?: string;
    dealerName?: string;
    productId?: string;
    productName?: string;
    serialNo?: string;
    assignedTo?: string;
    date: string;
    resolvedDate?: string;
    comments: { by: string; text: string; date: string; time?: string }[];
};

const EmployeeService = () => {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<"all" | Ticket["status"]>("all");
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketService.getTickets({ limit: 100 });
            setTickets(response.data.map(t => ({
                id: t._id,
                type: t.category as "Complaint" | "Warranty" | "Query" | "Return",
                subject: t.subject,
                description: t.description,
                status: t.status as "Open" | "In Progress" | "Resolved" | "Closed",
                priority: t.priority as "Low" | "Medium" | "High" | "Critical",
                customerName: 'Customer',
                productName: 'Product',
                date: new Date(t.createdAt).toISOString().split('T')[0],
                comments: t.comments?.map(c => ({
                    by: c.commentedBy,
                    text: c.comment,
                    date: new Date(c.commentedAt).toISOString().split('T')[0]
                })) || []
            })));
        } catch (error: any) {
            console.error('Failed to load tickets:', error);
            toast.error('Failed to load ticket data');
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = activeFilter === "all"
        ? tickets
        : tickets.filter(t => t.status === activeFilter);

    const openTickets = tickets.filter(t => t.status === "Open");
    const inProgressTickets = tickets.filter(t => t.status === "In Progress");
    const resolvedTickets = tickets.filter(t => t.status === "Resolved");
    const criticalTickets = tickets.filter(t => t.priority === "Critical" && t.status !== "Resolved" && t.status !== "Closed");

    if (loading) {
        return (
            <SiteLayout>
                <div className="container py-12 flex items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading support tickets...</p>
                    </div>
                </div>
            </SiteLayout>
        );
    }

    const handleUpdateStatus = (ticketId: string, newStatus: Ticket["status"]) => {
        if (!hasPermission(PERMISSIONS.MANAGE_TICKETS)) {
            toast.error("You don't have permission to update tickets");
            return;
        }

        setTickets(tickets.map(t => {
            if (t.id === ticketId) {
                return {
                    ...t,
                    status: newStatus,
                    resolvedDate: newStatus === "Resolved" || newStatus === "Closed" ? new Date().toISOString().split('T')[0] : t.resolvedDate,
                    assignedTo: t.assignedTo || user?.name
                };
            }
            return t;
        }));

        if (selectedTicket?.id === ticketId) {
            setSelectedTicket(prev => prev ? {
                ...prev,
                status: newStatus,
                resolvedDate: newStatus === "Resolved" || newStatus === "Closed" ? new Date().toISOString().split('T')[0] : prev.resolvedDate
            } : null);
        }

        toast.success(`Ticket status updated to ${newStatus}`);
    };

    const handleAddComment = () => {
        if (!commentText.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        if (!selectedTicket) return;

        const newComment = {
            by: user?.name || "Service Tech",
            text: commentText,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        setTickets(tickets.map(t =>
            t.id === selectedTicket.id
                ? { ...t, comments: [...t.comments, newComment], assignedTo: t.assignedTo || user?.name }
                : t
        ));

        setSelectedTicket(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
        setCommentText("");
        toast.success("Comment added successfully");
    };

    const getPriorityColor = (priority: Ticket["priority"]) => {
        switch (priority) {
            case "Critical": return "bg-red-500";
            case "High": return "bg-orange-500";
            case "Medium": return "bg-yellow-500";
            case "Low": return "bg-blue-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusColor = (status: Ticket["status"]) => {
        switch (status) {
            case "Open": return "bg-blue-500";
            case "In Progress": return "bg-yellow-500";
            case "Resolved": return "bg-green-500";
            case "Closed": return "bg-gray-500";
            default: return "bg-gray-500";
        }
    };

    const getTypeIcon = (type: Ticket["type"]) => {
        switch (type) {
            case "Complaint": return AlertCircle;
            case "Warranty": return FileCheck;
            case "Query": return MessageSquare;
            case "Return": return Package;
            default: return Wrench;
        }
    };

    return (
        <SiteLayout>
            <div className="container py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-gradient-cta flex items-center justify-center text-white">
                            <Headphones className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Service & Support Dashboard</h1>
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
                                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                                    <p className="text-2xl font-bold text-blue-600">{openTickets.length}</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-bold text-yellow-600">{inProgressTickets.length}</p>
                                </div>
                                <Wrench className="h-8 w-8 text-yellow-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                                    <p className="text-2xl font-bold text-red-600">{criticalTickets.length}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Resolved Today</p>
                                    <p className="text-2xl font-bold text-green-600">{resolvedTickets.length}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                        variant={activeFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("all")}
                    >
                        All ({tickets.length})
                    </Button>
                    <Button
                        variant={activeFilter === "Open" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("Open")}
                    >
                        Open ({openTickets.length})
                    </Button>
                    <Button
                        variant={activeFilter === "In Progress" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("In Progress")}
                    >
                        In Progress ({inProgressTickets.length})
                    </Button>
                    <Button
                        variant={activeFilter === "Resolved" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("Resolved")}
                    >
                        Resolved ({resolvedTickets.length})
                    </Button>
                </div>

                {/* Tickets List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTickets.map((ticket) => {
                        const TypeIcon = getTypeIcon(ticket.type);
                        return (
                            <Card key={ticket.id} className="shadow-card hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => { setSelectedTicket(ticket); setViewDialog(true); }}
                            >
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", getPriorityColor(ticket.priority))}>
                                                    <TypeIcon className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                                                    <Badge className={cn("text-xs w-fit", getStatusColor(ticket.status))}>
                                                        {ticket.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {ticket.type}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">{ticket.subject}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                                        </div>

                                        <Separator />

                                        <div className="space-y-1.5 text-xs">
                                            {ticket.customerName && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span>{ticket.customerName}</span>
                                                </div>
                                            )}
                                            {ticket.dealerName && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span>{ticket.dealerName}</span>
                                                </div>
                                            )}
                                            {ticket.productName && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Package className="h-3 w-3" />
                                                    <span>{ticket.productName}</span>
                                                </div>
                                            )}
                                            {ticket.serialNo && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Hash className="h-3 w-3" />
                                                    <span>{ticket.serialNo}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{ticket.date}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <Badge className={cn("text-xs", getPriorityColor(ticket.priority))}>
                                                {ticket.priority} Priority
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>{ticket.comments.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredTickets.length === 0 && (
                    <Card className="shadow-card">
                        <CardContent className="p-8 text-center">
                            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No tickets found in this category</p>
                        </CardContent>
                    </Card>
                )}

                {/* Ticket Details Dialog */}
                <Dialog open={viewDialog} onOpenChange={setViewDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh]">
                        <DialogHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <DialogTitle className="text-xl">{selectedTicket?.subject}</DialogTitle>
                                    <DialogDescription className="font-mono">{selectedTicket?.id}</DialogDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className={cn("text-xs", selectedTicket && getPriorityColor(selectedTicket.priority))}>
                                        {selectedTicket?.priority}
                                    </Badge>
                                    <Badge className={cn("text-xs", selectedTicket && getStatusColor(selectedTicket.status))}>
                                        {selectedTicket?.status}
                                    </Badge>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4 py-4">
                                {/* Ticket Details */}
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Type</Label>
                                        <p className="text-sm font-medium">{selectedTicket?.type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Description</Label>
                                        <p className="text-sm">{selectedTicket?.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedTicket?.customerName && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Customer</Label>
                                                <p className="text-sm font-medium">{selectedTicket.customerName}</p>
                                            </div>
                                        )}
                                        {selectedTicket?.dealerName && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Dealer</Label>
                                                <p className="text-sm font-medium">{selectedTicket.dealerName}</p>
                                            </div>
                                        )}
                                        {selectedTicket?.productName && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Product</Label>
                                                <p className="text-sm font-medium">{selectedTicket.productName}</p>
                                            </div>
                                        )}
                                        {selectedTicket?.serialNo && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Serial Number</Label>
                                                <p className="text-sm font-mono">{selectedTicket.serialNo}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Date Raised</Label>
                                            <p className="text-sm">{selectedTicket?.date}</p>
                                        </div>
                                        {selectedTicket?.resolvedDate && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Resolved Date</Label>
                                                <p className="text-sm">{selectedTicket.resolvedDate}</p>
                                            </div>
                                        )}
                                        {selectedTicket?.assignedTo && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Assigned To</Label>
                                                <p className="text-sm">{selectedTicket.assignedTo}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Status Update */}
                                <PermissionGate requires={PERMISSIONS.MANAGE_TICKETS}>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Update Status</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(["Open", "In Progress", "Resolved", "Closed"] as const).map((status) => (
                                                <Button
                                                    key={status}
                                                    size="sm"
                                                    variant={selectedTicket?.status === status ? "default" : "outline"}
                                                    onClick={() => selectedTicket && handleUpdateStatus(selectedTicket.id, status)}
                                                >
                                                    {status}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </PermissionGate>

                                <Separator />

                                {/* Comments Section */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Comments & Updates</Label>

                                    {selectedTicket?.comments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-4 text-center">No comments yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedTicket?.comments.map((comment, idx) => (
                                                <Card key={idx} className="shadow-sm">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <span className="text-sm font-semibold">{comment.by}</span>
                                                            <span className="text-xs text-muted-foreground">{comment.date} {comment.time}</span>
                                                        </div>
                                                        <p className="text-sm">{comment.text}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    <PermissionGate requires={PERMISSIONS.MANAGE_TICKETS}>
                                        <div className="space-y-2 mt-4">
                                            <Label className="text-sm">Add Comment</Label>
                                            <Textarea
                                                placeholder="Enter your comment or update..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                rows={3}
                                            />
                                            <Button size="sm" onClick={handleAddComment} className="w-full">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Comment
                                            </Button>
                                        </div>
                                    </PermissionGate>
                                </div>
                            </div>
                        </ScrollArea>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setViewDialog(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SiteLayout>
    );
};

export default EmployeeService;
