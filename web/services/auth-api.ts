import { ApiClient } from '@/lib/api-client';
import { UserDto } from '@/types/user';

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  linkedin_profile_url?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: string;
    avatar_url: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface GoogleLoginResponse {
  token: string;
  is_new: boolean;
  user: {
    id: string;
    role: string;
    avatar_url: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export class AuthService {
  static async register(data: RegisterData) {
    try {
      const res = await ApiClient.post<UserDto>('/auth/register', data);
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  static async login(data: LoginData) {
    try {
      const res = await ApiClient.post<LoginResponse>('/auth/login', data);
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  static async signInWithGoogle(idToken: string) {
    try {
      const res = await ApiClient.post<GoogleLoginResponse>('/auth/google', { idToken });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(token: string) {
    try {
      const res = await ApiClient.get<UserDto>('/auth/verify', { token });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  static async resendVerification(email: string) {
    try {
      const res = await ApiClient.post<boolean>('/auth/resend-verification', { email });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateLinkedInProfile(linkedinProfileUrl: string) {
    try {
      const res = await ApiClient.post<UserDto>('/auth/linkedin-profile', {
        linkedin_profile_url: linkedinProfileUrl,
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(data: ChangePasswordData) {
    return await ApiClient.post<boolean>('/auth/change-password', data);
  }
}
