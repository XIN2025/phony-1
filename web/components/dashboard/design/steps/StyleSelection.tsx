import React from 'react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface StyleOption {
  id: string;
  title: string;
  description: string;
  recommended?: boolean;
  image: string;
}

const styles: StyleOption[] = [
  {
    id: 'minimal',
    title: 'Minimalist',
    description: 'Clean lines, simple colors, minimalist design',
    recommended: true,
    image: '/images/minimalistic.png',
  },
  {
    id: 'modern',
    title: 'Modern',
    description: 'Clean and minimalistic design with a modern look',
    recommended: true,
    image: '/images/modern.png',
  },
  {
    id: 'luxury',
    title: 'Luxurious',
    description: 'Sophisticated design with premium elements',
    image: '/images/luxury.png',
  },
  {
    id: 'playful',
    title: 'Playful & Friendly',
    description: 'Fun and approachable design style',
    image: '/images/playful.png',
  },
  {
    id: 'creative',
    title: 'Creative & Artsy',
    description: 'Unique and artistic design approach',
    image: '/images/creative.png',
  },
];

type Props = {
  currentStyle: string;
  onStyleChange: (style: string) => void;
};

const StyleSelection = ({ currentStyle, onStyleChange }: Props) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {styles.map((style) => (
          <div
            key={style.id}
            className={` ${currentStyle === style.id ? 'border-primary' : 'border-transparent'} bg-background hover:border-primary relative cursor-pointer rounded-lg border p-2`}
            onClick={() => onStyleChange(style.id)}
          >
            {style.recommended && <Badge className="absolute top-3 left-2 z-10">Recommended</Badge>}
            <div className="bg-muted aspect-video overflow-hidden rounded-md">
              <Image
                src={style.image}
                alt={style.title}
                className="h-full w-full object-cover"
                width={100}
                height={100}
              />
            </div>
            <div className="p-2">
              <h3 className="font-medium">{style.title}</h3>
              <p className="text-muted-foreground text-sm">{style.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleSelection;
