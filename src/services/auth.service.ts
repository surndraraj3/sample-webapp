import api from "./api";

export interface SendOTPRequest {
  mobile: string;
  userType: "customer" | "dealer";
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data: {
    otpId: string;
    expiresAt: string;
  };
}

export interface VerifyOTPRequest {
  mobile: string;
  otp: string;
  userType: "customer" | "dealer";
  deviceType?: string;
  deviceId?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      userId: string;
      mobile: string;
      name: string;
      userType: string;
      userCode?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    session: {
      sessionId: string;
      expiresAt: string;
    };
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  data: {
    userId: string;
    mobile: string;
    name: string;
    email?: string;
    userType: string;
    userCode?: string;
    dealerInfo?: any;
  };
}

export const authService = {
  // Send OTP to mobile number
  sendOTP: async (data: SendOTPRequest): Promise<SendOTPResponse> => {
    const response = await api.post("/auth/send-otp", data);
    return response.data;
  },

  // Verify OTP and login
  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await api.post("/auth/verify-otp", {
      ...data,
      deviceType: data.deviceType || "web",
      deviceId: data.deviceId || `web-${Date.now()}`,
    });

    // Store tokens in localStorage
    if (response.data.success) {
      localStorage.setItem(
        "msi.accessToken",
        response.data.data.tokens.accessToken,
      );
      localStorage.setItem(
        "msi.refreshToken",
        response.data.data.tokens.refreshToken,
      );
      localStorage.setItem("msi.user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("msi.accessToken");
      localStorage.removeItem("msi.refreshToken");
      localStorage.removeItem("msi.user");
    }
  },
};
