'use client';

import { Coupon } from '@/types/admin';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

export function CouponCard({ coupon, onEdit, onDelete }: CouponCardProps) {
  return (
    <Card className="bg-muted/30 w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{coupon.code}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{coupon.description}</p>
            </div>
            <div className="text-right">
              <span className="text-primary text-2xl font-semibold">{coupon.discount}</span>
              <p className="text-muted-foreground text-sm">discount</p>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Usage</p>
              <p className="font-medium">
                {coupon.used_count} / {coupon.max_uses}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Expires</p>
              <p className="font-medium">
                {coupon.expires_at ? format(new Date(coupon.expires_at), 'PP') : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(coupon)}>
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(coupon)}>
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
