// 可选的口令门禁（与 portfolio / OurAtlas 同一思路：APP_PASSWORD + APP_SESSION_SECRET + 加密会话 Cookie）。
// - 未设置 APP_PASSWORD：开放模式。/api/store 不要求登录，但只允许读写 app_store 的两个 key，且有格式/大小校验。
// - 设置了 APP_PASSWORD：/api/store 需要会话 Cookie（AES-256-GCM 加密，1 年有效）；
//   此时 APP_SESSION_SECRET 也必须设置（>= 16 位），否则一律拒绝（fail closed）。
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'bs_sess'
const SESSION_MAX_AGE = 60 * 60 * 24 * 365
const MIN_SECRET_LENGTH = 16

const password = () => process.env.APP_PASSWORD || ''
const secret = () => process.env.APP_SESSION_SECRET || ''

export const passwordRequired = () => password().length > 0
const configured = () => passwordRequired() && secret().length >= MIN_SECRET_LENGTH

function key() {
  return createHash('sha256').update(`breakfast-session:v1:${secret()}`).digest()
}

function pwFingerprint() {
  return createHash('sha256').update(`breakfast-pw:v1:${secret()}:${password()}`).digest('base64url').slice(0, 16)
}

export function passwordMatches(input) {
  if (!configured() || typeof input !== 'string') return false
  const a = createHash('sha256').update(`pw:${secret()}:${input}`).digest()
  const b = createHash('sha256').update(`pw:${secret()}:${password()}`).digest()
  return timingSafeEqual(a, b)
}

function createToken() {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  cipher.setAAD(Buffer.from(SESSION_COOKIE))
  const payload = JSON.stringify({ v: 1, exp: Date.now() + SESSION_MAX_AGE * 1000, pw: pwFingerprint() })
  const ct = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64url')
}

function verifyToken(token) {
  if (!token || token.length > 1024 || !configured()) return false
  try {
    const buf = Buffer.from(token, 'base64url')
    if (buf.length < 12 + 16 + 2) return false
    const decipher = createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12))
    decipher.setAAD(Buffer.from(SESSION_COOKIE))
    decipher.setAuthTag(buf.subarray(12, 28))
    const plain = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8')
    const p = JSON.parse(plain)
    return p.v === 1 && typeof p.exp === 'number' && p.exp > Date.now() && p.pw === pwFingerprint()
  } catch {
    return false
  }
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || ''
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim())
  }
  return null
}

/** 返回 null 表示允许访问；否则返回应直接回给客户端的 Response */
export function checkAccess(request) {
  if (!passwordRequired()) return null
  if (!configured()) return json({ error: 'NOT_CONFIGURED' }, 503)
  if (verifyToken(readCookie(request, SESSION_COOKIE))) return null
  return json({ error: 'UNAUTHENTICATED' }, 401)
}

export function hasValidSession(request) {
  return verifyToken(readCookie(request, SESSION_COOKIE))
}

function cookie(value, maxAge) {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export const sessionCookie = () => cookie(createToken(), SESSION_MAX_AGE)
export const clearedCookie = () => cookie('', 0)
export const isConfigured = configured

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })
}
