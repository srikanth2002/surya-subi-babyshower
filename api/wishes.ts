type Req = { method?: string; body?: unknown }
type Res = { setHeader: (k: string, v: string) => void; status: (code: number) => { json: (data: unknown) => void } }
const safeBody = (body: unknown): Record<string, unknown> => {
  if (typeof body === 'string') { try { return JSON.parse(body) } catch { return {} } }
  return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {}
}
const safeName = (v: unknown) => typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, 70) : ''

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  const url = process.env.SHEETS_WEBHOOK_URL
  const secret = process.env.SHEETS_WEBHOOK_SECRET
  if (!url || !secret) return res.status(503).json({ok: false, error: 'Google Sheets collection is being connected. Please try again shortly.'})
  const b = safeBody(req.body)
  if (b.honeypot) return res.status(400).json({ok: false, error: 'Invalid submission'})
  const name = safeName(b.name)
  if (name.length < 2) return res.status(400).json({ok: false, error: 'Please enter a valid name'})
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 601) : ''
  if (message.length < 3 || message.length > 600) return res.status(400).json({ok:false,error:'Please enter a valid wish (3–600 characters)'})
  const data = { name, message }
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 15000)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...data, kind: 'wishes', secret, submissionId: crypto.randomUUID() }),
      redirect: 'follow', signal: ctrl.signal,
    })
    if (!response.ok) throw new Error('Google Sheets endpoint failed')
    const result = await response.json() as { ok?: boolean }
    if (result.ok !== true) throw new Error('Google Sheets did not confirm save')
    return res.status(201).json({ok: true})
  } catch (err) {
    console.error('Google Sheets submission error:', err instanceof Error ? err.message : 'unknown')
    return res.status(503).json({ok: false, error: 'Your response was not saved. Please try again shortly.'})
  } finally { clearTimeout(timeout) }
}
