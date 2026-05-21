import api from "./api";

export interface Product {
  _id: string;
  productCode: string;
  sku: string;
  name: {
    en: string;
    te: string;
    hi: string;
  };
  description: {
    en: string;
    te: string;
    hi: string;
  };
  basePrice: number;
  dealerPrice: number;
  costPrice: number;
  hsnCode: string;
  gstRate: number;
  category: string;
  subCategory: string;
  images: string[];
  specifications: Array<{ key: string; value: string }>;
  warrantyPeriod: number;
  isActive: boolean;
  isFeatured: boolean;
  inventory?: {
    currentStock: number;
    availableStock: number;
    committedStock: number;
  };
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: Array<{
    category: string;
    subCategories: string[];
    count: number;
  }>;
}

export const productService = {
  // Get all products with filters
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ProductsResponse> => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<ProductsResponse> => {
    const response = await api.get("/products/featured");
    return response.data;
  },

  // Get product categories
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get("/products/categories");
    return response.data;
  },
};
