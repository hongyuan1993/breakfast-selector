// /api/store —— 浏览器读写 app_store 的唯一通道（Vercel Function，Node runtime）。
// 服务端用 service_role（绕过 RLS）；PHASE B5 之后 anon 对 app_store 没有任何权限。
// 只允许：GET ?key=breakfasts|history，PUT { key, value }（整体覆盖该 key 的 JSON 数组），并做格式/大小校验。
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { checkAccess, json } from './_lib/auth.js'

const ALLOWED_KEYS = { breakfasts: 1000, history: 5000 } // key -> 最大条目数
const MAX_BYTES = 256 * 1024

function validKey(key) {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(ALLOWED_KEYS, key)
}

function validateValue(key, value) {
  if (!Array.isArray(value)) return 'value must be an array'
  if (value.length > ALLOWED_KEYS[key]) return 'too many entries'
  if (!value.every((v) => v && typeof v === 'object' && !Array.isArray(v))) return 'entries must be objects'
  if (JSON.stringify(value).length > MAX_BYTES) return 'value too large'
  return null
}

export async function GET(request) {
  const denied = checkAccess(request)
  if (denied) return denied
  const key = new URL(request.url).searchParams.get('key')
  if (!validKey(key)) return json({ error: 'key not allowed' }, 400)
  try {
    const { data, error } = await getSupabaseAdmin().from('app_store').select('value').eq('key', key).maybeSingle()
    if (error) return json({ error: error.message }, 502)
    return json({ value: data?.value ?? null })
  } catch (e) {
    console.error('[api/store GET]', e instanceof Error ? e.message : e)
    return json({ error: 'server error' }, 500)
  }
}

export async function PUT(request) {
  const denied = checkAccess(request)
  if (denied) return denied
  const len = Number(request.headers.get('content-length') || 0)
  if (len > MAX_BYTES + 1024) return json({ error: 'payload too large' }, 413)
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }
  const { key, value } = body || {}
  if (!validKey(key)) return json({ error: 'key not allowed' }, 400)
  const problem = validateValue(key, value)
  if (problem) return json({ error: problem }, 400)
  try {
    const { error } = await getSupabaseAdmin()
      .from('app_store')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) return json({ error: error.message }, 502)
    return json({ ok: true })
  } catch (e) {
    console.error('[api/store PUT]', e instanceof Error ? e.message : e)
    return json({ error: 'server error' }, 500)
  }
}
