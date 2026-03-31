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
    document.getElementById('camera-frame').hidden = true;
    document.getElementById('camera-actions').hidden = true;
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
  const flash = document.getElementById('flash-overlay');
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
      flash.hidden = false;
      flash.style.opacity = '1';
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => { flash.hidden = true; takePhoto(); }, 350);
      }, 100);
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
      document.getElementById('camera-frame').hidden = true;
      document.getElementById('camera-actions').hidden = true;
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
  const BANNER_INSTRUCTION = `BOTTOM BANNER AREA (bottom 10% of the image): Leave this as a solid flat navy blue (#1A3B8C) rectangle with NO text, NO logos, and NO decorations. It must be completely empty — we will add the sponsor logos and school name in post-production.`;

  if (cardType === 'trading-card') {
    return `Create a fun, ultra-rare Pokemon-style trading card. The image must look like a real physical trading card, perfectly centered, styled for printing as a 4x6 image.

CARD LAYOUT — follow this exactly:
- GOLD/YELLOW outer border (thick, like a real Pokemon card)
- TOP LEFT: The text "${teacherName}" in small font
- TOP LEFT below that: The text "${personName}" in large bold font
- TOP RIGHT: "300 HP" in large bold Pokemon-style font
- TOP RIGHT below that: A gold star badge reading "Ultra Rare"
- CENTER (main art area): An anime/manga-style illustration of the person from the reference photo. Make them look like a friendly anime kid character, smiling. Bright colorful background with sparkles and energy bursts.
- LOWER CARD (attribute section): Three ability rows in classic Pokemon card style, each on its own line:
  Row 1: "⚡ Creativity — 80"
  Row 2: "🧠 Problem Solving — 90"
  Row 3: "🤝 Teamwork — 70"
  Use LARGE, clearly readable text for each row. Simple layout, no clutter.
- ${BANNER_INSTRUCTION}

Style: Bright, playful, collectible. Realistic card shadow like it's sitting on a table. DO NOT add any other text beyond what is listed above.`;
  }

  if (cardType === 'action-figure') {
    return `Create a fun action figure toy packaging image, like a collectible you'd find at a toy store — a plastic blister pack (clear bubble) over a colorful cardboard backing. Styled for printing as a 4x6 image.

PACKAGING LAYOUT — follow this exactly:
- TOP HEADER (cardboard backing, top): The text "${personName} — FUTURE TECH HERO" in large bold comic/toy font. Use navy blue and gold colors.
- TOP LEFT CORNER: A circular yellow badge with the text "Career Fair Edition"
- TOP RIGHT CORNER: The text "${teacherName}" in small font
- CENTER: A 3D cartoon-style toy figure of the person from the reference photo. The figure must be:
  - Fully enclosed inside a clear plastic bubble/blister pack (visible plastic with light reflections)
  - Smiling and in a confident heroic pose
  - Wearing a fun STEM-themed outfit
  - Accompanied by exactly 3 small accessories inside the bubble: a mini laptop, a small robot, and a backpack
  - NO part of the figure or accessories breaks outside the bubble
- BACKGROUND (cardboard area around bubble): Bright comic-style sunburst rays in blue and gold
- ${BANNER_INSTRUCTION}

Style: Realistic toy packaging. The plastic bubble must look real — glossy, with reflections. DO NOT add any other text beyond what is listed above.`;
  }

  if (cardType === 'superhero-comic') {
    return `Create a superhero comic book cover. It must look like a real printed comic book cover, styled for printing as a 4x6 image.

COVER LAYOUT — follow this exactly:
- TOP TITLE BANNER: Large bold retro comic lettering: "${personName}'s TECH ADVENTURES" — make this text LARGE and take up the full width, like a real comic title. Use navy blue background with gold letters and thick black outline.
- SMALL TEXT below title: "Career Fair Edition · ${teacherName}'s Class" — small but readable
- MAIN ART (center, majority of the cover): A full-body dynamic illustration of the person from the reference photo as a superhero. They should:
  - Have a colorful STEM-themed superhero costume (circuit board patterns, glowing blue tech lines)
  - Be flying or leaping heroically with fist forward, smiling
  - Be in front of a dramatic city skyline with light beams and energy effects
- ONE SPEECH BUBBLE in the art: "With CODE comes POWER!" — large, readable comic speech bubble
- Issue label (small, bottom right of art area): "ISSUE #1"
- ${BANNER_INSTRUCTION}

Style: Bold colors, thick black outlines, Ben-Day dot halftone texture, dynamic action lines. DO NOT add any other text beyond what is listed above.`;
  }

  if (cardType === 'minecraft-card') {
    return `Create a Minecraft-themed collectible character card. Everything must be rendered in Minecraft's iconic blocky pixel-art style. Styled for printing as a 4x6 image.

CARD LAYOUT — follow this exactly:
- TOP HEADER: A dark stone-block banner (pixelated texture) with the text "MINECRAFT" in the official Minecraft font (blocky, pixelated, green/white), and below it "CAREER FAIR EDITION" in smaller pixel text
- TEACHER LABEL (top right, small pixel font): "${teacherName}"
- MAIN ART (center, large): A full-body Minecraft skin/character based on the person from the reference photo:
  - Classic blocky Minecraft character proportions
  - Wearing a white lab coat skin over their outfit, holding a diamond pickaxe in one hand and a blocky laptop in the other
  - Standing on grass blocks with a blue Minecraft sky behind them
  - The character's face/hair should match the reference photo as closely as possible in pixel style
- NAME TAG (floating above character, like in Minecraft): "${personName}" — white text on dark semi-transparent background, pixel font
- STATS PANEL (below character, dark stone UI panel):
  - "❤ HEALTH: 10/10" on one line (large pixel text)
  - "XP: CAREER FAIR CHAMPION" on one line (large pixel text)
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
      const BANNER_H = Math.round(H * 0.10); // 10% from bottom
      const Y = H - BANNER_H;

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Ensure banner area is solid navy (in case AI bled over)
      ctx.fillStyle = '#1A3B8C';
      ctx.fillRect(0, Y, W, BANNER_H);

      // Separator line in gold
      ctx.fillStyle = '#F5A800';
      ctx.fillRect(0, Y, W, 3);

      // Load AA logo and draw it
      const aaLogo = new Image();
      aaLogo.onload = () => {
        const logoH = BANNER_H * 0.65;
        const logoW = aaLogo.width * (logoH / aaLogo.height);
        const logoX = W * 0.04;
        const logoY = Y + (BANNER_H - logoH) / 2;
        ctx.drawImage(aaLogo, logoX, logoY, logoW, logoH);

        // School name text on the right side
        const fontSize = Math.round(BANNER_H * 0.28);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const textX = W - W * 0.04;
        const line1Y = Y + BANNER_H * 0.33;
        const line2Y = Y + BANNER_H * 0.68;
        ctx.fillText('STATESVILLE RD ELEMENTARY', textX, line1Y);
        ctx.fillStyle = '#F5A800';
        ctx.fillText('CAREER FAIR', textX, line2Y);

        resolve(canvas.toDataURL('image/png'));
      };
      aaLogo.onerror = () => {
        // If logo fails to load, still resolve without it
        const fontSize = Math.round(BANNER_H * 0.28);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AUTOMATION ANYWHERE  ·  STATESVILLE RD ELEMENTARY CAREER FAIR', W / 2, Y + BANNER_H / 2);
        resolve(canvas.toDataURL('image/png'));
      };
      aaLogo.src = 'images/AAI standard.png';
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

function startProgressMessages() {
  const el = document.querySelector('.progress-message');
  let i = 0;
  if (el) el.textContent = progressMessages[0];
  progressInterval = setInterval(() => {
    i = (i + 1) % progressMessages.length;
    if (el) el.textContent = progressMessages[i];
  }, 3000);
}

function stopProgressMessages() {
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
  const personName = document.getElementById('personName').value.trim();
  const teacherName = document.getElementById('teacherName').value.trim();
  const filename = `${personName}_${teacherName}_${Date.now()}`;

  goToStep(3);
  document.getElementById('loading-state').hidden = false;
  document.getElementById('result-state').hidden = true;
  document.getElementById('error-state').hidden = true;
  startProgressMessages();
  stopCamera();

  try {
    const photoBase64 = photoDataUrl.replace(/^data:image\/(jpeg|png|webp);base64,/, '');

    const aaResp = await fetch('images/AAI standard.png');
    if (!aaResp.ok) throw new Error('Could not load AA logo');
    const aaLogoBase64 = await blobToBase64(await aaResp.blob());

    const prompt = buildPrompt(selectedCardType, personName, teacherName);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoBase64, aaLogoBase64, prompt, size: '1024x1536' })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    stopProgressMessages();

    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error('No image returned from API');

    // Composite real banner on top of AI result
    const finalImgSrc = await compositeBanner(b64);

    document.getElementById('result-image').src = finalImgSrc;
    document.getElementById('loading-state').hidden = true;
    document.getElementById('result-state').hidden = false;

    // Auto-download
    const a = document.createElement('a');
    a.href = finalImgSrc;
    a.download = `${filename}.png`;
    a.click();

  } catch (err) {
    console.error('Generation error:', err);
    stopProgressMessages();
    document.getElementById('loading-state').hidden = true;
    document.getElementById('error-state').hidden = false;
    document.getElementById('error-text').textContent = `😞 ${err.message || 'Something went wrong. Please try again.'}`;
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
  document.getElementById('camera-frame').hidden = false;
  document.getElementById('camera-actions').hidden = false;
  document.getElementById('preview-actions').hidden = true;
  if (!videoStream) initCamera();
});

document.getElementById('next-btn-1').addEventListener('click', () => goToStep(2));

document.getElementById('back-btn-2').addEventListener('click', () => {
  goToStep(1);
  if (photoDataUrl) {
    document.getElementById('camera-frame').hidden = true;
    document.getElementById('camera-actions').hidden = true;
    document.getElementById('preview-actions').hidden = false;
    document.getElementById('preview-img').src = photoDataUrl;
  } else {
    document.getElementById('camera-frame').hidden = false;
    document.getElementById('camera-actions').hidden = false;
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

  document.getElementById('camera-frame').hidden = false;
  document.getElementById('camera-actions').hidden = false;
  document.getElementById('preview-actions').hidden = true;
  document.getElementById('no-camera-msg').hidden = true;

  goToStep(1);
  initCamera();
});

document.getElementById('retry-btn').addEventListener('click', () => {
  goToStep(2);
});

