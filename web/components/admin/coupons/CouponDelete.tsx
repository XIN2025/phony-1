import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogContent,
} from '@/components/ui/alert-dialog';
import { Coupon } from '@/types/admin';
import React from 'react';

type Props = {
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  selectedCoupon: Coupon;
  handleConfirmDelete: () => void;
};

const CouponDelete = ({
  deleteDialogOpen,
  setDeleteDialogOpen,
  selectedCoupon,
  handleConfirmDelete,
}: Props) => {
  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the coupon code{' '}
            {selectedCoupon?.code}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CouponDelete;
