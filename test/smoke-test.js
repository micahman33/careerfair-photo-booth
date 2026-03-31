#!/usr/bin/env node
/**
 * Smoke test suite for the Career Fair Photo Booth.
 *
 * Usage:
 *   node test/smoke-test.js                           # Quick (no API calls)
 *   node test/smoke-test.js https://your.vercel.app  # Quick against deployed URL
 *   node test/smoke-test.js --full                   # Calls OpenAI (costs ~$0.04, ~30s)
 *   node test/smoke-test.js https://your.vercel.app --full
 *
 * Exit code 0 = all tests passed. Non-zero = one or more failed.
 */

const BASE_URL = process.argv.find(a => a.startsWith('http')) || 'http://localhost:3000';
const FULL     = process.argv.includes('--full');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌  ${name}`);
    console.error(`       → ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/** 1×1 transparent PNG — smallest valid image for testing */
const TINY_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function main() {
  console.log(`\n🔬  Career Fair Photo Booth — Smoke Tests`);
  console.log(`    Target: ${BASE_URL}`);
  console.log(`    Mode:   ${FULL ? 'full (includes OpenAI call)' : 'quick (API structure only)'}\n`);

  // ── Static asset checks ──────────────────────────────────────────────────
  console.log('📄  Static assets');

  await test('index.html is reachable', async () => {
    const r = await fetch(`${BASE_URL}/`);
    assert(r.ok, `HTTP ${r.status}`);
    const html = await r.text();
    assert(html.includes('Career Day AI Photo Booth'), 'Page title not found in HTML');
  });

  await test('styles.css is reachable', async () => {
    const r = await fetch(`${BASE_URL}/styles.css`);
    assert(r.ok, `HTTP ${r.status}`);
  });

  await test('script.js is reachable', async () => {
    const r = await fetch(`${BASE_URL}/script.js`);
    assert(r.ok, `HTTP ${r.status}`);
  });

  await test('AA logo image is reachable', async () => {
    const r = await fetch(`${BASE_URL}/images/AAI%20standard.png`);
    assert(r.ok, `HTTP ${r.status} — did you commit images/AAI standard.png?`);
  });

  await test('Statesville Rd logo is reachable', async () => {
    const r = await fetch(`${BASE_URL}/images/statesvilleroad.png`);
    assert(r.ok, `HTTP ${r.status} — did you commit images/statesvilleroad.png?`);
  });

  for (const card of ['pokemon', 'action-figure', 'superhero', 'minecraft']) {
    await test(`Demo card image: ${card}.png is reachable`, async () => {
      const r = await fetch(`${BASE_URL}/images/demos/${card}.png`);
      assert(r.ok, `HTTP ${r.status} — run generate-demos.js to create demo images`);
    });
  }

  // ── API: method validation ────────────────────────────────────────────────
  console.log('\n🔌  API /api/generate — method & validation');

  await test('GET /api/generate → 405 Method Not Allowed', async () => {
    const r = await fetch(`${BASE_URL}/api/generate`);
    assert(r.status === 405, `Expected 405, got ${r.status}`);
  });

  await test('POST with empty body → 400 with JSON error', async () => {
    const r = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
    const ct = r.headers.get('content-type') || '';
    assert(ct.includes('application/json'), `Expected JSON content-type, got: ${ct}`);
    const body = await r.json();
    assert(body.error, 'Expected an "error" field in the response body');
  });

  await test('POST with photo but no prompt → 400', async () => {
    const r = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoBase64: TINY_PNG_B64 })
    });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  await test('Error responses always return JSON (not HTML error pages)', async () => {
    const r = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoBase64: TINY_PNG_B64 })
    });
    const ct = r.headers.get('content-type') || '';
    assert(ct.includes('application/json'), `Got "${ct}" instead of JSON — browser will show cryptic parse error`);
  });

  // ── HTML structure checks ─────────────────────────────────────────────────
  console.log('\n🏗   HTML structure');

  await test('All required element IDs present in HTML', async () => {
    const r   = await fetch(`${BASE_URL}/`);
    const html = await r.text();

    const requiredIds = [
      'loading-overlay', 'flash-overlay',
      'step-1', 'step-2', 'step-3',
      'video', 'canvas', 'capture-btn', 'camera-row', 'countdown-overlay',
      'no-camera-msg', 'preview-actions', 'preview-img',
      'retake-btn', 'next-btn-1',
      'personName', 'teacherName', 'card-grid', 'generate-btn', 'back-btn-2',
      'result-state', 'result-image', 'start-over-btn',
      'error-state', 'error-text', 'retry-btn',
    ];

    const missing = requiredIds.filter(id => !html.includes(`id="${id}"`));
    assert(missing.length === 0, `Missing IDs: ${missing.join(', ')}`);
  });

  await test('All four card types present in HTML', async () => {
    const r   = await fetch(`${BASE_URL}/`);
    const html = await r.text();
    const cards = ['trading-card', 'action-figure', 'superhero-comic', 'minecraft-card'];
    const missing = cards.filter(c => !html.includes(`data-value="${c}"`));
    assert(missing.length === 0, `Missing card types: ${missing.join(', ')}`);
  });

  await test('result-state uses [hidden] correctly (not CSS-display override)', async () => {
    const r   = await fetch(`${BASE_URL}/styles.css`);
    const css = await r.text();
    // Check the fix: result-state display should be gated by :not([hidden])
    const bareRule = css.match(/#result-state\s*\{[^}]*display\s*:[^}]*\}/);
    assert(!bareRule, 'Found bare #result-state { display: ... } rule — this overrides [hidden]. Use #result-state:not([hidden]) instead.');
  });

  await test('camera-row uses [hidden] correctly (not CSS-display override)', async () => {
    const r   = await fetch(`${BASE_URL}/styles.css`);
    const css = await r.text();
    const bareRule = css.match(/\.camera-row\s*\{[^}]*display\s*:[^}]*\}/);
    assert(!bareRule, 'Found bare .camera-row { display: ... } rule — this overrides [hidden]. Use .camera-row:not([hidden]) instead.');
  });

  await test('Card grid is horizontal (flex row, not 2-column grid)', async () => {
    const r   = await fetch(`${BASE_URL}/styles.css`);
    const css = await r.text();
    // Should NOT have grid-template-columns (means it's still a grid)
    const hasGridCols = css.match(/\.card-grid\s*\{[^}]*grid-template-columns[^}]*\}/);
    assert(!hasGridCols, '.card-grid still uses grid-template-columns — should be a horizontal flex row');
  });

  await test('Banner is added by extending canvas (not overlaying on AI image)', async () => {
    const r  = await fetch(`${BASE_URL}/script.js`);
    const js = await r.text();
    // New architecture: canvas.height = H + BANNER_H, not H
    assert(js.includes('H + BANNER_H'), 'compositeBanner should extend canvas height (H + BANNER_H), not overlay');
    assert(!js.includes('BANNER_INSTRUCTION'), 'No BANNER_INSTRUCTION should remain in prompts');
  });

  await test('Prompts do not reserve space or constrain AI image area', async () => {
    const r  = await fetch(`${BASE_URL}/script.js`);
    const js = await r.text();
    assert(!js.includes('top 82%'), 'Prompt should not constrain AI to top 82%');
    assert(!js.includes('bottom 18% is reserved'), 'Prompt should not reserve bottom 18%');
  });

  await test('Minecraft card uses career skills (not HEALTH/XP game stats)', async () => {
    const r  = await fetch(`${BASE_URL}/script.js`);
    const js = await r.text();
    assert(!js.includes('HEALTH: 10/10'), 'Minecraft prompt still has game stat "HEALTH: 10/10"');
    assert(!js.includes('XP: CAREER FAIR CHAMPION'), 'Minecraft prompt still has "XP: CAREER FAIR CHAMPION"');
    assert(js.includes('CREATIVITY'), 'Minecraft prompt should include CREATIVITY skill');
  });

  // ── Full generation test (optional, costs money) ──────────────────────────
  if (FULL) {
    console.log('\n🤖  Full generation test (calls OpenAI)');

    await test('POST /api/generate returns a base64 PNG image', async () => {
      const r = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoBase64: TINY_PNG_B64,
          prompt: 'A simple bright yellow square. No text. No people.',
          size: '1024x1024'
        })
      });
      const ct = r.headers.get('content-type') || '';
      assert(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
      const data = await r.json();
      assert(!data.error, `API returned error: ${data.error}`);
      const b64 = data.data?.[0]?.b64_json;
      assert(b64 && b64.length > 1000, `Expected a non-empty base64 image, got: ${JSON.stringify(data).slice(0, 100)}`);
      console.log(`       Image size: ${Math.round(b64.length * 0.75 / 1024)} KB`);
    });
  } else {
    console.log('\n  💡  Tip: run with --full to test actual OpenAI image generation (~$0.04)');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log(`  ⚠️  Fix the failing tests before the event!\n`);
    process.exit(1);
  } else {
    console.log(`  🎉  All good — ready for career fair day!\n`);
  }
}

main().catch(err => {
  console.error('\nUnexpected error running tests:', err);
  process.exit(1);
});
