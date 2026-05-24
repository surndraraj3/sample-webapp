import api from "./api";

export interface Inventory {
  _id: string;
  productId: {
    _id: string;
    name: { en: string; te: string; hi: string };
    productCode: string;
  };
  currentStock: number;
  committedStock: number;
  availableStock: number;
  minStockLevel: number;
  reorderLevel: number;
  lastRestockDate?: string;
  lowStock: boolean;
}

export interface InventoryResponse {
  success: boolean;
  data: Inventory;
}

export interface InventoriesResponse {
  success: boolean;
  data: Inventory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StockMovement {
  _id: string;
  productId: {
    _id: string;
    name: { en: string; te: string };
    productCode: string;
  };
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

export interface StockMovementsResponse {
  success: boolean;
  data: StockMovement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const inventoryService = {
  // Get all inventory
  getAllInventory: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    lowStock?: boolean;
  }): Promise<InventoriesResponse> => {
    const response = await api.get("/inventory", { params });
    return response.data;
  },

  // Get inventory by product ID
  getInventoryByProduct: async (
    productId: string,
  ): Promise<InventoryResponse> => {
    const response = await api.get(`/inventory/${productId}`);
    return response.data;
  },

  // Update stock
  updateStock: async (
    productId: string,
    data: {
      movementType:
        | "add"
        | "remove"
        | "purchase"
        | "damage"
        | "adjustment"
        | "return";
      quantity: number;
      notes?: string;
    },
  ): Promise<InventoryResponse> => {
    // Map movementType to 'type' for the API
    const response = await api.put(`/inventory/${productId}/stock`, {
      type: data.movementType,
      quantity: data.quantity,
      notes: data.notes,
    });
    return response.data;
  },

  // Get stock movements/history
  getStockMovements: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      movementType?: string;
    },
  ): Promise<StockMovementsResponse> => {
    const response = await api.get(`/inventory/${productId}/movements`, {
      params,
    });
    return response.data;
  },

  // Get all stock movements across all products
  getAllStockMovements: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<StockMovementsResponse> => {
    const response = await api.get("/inventory/movements", { params });
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async (): Promise<InventoriesResponse> => {
    const response = await api.get("/inventory/alerts/low-stock");
    return response.data;
  },
};
