const STORAGE_KEYS = {
  REGISTERED: 'breakfast_registered',
  HISTORY: 'breakfast_history',
}

export function getRegisteredBreakfasts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTERED)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveRegisteredBreakfasts(items) {
  localStorage.setItem(STORAGE_KEYS.REGISTERED, JSON.stringify(items))
}

export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveHistory(records) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records))
}

export function addHistoryRecord(record) {
  const history = getHistory()
  // 同一天只保留最新记录
  const filtered = history.filter(r => r.date !== record.date)
  filtered.unshift(record)
  saveHistory(filtered)
}
