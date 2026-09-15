// Renders the Figma tab glyphs (assets/icons/tabs/src/*.svg, 24pt boxes, black fills) to
// template PNGs at 1x/2x/3x. The native tab bar tints template images, so one glyph serves
// both states. macOS only: rasterizes via scripts/svg2png.swift (transparent background).
//   node scripts/render-tab-icons.mjs
import { execSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';

const SCALES = { '': 24, '@2x': 48, '@3x': 72 };
const SRC = 'assets/icons/tabs/src';
const OUT = 'assets/icons/tabs';
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) rmSync(`${OUT}/${f}`);
let n = 0;
for (const file of readdirSync(SRC).filter((f) => f.endsWith('.svg'))) {
  const name = file.replace(/\.svg$/, '');
  for (const [scale, px] of Object.entries(SCALES)) {
    execSync(`swift scripts/svg2png.swift "${SRC}/${file}" "${OUT}/${name}${scale}.png" ${px}`);
    n++;
  }
}
console.log(`rendered ${n} PNGs into ${OUT}`);
