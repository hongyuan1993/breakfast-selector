import { useState } from 'react'
import OptionsEditor from './OptionsEditor'

const COMMON_EMOJIS = [
  '🍜', '🌽', '🥚', '🍳', '🥪', '🥞', '🥣', '🥟', '🍓', '🍌', '🍲', '🧃', '🍚', '🥛', '🥐', '🍞',
  '🥗', '☕', '🍵', '🥤', '🍽️', '🍎', '🍊', '🍇', '🍉', '🍐', '🍑', '🍒', '🥝', '🥑', '🫐', '🥭', '🍍',
  '🥥', '🍋', '🍩', '🎂', '🍪', '🍫', '🍬', '🍯', '🧀', '🥓', '🌭', '🍕', '🍗', '🥘', '🥙', '🌮',
  '🌯', '🥗', '🥫', '🫕', '🍿', '🥜', '🫘', '🥛', '🥤', '🧋', '🍶', '🥂', '🥄', '🍴', '🍽️',
]

function EditBreakfast({ registered, updateBreakfast, removeBreakfast, categories }) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('🍽️')
  const [editCategory, setEditCategory] = useState('staple')
  const [editOptions, setEditOptions] = useState([])
  const [editInStock, setEditInStock] = useState(true)

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditName(item.customName || item.name)
    setEditEmoji(item.emoji || '🍽️')
    setEditCategory(item.category || 'staple')
    setEditInStock(item.inStock !== false)
    setEditOptions(
      (item.options || []).map((o, i) => ({
        key: o.key || `opt-${i}`,
        label: o.label || '',
        values: [...(o.values || [])]
      }))
    )
  }

  const saveEdit = () => {
    if (!editingId) return
    const opts = editOptions
      .filter(o => o.label?.trim() && o.values?.some(v => v?.trim()))
      .map((o, i) => ({
        key: o.key || `opt-${i}`,
        label: o.label.trim(),
        values: o.values.filter(v => v?.trim()).map(v => v.trim())
      }))
    updateBreakfast(editingId, {
      customName: editName.trim(),
      emoji: editEmoji,
      category: editCategory,
      options: opts,
      inStock: editInStock
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const byCategory = {}
  registered.forEach(item => {
    const cat = item.category || 'staple'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(item)
  })

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <span>✏️</span> 修改早餐
      </h2>
      <p className="text-amber-800/80 text-sm mb-4">
        点击早餐卡片可修改名称、图标、分类与选项
      </p>
      {registered.length === 0 ? (
        <div className="text-center py-12 text-amber-800/70">
          <span className="text-4xl block mb-2">📝</span>
          <p>暂无可修改的早餐</p>
          <p className="text-xs mt-2">请先在「登陆早餐」中添加</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([catKey, items]) => (
            <div key={catKey}>
              <h3 className="text-amber-800 font-medium mb-2 flex items-center gap-1">
                <span>{categories[catKey]?.emoji || '🍽️'}</span>
                {categories[catKey]?.name || catKey}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`relative group ${editingId === item.id ? 'col-span-2 sm:col-span-3' : ''}`}
                  >
                    {editingId === item.id ? (
                      <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-md space-y-3">
                        <div>
                          <label className="block text-xs text-amber-800 mb-1">名称</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-amber-800 mb-1">图标</label>
                          <div className="flex flex-wrap gap-2">
                            {COMMON_EMOJIS.map(em => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => setEditEmoji(em)}
                                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                                  editEmoji === em ? 'bg-amber-300 scale-110' : 'bg-amber-100/80 hover:bg-amber-200'
                                }`}
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-amber-800 mb-1">分类</label>
                          <select
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          >
                            {Object.entries(categories).map(([key, c]) => (
                              <option key={key} value={key}>
                                {c.emoji} {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="block text-xs text-amber-800">库存状态</label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editInStock}
                              onChange={e => setEditInStock(e.target.checked)}
                              className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-300"
                            />
                            <span className="text-sm text-amber-900">有货</span>
                          </label>
                          <span className="text-xs text-amber-600">
                            {editInStock ? '✅ 有货' : '❌ 无货'}
                          </span>
                        </div>
                        <OptionsEditor options={editOptions} onChange={setEditOptions} />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 py-2 rounded-xl bg-amber-400 text-amber-900 font-medium hover:bg-amber-500 transition-colors"
                          >
                            保存
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-xl bg-amber-200/80 text-amber-800 hover:bg-amber-300 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => startEdit(item)}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/80 shadow-sm border border-amber-200/60 hover:shadow-md hover:border-amber-300 cursor-pointer transition-all duration-200"
                        >
                          <span className="text-3xl mb-1">{item.emoji}</span>
                          <span className="text-sm font-medium text-amber-900">
                            {item.customName || item.name}
                          </span>
                          {item.options?.length > 0 && (
                            <span className="text-xs text-amber-600 mt-1">
                              {item.options.length} 个选项
                            </span>
                          )}
                          {item.inStock === false && (
                            <span className="text-xs text-red-600 mt-1">无货</span>
                          )}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); removeBreakfast(item.id) }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-400 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity z-10"
                          title="删除"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EditBreakfast
