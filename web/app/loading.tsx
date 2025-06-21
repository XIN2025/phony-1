import LoadingScreen from '@/components/LoadingScreen';
import React from 'react';

const GlobalLoading = () => {
  return (
    <div className="absolute top-0 left-0 z-50 h-dvh w-full">
      <LoadingScreen type="logo" />
    </div>
  );
};

export default GlobalLoading;
