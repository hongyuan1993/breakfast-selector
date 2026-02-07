import { useState } from 'react'

function SelectBreakfast({ registered, saveSelection, categories }) {
  const [selected, setSelected] = useState({}) // { id: { optionKey: value } }
  const [animatingId, setAnimatingId] = useState(null)

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

  const handleSave = () => {
    const items = Object.entries(selected)
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
    saveSelection(items)
    setSelected({})
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
        多选明天的早餐，带选项的可展开选择
      </p>
      {registered.length === 0 ? (
        <div className="text-center py-12 text-amber-800/70">
          <span className="text-4xl block mb-2">🥣</span>
          <p>暂无可选择的早餐</p>
          <p className="text-xs mt-2">请先在「登陆早餐」中添加</p>
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
                onClick={handleSave}
                className="px-8 py-3 rounded-full bg-warm-gradient text-amber-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                💾 保存明日选择
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SelectBreakfast
