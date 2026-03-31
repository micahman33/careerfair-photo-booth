export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY environment variable is not set' });
  }

  const { photoBase64, aaLogoBase64, prompt, size } = req.body;

  if (!photoBase64 || !prompt) {
    return res.status(400).json({ error: 'Missing required fields: photoBase64, prompt' });
  }

  try {
    const form = new FormData();

    // User photo
    const photoBuffer = Buffer.from(photoBase64, 'base64');
    form.append('image[]', new Blob([photoBuffer], { type: 'image/png' }), 'photo.png');

    // AA logo (if provided)
    if (aaLogoBase64) {
      const aaBuffer = Buffer.from(aaLogoBase64, 'base64');
      form.append('image[]', new Blob([aaBuffer], { type: 'image/png' }), 'aa-logo.png');
    }

    form.append('prompt', prompt);
    form.append('model', 'gpt-image-1.5');
    form.append('size', size || '1024x1536');
    form.append('output_format', 'png');
    form.append('quality', 'low'); // 'medium'/'high' bloats file size and risks 60s timeout on mobile tethering

    const openaiRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('OpenAI error:', data);
      return res.status(openaiRes.status).json({ error: data.error?.message || 'OpenAI request failed' });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
