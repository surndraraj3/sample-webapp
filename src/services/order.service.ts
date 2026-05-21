import api from "./api";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: "COD" | "ONLINE" | "CREDIT";
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    productId: {
      _id: string;
      name: { en: string; te: string; hi: string };
      images: string[];
    };
    quantity: number;
    price: number;
    gstAmount: number;
  }>;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
  billingAddress: any;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy: string;
  }>;
  createdAt: string;
  estimatedDelivery?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export const orderService = {
  // Create new order
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  // Get all orders for current user
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  // Get single order by ID
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string, reason: string): Promise<OrderResponse> => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};
