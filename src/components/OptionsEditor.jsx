// 可复用的选项编辑器：{ key, label, values }[]
// 用于添加/修改早餐时的选项配置

function OptionsEditor({ options = [], onChange }) {
  const updateOption = (idx, field, value) => {
    const next = options.map((opt, i) =>
      i === idx ? { ...opt, [field]: value } : opt
    )
    onChange(next)
  }

  const updateValue = (optIdx, valIdx, value) => {
    const next = options.map((opt, i) => {
      if (i !== optIdx) return opt
      const vals = [...(opt.values || [])]
      vals[valIdx] = value
      return { ...opt, values: vals }
    })
    onChange(next)
  }

  const addOption = () => {
    onChange([...options, { key: `opt-${Date.now()}`, label: '', values: [''] }])
  }

  const removeOption = (idx) => {
    onChange(options.filter((_, i) => i !== idx))
  }

  const addValue = (optIdx) => {
    const opt = options[optIdx]
    const vals = [...(opt.values || []), '']
    updateOption(optIdx, 'values', vals)
  }

  const removeValue = (optIdx, valIdx) => {
    const opt = options[optIdx]
    const vals = (opt.values || []).filter((_, i) => i !== valIdx)
    updateOption(optIdx, 'values', vals)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm text-amber-800 font-medium">
          <span>⚙️</span> 选项（可选，如熟度、甜度等）
        </label>
        <button
          type="button"
          onClick={addOption}
          className="text-sm px-2 py-1 rounded-lg bg-amber-200/80 text-amber-900 hover:bg-amber-300 transition-colors"
        >
          + 添加选项
        </button>
      </div>
      {options.map((opt, optIdx) => (
        <div
          key={opt.key || optIdx}
          className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/50 space-y-2"
        >
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={opt.label || ''}
              onChange={e => updateOption(optIdx, 'label', e.target.value)}
              placeholder="选项名称，如：熟度"
              className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-amber-200 bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
            />
            <button
              type="button"
              onClick={() => removeOption(optIdx)}
              className="w-7 h-7 rounded-full bg-red-200/80 text-red-700 text-sm hover:bg-red-300 flex items-center justify-center"
              title="删除选项"
            >
              ×
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(opt.values || []).map((v, valIdx) => (
              <div key={valIdx} className="flex items-center gap-1">
                <input
                  type="text"
                  value={v}
                  onChange={e => updateValue(optIdx, valIdx, e.target.value)}
                  placeholder="选项值"
                  className="w-20 px-2 py-1 text-sm rounded-lg border border-amber-200 bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <button
                  type="button"
                  onClick={() => removeValue(optIdx, valIdx)}
                  className="w-6 h-6 rounded-full bg-amber-200/80 text-amber-800 text-xs hover:bg-amber-300 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addValue(optIdx)}
              className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 text-sm hover:bg-amber-200 flex items-center justify-center border border-amber-200/60"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OptionsEditor
