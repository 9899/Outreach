// Serverless function to save/retrieve responses cross-device
// Uses Vercel KV (free tier) or falls back to upstash Redis (free)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Free KV store via Upstash Redis REST API ──
  // Set these in Vercel Environment Variables (free at upstash.com):
  // UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
  const KV_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  async function kvGet(key) {
    if (!KV_URL) return null;
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return d.result ? JSON.parse(d.result) : null;
  }

  async function kvSet(key, value) {
    if (!KV_URL) return;
    await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify(value))
    });
  }

  // ── POST: save a response ──
  if (req.method === 'POST') {
    const { campaignId, contactId, name, type, time } = req.body || {};
    if (!campaignId || !contactId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const key = `hr_campaign_${campaignId}`;
    try {
      let record = await kvGet(key) || { responses: [] };
      // Check duplicate
      const existing = record.responses.find(r => r.contactId === contactId);
      if (existing) {
        return res.status(200).json({ ok: true, already: true, existingType: existing.type });
      }
      record.responses.push({ contactId, name, type, time: time || new Date().toISOString() });
      await kvSet(key, record);
      return res.status(200).json({ ok: true });
    } catch (e) {
      // If KV not configured, return ok anyway — contact sees success
      // Recruiter won't see it live but it's better than showing an error to candidate
      console.error('KV error:', e.message);
      return res.status(200).json({ ok: true, warning: 'KV not configured' });
    }
  }

  // ── GET: fetch responses for a campaign ──
  if (req.method === 'GET') {
    const { campaignId } = req.query;
    if (!campaignId) return res.status(400).json({ error: 'Missing campaignId' });
    try {
      const key = `hr_campaign_${campaignId}`;
      const record = await kvGet(key) || { responses: [] };
      return res.status(200).json({ responses: record.responses });
    } catch (e) {
      return res.status(200).json({ responses: [] });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
