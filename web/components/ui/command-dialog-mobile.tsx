'use client';

import * as React from 'react';
import { DialogTitle, type DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
        className,
      )}
      {...props}
    />
  );
}
Command.displayName = CommandPrimitive.displayName;

const CommandDialogMobile = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 top-0 mt-4 w-[calc(100%-1rem)] translate-y-0 overflow-hidden rounded-sm p-0 transition-all duration-300 ease-out sm:w-full sm:max-w-lg">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export { CommandDialogMobile };
