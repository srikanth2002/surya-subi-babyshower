/**
 * Public guest-wishes read endpoint; RSVP responses and submission IDs stay private.
 * Uses the server-side Apps Script secret. Only safe display fields are returned.
 */
type Req = { method?: string; query?: { limit?: string; cursor?: string } }
type Res = { setHeader: (key: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } }
type RawWish = { row?: unknown; name?: unknown; message?: unknown; createdAt?: unknown }
const clamp = (value: unknown, low: number, high: number, fallback: number) => {
  const n = Number(value)
  return Number.isInteger(n) && n >= low && n <= high ? n : fallback
}
export default async function handler(req: Req, res: Res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=8, stale-while-revalidate=8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') return res.status(405).json({ok: false, error: 'Method not allowed'})
  const url = process.env.SHEETS_WEBHOOK_URL
  const secret = process.env.SHEETS_WEBHOOK_SECRET
  if (!url || !secret) return res.status(503).json({ok: false, error: 'Wishes service is not configured'})
  const limit = clamp(req.query?.limit, 1, 40, 40)
  const cursor = req.query?.cursor ? clamp(req.query.cursor, 2, 99999999, 0) : 0
  if (req.query?.cursor && !cursor) return res.status(400).json({ok: false, error: 'Invalid cursor'})
  const ctl = new AbortController()
  const timeout = setTimeout(() => ctl.abort(), 12000)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: JSON.stringify({kind: 'publicWishes', secret, limit, cursor}),
      redirect: 'follow', signal: ctl.signal
    })
    if (!response.ok) throw new Error('Apps Script response error')
    const json = await response.json() as { ok?: boolean; wishes?: RawWish[]; nextCursor?: unknown }
    if (!json.ok || !Array.isArray(json.wishes)) throw new Error('Apps Script publicWishes is not deployed')
    const wishes = json.wishes.slice(0, 40).map((row) => ({
      row: clamp(row.row, 2, 99999999, 2),
      name: typeof row.name === 'string' ? row.name.slice(0, 70) : '',
      message: typeof row.message === 'string' ? row.message.slice(0, 600) : '',
      createdAt: typeof row.createdAt === 'string' ? row.createdAt.slice(0, 30) : ''
    })).filter((w) => w.name.length >= 2 && w.message.length >= 3)
    const nextCursor = typeof json.nextCursor === 'number' && json.nextCursor >= 2 ? json.nextCursor : null
    return res.status(200).json({ok: true, wishes, nextCursor})
  } catch (error) {
    console.error('Public wishes gateway:', error instanceof Error ? error.message : 'Unavailable')
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({ok: false, error: 'Unable to load guest wishes at the moment'})
  } finally {
    clearTimeout(timeout)
  }
}
