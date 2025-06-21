import React from 'react';
import { ThemeDesign } from '@/types/design';
import PreviewCard from '../cards/PreviewCard';

type Props = {
  themeDesign: ThemeDesign;
  theme: 'light' | 'dark';
};

const FinalView = ({ themeDesign, theme }: Props) => {
  return (
    <div>
      <PreviewCard themeDesign={themeDesign} theme={theme} />
    </div>
  );
};

export default FinalView;
