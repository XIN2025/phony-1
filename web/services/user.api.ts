import { ApiClient } from '@/lib/api-client';
import { UserDto, UserUpdateDto, CreditRequestDto } from '@/types/user';
import { GlobalSearchParams, GlobalSearchResponse } from '@/types/search';

export class UserService {
  static async getMe() {
    return await ApiClient.get<UserDto>('/users/me');
  }

  static async updateMe(user: UserUpdateDto) {
    return await ApiClient.patch<UserUpdateDto & { id: string }>('/users/me', user);
  }
  static async applyCoupon(coupon: string) {
    return await ApiClient.post<boolean>('/users/me/apply-coupon', { coupon });
  }

  static async globalSearch({ query, limit = 20 }: GlobalSearchParams) {
    return await ApiClient.get<GlobalSearchResponse>('/users/me/search', { query, limit });
  }
}
