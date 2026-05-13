// Generates demo cards shown in the homepage gallery.
// Usage: OPENAI_API_KEY=sk-... node generate-demos.js
//
// Reads:  images/demo-source.jpg        (reference photo of you)
//         images/2021-AAI-White.png     (AA logo)
//         images/corneliuselementary.png (school logo)
// Writes: images/demos/roblox.jpg, pokemon.jpg, pixar.jpg, funko-pop.jpg, minecraft.jpg, action-figure.jpg

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error('Error: OPENAI_API_KEY env var not set.'); process.exit(1); }

const PHOTO_PATH  = join(__dirname, 'images/demo-source.jpg');
const AA_PATH     = join(__dirname, 'images/2021-AAI-White.png');
const SCHOOL_PATH = join(__dirname, 'images/corneliuselementary.png');
const OUT_DIR     = join(__dirname, 'images/demos');
mkdirSync(OUT_DIR, { recursive: true });

const PERSON  = 'Micah';
const TEACHER = 'Ms. Smith';
// No banner instruction in prompts — banner is added BELOW the image by extending canvas.

const cards = [
  {
    id: 'roblox',
    prompt: `Create a Roblox Developer Profile Card. The entire image IS the card — portrait orientation, styled for printing as a 4x6 image.

CARD LAYOUT — follow this exactly:
- BACKGROUND: Dark navy/space gradient with floating Roblox-style UI elements and subtle grid lines, like the Roblox studio interface.
- TOP HEADER: The Roblox logo "ROBLOX" in the official bold red Roblox font. To the right: a badge reading "⭐ DEVELOPER EDITION". Below the logo: "CAREER FAIR SERIES" in small white text.
- AVATAR SHOWCASE (center, large, ~55% of card height): The person from the reference photo reimagined as a Roblox avatar — blocky rectangular head, classic Roblox body proportions, big expressive eyes, wearing a cool customized outfit (hoodie, sneakers, accessories). Fully in Roblox avatar style — NOT photorealistic. The avatar is in a dynamic pose, like jumping or giving a thumbs up. Background behind the avatar: a bright colorful Roblox game world scene.
- PLAYER NAME BANNER: "@${PERSON}" in bold white Roblox-style font with a dark translucent pill background.
- STATS PANEL (bottom ~28% of card, dark UI panel with Roblox-style rounded corners and icons):
  - "${TEACHER}'s Class" in small text at top
  - Four stat rows with icon, label, and filled bar:
    🧠  PROBLEM SOLVING    ████████░░  85
    💡  CREATIVITY         █████████░  92
    🤝  TEAMWORK           ████████░░  88
    🚀  INNOVATION         █████████░  95
  - Bars use bright Roblox green/teal gradient

Style: Authentic Roblox aesthetic — bold, colorful, UI-forward, game-feel. Looks like an official Roblox collectible card. DO NOT add any other text beyond what is listed above.`
  },
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
- LOWER CARD (skill section): Three skill rows in classic Pokemon card style. Each row has TWO lines — a bold name/score line followed by a smaller italic flavor description, exactly like a real Pokemon card attack description:
  Row 1 bold:   "💡 Creativity — 80"
  Row 1 italic: "Dreams up bold new ideas and turns imagination into reality."
  Row 2 bold:   "⚙️ Problem Solving — 90"
  Row 2 italic: "Breaks any challenge into steps and never gives up finding the answer."
  Row 3 bold:   "🤝 Collaboration — 85"
  Row 3 italic: "Makes every teammate better and builds something greater together."

Style: Bright, playful, collectible. Realistic card shadow like it's sitting on a table. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'action-figure',
    prompt: `Create a fun action figure toy packaging image, like a collectible you'd find at a toy store — a plastic blister pack (clear bubble) over a colorful cardboard backing. Styled for printing as a 4x6 image.

PACKAGING LAYOUT — follow this exactly:
- TOP HEADER (cardboard backing): The text "${PERSON} — FUTURE TECH HERO" in large bold comic/toy font. Use navy blue and gold colors.
- TOP LEFT CORNER: A circular yellow badge with the text "Career Fair Edition"
- TOP RIGHT CORNER: The text "${TEACHER}" in small font
- CENTER (inside the blister pack bubble): A 3D cartoon-style toy figure of the person from the reference photo:
  - Fully enclosed inside a clear plastic bubble/blister pack (visible plastic with light reflections)
  - Smiling and in a confident heroic pose, wearing a fun STEM-themed outfit
  - Accompanied by exactly 3 small accessories inside the bubble: a mini laptop, a small robot, and a backpack
- SKILL BADGES on the cardboard below the bubble:
  Three small colored badges reading: "💡 CREATIVE THINKER"  "⚙️ PROBLEM SOLVER"  "🚀 INNOVATOR"
- BACKGROUND (cardboard area around bubble): Bright comic-style sunburst rays in blue and gold

Style: Realistic toy packaging. The plastic bubble must look real — glossy, with reflections. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'pixar',
    prompt: `Create a Pixar animated movie poster. The entire image IS the poster — portrait orientation, styled for printing as a 4x6 image.

POSTER LAYOUT — follow this exactly:
- MOVIE TITLE (top of poster, large): "${PERSON} AND THE CODE QUEST" — in the style of a Pixar movie title: big, bold, playful lettering with a glow or shadow effect. Bright warm gold/orange colors.
- TAGLINE (small text below title): "One kid. Infinite ideas. The adventure starts now."
- MAIN CHARACTER ART (center, fills most of the poster): The person from the reference photo reimagined as a Pixar CGI animated character — smooth stylized skin, expressive oversized eyes, warm natural colors, the exact Pixar quality rendering. Match their face shape, hair, and glasses but fully in Pixar CGI style. The character is in a heroic adventure pose holding a glowing laptop or tablet like a magic artifact, looking excited and confident. Colorful cinematic background: a digital/tech world that looks magical — glowing circuits, floating code, bright light beams. Like a Pixar STEM adventure film.
- CREDITS STRIP (bottom of poster, small text): "${TEACHER}'s Class · Career Fair Edition"
- SKILL BADGES along the bottom above credits — four small round badge icons in Pixar style:
  💡 CREATIVE   🔧 BUILDER   🤝 TEAMMATE   🚀 INNOVATOR

Style: Authentic Pixar movie poster — cinematic, warm, emotionally engaging. Smooth CGI character rendering. Feels like a real Pixar film poster you'd see at a theater. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'funko-pop',
    prompt: `Create a Funko Pop vinyl figure in retail box packaging. The entire image IS the product — a real Funko Pop box as if photographed on a shelf. Styled for printing as a 4x6 image.

PACKAGING LAYOUT — follow this exactly:
- BOX SHAPE: Classic Funko Pop window box — black cardboard with a large clear plastic window on the front showing the figure inside. The box has the characteristic Funko Pop angled top-right corner cut.
- TOP OF BOX: "POP!" in the official Funko Pop logo style. Below it: "CAREER FAIR" as the series name. A small number badge in the top-right corner: "#1".
- FIGURE INSIDE THE WINDOW: A classic Funko Pop vinyl figure of the person from the reference photo. Funko Pop style means: oversized round head, tiny stylized body, large black oval eyes with no pupils, minimal facial features, simplified clothing. Match the person's hair, glasses, and general clothing style but fully in Funko Pop form. The figure holds a small laptop or tablet accessory.
- BOTTOM OF BOX NAMEPLATE: "${PERSON}" in bold white text on a colored band. Below it in smaller text: "${TEACHER}'s Class".
- SKILL STRIP below the nameplate (on the cardboard, outside the window): Three small horizontal badges in bright colors reading: "💡 CREATIVE THINKER" · "⚙️ PROBLEM SOLVER" · "🤝 COLLABORATOR"
- BOX SIDES: Subtle "Career Fair Edition" text and small star decorations in the Funko style.
- BACKGROUND inside the window: Simple gradient matching the box color.

Style: The box is sitting upright on a wooden collector's shelf, slightly angled for a natural look. Behind and around it: soft bokeh of other Funko Pop boxes, dim shelf lighting, maybe a subtle glow. Cinematic collector's room vibe — warm, moody, like a display cabinet photo. The box should be the clear hero of the shot, large in frame. The figure must unmistakably read as a Funko Pop — oversized head is essential. DO NOT add any other text beyond what is listed above.`
  },
  {
    id: 'minecraft',
    prompt: `Create a Minecraft-themed collectible character card. Everything must be rendered in Minecraft's iconic blocky pixel-art style. Styled for printing as a 4x6 image.

CARD LAYOUT — follow this exactly:
- TOP HEADER (dark stone-block texture, pixelated): The text "MINECRAFT" in the official Minecraft font (blocky, pixelated, green/white), and below it "CAREER FAIR EDITION" in smaller pixel text
- TEACHER LABEL (top right, small pixel font): "${TEACHER}"
- MAIN ART (center, large): A full-body Minecraft skin/character based on the person from the reference photo:
  - Classic blocky Minecraft character proportions
  - Wearing a white lab coat skin, holding a diamond pickaxe in one hand and a blocky laptop in the other
  - Standing on grass blocks with a blue Minecraft sky
  - Face/hair should match the reference photo as closely as possible in pixel style
- NAME TAG (floating above character): "${PERSON}" — white text on dark semi-transparent background, pixel font
- SKILLS PANEL (bottom of card, dark stone UI panel):
  - "💡 CREATIVITY: LEVEL 10" — large pixel text
  - "⚙ PROBLEM SOLVING: LEVEL 9" — large pixel text
  - "🤝 TEAMWORK: LEVEL 10" — large pixel text

Style: Pure Minecraft pixel-art aesthetic. Dark background. Glowing enchantment particle effects around the character. Keep all text LARGE and readable. DO NOT add any other text beyond what is listed above.`
  }
];

// Extends the image DOWNWARD and draws the sponsor banner in the new space.
// Layout: [AA logo left] [CORNELIUS / ELEMENTARY / CAREER FAIR centered] [school logo right]
// The AI image is completely untouched — no content ever gets cut off.
async function compositeBanner(imageBuffer, aaLogoBuffer, schoolLogoBuffer) {
  const meta = await sharp(imageBuffer).metadata();
  const W = meta.width;
  const H = meta.height;
  const BANNER_H   = Math.round(H * 0.18);
  const PAD        = Math.round(W * 0.03);
  const LOGO_MAX_W = Math.round(W * 0.195);
  const LOGO_MAX_H = Math.round(BANNER_H * 0.82);

  const aaResized = await sharp(aaLogoBuffer)
    .resize({ width: LOGO_MAX_W, height: LOGO_MAX_H, fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const aaMeta = await sharp(aaResized).metadata();
  const AA_W = aaMeta.width;
  const AA_H = aaMeta.height;

  const schoolResized = await sharp(schoolLogoBuffer)
    .resize({ width: LOGO_MAX_W, height: LOGO_MAX_H, fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const schoolMeta = await sharp(schoolResized).metadata();
  const SCHOOL_W = schoolMeta.width;
  const SCHOOL_H = schoolMeta.height;

  const aaX     = PAD;
  const aaY     = Math.round((BANNER_H - AA_H)     / 2);
  const schoolX = W - PAD - SCHOOL_W;
  const schoolY = Math.round((BANNER_H - SCHOOL_H) / 2);

  const textLeft  = aaX + AA_W + PAD;
  const textRight = schoolX - PAD;
  const textCX    = Math.round((textLeft + textRight) / 2);
  const textAreaW = textRight - textLeft;

  function fitFontSize(text, maxFs) {
    let fs = maxFs;
    while (fs > 10 && text.length * fs * 0.54 > textAreaW) fs--;
    return fs;
  }
  const fs1 = fitFontSize('CORNELIUS',  Math.round(BANNER_H * 0.26));
  const fs2 = fitFontSize('ELEMENTARY', Math.round(BANNER_H * 0.22));
  const fs3 = Math.round(BANNER_H * 0.19);

  const line1Y = Math.round(BANNER_H * 0.25);
  const line2Y = Math.round(BANNER_H * 0.52);
  const line3Y = Math.round(BANNER_H * 0.80);

  const bannerSvg = `<svg width="${W}" height="${BANNER_H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${W}" height="${BANNER_H}" fill="#1A3B8C"/>
    <rect x="0" y="0" width="${W}" height="4" fill="#F5A800"/>
    <text x="${textCX}" y="${line1Y}" font-family="Arial, sans-serif" font-size="${fs1}" font-weight="800" fill="white" text-anchor="middle" dominant-baseline="middle">CORNELIUS</text>
    <text x="${textCX}" y="${line2Y}" font-family="Arial, sans-serif" font-size="${fs2}" font-weight="800" fill="white" text-anchor="middle" dominant-baseline="middle">ELEMENTARY</text>
    <text x="${textCX}" y="${line3Y}" font-family="Arial, sans-serif" font-size="${fs3}" font-weight="700" fill="#F5A800" text-anchor="middle" dominant-baseline="middle">CAREER FAIR</text>
  </svg>`;

  const bannerBuffer = await sharp(Buffer.from(bannerSvg)).png().toBuffer();

  const composited = await sharp(imageBuffer)
    .extend({ bottom: BANNER_H, background: { r: 26, g: 59, b: 140, alpha: 255 } })
    .composite([
      { input: bannerBuffer,  top: H,            left: 0       },
      { input: aaResized,     top: H + aaY,      left: aaX     },
      { input: schoolResized, top: H + schoolY,  left: schoolX },
    ])
    .toBuffer();

  const PRINT_W = 1200;
  const PRINT_H = 1800;
  const cMeta   = await sharp(composited).metadata();
  const scale   = Math.min(PRINT_W / cMeta.width, PRINT_H / cMeta.height);
  const scaledW = Math.round(cMeta.width  * scale);
  const scaledH = Math.round(cMeta.height * scale);
  const offsetX = Math.round((PRINT_W - scaledW) / 2);
  const offsetY = Math.round((PRINT_H - scaledH) / 2);

  const scaledCard = await sharp(composited).resize(scaledW, scaledH).toBuffer();

  const navyBg = await sharp({
    create: { width: PRINT_W, height: PRINT_H, channels: 3, background: { r: 26, g: 59, b: 140 } }
  }).png().toBuffer();

  return sharp(navyBg)
    .composite([{ input: scaledCard, top: offsetY, left: offsetX }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function generateCard(card, photoBuffer, aaBuffer, schoolBuffer) {
  console.log(`\nGenerating ${card.id}...`);

  const form = new FormData();
  form.append('image[]', new Blob([photoBuffer], { type: 'image/jpeg' }), 'photo.jpg');
  form.append('image[]', new Blob([aaBuffer],    { type: 'image/png'  }), 'aa-logo.png');
  form.append('prompt',        card.prompt);
  form.append('model',         'gpt-image-1');
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

  console.log(`  Compositing banner...`);
  const finalBuffer = await compositeBanner(Buffer.from(b64, 'base64'), aaBuffer, schoolBuffer);

  const outPath = join(OUT_DIR, `${card.id}.jpg`);
  writeFileSync(outPath, finalBuffer);
  console.log(`  Saved → ${outPath}`);
}

async function main() {
  const photoBuffer  = readFileSync(PHOTO_PATH);
  const aaBuffer     = readFileSync(AA_PATH);
  const schoolBuffer = readFileSync(SCHOOL_PATH);

  for (const card of cards) {
    await generateCard(card, photoBuffer, aaBuffer, schoolBuffer);
  }
  console.log('\nAll demo cards generated!');
}

main().catch(err => { console.error(err); process.exit(1); });
