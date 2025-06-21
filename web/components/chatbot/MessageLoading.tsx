import Image from 'next/image';
import React from 'react';
import ShinyText from '@/components/ShinyText';

const MessageLoading = () => {
  return (
    <div className="my-5 flex max-w-full items-center gap-3">
      <Image
        src={'https://d2iyl9s54la9ej.cloudfront.net/heizen.png'}
        alt="Curie"
        width={100}
        height={100}
        className="size-7 rounded-md"
      />
      <ShinyText text="AI is thinking..." className="font-medium" />
    </div>
  );
};

export default MessageLoading;
