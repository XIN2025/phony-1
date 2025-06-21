import {
  DashboardStatsResponse,
  GetUserCreditsParams,
  UserCreditsResponse,
  UsersByDateResponse,
  Coupon,
  CreateCouponData,
  UpdateCouponData,
  GetTransactionsParams,
  TransactionsResponse,
} from '@/types/admin';
import { ApiClient } from '@/lib/api-client';

export class AdminApi {
  static async getUserCredits(params: GetUserCreditsParams) {
    return await ApiClient.get<UserCreditsResponse>('/admin/credits', { ...params });
  }

  static async getDashboardStats() {
    return await ApiClient.get<DashboardStatsResponse>('/admin/dashboard/stats');
  }

  static async addCreditsToUser(userId: string, credits: number) {
    return await ApiClient.post<boolean>(`/admin/credits/add/${userId}`, { credits });
  }

  static async deductCreditsFromUser(userId: string, credits: number) {
    return await ApiClient.post<boolean>(`/admin/credits/deduct/${userId}`, { credits });
  }

  static async updateMaxProjects(userId: string, maxProjects: number) {
    return await ApiClient.put<boolean>(`/admin/max-projects/${userId}`, { maxProjects });
  }

  static async addMeetingCredits(userId: string, credits: number) {
    return await ApiClient.put<boolean>(`/admin/meeting-credits/add/${userId}`, { credits });
  }

  static async deductMeetingCredits(userId: string, credits: number) {
    return await ApiClient.post<boolean>(`/admin/meeting-credits/deduct/${userId}`, { credits });
  }

  static async getUsersByDateRange(startDate: string, endDate: string) {
    return await ApiClient.get<UsersByDateResponse[]>('/admin/users/by-date', {
      startDate,
      endDate,
    });
  }
  static async getTransactions(params: GetTransactionsParams) {
    return await ApiClient.get<TransactionsResponse>('/admin/transactions', { ...params });
  }
  static async getCoupons() {
    return await ApiClient.get<Coupon[]>('/admin/coupons');
  }

  static async createCoupon(couponData: CreateCouponData) {
    return await ApiClient.post<Coupon>('/admin/coupons', couponData);
  }

  static async updateCoupon(id: string, couponData: UpdateCouponData) {
    return await ApiClient.put<Coupon>(`/admin/coupons/${id}`, couponData);
  }

  static async deleteCoupon(id: string) {
    return await ApiClient.delete<boolean>(`/admin/coupons/${id}`);
  }
}
