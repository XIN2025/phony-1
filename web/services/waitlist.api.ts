import { ApiClient } from '@/lib/api-client';
import { WaitlistEntry } from '@/types/waitlist';
import { CreateWaitlistInput } from '@/types/waitlist';

export class WaitlistService {
  static async create(data: CreateWaitlistInput) {
    return await ApiClient.post<WaitlistEntry>('/waitlist', data);
  }

  static async getAll() {
    return await ApiClient.get<WaitlistEntry[]>('/waitlist');
  }

  static async getOne(id: string) {
    return await ApiClient.get<WaitlistEntry>(`/waitlist/${id}`);
  }

  static async isUserApproved() {
    return await ApiClient.get<boolean>('/waitlist/isUserApproved');
  }

  static async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return await ApiClient.put<WaitlistEntry>(`/waitlist/${id}`, { status });
  }

  static async remove(id: string) {
    return await ApiClient.delete<WaitlistEntry>(`/waitlist/${id}`);
  }
}
