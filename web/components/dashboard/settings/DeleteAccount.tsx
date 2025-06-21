import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';

const DeleteAccount = () => {
  return (
    <Card className="border-none p-2 shadow-none sm:p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skull className="text-destructive h-5 w-5" />
          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-500">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive">Delete Account</Button>
      </div>
    </Card>
  );
};

export default DeleteAccount;
