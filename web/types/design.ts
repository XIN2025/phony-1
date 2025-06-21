export type ThemeDesign = {
  colors: Colors;
  typography: Fonts;
  style: string;
};

export type Colors = {
  light: {
    [key: string]: string;
  };
  dark: {
    [key: string]: string;
  };
};

export type Fonts = {
  heading: string;
  body: string;
  fontLinks: string[];
};
