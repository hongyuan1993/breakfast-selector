import { useState, useMemo } from 'react'
import { generateEmoji, generateCategory } from '../utils/emojiGenerator'
import OptionsEditor from './OptionsEditor'

function AddBreakfast({ registerCustomBreakfast, categories }) {
  const [name, setName] = useState('')
  const [options, setOptions] = useState([])

  const autoCategory = useMemo(() => generateCategory(name), [name])
  const autoEmoji = useMemo(() => generateEmoji(name, autoCategory), [name, autoCategory])

  const handleAddCustom = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    registerCustomBreakfast({ name: name.trim(), emoji: autoEmoji, category: autoCategory, options })
    setName('')
    setOptions([])
  }

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <span>➕</span> 添加早餐
      </h2>

      {/* 添加新种类 */}
      <div className="mb-8 p-4 rounded-2xl bg-white/80 shadow-sm border border-amber-200/60">
        <h3 className="text-amber-800 font-medium mb-3 flex items-center gap-1">
          <span>✨</span> 添加新种类
        </h3>
        <form onSubmit={handleAddCustom} className="space-y-3">
          <div>
            <label className="block text-sm text-amber-800 mb-1">名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：豆浆油条"
              className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-amber-100/80 flex items-center justify-center text-2xl border border-amber-200/60">
              {autoEmoji}
            </div>
            <div>
              <p className="text-sm text-amber-700">根据名称自动生成</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {categories[autoCategory]?.emoji} {categories[autoCategory]?.name || autoCategory}
              </p>
            </div>
          </div>
          <OptionsEditor options={options} onChange={setOptions} />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-xl bg-amber-400 text-amber-900 font-medium hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            添加
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddBreakfast
