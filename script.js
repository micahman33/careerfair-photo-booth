// ===== STATE =====
let photoDataUrl = null;
let selectedCardType = 'trading-card';
let videoStream = null;
let progressInterval = null;

// ===== CAMERA =====
async function initCamera() {
  const video = document.getElementById('video');
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }
    });
    video.srcObject = videoStream;
  } catch (err) {
    console.error('Camera error:', err);
    // Hide the whole camera row so no-camera-msg can fill the flex space
    document.getElementById('camera-row').hidden = true;
    document.getElementById('no-camera-msg').hidden = false;
  }
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }
}

function startCountdown() {
  const overlay = document.getElementById('countdown-overlay');
  const flash   = document.getElementById('flash-overlay');
  let count = 3;
  overlay.hidden = false;
  overlay.textContent = count;

  const tick = () => {
    count--;
    if (count > 0) {
      overlay.textContent = count;
      setTimeout(tick, 800);
    } else {
      overlay.hidden = true;
      // Full-page flash
      flash.hidden = false;
      flash.style.opacity = '1';
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => { flash.hidden = true; takePhoto(); }, 400);
      }, 80);
    }
  };
  setTimeout(tick, 800);
}

function takePhoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    const reader = new FileReader();
    reader.onloadend = () => {
      photoDataUrl = reader.result;
      document.getElementById('preview-img').src = photoDataUrl;
      document.getElementById('camera-row').hidden = true;
      document.getElementById('preview-actions').hidden = false;
    };
    reader.readAsDataURL(blob);
  }, 'image/jpeg', 0.85);
}

// ===== WIZARD NAVIGATION =====
function goToStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`step-${i}`).hidden = (i !== n);
    const prog = document.getElementById(`prog-${i}`);
    prog.classList.toggle('active', i === n);
    prog.classList.toggle('done', i < n);
  });
  document.getElementById('line-1-2').classList.toggle('done', n > 1);
  document.getElementById('line-2-3').classList.toggle('done', n > 2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== CARD TYPE SELECTION =====
document.getElementById('card-grid').addEventListener('click', e => {
  const opt = e.target.closest('.card-opt');
  if (!opt) return;
  document.querySelectorAll('.card-opt').forEach(o => o.classList.remove('selected'));
  opt.classList.add('selected');
  selectedCardType = opt.dataset.value;
});

// ===== GENERATE BUTTON ENABLE =====
function checkGenerateBtn() {
  const name = document.getElementById('personName').value.trim();
  const teacher = document.getElementById('teacherName').value.trim();
  document.getElementById('generate-btn').disabled = !(name && teacher);
}

// ===== PROMPT BUILDER =====
// KEY STRATEGY: We tell the AI to leave a solid navy rectangle at the very bottom.
// After generation we composite the real AA logo + school text onto that space in
// the browser using Canvas — so those elements are always pixel-perfect.

function buildPrompt(cardType, personName, teacherName) {
  // The banner is composited in code AFTER generation (real AA logo + school name).
  // We ask the AI to leave 15% of the image height as a plain navy rectangle at the very
  // bottom — this gives enough clearance so card content never gets covered.
  const BANNER_INSTRUCTION = `BOTTOM BANNER ZONE (the bottom 18% of the full image height): This entire strip must be a solid flat navy blue (#1A3B8C) rectangle with absolutely NO text, NO logos, NO artwork, and NO decorations of any kind. All card content (borders, art, stats, text) must be fully contained within the top 82% of the image. This zone will be replaced in post-production.`;

  if (cardType === 'trading-card') {
    return `Create a fun, ultra-rare Pokemon-style trading card. The image must look like a real physical trading card, perfectly centered, styled for printing as a 4x6 image.

IMPORTANT: All card content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

CARD LAYOUT — follow this exactly:
- GOLD/YELLOW outer border (thick, like a real Pokemon card)
- TOP LEFT: The text "${teacherName}" in small font
- TOP LEFT below that: The text "${personName}" in large bold font
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

Style: Bright, playful, collectible. Realistic card shadow like it's sitting on a table. DO NOT add any other text beyond what is listed above.`;
  }

  if (cardType === 'action-figure') {
    return `Create a fun action figure toy packaging image, like a collectible you'd find at a toy store — a plastic blister pack (clear bubble) over a colorful cardboard backing. Styled for printing as a 4x6 image.

IMPORTANT: All packaging content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

PACKAGING LAYOUT — follow this exactly:
- TOP HEADER (cardboard backing, top 15% of image): The text "${personName} — FUTURE TECH HERO" in large bold comic/toy font. Use navy blue and gold colors.
- TOP LEFT CORNER: A circular yellow badge with the text "Career Fair Edition"
- TOP RIGHT CORNER: The text "${teacherName}" in small font
- CENTER (inside the blister pack bubble): A 3D cartoon-style toy figure of the person from the reference photo:
  - Fully enclosed inside a clear plastic bubble/blister pack (visible plastic with light reflections)
  - Smiling and in a confident heroic pose, wearing a fun STEM-themed outfit
  - Accompanied by exactly 3 small accessories inside the bubble: a mini laptop, a small robot, and a backpack
- SKILL BADGES on the cardboard below the bubble (still inside the top 85%):
  Three small colored badges reading: "💡 CREATIVE THINKER"  "⚙️ PROBLEM SOLVER"  "🚀 INNOVATOR"
- BACKGROUND (cardboard area around bubble): Bright comic-style sunburst rays in blue and gold
- ${BANNER_INSTRUCTION}

Style: Realistic toy packaging. The plastic bubble must look real — glossy, with reflections. DO NOT add any other text beyond what is listed above.`;
  }

  if (cardType === 'superhero-comic') {
    return `Create a superhero comic book cover. It must look like a real printed comic book cover, styled for printing as a 4x6 image.

IMPORTANT: All cover content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

COVER LAYOUT — follow this exactly:
- TOP TITLE BANNER (top 12% of image): Large bold retro comic lettering: "${personName}'s TECH ADVENTURES" — full width, navy blue background, gold letters, thick black outline.
- SMALL TEXT below title: "Career Fair Edition · ${teacherName}'s Class" — small but readable
- MAIN ART (center, fills most of the cover): A full-body dynamic illustration of the person from the reference photo as a superhero:
  - Colorful STEM-themed superhero costume (circuit board patterns, glowing blue tech lines)
  - Flying or leaping heroically with fist forward, big smile
  - Dramatic city skyline background with light beams and energy effects
- SPEECH BUBBLE: "Creativity + Code = SUPERPOWERS!" — large, readable comic speech bubble
- SKILL STRIP (just above the bottom 15% reserve, inside the art area): Three small comic-style banners: "💡 CREATIVE" · "⚙️ ANALYTICAL" · "🤝 COLLABORATIVE"
- Issue label (small, bottom right of art area): "ISSUE #1"
- ${BANNER_INSTRUCTION}

Style: Bold colors, thick black outlines, Ben-Day dot halftone texture, dynamic action lines. DO NOT add any other text beyond what is listed above.`;
  }

  if (cardType === 'minecraft-card') {
    return `Create a Minecraft-themed collectible character card. Everything must be rendered in Minecraft's iconic blocky pixel-art style. Styled for printing as a 4x6 image.

IMPORTANT: All card content must fit within the TOP 82% of the image. The bottom 18% is reserved (see below).

CARD LAYOUT — follow this exactly:
- TOP HEADER (dark stone-block texture, pixelated): The text "MINECRAFT" in the official Minecraft font (blocky, pixelated, green/white), and below it "CAREER FAIR EDITION" in smaller pixel text
- TEACHER LABEL (top right, small pixel font): "${teacherName}"
- MAIN ART (center, large): A full-body Minecraft skin/character based on the person from the reference photo:
  - Classic blocky Minecraft character proportions
  - Wearing a white lab coat skin, holding a diamond pickaxe in one hand and a blocky laptop in the other
  - Standing on grass blocks with a blue Minecraft sky
  - Face/hair should match the reference photo as closely as possible in pixel style
- NAME TAG (floating above character): "${personName}" — white text on dark semi-transparent background, pixel font
- SKILLS PANEL (below character, dark stone UI panel, inside top 85%):
  - "💡 CREATIVITY: LEVEL 10" — large pixel text
  - "⚙ PROBLEM SOLVING: LEVEL 9" — large pixel text
  - "🤝 TEAMWORK: LEVEL 10" — large pixel text
- ${BANNER_INSTRUCTION}

Style: Pure Minecraft pixel-art aesthetic. Dark background. Glowing enchantment particle effects around the character. Keep all text LARGE and readable. DO NOT add any other text beyond what is listed above.`;
  }

  return '';
}

// ===== BANNER COMPOSITING =====
// Stamps the real AA logo + school name onto the blank navy bar the AI left.
async function compositeBanner(b64png) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = img.width;
      const H = img.height;
      const BANNER_H = Math.round(H * 0.18); // 18% — matches BANNER_INSTRUCTION in prompts
      const Y = H - BANNER_H;
      const PAD = Math.round(W * 0.035);

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Solid navy banner (covers anything the AI drew in the reserved zone)
      ctx.fillStyle = '#1A3B8C';
      ctx.fillRect(0, Y, W, BANNER_H);

      // Gold separator line
      ctx.fillStyle = '#F5A800';
      ctx.fillRect(0, Y, W, 3);

      const aaLogo = new Image();
      aaLogo.onload = () => {
        // Logo: left-aligned
        const logoH = Math.round(BANNER_H * 0.62);
        const logoW = Math.round(aaLogo.width * (logoH / aaLogo.height));
        const logoX = PAD;
        const logoY = Y + Math.round((BANNER_H - logoH) / 2);
        ctx.drawImage(aaLogo, logoX, logoY, logoW, logoH);

        // Text area: starts AFTER the logo + a gap — never overlaps
        const textLeft = logoX + logoW + PAD;
        const textRight = W - PAD;
        const textAreaW = textRight - textLeft;

        // Auto-shrink font until "STATESVILLE RD ELEMENTARY" fits in the text area
        let fontSize = Math.round(BANNER_H * 0.30);
        ctx.font = `800 ${fontSize}px "Segoe UI", Arial, sans-serif`;
        while (ctx.measureText('STATESVILLE RD ELEMENTARY').width > textAreaW && fontSize > 10) {
          fontSize--;
          ctx.font = `800 ${fontSize}px "Segoe UI", Arial, sans-serif`;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('STATESVILLE RD ELEMENTARY', textLeft, Y + BANNER_H * 0.35);

        const fontSize2 = Math.round(fontSize * 0.92);
        ctx.font = `800 ${fontSize2}px "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#F5A800';
        ctx.fillText('CAREER FAIR', textLeft, Y + BANNER_H * 0.72);

        resolve(canvas.toDataURL('image/png'));
      };
      aaLogo.onerror = () => {
        // Fallback: centered text if logo fails to load
        const fontSize = Math.round(BANNER_H * 0.24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AUTOMATION ANYWHERE  ·  STATESVILLE RD ELEMENTARY CAREER FAIR', W / 2, Y + BANNER_H / 2);
        resolve(canvas.toDataURL('image/png'));
      };
      aaLogo.src = 'images/2021-AAI-White.png';
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${b64png}`;
  });
}

// ===== PROGRESS MESSAGES =====
const progressMessages = [
  'Feeding the hamster...',
  'Analyzing your picture...',
  "Changing the hamster's water...",
  'Building your image...',
  'Reading your super powers...',
  'Almost done...',
  'Just a few more seconds...',
  'Thanks for your patience...',
  'Hamster is running extra fast!'
];

function showLoadingOverlay() {
  document.getElementById('loading-overlay').hidden = false;
  const el = document.querySelector('#loading-overlay .progress-message');
  let i = 0;
  if (el) el.textContent = progressMessages[0];
  progressInterval = setInterval(() => {
    i = (i + 1) % progressMessages.length;
    if (el) el.textContent = progressMessages[i];
  }, 3000);
}

function hideLoadingOverlay() {
  document.getElementById('loading-overlay').hidden = true;
  if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
}

// ===== HELPERS =====
function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.replace(/^data:[^;]+;base64,/, ''));
    reader.readAsDataURL(blob);
  });
}

// ===== GENERATE =====
async function generateCard() {
  const personName  = document.getElementById('personName').value.trim();
  const teacherName = document.getElementById('teacherName').value.trim();
  const filename    = `${personName}_${teacherName}_${Date.now()}`;

  // Reset result/error from any previous run before showing overlay
  document.getElementById('result-image').src = '';
  document.getElementById('result-state').hidden = true;
  document.getElementById('error-state').hidden = true;

  showLoadingOverlay();
  stopCamera();

  try {
    const photoBase64 = photoDataUrl.replace(/^data:image\/(jpeg|png|webp);base64,/, '');

    const aaResp = await fetch('images/2021-AAI-White.png');
    if (!aaResp.ok) throw new Error('Could not load AA logo');
    const aaLogoBase64 = await blobToBase64(await aaResp.blob());

    const prompt = buildPrompt(selectedCardType, personName, teacherName);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoBase64, aaLogoBase64, prompt, size: '1024x1536' })
    });

    // Guard against non-JSON responses (e.g. HTML error pages from proxy/CDN)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const raw = await response.text();
      throw new Error(`Unexpected server response (${response.status}): ${raw.slice(0, 120)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error('No image returned from API');

    // Composite real banner on top of AI result
    const finalImgSrc = await compositeBanner(b64);

    hideLoadingOverlay();
    goToStep(3);
    document.getElementById('result-image').src = finalImgSrc;
    document.getElementById('result-state').hidden = false;

    // Auto-download
    const a = document.createElement('a');
    a.href = finalImgSrc;
    a.download = `${filename}.png`;
    a.click();

  } catch (err) {
    console.error('Generation error:', err);
    hideLoadingOverlay();
    // Make sure result-state is hidden (belt-and-suspenders)
    document.getElementById('result-state').hidden = true;
    document.getElementById('result-image').src = '';
    // Show error on step 3
    goToStep(3);
    document.getElementById('error-text').textContent =
      err.message || 'Something went wrong. Please try again.';
    document.getElementById('error-state').hidden = false;
  }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  initCamera();
  goToStep(1);
});

document.getElementById('capture-btn').addEventListener('click', startCountdown);

document.getElementById('retake-btn').addEventListener('click', () => {
  photoDataUrl = null;
  document.getElementById('preview-img').src = '';
  document.getElementById('camera-row').hidden = false;
  document.getElementById('preview-actions').hidden = true;
  if (!videoStream) initCamera();
});

document.getElementById('next-btn-1').addEventListener('click', () => goToStep(2));

document.getElementById('back-btn-2').addEventListener('click', () => {
  goToStep(1);
  if (photoDataUrl) {
    document.getElementById('camera-row').hidden = true;
    document.getElementById('preview-actions').hidden = false;
    document.getElementById('preview-img').src = photoDataUrl;
  } else {
    document.getElementById('camera-row').hidden = false;
    document.getElementById('preview-actions').hidden = true;
    if (!videoStream) initCamera();
  }
});

document.getElementById('personName').addEventListener('input', checkGenerateBtn);
document.getElementById('teacherName').addEventListener('input', checkGenerateBtn);
document.getElementById('generate-btn').addEventListener('click', generateCard);

document.getElementById('start-over-btn').addEventListener('click', () => {
  photoDataUrl = null;
  document.getElementById('personName').value = '';
  document.getElementById('teacherName').value = '';
  document.getElementById('preview-img').src = '';
  document.querySelectorAll('.card-opt').forEach(o => o.classList.remove('selected'));
  document.querySelector('.card-opt[data-value="trading-card"]').classList.add('selected');
  selectedCardType = 'trading-card';
  checkGenerateBtn();

  document.getElementById('camera-row').hidden = false;
  document.getElementById('preview-actions').hidden = true;
  document.getElementById('no-camera-msg').hidden = true;

  goToStep(1);
  initCamera();
});

document.getElementById('retry-btn').addEventListener('click', () => {
  goToStep(2);
});

