// Vercel serverless function.
// Fetches the bundle chart report from dtrtsystems.ddns.net on the server side
// (server-to-server requests aren't subject to browser CORS rules), so the
// frontend can call this endpoint instead of the ddns server directly.
//
// Usage: /api/bundlechart?laysheet=66882

module.exports = async (req, res) => {
  const laysheet = req.query.laysheet;

  if (!laysheet) {
    res.status(400).json({ error: 'Missing "laysheet" query parameter' });
    return;
  }

  const targetUrl =
    'https://dtrtsystems.ddns.net/shopfloor/public/index.php/cutting/bundle_2/print_bundlechart/' +
    encodeURIComponent(laysheet);

  try {
    const upstream = await fetch(targetUrl);

    if (!upstream.ok) {
      res.status(502).json({ error: 'Upstream server responded with status ' + upstream.status });
      return;
    }

    const html = await upstream.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(html);
  } catch (err) {
    res.status(502).json({ error: 'Could not reach the report server: ' + (err && err.message ? err.message : String(err)) });
  }
};
