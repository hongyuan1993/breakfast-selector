// 仅服务端（Vercel Function）使用。浏览器打包只包含 src/，不会包含本文件。
// SUPABASE_SERVICE_ROLE_KEY 绕过 RLS：绝不能以 VITE_ 开头，也不能被 src/ 下任何文件 import。
import { createClient } from '@supabase/supabase-js'

let cached = null

export function getSupabaseAdmin() {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured')
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return cached
}
