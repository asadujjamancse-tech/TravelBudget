import { useLocalStorage } from '@hooks/useLocalStorage'

// Each category has a stable id (used as localStorage key), display label,
// emoji icon, and brand-matched color for Recharts / UI.
export const EXPENSE_CATEGORIES = [
  { id: 'accommodation', label: 'Accommodation', icon: '🏨', color: '#8b5cf6' },
  { id: 'food',          label: 'Food & Drinks',  icon: '🍜', color: '#f97316' },
  { id: 'transport',     label: 'Transport',       icon: '🚌', color: '#3b82f6' },
  { id: 'activities',    label: 'Activities',      icon: '🎭', color: '#10b981' },
  { id: 'shopping',      label: 'Shopping',        icon: '🛍️', color: '#ec4899' },
  { id: 'health',        label: 'Health',          icon: '🏥', color: '#ef4444' },
  { id: 'other',         label: 'Other',           icon: '📦', color: '#94a3b8' },
]

export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage('travel_expenses', [])

  const addExpense = (expense) =>
    setExpenses(prev => [{ ...expense, id: Date.now() }, ...prev])

  const removeExpense = (id) =>
    setExpenses(prev => prev.filter(e => e.id !== id))

  const clearAll = () => setExpenses([])

  // Total across all recorded expenses
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // Aggregate amounts per category (only include categories that have spend)
  const byCategory = EXPENSE_CATEGORIES
    .map(cat => ({
      ...cat,
      value: expenses
        .filter(e => e.category === cat.id)
        .reduce((sum, e) => sum + Number(e.amount), 0),
    }))
    .filter(c => c.value > 0)

  // Last 7 days of spending, grouped by date — used for the timeline chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const dayLabel = d.toLocaleDateString('en', { weekday: 'short' })
    const amount = expenses
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + Number(e.amount), 0)
    return { date: dayLabel, amount: parseFloat(amount.toFixed(2)) }
  })

  return { expenses, addExpense, removeExpense, clearAll, totalSpent, byCategory, last7Days }
}
