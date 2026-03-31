// Generates demo cards shown in the homepage gallery.
// Usage: OPENAI_API_KEY=sk-... node generate-demos.js
//
// Reads:  images/demo-source.jpg  (reference photo)
//         images/AAI standard.png (AA logo)
// Writes: images/demos/pokemon.png, action-figure.png, superhero.png, minecraft.png

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error('Error: OPENAI_API_KEY env var not set.'); process.exit(1); }

const PHOTO_PATH = join(__dirname, 'images/demo-source.jpg');
const AA_PATH    = join(__dirname, 'images/AAI standard.png');
const OUT_DIR    = join(__dirname, 'images/demos');
mkdirSync(OUT_DIR, { recursive: true });

const PERSON  = 'Micah';
const TEACHER = 'Ms. Smith';
const BANNER_INSTRUCTION = `BOTTOM BANNER AREA (bottom 10% of the image): Leave this as a solid flat navy blue (#1A3B8C) rectangle with NO text, NO logos, and NO decorations. It must be completely empty — we will add the sponsor logos and school name in post-production.`;

const cards = [
  {
    id: 'pokemon',
    prompt: `Create a fun, ultra-rare Pokemon-style trading card. The image must look like a real physical trading card, perfectly centered, styled for printing as a 4x6 image.

CARD LAYOUT — follow this exactly:
- GOLD/YELLOW outer border (thick, like a real Pokemon card)
- TOP LEFT: The text "${TEACHER}" in small font
- TOP LEFT below that: The text "${PERSON}" in large bold font
- TOP RIGHT: "300 HP" in large bold Pokemon-style font
- TOP RIGHT below that: A gold star badge reading "Ultra Rare"
- CENTER (main art area): An anime/manga-style illustration of the person from the reference photo. Make them look like a friendly anime kid character, smiling. Bright colorful background with sparkles and energy bursts.
- LOWER CARD (attribute section): Three ability rows in classic Pokemon card style, each on its own line:
  Row 1: "⚡ Creativity — 80"
  Row 2: "🧠 Problem Solving — 90"
  Row 3: "🤝 Teamwork — 70"
  Use LARGE, clearly readable text for each row. Simple layout, no clutter.
- ${BANNER_INSTRUCTION}

Style: Bright, playful, collectible. Realistic card shadow like it's sitting on a table. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'action-figure',
    prompt: `Create a fun action figure toy packaging image, like a collectible you'd find at a toy store — a plastic blister pack (clear bubble) over a colorful cardboard backing. Styled for printing as a 4x6 image.

PACKAGING LAYOUT — follow this exactly:
- TOP HEADER (cardboard backing, top): The text "${PERSON} — FUTURE TECH HERO" in large bold comic/toy font. Use navy blue and gold colors.
- TOP LEFT CORNER: A circular yellow badge with the text "Career Fair Edition"
- TOP RIGHT CORNER: The text "${TEACHER}" in small font
- CENTER: A 3D cartoon-style toy figure of the person from the reference photo. The figure must be:
  - Fully enclosed inside a clear plastic bubble/blister pack (visible plastic with light reflections)
  - Smiling and in a confident heroic pose
  - Wearing a fun STEM-themed outfit
  - Accompanied by exactly 3 small accessories inside the bubble: a mini laptop, a small robot, and a backpack
  - NO part of the figure or accessories breaks outside the bubble
- BACKGROUND (cardboard area around bubble): Bright comic-style sunburst rays in blue and gold
- ${BANNER_INSTRUCTION}

Style: Realistic toy packaging. The plastic bubble must look real — glossy, with reflections. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'superhero',
    prompt: `Create a superhero comic book cover. It must look like a real printed comic book cover, styled for printing as a 4x6 image.

COVER LAYOUT — follow this exactly:
- TOP TITLE BANNER: Large bold retro comic lettering: "${PERSON}'s TECH ADVENTURES" — make this text LARGE and take up the full width, like a real comic title. Use navy blue background with gold letters and thick black outline.
- SMALL TEXT below title: "Career Fair Edition · ${TEACHER}'s Class" — small but readable
- MAIN ART (center, majority of the cover): A full-body dynamic illustration of the person from the reference photo as a superhero. They should:
  - Have a colorful STEM-themed superhero costume (circuit board patterns, glowing blue tech lines)
  - Be flying or leaping heroically with fist forward, smiling
  - Be in front of a dramatic city skyline with light beams and energy effects
- ONE SPEECH BUBBLE in the art: "With CODE comes POWER!" — large, readable comic speech bubble
- Issue label (small, bottom right of art area): "ISSUE #1"
- ${BANNER_INSTRUCTION}

Style: Bold colors, thick black outlines, Ben-Day dot halftone texture, dynamic action lines. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'minecraft',
    prompt: `Create a Minecraft-themed collectible character card. Everything must be rendered in Minecraft's iconic blocky pixel-art style. Styled for printing as a 4x6 image.

CARD LAYOUT — follow this exactly:
- TOP HEADER: A dark stone-block banner (pixelated texture) with the text "MINECRAFT" in the official Minecraft font (blocky, pixelated, green/white), and below it "CAREER FAIR EDITION" in smaller pixel text
- TEACHER LABEL (top right, small pixel font): "${TEACHER}"
- MAIN ART (center, large): A full-body Minecraft skin/character based on the person from the reference photo:
  - Classic blocky Minecraft character proportions
  - Wearing a white lab coat skin over their outfit, holding a diamond pickaxe in one hand and a blocky laptop in the other
  - Standing on grass blocks with a blue Minecraft sky behind them
  - The character's face/hair should match the reference photo as closely as possible in pixel style
- NAME TAG (floating above character, like in Minecraft): "${PERSON}" — white text on dark semi-transparent background, pixel font
- STATS PANEL (below character, dark stone UI panel):
  - "❤ HEALTH: 10/10" on one line (large pixel text)
  - "XP: CAREER FAIR CHAMPION" on one line (large pixel text)
- ${BANNER_INSTRUCTION}

Style: Pure Minecraft pixel-art aesthetic. Dark background. Glowing enchantment particle effects around the character. Keep all text LARGE and readable. DO NOT add any other text beyond what is listed above.`
  }
];

// Composite the real banner onto the generated image using sharp
async function compositeBanner(imageBuffer, aaLogoBuffer) {
  const meta = await sharp(imageBuffer).metadata();
  const W = meta.width;
  const H = meta.height;
  const BANNER_H = Math.round(H * 0.10);
  const Y = H - BANNER_H;

  // Resize AA logo to fit banner height (65% of banner height)
  const logoH = Math.round(BANNER_H * 0.65);
  const aaResized = await sharp(aaLogoBuffer)
    .resize({ height: logoH, fit: 'contain', background: { r: 26, g: 59, b: 140, alpha: 0 } })
    .toBuffer();
  const aaResizedMeta = await sharp(aaResized).metadata();
  const logoW = aaResizedMeta.width;
  const logoX = Math.round(W * 0.04);
  const logoY = Y + Math.round((BANNER_H - logoH) / 2);

  // Build SVG text overlay for school name (right-aligned)
  const fontSize = Math.round(BANNER_H * 0.27);
  const fontSize2 = Math.round(BANNER_H * 0.27);
  const textX = W - Math.round(W * 0.04);
  const line1Y = Y + Math.round(BANNER_H * 0.35);
  const line2Y = Y + Math.round(BANNER_H * 0.72);

  const svgText = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <!-- Navy banner background -->
    <rect x="0" y="${Y}" width="${W}" height="${BANNER_H}" fill="#1A3B8C"/>
    <!-- Gold separator line -->
    <rect x="0" y="${Y}" width="${W}" height="3" fill="#F5A800"/>
    <!-- School name lines -->
    <text x="${textX}" y="${line1Y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="end" dominant-baseline="middle">STATESVILLE RD ELEMENTARY</text>
    <text x="${textX}" y="${line2Y}" font-family="Arial, sans-serif" font-size="${fontSize2}" font-weight="bold" fill="#F5A800" text-anchor="end" dominant-baseline="middle">CAREER FAIR</text>
  </svg>`;

  const result = await sharp(imageBuffer)
    .composite([
      // Navy banner + text via SVG
      { input: Buffer.from(svgText), top: 0, left: 0 },
      // AA logo
      { input: aaResized, top: logoY, left: logoX }
    ])
    .png()
    .toBuffer();

  return result;
}

async function generateCard(card, photoBuffer, aaBuffer) {
  console.log(`\nGenerating ${card.id}...`);

  const form = new FormData();
  form.append('image[]', new Blob([photoBuffer], { type: 'image/jpeg' }), 'photo.jpg');
  form.append('image[]', new Blob([aaBuffer],    { type: 'image/png'  }), 'aa-logo.png');
  form.append('prompt',        card.prompt);
  form.append('model',         'gpt-image-1.5');
  form.append('size',          '1024x1536');
  form.append('output_format', 'png');
  form.append('quality',       'high');

  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: form
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI error (${card.id}): ${data.error?.message}`);

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image data for ${card.id}`);

  const rawBuffer = Buffer.from(b64, 'base64');

  console.log(`  Compositing banner...`);
  const finalBuffer = await compositeBanner(rawBuffer, aaBuffer);

  const outPath = join(OUT_DIR, `${card.id}.png`);
  writeFileSync(outPath, finalBuffer);
  console.log(`  Saved → ${outPath}`);
}

async function main() {
  const photoBuffer = readFileSync(PHOTO_PATH);
  const aaBuffer    = readFileSync(AA_PATH);

  for (const card of cards) {
    await generateCard(card, photoBuffer, aaBuffer);
  }
  console.log('\nAll demo cards generated!');
}

main().catch(err => { console.error(err); process.exit(1); });
