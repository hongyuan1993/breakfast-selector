import { useState } from 'react'

function HistoryCalendar({ history }) {
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [selectedDate, setSelectedDate] = useState(null)

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

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <span>📅</span> 历史记录
      </h2>
      <p className="text-amber-800/80 text-sm mb-4">
        点击日期查看当日早餐
      </p>
      {history.length === 0 ? (
        <div className="text-center py-12 text-amber-800/70">
          <span className="text-4xl block mb-2">📭</span>
          <p>暂无历史记录</p>
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
              <div className="flex flex-wrap gap-2">
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
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HistoryCalendar
