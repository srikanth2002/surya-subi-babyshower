/** Authenticated, server-to-server Google Apps Script gateway. Secrets never reach the browser. */
export function sheetsConnected() {
  return Boolean(process.env.SHEETS_WEBHOOK_URL && process.env.SHEETS_WEBHOOK_SECRET)
}
export async function appendToSheet(type: 'rsvp' | 'wishes', payload: Record<string, unknown>) {
  const url = process.env.SHEETS_WEBHOOK_URL
  const secret = process.env.SHEETS_WEBHOOK_SECRET
  if (!url || !secret) throw new Error('Google Sheets connector is not configured')
  const ctl = new AbortController()
  const timeout = setTimeout(() => ctl.abort(), 12000)
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, kind: type, secret, submissionId: crypto.randomUUID() }),
      signal: ctl.signal,
      redirect: 'follow',
    })
    if (!r.ok) throw new Error('Google Sheets endpoint failed')
    const text = await r.text()
    let result: { ok?: boolean } = {}
    try { result = JSON.parse(text) } catch { throw new Error('Invalid Google Sheets acknowledgement') }
    if (!result.ok) throw new Error('Google Sheets did not save the response')
  } finally { clearTimeout(timeout) }
}
