import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coupon } from '@/types/admin';
import React, { useMemo, useState } from 'react';
import { CouponCard } from './CouponCard';
type FilterType = 'all' | 'active' | 'expired' | 'never-expires';

interface CouponListProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

const CouponList = ({ coupons, onEdit, onDelete }: CouponListProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const filteredCoupons = useMemo(() => {
    const now = new Date();

    return coupons.filter((coupon) => {
      const isExpiredByDate = coupon.expires_at && new Date(coupon.expires_at) < now;
      const isMaxedOut = coupon.used_count >= coupon.max_uses;
      const isExpired = isExpiredByDate || isMaxedOut;

      switch (activeFilter) {
        case 'active':
          return !isExpired;
        case 'expired':
          return isExpired;
        case 'never-expires':
          return !coupon.expires_at && !isMaxedOut;
        default:
          return true;
      }
    });
  }, [coupons, activeFilter]);
  return (
    <>
      <Tabs
        value={activeFilter}
        onValueChange={(value) => setActiveFilter(value as FilterType)}
        className="w-full"
      >
        <TabsList className="flex h-auto w-fit flex-wrap items-center justify-start gap-1">
          <TabsTrigger value="all">All ({coupons.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active (
            {
              coupons.filter((c) => {
                const now = new Date();
                const isExpiredByDate = c.expires_at && new Date(c.expires_at) < now;
                const isMaxedOut = c.used_count >= c.max_uses;
                return !isExpiredByDate && !isMaxedOut;
              }).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired (
            {
              coupons.filter((c) => {
                const now = new Date();
                const isExpiredByDate = c.expires_at && new Date(c.expires_at) < now;
                const isMaxedOut = c.used_count >= c.max_uses;
                return isExpiredByDate || isMaxedOut;
              }).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="never-expires">
            Never Expires (
            {coupons.filter((c) => !c.expires_at && c.used_count < c.max_uses).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {filteredCoupons.length === 0 && (
          <div className="text-muted-foreground col-span-full py-10 text-center">
            No coupons found for the selected filter.
          </div>
        )}
      </div>
    </>
  );
};

export default CouponList;
