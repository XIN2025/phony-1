'use client';

import { useEffect, useState } from 'react';
import { AdminApi } from '@/services/admin.api';
import { Coupon } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CouponList from '@/components/admin/coupons/CouponList';
import CouponDelete from '@/components/admin/coupons/CouponDelete';
import CouponEditCreate from '@/components/admin/coupons/CouponEditCreate';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = async () => {
    try {
      const response = await AdminApi.getCoupons();
      if (response.data) {
        setCoupons(response.data);
      } else {
        toast.error(response.error.message);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.message, {
          description: error.response?.data.message,
        });
      } else {
        toast.error('Failed to fetch coupons');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormOpen(true);
  };

  const handleDelete = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData: {
    code: string;
    description: string;
    discount: number;
    max_uses: number;
    expires_at: Date | null;
  }) => {
    try {
      if (selectedCoupon) {
        const res = await AdminApi.updateCoupon(selectedCoupon.id, {
          ...formData,
          expires_at: formData.expires_at?.toISOString(),
        });
        if (res.data) {
          toast.success('Coupon updated successfully');
        } else {
          toast.error(res.error?.message);
        }
      } else {
        const res = await AdminApi.createCoupon({
          ...formData,
          expires_at: formData.expires_at?.toISOString(),
        });
        if (res.data) {
          toast.success('Coupon created successfully');
        } else {
          toast.error(res.error?.message);
        }
      }
      fetchCoupons();
      setFormOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.message, {
          description: error.response?.data.message,
        });
      } else {
        toast.error('Failed to create coupon');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCoupon) return;
    try {
      const res = await AdminApi.deleteCoupon(selectedCoupon.id);
      if (res.data) {
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } else {
        toast.error(res.error?.message);
      }
      setDeleteDialogOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.message, {
          description: error.response?.data.message,
        });
      } else {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedCoupon(null);
    setFormOpen(true);
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto space-y-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
        <Button size={'sm'} onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>
      <CouponList coupons={coupons} onEdit={handleEdit} onDelete={handleDelete} />

      <CouponEditCreate
        formOpen={formOpen}
        setFormOpen={setFormOpen}
        selectedCoupon={selectedCoupon}
        onSubmit={handleSubmit}
      />

      {selectedCoupon && (
        <CouponDelete
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          selectedCoupon={selectedCoupon}
          handleConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
