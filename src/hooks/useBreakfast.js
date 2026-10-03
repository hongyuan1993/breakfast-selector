import { useState, useEffect, useCallback } from 'react'
import { getRegisteredBreakfasts, saveRegisteredBreakfasts, getHistory, addHistoryRecord, removeHistoryRecord } from '../utils/storage'
import { BREAKFAST_PRESETS, CATEGORIES } from '../data/breakfastPresets'

export function useBreakfast() {
  const [registered, setRegistered] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    let reg = await getRegisteredBreakfasts()
    const hist = await getHistory()
    if (reg === null || hist === null) {
      // 读取失败（网络/服务端配置问题）：不要用预设覆盖已有数据
      setSaveError('数据加载失败，请稍后刷新重试')
      setLoading(false)
      return
    }
    if (reg.length === 0) {
      reg = BREAKFAST_PRESETS.map(p => ({ ...p, customName: p.name, inStock: true }))
      const ok = await saveRegisteredBreakfasts(reg)
      if (!ok) setSaveError('数据保存失败，请稍后重试')
    } else {
      const needsMigration = reg.some(r => r.inStock === undefined)
      reg = reg.map(r => ({ ...r, inStock: r.inStock !== false }))
      if (needsMigration) await saveRegisteredBreakfasts(reg)
    }
    setRegistered(reg)
    setHistory(hist)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const registerCustomBreakfast = useCallback(async ({ name, emoji, category, options }) => {
    if (!name?.trim()) return
    setSaveError(null)
    const id = `custom-${Date.now()}`
    const opts = (options || [])
      .filter(o => o.label?.trim() && o.values?.some(v => v?.trim()))
      .map((o, i) => ({
        key: o.key || `opt-${i}`,
        label: o.label.trim(),
        values: o.values.filter(v => v?.trim()).map(v => v.trim())
      }))
    const item = {
      id,
      name: name.trim(),
      customName: name.trim(),
      emoji: emoji || '🍽️',
      category: category || 'staple',
      inStock: true,
      ...(opts.length > 0 && { options: opts }),
    }
    const next = [...registered, item]
    setRegistered(next)
    const ok = await saveRegisteredBreakfasts(next)
    if (!ok) setSaveError('保存失败，请稍后重试')
  }, [registered])

  const updateBreakfast = useCallback(async (id, updates) => {
    setSaveError(null)
    const next = registered.map(r =>
      r.id === id ? { ...r, ...updates } : r
    )
    setRegistered(next)
    const ok = await saveRegisteredBreakfasts(next)
    if (!ok) setSaveError('保存失败，请稍后重试')
  }, [registered])

  const removeBreakfast = useCallback(async (id) => {
    setSaveError(null)
    const next = registered.filter(r => r.id !== id)
    setRegistered(next)
    const ok = await saveRegisteredBreakfasts(next)
    if (!ok) setSaveError('保存失败，请稍后重试')
  }, [registered])

  const saveSelection = useCallback(async (items, dateStr, servingTime = '') => {
    const record = {
      id: Date.now(),
      date: dateStr,
      items,
      servingTime: servingTime?.trim() || '',
      createdAt: new Date().toISOString(),
    }
    await addHistoryRecord(record)
    const h = await getHistory()
    if (h) setHistory(h)
  }, [])

  const refreshHistory = useCallback(async () => {
    const h = await getHistory()
    if (h) setHistory(h)
  }, [])

  const cancelOrder = useCallback(async (dateStr) => {
    await removeHistoryRecord(dateStr)
    const h = await getHistory()
    if (h) setHistory(h)
  }, [])

  const updateOrder = useCallback(async (dateStr, items, servingTime) => {
    const record = {
      id: Date.now(),
      date: dateStr,
      items,
      servingTime: servingTime || '',
      createdAt: new Date().toISOString(),
    }
    await addHistoryRecord(record)
    const h = await getHistory()
    if (h) setHistory(h)
  }, [])

  return {
    registered,
    history,
    loading,
    saveError,
    clearSaveError: () => setSaveError(null),
    presets: BREAKFAST_PRESETS,
    categories: CATEGORIES,
    registerCustomBreakfast,
    updateBreakfast,
    removeBreakfast,
    saveSelection,
    refreshHistory,
    cancelOrder,
    updateOrder,
    reload: loadData,
  }
}
