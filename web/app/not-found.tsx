import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Simple404 = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-9xl font-extrabold">404</h1>
      <p className="text-muted-foreground mb-8 text-2xl font-medium">Oops! Page not found.</p>
      <Link href="/" passHref>
        <Button className="bg-blue-500 text-white hover:bg-blue-600">Go Back Home</Button>
      </Link>
    </div>
  );
};

export default Simple404;
