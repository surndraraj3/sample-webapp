import api from "./api";

export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  userType: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface CustomerResponse {
  success: boolean;
  data: {
    message?: string;
    customer: Customer;
  };
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customerService = {
  // Create new customer
  createCustomer: async (
    data: CreateCustomerRequest,
  ): Promise<CustomerResponse> => {
    const response = await api.post("/customers", data);
    return response.data;
  },

  // Get all customers
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
  }): Promise<CustomersResponse> => {
    const response = await api.get("/customers", { params });
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (id: string): Promise<CustomerResponse> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Update customer
  updateCustomer: async (
    id: string,
    data: UpdateCustomerRequest,
  ): Promise<CustomerResponse> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (
    id: string,
  ): Promise<{ success: boolean; data: { message: string } }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;
