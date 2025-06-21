import React from 'react';
import { Button, ButtonProps } from './ui/button';
import { Loader2 } from 'lucide-react';

type ButtonWithLoadingProps = ButtonProps & {
  loading: boolean;
};

const ButtonWithLoading = ({
  children,
  loading,
  disabled,
  className,
  ...props
}: ButtonWithLoadingProps) => {
  return (
    <Button {...props} disabled={loading || disabled} className={`gap-2 ${className}`}>
      {loading && <Loader2 size={20} className="mr-2 animate-spin" />}
      {children}
    </Button>
  );
};

export default ButtonWithLoading;
