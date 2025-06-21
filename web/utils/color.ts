/**
 * Converts an HSL color string to HEX.
 * Input format: "221 10% 40%"
 * Output format: "#121212"
 */
function hslToHex(hslStr: string): string {
  try {
    const [h, s, l] = hslStr.split(' ').map((val) => {
      if (val.includes('%')) {
        return parseFloat(val) / 100;
      }
      return parseFloat(val) / 360;
    });

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number): string => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.error(error);
    return '#121212';
  }
}
/**
 * Converts an HSL color string to OKLCH.
 * Input format: "221 10% 40%"
 * Output format: "oklch(0.40 0.10 221)"
 */
function hslToOklch(hslStr: string): string {
  try {
    // First convert HSL to RGB
    const [h, s, l] = hslStr.split(' ').map((val, index) => {
      if (val.includes('%')) {
        return parseFloat(val) / 100;
      }
      return index === 0 ? parseFloat(val) / 360 : parseFloat(val);
    });

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    // Convert RGB to linear RGB
    const toLinear = (c: number): number => {
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Convert linear RGB to OKLab
    const l_oklab = 0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear;
    const m = 0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear;
    const s_oklab = 0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear;

    const l_cube = Math.cbrt(l_oklab);
    const m_cube = Math.cbrt(m);
    const s_cube = Math.cbrt(s_oklab);

    const L = 0.2104542553 * l_cube + 0.793617785 * m_cube - 0.0040720468 * s_cube;
    const a = 1.9779984951 * l_cube - 2.428592205 * m_cube + 0.4505937099 * s_cube;
    const b_oklab = 0.0259040371 * l_cube + 0.7827717662 * m_cube - 0.808675766 * s_cube;

    // Convert OKLab to OKLCH
    const C = Math.sqrt(a * a + b_oklab * b_oklab);
    let H = Math.atan2(b_oklab, a) * (180 / Math.PI);
    if (H < 0) H += 360;

    // Format as OKLCH string
    const lightness = Math.max(0, Math.min(1, L));
    const chroma = Math.max(0, C);
    const hue = isNaN(H) ? 0 : H;

    return `oklch(${lightness.toFixed(4)} ${chroma.toFixed(4)} ${hue.toFixed(4)})`;
  } catch (error) {
    console.error(error);
    return 'oklch(0.4 0.1 221)';
  }
}

/**
 * Converts a HEX color to HSL string.
 * Input format: "#121212"
 * Output format: "221 10% 40%"
 */
function hexToHsl(hex: string): string {
  try {
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else if (max === b) {
        h = (r - g) / d + 4;
      }

      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch (error) {
    console.error(error);
    return '221 10% 40%';
  }
}

export { hslToHex, hexToHsl, hslToOklch };
