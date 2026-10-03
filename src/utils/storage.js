// 数据读写：浏览器只调用同源的 /api/store（Vercel Function），服务端用 service_role 访问 Supabase。
// 浏览器端不再持有任何 Supabase URL / key。
// 读取失败时返回 null（而不是 []），避免调用方把“读失败”误当成“空数据”而覆盖已有数据。

const STORAGE_KEYS = {
  REGISTERED: 'breakfasts',
  HISTORY: 'history',
}

/** 口令门禁开启且会话失效时触发，App 据此回到口令页 */
export const AUTH_REQUIRED_EVENT = 'breakfast:auth-required'

function notifyIfUnauthenticated(res) {
  if (res.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT))
  }
}

async function apiGet(key) {
  try {
    const res = await fetch(`/api/store?key=${encodeURIComponent(key)}`, {
      credentials: 'same-origin',
      cache: 'no-store',
    })
    notifyIfUnauthenticated(res)
    if (!res.ok) {
      console.error('Store get error:', key, res.status)
      return { ok: false, value: null }
    }
    const json = await res.json()
    return { ok: true, value: json?.value ?? null }
  } catch (e) {
    console.error('Store get error:', key, e)
    return { ok: false, value: null }
  }
}

async function apiSet(key, value) {
  try {
    const res = await fetch('/api/store', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    notifyIfUnauthenticated(res)
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      console.error('Store set error:', key, res.status, json?.error)
      return { ok: false, error: json?.error }
    }
    return { ok: true }
  } catch (e) {
    console.error('Store set error:', key, e)
    return { ok: false, error: String(e) }
  }
}

/** 成功时返回数组（可能为空）；读取失败返回 null */
export async function getRegisteredBreakfasts() {
  const { ok, value } = await apiGet(STORAGE_KEYS.REGISTERED)
  if (!ok) return null
  return Array.isArray(value) ? value : []
}

export async function saveRegisteredBreakfasts(items) {
  const result = await apiSet(STORAGE_KEYS.REGISTERED, items)
  return result.ok
}

/** 成功时返回数组（可能为空）；读取失败返回 null */
export async function getHistory() {
  const { ok, value } = await apiGet(STORAGE_KEYS.HISTORY)
  if (!ok) return null
  return Array.isArray(value) ? value : []
}

export async function saveHistory(records) {
  const result = await apiSet(STORAGE_KEYS.HISTORY, records)
  return result.ok
}

export async function addHistoryRecord(record) {
  const history = await getHistory()
  if (history === null) return false // 读取失败时不写，避免覆盖已有历史
  const filtered = history.filter(r => r.date !== record.date)
  filtered.unshift(record)
  return await saveHistory(filtered)
}

export async function removeHistoryRecord(dateStr) {
  const history = await getHistory()
  if (history === null) return false
  const filtered = history.filter(r => r.date !== dateStr)
  return await saveHistory(filtered)
}
