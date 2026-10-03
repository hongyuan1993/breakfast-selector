import { useEffect, useState } from 'react'
import { AUTH_REQUIRED_EVENT } from '../utils/storage'

// 可选口令门禁：只有服务端设置了 APP_PASSWORD 时才会显示口令页（由 /api/session 告知）。
// 未设置时直接进入应用（/api/store 仍只允许读写 breakfasts/history 两个 key）。
export default function PasswordGate({ children }) {
  const [status, setStatus] = useState('checking') // checking | locked | open
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => !cancelled && setStatus(d?.required && !d?.ok ? 'locked' : 'open'))
      .catch(() => !cancelled && setStatus('open'))
    const onAuthRequired = () => setStatus('locked')
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired)
    return () => {
      cancelled = true
      window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy || !password) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setPassword('')
        setStatus('open')
        return
      }
      const d = await res.json().catch(() => ({}))
      setError(d?.error === 'WRONG_PASSWORD' ? '密码不正确' : d?.error === 'NOT_CONFIGURED' ? '服务器未配置 APP_SESSION_SECRET' : '登录失败，请重试')
    } catch {
      setError('登录失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'open') return children
  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center text-amber-800">
        <span className="text-4xl animate-pulse">🍳</span>
      </div>
    )
  }
  return (
    <div className="min-h-screen max-w-lg mx-auto flex items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 px-6">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl bg-white/90 p-6 shadow-md space-y-3">
        <h1 className="text-xl font-bold text-amber-900 text-center">🍳 大宝早餐选择</h1>
        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          className="w-full rounded-lg border border-amber-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy || !password} className="w-full rounded-lg bg-amber-500 py-2.5 font-medium text-white disabled:opacity-60">
          {busy ? '…' : '进入'}
        </button>
      </form>
    </div>
  )
}
