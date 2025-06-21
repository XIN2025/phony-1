'use client';
import { Project } from '@/types/project';
import { useState } from 'react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { ProjectService } from '@/services';
import { UserPlus, Trash2, Mail, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { useSession } from 'next-auth/react';
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { SelectTrigger } from '@/components/ui/select';
import { getRoleBadgeStyle } from '@/utils/style';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['Developer', 'Client', 'Designer', 'Manager', 'Admin'], {
    message: 'Role is Required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Member {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: string;
  userId?: string;
}

const ROLES = [
  { value: 'Developer', label: 'Developer' },
  { value: 'Client', label: 'Client' },
  { value: 'Designer', label: 'Designer' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Admin', label: 'Admin' },
];

const MemberRoleSelect = ({
  member,
  projectId,
  disabled,
  onRoleUpdated,
}: {
  member: Member;
  projectId: string;
  disabled: boolean;
  onRoleUpdated: (role: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const handleChange = async (role: string) => {
    if (role === member.role) return;
    setLoading(true);
    const res = await ProjectService.updateProjectMemberRole(projectId, member.id, role);
    if (res?.data) {
      toast.success('Role updated');
      onRoleUpdated(role);
    } else {
      toast.error(res?.error?.message || 'Failed to update role');
    }
    setLoading(false);
  };
  return (
    <Select value={member.role} onValueChange={handleChange} disabled={loading || disabled}>
      <SelectTrigger
        className={`h-7 w-[120px] px-2 py-1 text-xs ${getRoleBadgeStyle(member.role)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role.value} value={role.value} className="capitalize">
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const ProjectMembers = ({ project }: { project: Project }) => {
  const [members, setMembers] = useState<Member[]>(project.projectMembers ?? []);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: session } = useSession();

  const isAdmin = members.find((member) => member.userId === session?.id)?.role === 'Admin';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const fetchMembers = async () => {
    setLoading(true);
    const res = await ProjectService.getProjectMembers(project.id);
    if (res?.data) {
      setMembers(res.data);
    } else {
      toast.error(res?.error?.message);
    }
    setLoading(false);
  };

  const onSubmit = async (values: FormValues) => {
    setAddingMember(true);
    const res = await ProjectService.addProjectMember(project.id, values.email, values.role);
    if (res?.data) {
      toast.success('Member added successfully');
      fetchMembers();
      form.reset();
      setOpen(false);
    } else {
      toast.error(res?.error?.message || 'Failed to add member');
    }
    setAddingMember(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId);
    const res = await ProjectService.removeProjectMember(project.id, memberId);
    if (res?.data) {
      toast.success('Member removed successfully');
      fetchMembers();
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    } else {
      toast.error(res?.error?.message || 'Failed to remove member');
    }
    setRemovingMemberId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Team Members</h2>
            {isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  You can add multiple team members who are associated with this project. Team
                  members can access the project based on their assigned roles.
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <p className="text-muted-foreground text-sm">Manage your project team members</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="max-sm:hidden">Add Member</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Enter the email address of the user you want to add to the project.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center">
                            <Mail className="text-muted-foreground h-4 w-4" />
                          </div>
                          <FormControl>
                            <Input placeholder="member@example.com" className="pl-10" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Developer">Developer</SelectItem>
                            <SelectItem value="Client">Client</SelectItem>
                            <SelectItem value="Designer">Designer</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addingMember}>
                      {addingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Member
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="group bg-accent/40 hover:bg-accent/50 flex items-center justify-between rounded-lg border p-4 shadow-xs transition-all"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-white shadow-xs">
                  <AvatarImage src={member.avatarUrl} />
                  <AvatarFallback className="bg-primary/5 text-sm font-medium">
                    {member.firstName && member.lastName
                      ? `${member.firstName[0]} ${member.lastName[0]}`
                      : member.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {member.firstName && member.lastName
                        ? `${member.firstName} ${member.lastName}`
                        : member.email.split('@')[0]}
                    </h3>
                    {member.userId === project.ownerId ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getRoleBadgeStyle(
                          member.role,
                        )}`}
                      >
                        Owner
                      </span>
                    ) : isAdmin && session?.id !== member.userId ? (
                      <MemberRoleSelect
                        member={member}
                        projectId={project.id}
                        disabled={member.userId === project.ownerId || !member.userId}
                        onRoleUpdated={() => fetchMembers()}
                      />
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getRoleBadgeStyle(
                          member.role,
                        )}`}
                      >
                        {member.role}
                      </span>
                    )}
                    {!member.userId && (
                      <span
                        className={`inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500`}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{member.email}</p>
                </div>
              </div>
              {member.userId !== project.ownerId && session?.id !== member.userId && isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setMemberToDelete(member);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={removingMemberId === member.id}
                  >
                    {removingMemberId === member.id ? (
                      <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="text-muted-foreground hover:text-destructive h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              {memberToDelete?.firstName
                ? `${memberToDelete.firstName} ${memberToDelete.lastName}`
                : memberToDelete?.email}{' '}
              from the project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setMemberToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => memberToDelete && handleRemoveMember(memberToDelete.id)}
              disabled={!!removingMemberId}
            >
              {removingMemberId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectMembers;
