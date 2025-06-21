import { DialogContent, Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/DatePicker';
import { Coupon } from '@/types/admin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be less than 20 characters')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Code must contain only uppercase letters, numbers, underscores, and hyphens',
    ),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  discount: z
    .number()
    .min(1, 'Discount must be at least 1%')
    .max(100, 'Discount cannot exceed 100%'),
  max_uses: z.number().min(1, 'Maximum uses must be at least 1'),
  expires_at: z.date().nullable(),
});

type CouponFormData = z.infer<typeof couponSchema>;

type Props = {
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  selectedCoupon: Coupon | null;
  onSubmit: (data: CouponFormData) => Promise<void>;
};

const CouponEditCreate = ({ formOpen, setFormOpen, selectedCoupon, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      description: '',
      discount: 0,
      max_uses: 1,
      expires_at: null,
    },
  });

  useEffect(() => {
    if (selectedCoupon) {
      reset({
        code: selectedCoupon.code,
        description: selectedCoupon.description,
        discount: selectedCoupon.discount,
        max_uses: selectedCoupon.max_uses,
        expires_at: selectedCoupon.expires_at ? new Date(selectedCoupon.expires_at) : null,
      });
    } else {
      reset({
        code: '',
        description: '',
        discount: 0,
        max_uses: 1,
        expires_at: null,
      });
    }
  }, [selectedCoupon, reset]);

  const expiryDate = watch('expires_at');

  return (
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" {...register('code')} placeholder="SUMMER2024" />
            {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Summer sale discount"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Amount</Label>
              <Input
                id="discount"
                type="number"
                {...register('discount', { valueAsNumber: true })}
              />
              {errors.discount && <p className="text-sm text-red-500">{errors.discount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_uses">Maximum Uses</Label>
              <Input
                id="max_uses"
                type="number"
                {...register('max_uses', { valueAsNumber: true })}
              />
              {errors.max_uses && <p className="text-sm text-red-500">{errors.max_uses.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <DatePicker
              date={expiryDate || undefined}
              onChange={(date) => setValue('expires_at', date || null)}
              minDate={new Date()}
            />
            {errors.expires_at && (
              <p className="text-sm text-red-500">{errors.expires_at.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            {selectedCoupon ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CouponEditCreate;
