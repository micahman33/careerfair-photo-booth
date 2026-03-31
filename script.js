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
function buildPrompt(cardType, personName, teacherName) {
  if (cardType === 'trading-card') {
    return `Create a fun, ultra-rare trading card styled exactly like a real Pokemon card laying on a table. The image must look like a real, physical trading card, perfectly centered and styled for printing as a 4x6 image. Use the following layout and elements:

Card Layout (from top to bottom):
1. TOP LEFT: Teacher's name ("${teacherName}") as a subtitle, in a smaller font.
2. TOP LEFT, just below: Kid's name ("${personName}") in a larger, bold font.
3. TOP RIGHT: "300HP" in a bold, Pokemon-style font.
4. TOP RIGHT, just below: "Ultra Rare" badge.
5. CENTER: Anime-style portrait of the kid, inspired by the reference photo but always looking like a kid in anime/pokemon style, smiling and friendly.
6. BOTTOM HALF: Three key attributes for becoming a software developer/IT professional:
   - Each attribute should have a name, short description, and power value (e.g., 80, 90, 70)
   - Example: "Creativity: Thinks of new ideas (80)", "Problem Solving: Finds solutions (90)", "Teamwork: Works well with others (70)"
7. BOTTOM BANNER (spanning the width of the card):
   - Left: The Automation Anywhere logo
   - Right: "STATESVILLE RD ELEMENTARY CAREER FAIR" in all caps
   - The banner should be navy blue with gold text

Additional Requirements:
- The card must have a yellow/gold border and a realistic shadow, looking like it is laying on a table
- The background should be playful and colorful, with sparkles or energy effects
- The overall style should be fun, empowering, and collectible, just like a real Pokemon card
- IMPORTANT: MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`;
  }

  if (cardType === 'action-figure') {
    return `Create a fun, empowering action figure packaging image for a child in the style of a collectible toy you'd find on a toy store shelf. The image must look like a real blister-pack toy (plastic bubble over cardboard backing), perfectly centered and styled for printing as a 4x6 image.

Packaging Layout:
1. TOP HEADER: Bold title in a fun comic or toy-style font: "${personName} Future Tech Hero"
2. TOP CORNER BADGE: "Career Fair Edition" on the left. Teacher's name ("${teacherName}") in the top right corner.
3. MAIN IMAGE (CENTER): A 3D cartoon-style action figure based on the child in the reference photo:
   - Stylized and age-appropriate, like a superhero/toy character
   - Smiling and posed heroically
   - THE ENTIRE figure and ALL accessories must appear FULLY INSIDE a clear, highly visible plastic blister pack bubble. The plastic bubble must be clearly visible with realistic light reflections. NO part of the character or accessories should break through the bubble.
   - Wearing a futuristic or STEM-themed outfit

4. ACCESSORIES (VISIBLE IN PACKAGING):
   - EXACTLY 3 fun toy accessories: mini laptop, robot assistant, kids backpack

5. BACKGROUND: Bright, colorful, playful with comic-style rays, sparkles, or digital patterns. Blues, golds, and purples.

6. BOTTOM TEXT:
   - "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR"
   - Automation Anywhere logo on the lower left
   - "Ages 6+ | Future Innovator Series" on the lower right
   - IMPORTANT: MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`;
  }

  if (cardType === 'superhero-comic') {
    return `Create a vibrant superhero comic book cover featuring the child from the reference photo as the star superhero. The image must look like a real, printed comic book cover, perfectly sized for printing as a 4x6 image.

Comic Cover Layout:
1. TOP BANNER: Classic comic book title banner: "${personName}'s TECH ADVENTURES" in bold retro comic lettering. Small badge: "Career Fair Edition"
2. TEACHER CREDIT: Small text near the top: "Starring ${teacherName}'s Class"
3. MAIN ARTWORK: A dynamic full-body illustration of the child as a superhero:
   - Marvel/DC-style cartoon superhero
   - Colorful STEM-themed costume (circuit board patterns, glowing tech accents)
   - Heroic pose — flying, fist forward, or cape billowing
   - Smiling confidently
   - City skyline or digital world background with bright energy effects
4. SPEECH BUBBLE: Classic comic speech bubble: "With CODE comes POWER!"
5. BOTTOM BANNER: "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR"
   - Automation Anywhere logo lower left
   - "Issue #1 | Future Tech Heroes Series" lower right

Style: Bold saturated colors, Ben-Day dot halftone textures, thick black outlines, dynamic action lines.
- IMPORTANT: MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`;
  }

  if (cardType === 'sports-card') {
    return `Create a fun, collectible sports trading card styled exactly like a real professional baseball or basketball rookie card. Perfectly sized for printing as a 4x6 image.

Card Layout:
1. TOP HEADER: Team banner: "STATESVILLE RD ELEMENTARY ALL-STARS" in bold sports font
2. TOP LEFT: "${teacherName}'s Class" in small text
3. MAIN IMAGE (CENTER): A dynamic sports-photo-style portrait of the child from the reference photo:
   - Styled as a professional athlete card photo
   - Child wearing a colorful team jersey with "SRES" on it, navy blue and gold colors
   - Confident action-ready pose (throwing, dribbling, or running stance)
   - Stadium or gym background with crowd blur
4. NAMEPLATE: Large chrome/foil-style nameplate:
   - "${personName}" in large bold letters
   - Position: "FUTURE TECH INNOVATOR" below the name
5. STATS BOX:
   - "CREATIVITY: 99" | "PROBLEM SOLVING: 95" | "TEAMWORK: 98"
   - "ROOKIE YEAR: 2025-2026"
6. BOTTOM BANNER: "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR"
   - Automation Anywhere logo lower left
   - "RC Rookie Card" badge lower right

Style: Chrome and holographic foil effects, navy blue and gold team colors, glossy premium card feel.
- IMPORTANT: MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`;
  }

  if (cardType === 'minecraft-card') {
    return `Create a fun Minecraft-themed character card featuring the child from the reference photo as a pixelated Minecraft character. Perfectly sized for printing as a 4x6 image.

Card Layout:
1. TOP HEADER: "MINECRAFT CAREER FAIR EDITION" in classic Minecraft blocky pixel font on a dark stone-block banner
2. TOP RIGHT: "${teacherName}'s Class" in small pixel text
3. MAIN IMAGE (CENTER): A Minecraft-style pixel art character based on the child:
   - Full-body Minecraft skin styled to look like the child (matching hair color, skin tone, general features)
   - Wearing a STEM-themed Minecraft skin: lab coat or tech gear
   - Classic Minecraft stance, holding a diamond pickaxe AND a laptop
   - Standing in a Minecraft world: blocky landscape, trees, pixelated sky with Minecraft sun
4. PLAYER STATS (Minecraft game UI style):
   - Name tag floating above character: "${personName}"
   - "HEALTH: ❤❤❤❤❤ 10/10"
   - "XP LEVEL: CAREER FAIR CHAMPION"
   - Skill bars: "CREATIVITY ████████ 8/10", "CODING █████████ 9/10", "TEAMWORK ████████ 8/10"
5. BOTTOM BANNER: "Presented by Automation Anywhere & STATESVILLE RD ELEMENTARY CAREER FAIR"
   - Minecraft grass-block divider
   - Automation Anywhere logo lower left
   - "Limited Edition | Tech Crafter Series" lower right

Style: Minecraft's iconic blocky pixel-art style, dark background with green and grey stone-block UI panels, glowing enchantment effects.
- IMPORTANT: MAKE SURE THERE ARE NO SPELLING ERRORS IN ANY OF THE TEXT!`;
  }

  return '';
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
    // Strip data URL prefix from photo
    const photoBase64 = photoDataUrl.replace(/^data:image\/(jpeg|png|webp);base64,/, '');

    // Fetch AA logo and convert to base64
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

    const imgSrc = `data:image/png;base64,${b64}`;
    document.getElementById('result-image').src = imgSrc;
    document.getElementById('loading-state').hidden = true;
    document.getElementById('result-state').hidden = false;

    // Auto-download
    const a = document.createElement('a');
    a.href = imgSrc;
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
  // Restart camera if needed
  if (!videoStream) initCamera();
});

document.getElementById('next-btn-1').addEventListener('click', () => goToStep(2));
document.getElementById('back-btn-2').addEventListener('click', () => {
  goToStep(1);
  // Show camera or preview depending on whether photo exists
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

  // Reset step 1 to camera view
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
