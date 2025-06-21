import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Linkedin, Mail, User } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { toast } from 'sonner';

const UserProfile = () => {
  const { user, fetchUser, isLoading } = useUserStore();
  const [data, setData] = React.useState({
    first_name: user?.first_name,
    last_name: user?.last_name,
    linkedin_profile_url: user?.linkedin_profile_url,
  });

  useEffect(() => {
    setData({
      first_name: user?.first_name,
      last_name: user?.last_name,
      linkedin_profile_url: user?.linkedin_profile_url,
    });
  }, [user]);

  const onSubmit = async () => {
    if (!data.first_name?.trim() && !data.last_name?.trim()) {
      toast.error('First name and last name cannot be empty');
    } else {
      await fetchUser(true);
      toast.success('Profile updated successfully');
    }
  };
  return (
    <Card className="border-none bg-transparent p-2 shadow-none sm:p-6">
      <div className="flex items-start gap-6 max-sm:flex-col">
        <div className="group relative mx-auto shrink-0">
          <Avatar className="bg-background size-24 border-2 shadow-xs">
            <AvatarImage src={user?.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg uppercase">
              {user?.first_name?.charAt(0)}
              {user?.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-0 bottom-0 size-8 rounded-full shadow-xs"
          >
            <Camera className="size-4" />
          </Button>
        </div>

        <div className="w-full grow space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Profile Settings</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-muted-foreground text-sm font-medium">
                  <User className="mr-2 inline-block size-4" />
                  First name
                </Label>
                <Input
                  id="firstName"
                  value={data.first_name}
                  onChange={(e) => {
                    setData({ ...data, first_name: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-muted-foreground text-sm font-medium">
                  <User className="mr-2 inline-block size-4" />
                  Last name
                </Label>
                <Input
                  id="lastName"
                  value={data.last_name}
                  onChange={(e) => {
                    setData({ ...data, last_name: e.target.value });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  <Mail className="mr-2 inline-block size-4" />
                  Email Address
                </Label>
                <Input id="email" defaultValue={user?.email ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  <Linkedin className="mr-2 inline-block size-4" />
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedinProfile"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  type="url"
                  value={data.linkedin_profile_url}
                  onChange={(e) => {
                    setData({ ...data, linkedin_profile_url: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 border-t pt-6">
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? 'Loading..' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserProfile;
