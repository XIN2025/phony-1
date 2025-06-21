import React from 'react';
import ColorThemeCard from '../cards/ColorThemeCard';
import TypographyCard from '../cards/TypographyCard';
import PreviewCard from '../cards/PreviewCard';
import { ThemeDesign } from '@/types/design';

type Props = {
  themeDesign: ThemeDesign;
  theme: 'light' | 'dark';
  setThemeDesign: (themeDesign: ThemeDesign) => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

const ThemeSelection = ({ themeDesign, theme, setThemeDesign, setTheme }: Props) => {
  return (
    <div className="flex h-[calc(100dvh-200px)] flex-col gap-4 lg:flex-row">
      <div className="flex h-full flex-col gap-4 lg:h-[calc(100dvh-200px)] lg:w-2/5">
        <ColorThemeCard
          color={themeDesign.colors.light['--primary']}
          setColor={(color) => {
            const brightness = color.split(' ')[2].replace('%', '');
            const foreground = Number(brightness) < 50 ? '0 0% 100%' : '0 0% 0%';
            setThemeDesign({
              ...themeDesign,
              colors: {
                ...themeDesign.colors,
                light: {
                  ...themeDesign.colors.light,
                  '--primary': color,
                  '--primary-foreground': foreground,
                },
                dark: {
                  ...themeDesign.colors.dark,
                  '--primary': color,
                  '--primary-foreground': foreground,
                },
              },
            });
          }}
          radius={parseFloat(themeDesign.colors.light['--radius'].split('rem')[0])}
          setRadius={(radius) => {
            setThemeDesign({
              ...themeDesign,
              colors: {
                ...themeDesign.colors,
                light: { ...themeDesign.colors.light, '--radius': `${radius}rem` },
                dark: { ...themeDesign.colors.dark, '--radius': `${radius}rem` },
              },
            });
          }}
          theme={theme}
          setTheme={(theme) => {
            setTheme(theme);
          }}
        />
        <TypographyCard
          headingFont={themeDesign.typography.heading}
          bodyFont={themeDesign.typography.body}
          onChangeTypography={(headingFont, bodyFont, links) => {
            setThemeDesign({
              ...themeDesign,
              typography: {
                heading: headingFont,
                body: bodyFont,
                fontLinks: links,
              },
            });
          }}
        />
      </div>
      <div className="h-full lg:w-3/5">
        <PreviewCard theme={theme} themeDesign={themeDesign} />
      </div>
    </div>
  );
};

export default ThemeSelection;
