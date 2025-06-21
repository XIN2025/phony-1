'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function UnsubscribePage() {
  return (
    <main className="bg-background flex min-h-screen w-full items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Unsubscribed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <p className="text-muted-foreground text-center">
              You have been successfully unsubscribed from our email communications. You won&apos;t
              receive any more emails from us.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
