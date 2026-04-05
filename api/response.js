const WEBHOOK = 'https://script.google.com/macros/s/AKfycbzUKpTKCy3qP6nC3J4N1dasRb28yBVUXWri6vqsg4AohrdhTzCNxpmO3KO1qaoGK8kI/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST: save a response ──
  if (req.method === 'POST') {
    const { campaignId, contactId, name, phone, type, time } = req.body || {};
    if (!campaignId || !contactId || !type) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    try {
      const r = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', campaignId, contactId, name, phone, type, time: time || new Date().toISOString() })
      });
      const text = await r.text();
      let data = {};
      try { data = JSON.parse(text); } catch(e) {}
      return res.status(200).json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── GET: fetch responses for a campaign ──
  if (req.method === 'GET') {
    const { campaignId } = req.query;
    if (!campaignId) return res.status(400).json({ error: 'Missing campaignId' });
    try {
      const r = await fetch(`${WEBHOOK}?action=get&campaignId=${encodeURIComponent(campaignId)}`);
      const text = await r.text();
      let data = {};
      try { data = JSON.parse(text); } catch(e) {}
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ responses: [], error: e.message });
    }
  }

  // ── DELETE: delete rows for given campaignIds ──
  if (req.method === 'DELETE') {
    const { campaignIds } = req.body || {};
    if (!campaignIds || !campaignIds.length) {
      return res.status(400).json({ error: 'Missing campaignIds' });
    }
    try {
      const r = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', campaignIds })
      });
      const text = await r.text();
      let data = {};
      try { data = JSON.parse(text); } catch(e) {}
      return res.status(200).json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
