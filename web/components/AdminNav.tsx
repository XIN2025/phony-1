'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CreditCard, Users, BadgeDollarSign } from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Transactions',
    href: '/dashboard/admin/transactions',
    icon: CreditCard,
  },
  {
    title: 'Coupons',
    href: '/dashboard/admin/coupons',
    icon: BadgeDollarSign,
  },
  {
    title: 'Waitlist',
    href: '/dashboard/admin/waitlist',
    icon: Users,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'hover:text-primary flex items-center space-x-2 text-sm transition-colors',
              pathname === item.href ? 'text-primary font-medium' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
