import { useState, useEffect } from 'react'

function HistoryCalendar({ history, registered, categories, cancelOrder, updateOrder }) {
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [selectedDate, setSelectedDate] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editItems, setEditItems] = useState([])

  const year = parseInt(viewDate.slice(0, 4), 10)
  const month = parseInt(viewDate.slice(5, 7), 10)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()

  const dates = []
  for (let i = 0; i < startWeekday; i++) dates.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    dates.push(dateStr)
  }

  const recordsByDate = {}
  history.forEach(r => {
    recordsByDate[r.date] = r
  })

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1)
    setViewDate(d.toISOString().slice(0, 7))
  }
  const nextMonth = () => {
    const d = new Date(year, month, 1)
    setViewDate(d.toISOString().slice(0, 7))
  }

  const selectedRecord = selectedDate ? recordsByDate[selectedDate] : null

  // 是否为未来日期（可取消订单）
  const isFutureDate = (dateStr) => {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    return dateStr > todayStr
  }
  const canCancelOrder = selectedRecord && isFutureDate(selectedRecord.date)
  const canEditOrder = canCancelOrder

  useEffect(() => {
    setEditMode(false)
  }, [selectedDate])

  const enterEditMode = () => {
    if (!selectedRecord) return
    setEditItems(selectedRecord.items?.map(it => ({ ...it })) ?? [])
    setEditMode(true)
  }

  const exitEditMode = () => {
    setEditMode(false)
  }

  const removeItemFromOrder = (index) => {
    setEditItems(prev => prev.filter((_, i) => i !== index))
  }

  const addItemToOrder = (regItem) => {
    const opts = (regItem.options || []).map(o => ({
      label: o.label,
      value: o.values?.[0] ?? ''
    }))
    setEditItems(prev => [...prev, {
      id: regItem.id,
      name: regItem.customName || regItem.name,
      emoji: regItem.emoji,
      options: opts
    }])
  }

  const updateItemOption = (index, optLabel, value) => {
    setEditItems(prev => prev.map((it, i) => {
      if (i !== index) return it
      const opts = (it.options || []).map(o =>
        o.label === optLabel ? { ...o, value } : o
      )
      return { ...it, options: opts }
    }))
  }

  const handleSaveOrder = async () => {
    if (!selectedRecord) return
    await updateOrder(selectedRecord.date, editItems, selectedRecord.servingTime)
    setEditMode(false)
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <span>📋</span> 查看订单
      </h2>
      <p className="text-amber-800/80 text-sm mb-4">
        点击日期查看当日订单
      </p>
      {history.length === 0 ? (
        <div className="text-center py-12 text-amber-800/70">
          <span className="text-4xl block mb-2">📭</span>
          <p>暂无订单</p>
          <p className="text-xs mt-2">在「选择早餐」中保存后会显示</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-white/80 shadow-sm border border-amber-200/60 overflow-hidden mb-6">
            <div className="flex items-center justify-between p-3 bg-amber-100/50">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-amber-200/50 transition-colors"
              >
                ←
              </button>
              <span className="font-bold text-amber-900">
                {year}年{month}月
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-amber-200/50 transition-colors"
              >
                →
              </button>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(d => (
                  <div key={d} className="text-center text-xs text-amber-700 font-medium py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dates.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} />
                  const hasRecord = !!recordsByDate[d]
                  const isSelected = selectedDate === d
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                        hasRecord
                          ? 'bg-amber-200/70 text-amber-900 hover:bg-amber-300'
                          : 'text-amber-700/60 hover:bg-amber-100/50'
                      } ${isSelected ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
                    >
                      {d.slice(8)}
                      {hasRecord && <span className="text-[10px]">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          {selectedRecord && (
            <div className="rounded-2xl bg-white/80 shadow-sm border border-amber-200/60 p-4">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <span>🍳</span> {selectedRecord.date} 早餐
              </h3>
              {selectedRecord.servingTime && (
                <div className="text-sm text-amber-800 mb-3">
                  <span className="font-medium">提供时间：</span>
                  {selectedRecord.servingTime}
                </div>
              )}
              {editMode ? (
                <>
                  <div className="text-xs text-amber-600 mb-2">日期与提供时间不可变更</div>
                  <div className="space-y-3 mb-4">
                    {(editItems || []).map((item, i) => {
                      const regItem = registered?.find(r => r.id === item.id)
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-100/70 border border-amber-200/50"
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-amber-900">{item.name}</span>
                            {regItem?.options?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {regItem.options.map(opt => (
                                  <div key={opt.key} className="flex items-center gap-1">
                                    <span className="text-xs text-amber-700">{opt.label}:</span>
                                    {opt.values.map(v => (
                                      <button
                                        key={v}
                                        onClick={() => updateItemOption(i, opt.label, v)}
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          (item.options?.find(o => o.label === opt.label)?.value) === v
                                            ? 'bg-amber-400 text-amber-900'
                                            : 'bg-amber-200/80 text-amber-800 hover:bg-amber-300'
                                        }`}
                                      >
                                        {v}
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeItemFromOrder(i)}
                            className="w-7 h-7 rounded-full bg-red-200 text-red-700 text-sm flex items-center justify-center hover:bg-red-300 shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-amber-800 font-medium mb-2">添加早餐</div>
                    <div className="flex flex-wrap gap-2">
                      {registered?.filter(r => r.inStock !== false).map(regItem => (
                        <button
                          key={regItem.id}
                          onClick={() => addItemToOrder(regItem)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-100/80 text-amber-900 text-sm hover:bg-amber-200 border border-amber-200/60"
                        >
                          <span>{regItem.emoji}</span>
                          <span>{regItem.customName || regItem.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={exitEditMode}
                      className="flex-1 py-2.5 rounded-xl bg-amber-200/80 text-amber-800 font-medium hover:bg-amber-300"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveOrder}
                      className="flex-1 py-2.5 rounded-xl bg-amber-400 text-amber-900 font-bold hover:bg-amber-500"
                    >
                      保存变更
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedRecord.items?.map((item, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100/70 border border-amber-200/50"
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <span className="font-medium text-amber-900">{item.name}</span>
                          {(() => {
                            const opts = item.options
                            if (!opts || (Array.isArray(opts) && opts.length === 0) || (!Array.isArray(opts) && Object.keys(opts).length === 0)) return null
                            const text = Array.isArray(opts)
                              ? opts.map(o => `${o.label}: ${o.value}`).join(', ')
                              : Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join(', ')
                            return <span className="text-xs text-amber-700 block">{text}</span>
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                  {canEditOrder ? (
                    <div className="flex gap-3">
                      <button
                        onClick={enterEditMode}
                        className="flex-1 py-2.5 rounded-xl bg-amber-200/80 text-amber-800 font-medium hover:bg-amber-300"
                      >
                        变更订单
                      </button>
                      <button
                        onClick={() => cancelOrder(selectedRecord.date)}
                        className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-700 font-medium hover:bg-red-200"
                      >
                        取消订单
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 text-center py-2">今日及过去的订单不可取消</p>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HistoryCalendar
