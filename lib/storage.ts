/** Upstash Redis REST helper for Vercel functions. No DB credentials go to the browser. */
export function configured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export async function redis(command: Array<string | number>): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('Database is not configured')
  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  if (!result.ok) throw new Error('Database unavailable')
  const body = await result.json() as { result?: unknown; error?: string }
  if (body.error) throw new Error('Database error')
  return body.result
}

export function cleanName(name: unknown): string {
  return typeof name === 'string' ? name.trim().replace(/\s+/g, ' ').slice(0, 70) : ''
}

export function getBody(req: { body?: unknown }): Record<string, unknown> {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) as Record<string, unknown> } catch { return {} }
  }
  return req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body as Record<string, unknown> : {}
}

export function secureResponse(res: { setHeader: (key: string, value: string) => void }) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
}
