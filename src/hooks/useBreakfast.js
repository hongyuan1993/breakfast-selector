import { useState, useEffect, useCallback } from 'react'
import { getRegisteredBreakfasts, saveRegisteredBreakfasts, getHistory, addHistoryRecord } from '../utils/storage'
import { BREAKFAST_PRESETS, CATEGORIES } from '../data/breakfastPresets'

export function useBreakfast() {
  const [registered, setRegistered] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    let reg = await getRegisteredBreakfasts()
    const hist = await getHistory()
    if (reg.length === 0) {
      reg = BREAKFAST_PRESETS.map(p => ({ ...p, customName: p.name, inStock: true }))
      await saveRegisteredBreakfasts(reg)
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
    await saveRegisteredBreakfasts(next)
  }, [registered])

  const updateBreakfast = useCallback(async (id, updates) => {
    const next = registered.map(r =>
      r.id === id ? { ...r, ...updates } : r
    )
    setRegistered(next)
    await saveRegisteredBreakfasts(next)
  }, [registered])

  const removeBreakfast = useCallback(async (id) => {
    const next = registered.filter(r => r.id !== id)
    setRegistered(next)
    await saveRegisteredBreakfasts(next)
  }, [registered])

  const saveSelection = useCallback(async (items) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().slice(0, 10)
    const record = {
      id: Date.now(),
      date: dateStr,
      items,
      createdAt: new Date().toISOString(),
    }
    await addHistoryRecord(record)
    setHistory(await getHistory())
  }, [])

  const refreshHistory = useCallback(async () => {
    setHistory(await getHistory())
  }, [])

  return {
    registered,
    history,
    loading,
    presets: BREAKFAST_PRESETS,
    categories: CATEGORIES,
    registerCustomBreakfast,
    updateBreakfast,
    removeBreakfast,
    saveSelection,
    refreshHistory,
    reload: loadData,
  }
}
