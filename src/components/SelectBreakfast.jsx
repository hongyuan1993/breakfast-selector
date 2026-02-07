import { useState, useMemo } from 'react'

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const SERVING_TIME_OPTIONS = [
  '6:00-6:30', '6:30-7:00', '7:00-7:30', '7:30-8:00', '8:00-8:30', '8:30-9:00',
  '9:00-9:30', '9:30-10:00', '10:00-10:30', '10:30-11:00', '11:00-11:30', '11:30-12:00',
]

// 生成明日到一周内的日期选项
function getDateOptions() {
  const today = new Date()
  const options = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    options.push({
      value: d.toISOString().slice(0, 10),
      label: i === 1 ? '明日' : `+${i}天`,
      display: `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`,
    })
  }
  return options
}

function SelectBreakfast({ registered, saveSelection, categories }) {
  const dateOptions = useMemo(() => getDateOptions(), [])
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.value ?? '')
  const [servingTime, setServingTime] = useState('10:00-10:30')
  const [selected, setSelected] = useState({}) // { id: { optionKey: value } }
  const [animatingId, setAnimatingId] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const toggleSelect = (id) => {
    const item = registered.find(r => r.id === id)
    const isAdding = !selected[id]
    if (isAdding && item?.inStock === false) return
    setAnimatingId(id)
    setTimeout(() => setAnimatingId(null), 500)
    setSelected(prev => {
      if (prev[id]) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: {} }
    })
  }

  const setOption = (id, optionKey, value) => {
    setSelected(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [optionKey]: value }
    }))
  }

  const buildPreviewItems = () => {
    return Object.entries(selected)
      .filter(([id]) => {
        const item = registered.find(r => r.id === id)
        return item && item.inStock !== false
      })
      .map(([id, opts]) => {
        const item = registered.find(r => r.id === id)
        const optsDisplay = Object.entries(opts).map(([key, val]) => {
          const optDef = (item?.options || []).find(o => o.key === key)
          return { label: optDef?.label || key, value: val }
        })
        return {
          id,
          name: item?.customName || item?.name,
          emoji: item?.emoji,
          options: optsDisplay
        }
      })
  }

  const handleOpenConfirm = () => {
    setShowConfirm(true)
  }

  const handleConfirmSave = () => {
    const items = buildPreviewItems()
    saveSelection(items, selectedDate, servingTime)
    setSelected({})
    setServingTime('10:00-10:30')
    setShowConfirm(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  const handleCancelConfirm = () => {
    setShowConfirm(false)
  }

  const byCategory = {}
  registered.forEach(item => {
    const cat = item.category || 'staple'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(item)
  })

  return (
    <div className="p-4 pb-28">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <span>🍽️</span> 选择早餐
      </h2>
      <p className="text-amber-800/80 text-sm mb-4">
        选择日期并多选早餐，带选项的可展开选择
      </p>
      <div className="mb-4">
        <label className="block text-xs text-amber-800 mb-2">保存到日期</label>
        <div className="flex flex-wrap gap-2">
          {dateOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedDate(opt.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedDate === opt.value
                  ? 'bg-amber-400 text-amber-900 shadow-md'
                  : 'bg-white/80 text-amber-800 border border-amber-200/60 hover:bg-amber-100'
              }`}
            >
              {opt.display}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-amber-800 mb-2">早餐提供时间</label>
        <select
          value={servingTime}
          onChange={e => setServingTime(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          {SERVING_TIME_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      {registered.length === 0 ? (
        <div className="text-center py-12 text-amber-800/70">
          <span className="text-4xl block mb-2">🥣</span>
          <p>暂无可选择的早餐</p>
          <p className="text-xs mt-2">请先在「添加早餐」中添加</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {Object.entries(byCategory).map(([catKey, items]) => (
              <div key={catKey}>
                <h3 className="text-amber-800 font-medium mb-2 flex items-center gap-1">
                  <span>{categories[catKey]?.emoji || '🍽️'}</span>
                  {categories[catKey]?.name || catKey}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.map(item => {
                    const isSelected = !!selected[item.id]
                    const isAnimating = animatingId === item.id
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="relative">
                          <button
                            onClick={() => toggleSelect(item.id)}
                            disabled={item.inStock === false}
                            className={`w-full flex flex-col items-center justify-center p-4 rounded-2xl shadow-sm border transition-all duration-200 active:scale-[0.98] relative ${
                              item.inStock === false
                                ? 'opacity-60 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-amber-200/80 border-amber-400 shadow-md'
                                  : 'bg-white/80 border-amber-200/60 hover:shadow-md hover:scale-[1.02] hover:border-amber-300'
                            } ${isAnimating && isSelected ? 'animate-bounce-select' : isAnimating ? 'animate-spin-select' : ''}`}
                          >
                            {item.inStock === false && (
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-400/90 text-white">
                                无货
                              </span>
                            )}
                            <span className="text-3xl mb-1">{item.emoji}</span>
                            <span className="text-sm font-medium text-amber-900">
                              {item.customName || item.name}
                            </span>
                            {isSelected && <span className="text-amber-600 text-xs mt-1">✓ 已选</span>}
                          </button>
                        </div>
                        {isSelected && item.options?.length > 0 && (
                          <div className="rounded-xl bg-white/60 p-2 space-y-2 border border-amber-200/50">
                            {item.options.map(opt => (
                              <div key={opt.key} className="flex flex-wrap gap-1">
                                <span className="text-xs text-amber-800 w-full">{opt.label}:</span>
                                {opt.values.map(v => (
                                  <button
                                    key={v}
                                    onClick={() => setOption(item.id, opt.key, v)}
                                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                      selected[item.id]?.[opt.key] === v
                                        ? 'bg-amber-400 text-amber-900'
                                        : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200'
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
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {Object.keys(selected).length > 0 && (
            <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
              <button
                onClick={handleOpenConfirm}
                className="px-8 py-3 rounded-full bg-warm-gradient text-amber-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                💾 保存至 {dateOptions.find(o => o.value === selectedDate)?.display ?? selectedDate}
              </button>
            </div>
          )}
          {showSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 text-center">
                <span className="text-4xl block mb-3">✅</span>
                <p className="text-lg font-bold text-amber-900 mb-1">已成功添加！</p>
                <p className="text-amber-800">敬请期待！</p>
              </div>
            </div>
          )}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 max-h-[85vh] overflow-y-auto">
                <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <span>✅</span> 确认保存
                </h3>
                <div className="space-y-3 mb-5">
                  <div className="text-sm text-amber-800">
                    <span className="font-medium">日期：</span>
                    {dateOptions.find(o => o.value === selectedDate)?.display ?? selectedDate}
                  </div>
                  {servingTime.trim() && (
                    <div className="text-sm text-amber-800">
                      <span className="font-medium">提供时间：</span>
                      {servingTime.trim()}
                    </div>
                  )}
                  <div className="text-sm text-amber-800">
                    <span className="font-medium">已选早餐：</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {buildPreviewItems().map((item, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100/80 border border-amber-200/50"
                      >
                        <span className="text-lg">{item.emoji}</span>
                        <div>
                          <span className="font-medium text-amber-900">{item.name}</span>
                          {item.options?.length > 0 && (
                            <span className="text-xs text-amber-700 block">
                              {item.options.map(o => `${o.label}: ${o.value}`).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-amber-200/80 text-amber-800 font-medium hover:bg-amber-300 transition-colors"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    className="flex-1 py-2.5 rounded-xl bg-amber-400 text-amber-900 font-bold hover:bg-amber-500 transition-colors"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SelectBreakfast
