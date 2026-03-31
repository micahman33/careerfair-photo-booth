// Run once to generate demo cards shown on the homepage.
// Usage: OPENAI_API_KEY=sk-... node generate-demos.js
//
// Reads:  images/demo-source.jpg  (the reference photo)
// Writes: images/demos/pokemon.png, action-figure.png, superhero.png, sports.png, minecraft.png

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error('Error: OPENAI_API_KEY env var not set.'); process.exit(1); }

const PHOTO_PATH  = join(__dirname, 'images/demo-source.jpg');
const AA_PATH     = join(__dirname, 'images/AAI standard.png');
const OUTPUT_DIR  = join(__dirname, 'images/demos');

mkdirSync(OUTPUT_DIR, { recursive: true });

const PERSON  = 'Micah';
const TEACHER = 'Ms. Smith';

const cards = [
  {
    id: 'pokemon',
    prompt: `Create a fun, ultra-rare trading card styled exactly like a real Pokemon card laying on a table. The image must look like a real, physical trading card, perfectly centered and styled for printing as a 4x6 image.

Card Layout (from top to bottom):
1. TOP LEFT: Teacher's name ("${TEACHER}") as a subtitle, in a smaller font.
2. TOP LEFT, just below: Kid's name ("${PERSON}") in a larger, bold font.
3. TOP RIGHT: "300HP" in a bold, Pokemon-style font.
4. TOP RIGHT, just below: "Ultra Rare" badge.
5. CENTER: Anime-style portrait of the person, inspired by the reference photo but always in anime/pokemon style, smiling and friendly.
6. BOTTOM HALF: Three key attributes for becoming a software developer/IT professional:
   - "Creativity: Thinks of new ideas (80)", "Problem Solving: Finds solutions (90)", "Teamwork: Works well with others (70)"
7. BOTTOM BANNER: Left: Automation Anywhere logo. Right: "STATESVILLE RD ELEMENTARY CAREER FAIR" in all caps. Navy blue banner with gold text.

Requirements: Gold border, realistic shadow, playful colorful background with sparkles. Fun, empowering, collectible style. MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`
  },
  {
    id: 'action-figure',
    prompt: `Create a fun, empowering action figure packaging image for a person in the style of a collectible toy on a toy store shelf. Real blister-pack toy (plastic bubble over cardboard backing), perfectly centered for printing as a 4x6 image.

Packaging Layout:
1. TOP HEADER: "${PERSON} Future Tech Hero" in a fun comic/toy-style font.
2. BADGES: "Career Fair Edition" left. "${TEACHER}" top right corner.
3. MAIN IMAGE: 3D cartoon-style action figure of the person from the reference photo. Smiling, posed heroically. THE ENTIRE figure and ALL accessories FULLY INSIDE a clear visible plastic blister pack bubble. Realistic light reflections on bubble. NO parts breaking through the bubble. Futuristic STEM-themed outfit.
4. ACCESSORIES (inside bubble): mini laptop, robot assistant, kids backpack. Exactly 3.
5. BACKGROUND: Bright colorful comic-style rays, sparkles, blues/golds/purples.
6. BOTTOM: "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR". AA logo lower left. "Ages 6+ | Future Innovator Series" lower right.
MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`
  },
  {
    id: 'superhero',
    prompt: `Create a vibrant superhero comic book cover featuring the person from the reference photo as the star superhero. Printed comic book cover style, sized for printing as a 4x6 image.

Layout:
1. TOP BANNER: "${PERSON}'s TECH ADVENTURES" in bold retro comic lettering. "Career Fair Edition" badge.
2. TEACHER CREDIT: "Starring ${TEACHER}'s Class" near the top.
3. MAIN ART: Dynamic full-body superhero illustration of the person. Marvel/DC cartoon style. Colorful STEM-themed costume (circuit board patterns, glowing tech accents). Heroic pose — flying or fist forward. Smiling confidently. City skyline or digital world background.
4. SPEECH BUBBLE: "With CODE comes POWER!"
5. BOTTOM: "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR". AA logo lower left. "Issue #1 | Future Tech Heroes Series" lower right.

Style: Bold colors, Ben-Day dot halftone textures, thick black outlines, action lines.
MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`
  },
  {
    id: 'sports',
    prompt: `Create a fun collectible sports trading card styled exactly like a real professional baseball/basketball rookie card. Sized for printing as a 4x6 image.

Layout:
1. TOP HEADER: "STATESVILLE RD ELEMENTARY ALL-STARS" in bold sports font.
2. TOP LEFT: "${TEACHER}'s Class" in small text.
3. MAIN IMAGE: Dynamic sports-photo-style portrait of the person from the reference photo. Wearing a navy blue and gold team jersey with "SRES" on it. Confident action pose. Stadium background with crowd blur.
4. NAMEPLATE: Chrome/foil-style nameplate. "${PERSON}" in large bold letters. "FUTURE TECH INNOVATOR" below.
5. STATS: "CREATIVITY: 99" | "PROBLEM SOLVING: 95" | "TEAMWORK: 98" | "ROOKIE YEAR: 2025-2026"
6. BOTTOM: "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR". AA logo lower left. "RC Rookie Card" badge lower right.

Style: Chrome and holographic foil effects, navy blue and gold colors, glossy premium card feel.
MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`
  },
  {
    id: 'minecraft',
    prompt: `Create a fun Minecraft-themed character card featuring the person from the reference photo as a pixelated Minecraft character. Sized for printing as a 4x6 image.

Layout:
1. TOP HEADER: "MINECRAFT CAREER FAIR EDITION" in classic Minecraft blocky pixel font on a dark stone-block banner.
2. TOP RIGHT: "${TEACHER}'s Class" in pixel text.
3. MAIN IMAGE: Full-body Minecraft pixel art character based on the person (matching hair color, skin tone, general features). STEM-themed Minecraft skin: lab coat or tech gear. Holding a diamond pickaxe AND a laptop. Standing in a blocky Minecraft world.
4. STATS (Minecraft UI style):
   - Name tag: "${PERSON}"
   - "HEALTH: ❤❤❤❤❤ 10/10"
   - "XP LEVEL: CAREER FAIR CHAMPION"
   - Skill bars: "CREATIVITY ████████ 8/10" | "CODING █████████ 9/10" | "TEAMWORK ████████ 8/10"
5. BOTTOM: "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR". Grass-block divider. AA logo lower left. "Limited Edition | Tech Crafter Series" lower right.

Style: Minecraft blocky pixel-art, dark background, green/grey stone UI panels, glowing enchantment effects.
MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`
  }
];

async function generate(card, photoBuffer, aaBuffer) {
  console.log(`Generating ${card.id}...`);

  const form = new FormData();
  form.append('image[]', new Blob([photoBuffer], { type: 'image/jpeg' }), 'photo.jpg');
  form.append('image[]', new Blob([aaBuffer],    { type: 'image/png'  }), 'aa-logo.png');
  form.append('prompt',        card.prompt);
  form.append('model',         'gpt-image-1');
  form.append('size',          '1024x1536');
  form.append('output_format', 'png');
  form.append('quality',       'medium');

  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: form
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`OpenAI error for ${card.id}: ${data.error?.message}`);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image data returned for ${card.id}`);

  const outPath = join(OUTPUT_DIR, `${card.id}.png`);
  writeFileSync(outPath, Buffer.from(b64, 'base64'));
  console.log(`  Saved → ${outPath}`);
}

async function main() {
  const photoBuffer = readFileSync(PHOTO_PATH);
  const aaBuffer    = readFileSync(AA_PATH);

  for (const card of cards) {
    await generate(card, photoBuffer, aaBuffer);
  }

  console.log('\nAll demo cards generated!');
}

main().catch(err => { console.error(err); process.exit(1); });
