import { getApiInstance } from '@/utils/api';
import axios, { isAxiosError } from 'axios';

export class HelperService {
  static async convertMarkdownToDocx(markdown: string, filename: string): Promise<Blob | null> {
    const api = await getApiInstance();
    try {
      const response = await api.post(
        '/helper/markdown-to-docx',
        {
          markdown,
          filename,
        },
        {
          responseType: 'blob',
        },
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  static async getWorklogUsers() {
    try {
      const res = await axios.get<
        {
          id: string;
          email: string;
          name: string;
          role: string;
        }[]
      >(`${process.env.WORKLOG_API_URL}/api/get-users`);
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data);
      } else {
        console.error(error);
      }
      return [];
    }
  }
}
