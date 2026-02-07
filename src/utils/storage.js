import { supabase } from '../lib/supabase'

const STORAGE_KEYS = {
  REGISTERED: 'breakfasts',
  HISTORY: 'history',
}

// 使用 Supabase 时
async function supabaseGet(key) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('app_store')
    .select('value')
    .eq('key', key)
    .single()
  if (error && error.code !== 'PGRST116') {
    console.error('Supabase get error:', error)
    return null
  }
  return data?.value ?? null
}

async function supabaseSet(key, value) {
  if (!supabase) return false
  const { error } = await supabase
    .from('app_store')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) {
    console.error('Supabase set error:', error)
    return false
  }
  return true
}

// 同步接口 - localStorage 回退
function localGetRegistered() {
  try {
    const data = localStorage.getItem('breakfast_registered')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function localSetRegistered(items) {
  localStorage.setItem('breakfast_registered', JSON.stringify(items))
}

function localGetHistory() {
  try {
    const data = localStorage.getItem('breakfast_history')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function localSetHistory(records) {
  localStorage.setItem('breakfast_history', JSON.stringify(records))
}

// 导出：优先 Supabase，否则 localStorage
export async function getRegisteredBreakfasts() {
  if (supabase) {
    const value = await supabaseGet(STORAGE_KEYS.REGISTERED)
    return Array.isArray(value) ? value : []
  }
  return localGetRegistered()
}

export async function saveRegisteredBreakfasts(items) {
  if (supabase) {
    const ok = await supabaseSet(STORAGE_KEYS.REGISTERED, items)
    return ok
  }
  localSetRegistered(items)
  return true
}

export async function getHistory() {
  if (supabase) {
    const value = await supabaseGet(STORAGE_KEYS.HISTORY)
    return Array.isArray(value) ? value : []
  }
  return localGetHistory()
}

export async function saveHistory(records) {
  if (supabase) {
    return await supabaseSet(STORAGE_KEYS.HISTORY, records)
  }
  localSetHistory(records)
  return true
}

export async function addHistoryRecord(record) {
  const history = await getHistory()
  const filtered = history.filter(r => r.date !== record.date)
  filtered.unshift(record)
  return await saveHistory(filtered)
}
