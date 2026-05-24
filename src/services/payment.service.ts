import api from "./api";

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod:
    | "upi"
    | "netbanking"
    | "card"
    | "wallet"
    | "credit"
    | "cod"
    | "online";
  paymentGateway?: "razorpay" | "paytm" | "phonepe" | "manual";
  currency?: string;
}

export interface Payment {
  _id: string;
  transactionId: string;
  orderId: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  invoiceId?: string;
  failureReason?: string;
  refundAmount?: number;
  refundStatus?: string;
  createdAt: string;
  paidAt?: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment & {
    razorpayOrder?: {
      id: string;
      amount: number;
      currency: string;
    };
  };
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VerifyPaymentRequest {
  transactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const paymentService = {
  // Create payment
  createPayment: async (
    data: CreatePaymentRequest,
  ): Promise<PaymentResponse> => {
    const response = await api.post("/payments", data);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (
    data: VerifyPaymentRequest,
  ): Promise<PaymentResponse> => {
    const response = await api.post("/payments/verify", data);
    return response.data;
  },

  // Get all payments
  getPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentsResponse> => {
    const response = await api.get("/payments", { params });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<PaymentResponse> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Process refund (admin/employee only)
  processRefund: async (
    id: string,
    data: { refundAmount: number; reason: string },
  ): Promise<PaymentResponse> => {
    const response = await api.post(`/payments/${id}/refund`, data);
    return response.data;
  },
};
