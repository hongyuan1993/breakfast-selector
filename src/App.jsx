import { useState } from 'react'
import { useBreakfast } from './hooks/useBreakfast'
import AddBreakfast from './components/AddBreakfast'
import EditBreakfast from './components/EditBreakfast'
import SelectBreakfast from './components/SelectBreakfast'
import HistoryCalendar from './components/HistoryCalendar'

const TABS = [
  { id: 'select', label: '选择', icon: '🍽️' },
  { id: 'add', label: '添加', icon: '➕' },
  { id: 'edit', label: '修改', icon: '✏️' },
  { id: 'history', label: '历史', icon: '📅' },
]

function App() {
  const [tab, setTab] = useState('select')
  const breakfast = useBreakfast()

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-amber-400 via-orange-300 to-amber-400 shadow-md">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-amber-900 flex items-center justify-center gap-2">
            <span>🍳</span> 大宝早餐选择
          </h1>
        </div>
        <nav className="flex border-t border-amber-500/30">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? 'text-amber-900 bg-amber-200/80'
                  : 'text-amber-800/80 hover:bg-amber-100/50'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="min-h-[60vh]">
        {breakfast.loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-amber-800">
            <span className="text-4xl mb-4 animate-pulse">🍳</span>
            <p>加载中...</p>
          </div>
        ) : (
          <>
            {tab === 'add' && (
              <AddBreakfast
                registerCustomBreakfast={breakfast.registerCustomBreakfast}
                categories={breakfast.categories}
              />
            )}
            {tab === 'edit' && (
              <EditBreakfast
                registered={breakfast.registered}
                updateBreakfast={breakfast.updateBreakfast}
                removeBreakfast={breakfast.removeBreakfast}
                categories={breakfast.categories}
              />
            )}
            {tab === 'select' && (
              <SelectBreakfast
                registered={breakfast.registered}
                saveSelection={breakfast.saveSelection}
                categories={breakfast.categories}
              />
            )}
            {tab === 'history' && (
              <HistoryCalendar history={breakfast.history} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
