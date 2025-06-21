import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { ProjectMember, Sprint } from '@/types/project';
import { DatePicker } from '@/components/DatePicker';
import MdxEditorComponent from '@/components/MdxEditor';
import { useSession } from 'next-auth/react';

const sprintFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    requirements: z.string().optional(),
    startDate: z.date({
      required_error: 'Start date is required',
    }),
    endDate: z.date({
      required_error: 'End date is required',
    }),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Start date must be before end date',
    path: ['startDate'],
  });
export type SprintFormValues = z.infer<typeof sprintFormSchema>;

const EditSprintForm = ({
  sprint,
  members,
  onSubmit,
}: {
  sprint: Sprint;
  members: ProjectMember[];
  onSubmit: (sprintId: string, data: SprintFormValues) => Promise<void>;
}) => {
  // show price section to only admin
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isProjectAdmin = members.some(
    (member) => member.userId === session?.id && member.role === 'Admin',
  );
  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: {
      name: sprint.name,
      price: sprint.price ?? undefined,
      requirements: sprint.requirements || '',
      startDate: new Date(sprint.startDate),
      endDate: new Date(sprint.endDate),
    },
  });

  const handleSubmit = async (data: SprintFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(sprint.id, data);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter sprint name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isProjectAdmin && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter sprint price in USD($)"
                    min={0}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements</FormLabel>
              <FormControl>
                <MdxEditorComponent
                  className="max-h-[300px] overflow-y-auto"
                  markdown={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <DatePicker date={field.value} onChange={(date) => field.onChange(date)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <DatePicker date={field.value} onChange={(date) => field.onChange(date)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
};

export default EditSprintForm;
