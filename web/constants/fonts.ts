import { ThemeDesign } from '@/types/design';
import { darkDefaultTheme, lightDefaultTheme } from './colors';

const fonts = [
  {
    name: 'Quicksand',
    link: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap',
  },
  {
    name: 'Montserrat',
    link: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300..700&display=swap',
  },
  {
    name: 'Nunito Sans',
    link: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap',
  },
  {
    name: 'DM Sans',
    link: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,100..900;1,100..900&display=swap',
  },
  {
    name: 'DM Serif Display',
    link: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap',
  },
  {
    name: 'Playfair Display',
    link: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap',
  },
  {
    name: 'Poppins',
    link: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
  },
  {
    name: 'Roboto',
    link: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
  },
  {
    name: 'Alice',
    link: 'https://fonts.googleapis.com/css2?family=Alice&display=swap',
  },
  {
    name: 'Lora',
    link: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap',
  },
  {
    name: 'Nunito',
    link: 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..900;1,200..900&display=swap',
  },
];

export const fontPairs = [
  {
    heading: 'Quicksand',
    body: 'Quicksand',
    links: fonts.filter((font) => ['Quicksand'].includes(font.name)).map((font) => font.link),
  },
  {
    heading: 'Montserrat',
    body: 'Montserrat',
    links: fonts.filter((font) => ['Montserrat'].includes(font.name)).map((font) => font.link),
  },
  {
    heading: 'Nunito Sans',
    body: 'Nunito',
    links: fonts
      .filter((font) => ['Nunito Sans', 'Nunito'].includes(font.name))
      .map((font) => font.link),
  },
  {
    heading: 'DM Serif Display',
    body: 'DM Sans',
    links: fonts
      .filter((font) => ['DM Serif Display', 'DM Sans'].includes(font.name))
      .map((font) => font.link),
  },
  {
    heading: 'Playfair Display',
    body: 'Alice',
    links: fonts
      .filter((font) => ['Playfair Display', 'Alice'].includes(font.name))
      .map((font) => font.link),
  },
  {
    heading: 'Poppins',
    body: 'Lora',
    links: fonts.filter((font) => ['Poppins', 'Lora'].includes(font.name)).map((font) => font.link),
  },
  {
    heading: 'Roboto',
    body: 'Nunito',
    links: fonts
      .filter((font) => ['Roboto', 'Nunito'].includes(font.name))
      .map((font) => font.link),
  },
];

export const designStyleDefaults: {
  [key: string]: ThemeDesign;
} = {
  minimal: {
    colors: {
      light: {
        ...lightDefaultTheme,
        '--primary': '240 5% 85%',
        '--primary-foreground': '0 0% 10%',
        '--radius': '0rem',
      },
      dark: {
        ...darkDefaultTheme,
        '--primary': '240 5% 85%',
        '--primary-foreground': '0 0% 10%',
        '--radius': '0rem',
      },
    },
    typography: {
      heading: 'Quicksand',
      body: 'Quicksand',
      fontLinks: fonts.filter((font) => ['Quicksand'].includes(font.name)).map((font) => font.link),
    },
    style: 'minimal',
  },
  modern: {
    colors: {
      light: {
        ...lightDefaultTheme,
        '--primary': '210 100% 40%',
        '--primary-foreground': '0 0% 100%',
        '--radius': '0.5rem',
      },
      dark: {
        ...darkDefaultTheme,
        '--primary': '210 100% 40%',
        '--primary-foreground': '0 0% 100%',
        '--radius': '0.5rem',
      },
    },
    typography: {
      heading: 'Montserrat',
      body: 'Montserrat',
      fontLinks: fonts
        .filter((font) => ['Montserrat'].includes(font.name))
        .map((font) => font.link),
    },
    style: 'modern',
  },
  playful: {
    colors: {
      light: {
        ...lightDefaultTheme,
        '--primary': '15 85% 60%',
        '--primary-foreground': '0 0% 95%',
        '--radius': '1rem',
      },
      dark: {
        ...darkDefaultTheme,
        '--primary': '15 85% 60%',
        '--primary-foreground': '0 0% 95%',
        '--radius': '1rem',
      },
    },
    typography: {
      heading: 'Nunito Sans',
      body: 'Nunito',
      fontLinks: fonts
        .filter((font) => ['Nunito Sans', 'Nunito'].includes(font.name))
        .map((font) => font.link),
    },
    style: 'playful',
  },
  luxury: {
    colors: {
      light: {
        ...lightDefaultTheme,
        '--primary': '345 55% 35%',
        '--primary-foreground': '0 0% 100%',
        '--radius': '0.3rem',
      },
      dark: {
        ...darkDefaultTheme,
        '--primary': '345 55% 35%',
        '--primary-foreground': '0 0% 100%',
        '--radius': '0.3rem',
      },
    },
    typography: {
      heading: 'DM Serif Display',
      body: 'DM Sans',
      fontLinks: fonts
        .filter((font) => ['DM Serif Display', 'DM Sans'].includes(font.name))
        .map((font) => font.link),
    },
    style: 'luxury',
  },
  creative: {
    colors: {
      light: {
        ...lightDefaultTheme,
        '--primary': '270 50% 50%',
        '--primary-foreground': '0 0% 100%',
        '--radius': '0.75rem',
      },
      dark: {
        ...darkDefaultTheme,
        '--primary': '270 50% 50%',
        '--primary-foreground': '0 0% 100%',
        '--radius': '0.75rem',
      },
    },
    typography: {
      heading: 'Playfair Display',
      body: 'Alice',
      fontLinks: fonts
        .filter((font) => ['Playfair Display', 'Alice'].includes(font.name))
        .map((font) => font.link),
    },
    style: 'creative',
  },
};
