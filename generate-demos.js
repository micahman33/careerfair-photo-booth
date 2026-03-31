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
const AA_PATH    = join(__dirname, 'images/2021-AAI-White.png');
const OUT_DIR    = join(__dirname, 'images/demos');
mkdirSync(OUT_DIR, { recursive: true });

const PERSON  = 'Micah';
const TEACHER = 'Ms. Smith';
const BANNER_INSTRUCTION = `BOTTOM BANNER ZONE (the bottom 18% of the full image height): This entire strip must be a solid flat navy blue (#1A3B8C) rectangle with absolutely NO text, NO logos, NO artwork, and NO decorations of any kind. All card content (borders, art, stats, text) must be fully contained within the top 82% of the image. This zone will be replaced in post-production.`;

const cards = [
  {
    id: 'pokemon',
    prompt: `Create a fun, ultra-rare Pokemon-style trading card. The image must look like a real physical trading card, perfectly centered, styled for printing as a 4x6 image.

IMPORTANT: All card content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

CARD LAYOUT — follow this exactly:
- GOLD/YELLOW outer border (thick, like a real Pokemon card)
- TOP LEFT: The text "${TEACHER}" in small font
- TOP LEFT below that: The text "${PERSON}" in large bold font
- TOP RIGHT: "300 HP" in large bold Pokemon-style font
- TOP RIGHT below that: A gold star badge reading "Ultra Rare"
- CENTER (main art area): An anime/manga-style illustration of the person from the reference photo. Make them look like a friendly anime kid character, smiling. Bright colorful background with sparkles and energy bursts.
- LOWER CARD (skill section, inside top 82%): Three skill rows in classic Pokemon card style. Each row has TWO lines — a bold name/score line followed by a smaller italic flavor description, exactly like a real Pokemon card attack description:
  Row 1 bold:   "💡 Creativity — 80"
  Row 1 italic: "Dreams up bold new ideas and turns imagination into reality."
  Row 2 bold:   "⚙️ Problem Solving — 90"
  Row 2 italic: "Breaks any challenge into steps and never gives up finding the answer."
  Row 3 bold:   "🤝 Collaboration — 85"
  Row 3 italic: "Makes every teammate better and builds something greater together."
- ${BANNER_INSTRUCTION}

Style: Bright, playful, collectible. Realistic card shadow like it's sitting on a table. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'action-figure',
    prompt: `Create a fun action figure toy packaging image, like a collectible you'd find at a toy store — a plastic blister pack (clear bubble) over a colorful cardboard backing. Styled for printing as a 4x6 image.

IMPORTANT: All packaging content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

PACKAGING LAYOUT — follow this exactly:
- TOP HEADER (cardboard backing, top 15% of image): The text "${PERSON} — FUTURE TECH HERO" in large bold comic/toy font. Use navy blue and gold colors.
- TOP LEFT CORNER: A circular yellow badge with the text "Career Fair Edition"
- TOP RIGHT CORNER: The text "${TEACHER}" in small font
- CENTER (inside the blister pack bubble): A 3D cartoon-style toy figure of the person from the reference photo:
  - Fully enclosed inside a clear plastic bubble/blister pack (visible plastic with light reflections)
  - Smiling and in a confident heroic pose, wearing a fun STEM-themed outfit
  - Accompanied by exactly 3 small accessories inside the bubble: a mini laptop, a small robot, and a backpack
- SKILL BADGES on the cardboard below the bubble (still inside the top 85%):
  Three small colored badges reading: "💡 CREATIVE THINKER"  "⚙️ PROBLEM SOLVER"  "🚀 INNOVATOR"
- BACKGROUND (cardboard area around bubble): Bright comic-style sunburst rays in blue and gold
- ${BANNER_INSTRUCTION}

Style: Realistic toy packaging. The plastic bubble must look real — glossy, with reflections. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'superhero',
    prompt: `Create a superhero comic book cover. It must look like a real printed comic book cover, styled for printing as a 4x6 image.

IMPORTANT: All cover content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

COVER LAYOUT — follow this exactly:
- TOP TITLE BANNER (top 12% of image): Large bold retro comic lettering: "${PERSON}'s TECH ADVENTURES" — full width, navy blue background, gold letters, thick black outline.
- SMALL TEXT below title: "Career Fair Edition · ${TEACHER}'s Class" — small but readable
- MAIN ART (center, fills most of the cover): A full-body dynamic illustration of the person from the reference photo as a superhero:
  - Colorful STEM-themed superhero costume (circuit board patterns, glowing blue tech lines)
  - Flying or leaping heroically with fist forward, big smile
  - Dramatic city skyline background with light beams and energy effects
- SPEECH BUBBLE: "Creativity + Code = SUPERPOWERS!" — large, readable comic speech bubble
- SKILL STRIP (just above the bottom 15% reserve, inside the art area): Three small comic-style banners: "💡 CREATIVE" · "⚙️ ANALYTICAL" · "🤝 COLLABORATIVE"
- Issue label (small, bottom right of art area): "ISSUE #1"
- ${BANNER_INSTRUCTION}

Style: Bold colors, thick black outlines, Ben-Day dot halftone texture, dynamic action lines. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'minecraft',
    prompt: `Create a Minecraft-themed collectible character card. Everything must be rendered in Minecraft's iconic blocky pixel-art style. Styled for printing as a 4x6 image.

IMPORTANT: All card content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

CARD LAYOUT — follow this exactly:
- TOP HEADER (dark stone-block texture, pixelated): The text "MINECRAFT" in the official Minecraft font (blocky, pixelated, green/white), and below it "CAREER FAIR EDITION" in smaller pixel text
- TEACHER LABEL (top right, small pixel font): "${TEACHER}"
- MAIN ART (center, large): A full-body Minecraft skin/character based on the person from the reference photo:
  - Classic blocky Minecraft character proportions
  - Wearing a white lab coat skin, holding a diamond pickaxe in one hand and a blocky laptop in the other
  - Standing on grass blocks with a blue Minecraft sky
  - Face/hair should match the reference photo as closely as possible in pixel style
- NAME TAG (floating above character): "${PERSON}" — white text on dark semi-transparent background, pixel font
- SKILLS PANEL (below character, dark stone UI panel, inside top 85%):
  - "💡 CREATIVITY: LEVEL 10" — large pixel text
  - "⚙ PROBLEM SOLVING: LEVEL 9" — large pixel text
  - "🤝 TEAMWORK: LEVEL 10" — large pixel text
- ${BANNER_INSTRUCTION}

Style: Pure Minecraft pixel-art aesthetic. Dark background. Glowing enchantment particle effects around the character. Keep all text LARGE and readable. DO NOT add any other text beyond what is listed above.`
  }
];

// Composite the real banner onto the generated image using sharp
async function compositeBanner(imageBuffer, aaLogoBuffer) {
  const meta = await sharp(imageBuffer).metadata();
  const W = meta.width;
  const H = meta.height;
  const BANNER_H = Math.round(H * 0.18); // 18% — matches BANNER_INSTRUCTION in prompts
  const Y = H - BANNER_H;
  const PAD = Math.round(W * 0.035);

  // Logo: left-aligned, 62% of banner height
  const logoH = Math.round(BANNER_H * 0.62);
  const aaResized = await sharp(aaLogoBuffer)
    .resize({ height: logoH, fit: 'contain', background: { r: 26, g: 59, b: 140, alpha: 0 } })
    .toBuffer();
  const aaResizedMeta = await sharp(aaResized).metadata();
  const logoW = aaResizedMeta.width;
  const logoX = PAD;
  const logoY = Y + Math.round((BANNER_H - logoH) / 2);

  // Text area: starts AFTER logo + gap — never overlaps
  const textLeft = logoX + logoW + PAD;
  const textAreaW = W - PAD - textLeft;
  const line1Y = Y + Math.round(BANNER_H * 0.35);
  const line2Y = Y + Math.round(BANNER_H * 0.72);

  // Auto-fit font: "STATESVILLE RD ELEMENTARY" must fit in textAreaW
  // SVG can't measureText, so estimate: bold Arial ~0.56px per px of font-size per char
  const chars = 'STATESVILLE RD ELEMENTARY'.length; // 25 chars
  const fontSize = Math.min(Math.round(BANNER_H * 0.30), Math.floor(textAreaW / (chars * 0.56)));
  const fontSize2 = Math.round(fontSize * 0.92);

  const svgText = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="${Y}" width="${W}" height="${BANNER_H}" fill="#1A3B8C"/>
    <rect x="0" y="${Y}" width="${W}" height="3" fill="#F5A800"/>
    <text x="${textLeft}" y="${line1Y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="start" dominant-baseline="middle">STATESVILLE RD ELEMENTARY</text>
    <text x="${textLeft}" y="${line2Y}" font-family="Arial, sans-serif" font-size="${fontSize2}" font-weight="bold" fill="#F5A800" text-anchor="start" dominant-baseline="middle">CAREER FAIR</text>
  </svg>`;

  const result = await sharp(imageBuffer)
    .composite([
      { input: Buffer.from(svgText), top: 0, left: 0 },
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
