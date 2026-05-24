import api from "./api";

export interface CartItem {
  productId: {
    _id: string;
    name: { en: string; te: string; hi: string };
    description: string;
    basePrice: number;
    dealerPrice: number;
    images: string[];
    category: string;
    gstRate: number;
    inventory?: {
      currentStock: number;
      availableStock: number;
    };
  };
  quantity: number;
  addedAt: string;
  _id: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  lastModified: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface SyncCartRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const cartService = {
  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get("/cart");
    return response.data;
  },

  // Add item to cart
  addItem: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await api.post("/cart/items", data);
    return response.data;
  },

  // Update cart item quantity
  updateItem: async (
    productId: string,
    data: UpdateCartItemRequest,
  ): Promise<CartResponse> => {
    const response = await api.put(`/cart/items/${productId}`, data);
    return response.data;
  },

  // Remove item from cart
  removeItem: async (productId: string): Promise<CartResponse> => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete("/cart");
    return response.data;
  },

  // Sync cart from localStorage (for migration)
  syncCart: async (data: SyncCartRequest): Promise<CartResponse> => {
    const response = await api.post("/cart/sync", data);
    return response.data;
  },
};
