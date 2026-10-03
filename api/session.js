// /api/session —— 可选口令门禁。GET 状态 / POST 登录 / DELETE 退出。
import { clearedCookie, hasValidSession, isConfigured, json, passwordMatches, passwordRequired, sessionCookie } from './_lib/auth.js'

export function GET(request) {
  const required = passwordRequired()
  return json({ required, ok: !required || hasValidSession(request) })
}

export async function POST(request) {
  if (!passwordRequired()) return json({ ok: true })
  if (!isConfigured()) return json({ error: 'NOT_CONFIGURED' }, 503)
  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    return json({ error: 'BAD_REQUEST' }, 400)
  }
  if (!password || password.length > 512 || !passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 600))
    return json({ error: 'WRONG_PASSWORD' }, 401)
  }
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie() })
}

export function DELETE() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearedCookie() })
}
