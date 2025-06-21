'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth-api';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import posthog from 'posthog-js';
import { isAxiosError } from 'axios';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = loginSchema.extend({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  linkedin_profile_url: z.string().url('Please enter a valid LinkedIn profile URL').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function EmailPasswordForm({
  mode = 'login',
  callbackUrl = '/dashboard',
}: {
  mode?: 'login' | 'register';
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'register' && { first_name: '', last_name: '' }),
    },
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setLoading(true);

    try {
      posthog.capture('sign_in_with_email', {
        email: data.email,
      });
      if (mode === 'register') {
        await AuthService.register(data as RegisterFormData);
        toast.success('Registration successful! Please check your email to verify your account.');
        router.push(`/auth/verify?email=${data.email}`);
      } else {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          callbackUrl,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Something went wrong');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkedin_profile_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.linkedin.com/in/your-profile" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'register' ? 'Creating account...' : 'Signing in...'}
              </>
            ) : mode === 'register' ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
