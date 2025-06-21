import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import { parseMessage } from '@/utils/parse';
import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import { authOptions } from '@/auth';
import { NEXT_PUBLIC_API_URL } from '@/constants/api';

type ApiResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: {
        message: string;
        status: number;
        details?: Record<string, unknown>;
      };
    };

export class ApiClient {
  static async request<T>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
    try {
      const isServer = typeof window === 'undefined';
      const session = isServer ? await getServerSession(authOptions) : await getSession();

      const isFormData = config.data instanceof FormData;

      const client = axios.create({
        baseURL: NEXT_PUBLIC_API_URL,
        headers: {
          ...(config.data && !isFormData ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${session?.token}`,
        },
      });
      const response: AxiosResponse<T> = await client.request(config);
      return { data: response.data };
    } catch (err) {
      if (isAxiosError(err)) {
        return {
          error: {
            message: parseMessage(err.response?.data.message),
            details: err.response?.data.data,
            status: err.response?.status || 500,
          },
        };
      }
      console.log(err);
      return {
        error: {
          message: 'An unknown error occurred',
          status: 500,
        },
      };
    }
  }

  static async get<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'GET', url, params, headers });
  }

  static async post<T, D = unknown>(url: string, data?: D): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  static async put<T, D = unknown>(url: string, data?: D): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  static async patch<T, D = unknown>(url: string, data?: D): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  static async delete<T>(url: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'DELETE', url, params });
  }
}
