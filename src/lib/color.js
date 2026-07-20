function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;
  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (l > 0.5 ? 2 - max - min : max + min);
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

function hslToHex({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rp)}${toHex(gp)}${toHex(bp)}`.toUpperCase();
}

// Derives a darker, more saturated "stroke" tone from a pastel "fill" tone,
// calibrated against the ratio between the design's #F3A9B7 fill / #F3617D stroke pair.
export function deriveStroke(fillHex) {
  const { h, s, l } = rgbToHsl(hexToRgb(fillHex));
  return hslToHex({ h, s: Math.min(1, s * 1.14), l: l * 0.82 });
}

// Derives a darker, desaturated "text" tone for mood labels on a light background —
// calibrated against the design's #F3A9B7 fill / #C8405A text pair. Crushes lightness
// harder than deriveStroke() so the label stays legible instead of matching the bear's
// brighter outline color.
export function deriveTextColor(fillHex) {
  const { h, s, l } = rgbToHsl(hexToRgb(fillHex));
  return hslToHex({ h, s: s * 0.732, l: l * 0.641 });
}
