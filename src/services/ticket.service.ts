import api from "./api";

export interface CreateTicketRequest {
  type:
    | "complaint"
    | "warranty"
    | "query"
    | "return"
    | "installation"
    | "repair";
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  customerId?: string; // Optional - for dealers creating tickets on behalf of customers
  orderId?: string;
  productId?: string;
  attachments?: string[];
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  customerId: {
    _id: string;
    name: string;
    mobile: string;
  };
  subject: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  assignedTo?: {
    _id: string;
    name: string;
  };
  orderId?: string;
  productId?: string;
  slaTarget: string;
  resolvedAt?: string;
  resolutionTime?: number;
  comments: Array<{
    commentBy: string;
    commentByName: string;
    commentText: string;
    isInternal: boolean;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TicketResponse {
  success: boolean;
  data: Ticket;
}

export interface TicketsResponse {
  success: boolean;
  data: Ticket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ticketService = {
  // Create new ticket
  createTicket: async (data: CreateTicketRequest): Promise<TicketResponse> => {
    const response = await api.post("/tickets", data);
    return response.data;
  },

  // Get all tickets
  getTickets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<TicketsResponse> => {
    const response = await api.get("/tickets", { params });
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id: string): Promise<TicketResponse> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Assign ticket to employee (admin/employee only)
  assignTicket: async (
    id: string,
    employeeId: string,
  ): Promise<TicketResponse> => {
    const response = await api.put(`/tickets/${id}/assign`, {
      assignedTo: employeeId,
    });
    return response.data;
  },

  // Update ticket status (admin/employee only)
  updateTicketStatus: async (
    id: string,
    data: { status: string; resolution?: string },
  ): Promise<TicketResponse> => {
    const response = await api.put(`/tickets/${id}/status`, data);
    return response.data;
  },

  // Add comment to ticket
  addComment: async (
    id: string,
    data: { commentText: string; isInternal?: boolean },
  ): Promise<TicketResponse> => {
    const response = await api.post(`/tickets/${id}/comments`, data);
    return response.data;
  },
};
