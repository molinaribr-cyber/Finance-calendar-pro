export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ 
      status: 'ERROR',
      problem: 'ANTHROPIC_API_KEY no está configurada en Vercel'
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Respondé solo: OK' }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ 
        status: 'OK',
        message: 'API conectada correctamente',
        response: data.content?.[0]?.text
      });
    } else {
      return res.status(200).json({ 
        status: 'ERROR',
        httpStatus: response.status,
        error: data
      });
    }
  } catch (err) {
    return res.status(200).json({ 
      status: 'ERROR',
      problem: 'No se pudo conectar a Anthropic',
      detail: err.message
    });
  }
}
