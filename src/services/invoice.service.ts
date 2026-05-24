import api from "./api";

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber?: string;
  customerId?: string;
  dealerId?: string;
  customerName: string;
  customerGST?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    totalAmount: number;
  }>;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  totalCGST: number;
  totalSGST: number;
  paidAmount: number;
  balanceAmount: number;
  status:
    | "draft"
    | "sent"
    | "paid"
    | "partially_paid"
    | "overdue"
    | "cancelled";
  invoiceDate: string;
  dueDate: string;
  sentDate?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  orderId: string;
}

export interface UpdateInvoiceStatusRequest {
  status:
    | "draft"
    | "sent"
    | "paid"
    | "partially_paid"
    | "overdue"
    | "cancelled";
}

export interface GetInvoicesParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

const invoiceService = {
  /**
   * Create invoice from order
   */
  async createInvoice(
    data: CreateInvoiceRequest,
  ): Promise<{ success: boolean; data: Invoice }> {
    const response = await api.post("/invoices", data);
    return response.data;
  },

  /**
   * Get all invoices with optional filtering
   */
  async getInvoices(
    params?: GetInvoicesParams,
  ): Promise<{ success: boolean; data: Invoice[] }> {
    const response = await api.get("/invoices", { params });
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  async getInvoiceById(
    id: string,
  ): Promise<{ success: boolean; data: Invoice }> {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(
    id: string,
    data: UpdateInvoiceStatusRequest,
  ): Promise<{ success: boolean; data: Invoice }> {
    const response = await api.put(`/invoices/${id}/status`, data);
    return response.data;
  },

  /**
   * Delete invoice (draft only)
   */
  async deleteInvoice(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
};

export default invoiceService;
