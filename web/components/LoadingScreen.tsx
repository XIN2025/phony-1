import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

type Props = {
  type?: 'loader' | 'logo';
  className?: string;
};

const LoadingScreen = (props: Props) => {
  return (
    <div className={`flex h-full w-full items-center justify-center ${props.className ?? ''}`}>
      {props.type === 'logo' ? (
        <Image
          src="/images/logo.svg"
          width={60}
          height={60}
          priority
          loading="eager"
          className="pointer-events-none animate-pulse"
          alt="OG"
        />
      ) : (
        <Loader2 size={50} className="animate-spin" />
      )}
    </div>
  );
};

export default LoadingScreen;
