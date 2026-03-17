export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.length > 500) {
      return res.status(400).json({ error: 'Invalid query' });
    }

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
        system: `Eres un asistente financiero especializado en S&P 500, NASDAQ 100 y Merval argentino.
Responde SIEMPRE en español, de forma concisa.
Para cada consulta incluí: fecha de próximo earnings, dividendo (ex-date, payment date, monto, yield anual), y el link directo a Investor Relations.
Si hay varios resultados, mostralos en una tabla HTML con class="ai-table".
La fecha actual es ${new Date().toLocaleDateString('es-AR')}.
Sé directo, sin introducciones largas. Máximo 3 párrafos o 1 tabla + links.`,
        messages: [{ role: 'user', content: query }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    return res.status(200).json({ result: text });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
