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
