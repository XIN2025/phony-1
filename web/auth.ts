import { AuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services';
import { setIsNewUserCookie } from './server/cookies';

declare module 'next-auth' {
  interface Session {
    token: string;
    role: string;
    id: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password required');
          }

          const res = await AuthService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (res) {
            await setIsNewUserCookie(false);
            return {
              id: res.user.id,
              email: res.user.email,
              token: res.token,
              role: res.user.role,
              name: res.user.first_name + ' ' + res.user.last_name,
              image: res.user.avatar_url ?? '',
            };
          }

          throw new Error('Invalid credentials');
        } catch (error: any) {
          throw new Error(error?.response?.data?.message || 'Invalid credentials');
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          const res = await AuthService.signInWithGoogle(account.id_token!);
          if (res) {
            user.token = res.token;
            user.role = res.user.role;
            user.id = res.user.id;
            user.name = res.user.first_name + ' ' + res.user.last_name;
            user.image = res.user.avatar_url;
            await setIsNewUserCookie(res.is_new ?? false);
            return true;
          } else {
            console.log('error signing in with google', res);
            return '/auth?error=google_signin';
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message;
          console.log('errorMessage', errorMessage);
          if (errorMessage?.includes('waitlist')) {
            return `/auth?error=${encodeURIComponent(errorMessage)}`;
          }
          return '/auth?error=google_signin';
        }
      }
      if (account?.provider === 'credentials') {
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.token = (user as any).token;
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.image = (user as any).image;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.token = token.token;
      session.role = token.role;
      session.id = token.id;
      session.user.name = token.name;
      session.user.image = token.image;
      return session;
    },
  },
  jwt: {
    maxAge: 10 * 24 * 60 * 60,
  },
};
