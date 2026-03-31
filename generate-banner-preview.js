// Quick banner layout preview — no OpenAI calls.
// Generates banner-preview.png at actual card proportions.
// Usage: node generate-banner-preview.js

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Match real card dimensions
const CARD_W = 1024;
const CARD_H = 1536;
const BANNER_H = Math.round(CARD_H * 0.18); // 276px
const W = CARD_W;
const PAD = Math.round(W * 0.03); // ~31px

console.log(`Banner: ${W} × ${BANNER_H}px`);

const aaBuffer   = readFileSync(join(__dirname, 'images/2021-AAI-White.png'));
const sresBuffer = readFileSync(join(__dirname, 'images/statesvilleroad.png'));

// Each logo gets a reserved zone: max 200px wide, full banner height
// Using fit:'inside' so each logo scales to fit its box without distortion
const LOGO_MAX_W = 200;
const LOGO_MAX_H = Math.round(BANNER_H * 0.82); // 226px — keeps some padding top/bottom

const aaResized = await sharp(aaBuffer)
  .resize({ width: LOGO_MAX_W, height: LOGO_MAX_H, fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const aaMeta = await sharp(aaResized).metadata();
const AA_W = aaMeta.width;
const AA_H = aaMeta.height;

const sresResized = await sharp(sresBuffer)
  .resize({ width: LOGO_MAX_W, height: LOGO_MAX_H, fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const sresMeta = await sharp(sresResized).metadata();
const SRES_W = sresMeta.width;
const SRES_H = sresMeta.height;

console.log(`AA logo:   ${AA_W} × ${AA_H}px`);
console.log(`SRES logo: ${SRES_W} × ${SRES_H}px`);

// Positions — logos flush to each side, vertically centered
const aaX   = PAD;
const aaY   = Math.round((BANNER_H - AA_H) / 2);
const sresX = W - PAD - SRES_W;
const sresY = Math.round((BANNER_H - SRES_H) / 2);

// Center text sits between the two logos
const textLeft  = aaX + AA_W + PAD;
const textRight = sresX - PAD;
const textCX    = Math.round((textLeft + textRight) / 2);
const textAreaW = textRight - textLeft;

// Three lines of text
const line1Y = Math.round(BANNER_H * 0.25);  // STATESVILLE RD
const line2Y = Math.round(BANNER_H * 0.52);  // ELEMENTARY
const line3Y = Math.round(BANNER_H * 0.80);  // CAREER FAIR (gold)

// Font sizes — scale down to fit textAreaW if needed
const maxFs1 = Math.round(BANNER_H * 0.26);
const maxFs2 = Math.round(BANNER_H * 0.22);
const maxFs3 = Math.round(BANNER_H * 0.19);

// Approximate char widths (SVG/Arial bold): ~0.54× font size per char
const textLine1 = 'STATESVILLE RD';
const textLine2 = 'ELEMENTARY';
const textLine3 = 'CAREER FAIR';

function fitFontSize(text, maxFontSize, availableWidth, charWidthRatio = 0.54) {
  const minFs = 10;
  let fs = maxFontSize;
  while (fs > minFs && text.length * fs * charWidthRatio > availableWidth) fs--;
  return fs;
}

const fs1 = fitFontSize(textLine1, maxFs1, textAreaW);
const fs2 = fitFontSize(textLine2, maxFs2, textAreaW);
const fs3 = fitFontSize(textLine3, maxFs3, textAreaW);

console.log(`Text area: ${textAreaW}px wide, centered at x=${textCX}`);
console.log(`Font sizes: "${textLine1}"=${fs1}px  "${textLine2}"=${fs2}px  "${textLine3}"=${fs3}px`);

const svgBanner = `<svg width="${W}" height="${BANNER_H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${W}" height="${BANNER_H}" fill="#1A3B8C"/>
  <rect x="0" y="0" width="${W}" height="4" fill="#F5A800"/>
  <text x="${textCX}" y="${line1Y}"
    font-family="Arial, sans-serif" font-size="${fs1}" font-weight="800"
    fill="white" text-anchor="middle" dominant-baseline="middle">${textLine1}</text>
  <text x="${textCX}" y="${line2Y}"
    font-family="Arial, sans-serif" font-size="${fs2}" font-weight="800"
    fill="white" text-anchor="middle" dominant-baseline="middle">${textLine2}</text>
  <text x="${textCX}" y="${line3Y}"
    font-family="Arial, sans-serif" font-size="${fs3}" font-weight="700"
    fill="#F5A800" text-anchor="middle" dominant-baseline="middle">${textLine3}</text>
</svg>`;

const bannerBase = await sharp(Buffer.from(svgBanner)).png().toBuffer();

const result = await sharp(bannerBase)
  .composite([
    { input: aaResized,   top: aaY,   left: aaX   },
    { input: sresResized, top: sresY, left: sresX  },
  ])
  .png()
  .toBuffer();

const out = join(__dirname, 'banner-preview.png');
writeFileSync(out, result);
console.log(`\nSaved → ${out}`);
console.log('Open banner-preview.png to review before applying changes.\n');
