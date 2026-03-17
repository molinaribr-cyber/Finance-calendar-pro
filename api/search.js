export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { query } = req.body;
  if (!query || typeof query !== 'string' || query.length > 500) {
    return res.status(400).json({ error: 'Invalid query' });
  }

  const systemPrompt = `Eres un asistente financiero especializado en S&P 500, NASDAQ 100 y Merval argentino.
Responde SIEMPRE en español, de forma concisa y útil.
Para consultas sobre empresas incluí: próximo earnings (fecha), dividendo (payment date, monto, yield anual), y el link directo a Investor Relations.
Si hay varios resultados, mostralos en una tabla HTML con class="ai-table" con columnas: Empresa | Ticker | Dato | Valor | Fuente.
La fecha actual es ${new Date().toLocaleDateString('es-AR')}.
Sé directo, sin introducciones largas. Máximo 3 párrafos o 1 tabla + links.
Para links usá formato HTML: <a href="URL" target="_blank" style="color:#4d9fff">texto</a>`;

  // Intentamos primero con web search
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: systemPrompt,
        messages: [{ role: 'user', content: query }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
      if (text) return res.status(200).json({ result: text });
    }
  } catch (e) {
    console.error('Web search attempt failed:', e);
  }

  // Fallback sin web search (usa conocimiento del modelo)
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: query }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Fallback API error:', response.status, errText);
      return res.status(502).json({ error: 'API error: ' + response.status });
    }

    const data = await response.json();
    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    return res.status(200).json({ result: text });
  } catch (err) {
    console.error('Fatal error:', err);
    return res.status(500).json({ error: err.message });
  }
}
