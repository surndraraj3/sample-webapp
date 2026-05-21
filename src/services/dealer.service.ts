import api from "./api";

export interface RegisterDealerRequest {
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  businessType: string;
  gstNumber?: string;
  panNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

export interface Dealer {
  _id: string;
  userId: string;
  dealerCode: string;
  businessName: string;
  businessType: string;
  gstNumber?: string;
  panNumber?: string;
  creditLimit: number;
  currentCredit: number;
  kycStatus: string;
  approvalStatus: string;
  isActive: boolean;
  performanceMetrics?: {
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
  };
}

export interface DealerResponse {
  success: boolean;
  data: Dealer;
}

export interface DealersResponse {
  success: boolean;
  data: Dealer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DealerPerformanceResponse {
  success: boolean;
  data: {
    dealerId: string;
    dealerCode: string;
    metrics: {
      totalOrders: number;
      completedOrders: number;
      pendingOrders: number;
      cancelledOrders: number;
      totalRevenue: number;
      totalCommission: number;
      averageOrderValue: number;
    };
    creditUtilization: {
      creditLimit: number;
      currentCredit: number;
      availableCredit: number;
      utilizationPercentage: number;
    };
    recentOrders: any[];
  };
}

export const dealerService = {
  // Register new dealer
  registerDealer: async (
    data: RegisterDealerRequest,
  ): Promise<DealerResponse> => {
    const response = await api.post("/dealers/register", data);
    return response.data;
  },

  // Get all dealers (admin/employee only)
  getDealers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    kycStatus?: string;
    approvalStatus?: string;
  }): Promise<DealersResponse> => {
    const response = await api.get("/dealers", { params });
    return response.data;
  },

  // Get dealer by ID
  getDealerById: async (id: string): Promise<DealerResponse> => {
    const response = await api.get(`/dealers/${id}`);
    return response.data;
  },

  // Get dealer performance
  getDealerPerformance: async (
    id: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<DealerPerformanceResponse> => {
    const response = await api.get(`/dealers/${id}/performance`, { params });
    return response.data;
  },

  // Update KYC status (admin/employee only)
  updateKYCStatus: async (
    id: string,
    data: { kycStatus: string; rejectionReason?: string },
  ): Promise<DealerResponse> => {
    const response = await api.put(`/dealers/${id}/kyc`, data);
    return response.data;
  },

  // Update approval status (admin only)
  updateApprovalStatus: async (
    id: string,
    data: { approvalStatus: string; rejectionReason?: string },
  ): Promise<DealerResponse> => {
    const response = await api.put(`/dealers/${id}/approval`, data);
    return response.data;
  },

  // Update credit limit (admin only)
  updateCreditLimit: async (
    id: string,
    data: { newLimit: number; reason: string },
  ): Promise<DealerResponse> => {
    const response = await api.put(`/dealers/${id}/credit-limit`, data);
    return response.data;
  },
};
