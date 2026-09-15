// Renders Iconsax glyphs (Linear = default, Bold = selected) to template PNGs for the native tab bar.
// Usage: node scripts/render-tab-icons.mjs   (macOS: rasterizes via scripts/svg2png.swift for a transparent background)
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ICONS = { dashboard: 'Element3', messages: 'Message', wallet: 'Wallet2', more: 'MoreCircle' };
const SCALES = { '': 24, '@2x': 48, '@3x': 72 };
const src = (name) => readFileSync(`node_modules/iconsax-react-native/dist/esm/${name}.js`, 'utf8');

function variantSvg(text, variant) {
  const start = text.indexOf(`var ${variant} = function`);
  const end = text.indexOf('\nvar ', start + 5);
  const block = text.slice(start, end === -1 ? undefined : end);
  const paths = [...block.matchAll(/createElement\(Path, \{([\s\S]*?)\}\)/g)].map((m) => {
    const props = {};
    for (const [, k, v] of m[1].matchAll(/(\w+): (?:"([^"]*)"|color)/g)) props[k] = v ?? '#000';
    const attr = (k, out = k) => (props[k] !== undefined ? ` ${out}="${props[k]}"` : '');
    return `<path d="${props.d}"${props.fill ? ' fill="#000"' : ' fill="none"'}${props.stroke ? ' stroke="#000"' : ''}${attr('strokeWidth', 'stroke-width')}${attr('strokeLinecap', 'stroke-linecap')}${attr('strokeLinejoin', 'stroke-linejoin')}${attr('strokeMiterlimit', 'stroke-miterlimit')}${attr('opacity')}/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${paths.join('')}</svg>`;
}

const tmp = mkdtempSync(join(tmpdir(), 'iconsax-'));
for (const [tab, icon] of Object.entries(ICONS)) {
  const text = src(icon);
  for (const [variant, suffix] of [['Linear', ''], ['Bold', '-selected']]) {
    const svgPath = join(tmp, `${tab}${suffix}.svg`);
    writeFileSync(svgPath, variantSvg(text, variant));
    for (const [scale, px] of Object.entries(SCALES)) {
      execSync(`swift scripts/svg2png.swift "${svgPath}" "assets/icons/tabs/${tab}${suffix}${scale}.png" ${px}`);
    }
  }
}
console.log('rendered', Object.keys(ICONS).length * 2 * Object.keys(SCALES).length, 'PNGs into assets/icons/tabs');
