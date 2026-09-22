export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: number; // 2 = Admin
  accessToken: string;
  expiresAt: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  unit: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: number;
  isActive: boolean;
  createdAt: string;
}

export interface RevenueReport {
  from: string;
  to: string;
  totalRevenue: number;
  totalCommission: number;
  transactionCount: number;
}
