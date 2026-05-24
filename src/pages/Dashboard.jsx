import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  LayoutDashboard, Heart, Map, Trash2, Plus, DollarSign,
  TrendingUp, Globe, ChevronRight, Wallet, Calendar,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useExpenses, EXPENSE_CATEGORIES } from '../hooks/useExpenses'
import { countries, getCountryById } from '../data/countries'
import Footer from '../components/layout/Footer'

// ─── Tiny sub-components ──────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-card">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

// Custom Recharts tooltip styled to match the brand theme
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-sm">
      {label && <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>}
      {payload.map(p => (
        <p key={p.name} className="font-bold" style={{ color: p.color || p.fill }}>
          ${Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  )
}

// ─── Tab: Expense Tracker ─────────────────────────────────────────────────────
function ExpenseTracker() {
  const { expenses, addExpense, removeExpense, clearAll, totalSpent, byCategory, last7Days } = useExpenses()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    description: '', amount: '', category: 'food', date: today, note: '',
  })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.description || !form.amount) return
    addExpense(form)
    setForm(f => ({ ...f, description: '', amount: '', note: '' }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Add expense form ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus size={16} className="text-brand-500" /> Add Expense
        </h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            required
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What did you spend on?"
            className="input-base text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="Amount ($)"
              className="input-base text-sm"
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="input-base text-sm"
            />
          </div>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="input-base text-sm"
          >
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <input
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Note (optional)"
            className="input-base text-sm"
          />
          <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm">
            <Plus size={15} /> Add Expense
          </button>
        </form>

        {/* Total summary */}
        {totalSpent > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total tracked</span>
              <span className="text-xl font-bold text-brand-600">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="text-xs text-slate-400">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</div>
            <button onClick={clearAll} className="mt-3 text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1">
              <Trash2 size={12} /> Clear all expenses
            </button>
          </div>
        )}
      </div>

      {/* ── Charts column ── */}
      <div className="space-y-5">
        {/* Pie chart by category */}
        {byCategory.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                  {byCategory.map(c => <Cell key={c.id} fill={c.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {byCategory.map(c => (
                <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                  {c.label}: <span className="font-semibold text-slate-800 dark:text-white">${c.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 text-center py-10">
            <Wallet size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Add expenses to see your spending breakdown</p>
          </div>
        )}

        {/* 7-day spending area chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="url(#spendGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Expense list ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm flex items-center gap-2">
          <Calendar size={14} className="text-brand-500" /> Recent Expenses
        </h3>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No expenses yet — add your first!</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {expenses.map(e => {
              const cat = EXPENSE_CATEGORIES.find(c => c.id === e.category) || EXPENSE_CATEGORIES[6]
              return (
                <div key={e.id} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-lg leading-none mt-0.5">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{e.description}</p>
                    <p className="text-xs text-slate-400">{e.date} · {cat.label}</p>
                    {e.note && <p className="text-xs text-slate-400 italic">{e.note}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-sm" style={{ color: cat.color }}>${Number(e.amount).toFixed(2)}</span>
                    <button onClick={() => removeExpense(e.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Saved Trips ─────────────────────────────────────────────────────────
function SavedTrips() {
  const { savedTrips, removeTrip } = useApp()

  if (!savedTrips.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-12 text-center">
        <Globe size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700 dark:text-white mb-2">No saved trips yet</h3>
        <p className="text-sm text-slate-400 mb-4">Use the budget calculator to plan a trip and save it here.</p>
        <Link to="/calculator" className="btn-primary">Open Calculator</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {savedTrips.map(trip => (
        <div key={trip.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{trip.country}</p>
              <p className="text-xs text-slate-400">{trip.duration} days · {trip.style}</p>
            </div>
            <button onClick={() => removeTrip(trip.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
          <p className="text-2xl font-bold text-brand-600 mb-1">${trip.total?.toLocaleString()}</p>
          <p className="text-xs text-slate-400">estimated total</p>
        </div>
      ))}
    </div>
  )
}

// ─── Tab: Favorites ───────────────────────────────────────────────────────────
function FavoritesList() {
  const { favorites, toggleFavorite } = useApp()
  const favCountries = favorites.map(id => getCountryById(id)).filter(Boolean)

  if (!favCountries.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-12 text-center">
        <Heart size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700 dark:text-white mb-2">No favorites yet</h3>
        <p className="text-sm text-slate-400 mb-4">Heart any country to save it here.</p>
        <Link to="/explore" className="btn-primary">Explore Countries</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {favCountries.map(c => (
        <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card card-hover">
          <div className="relative h-32 overflow-hidden">
            <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <button
              onClick={() => toggleFavorite(c.id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
            >
              <Heart size={13} fill="white" />
            </button>
            <span className="absolute bottom-2 left-2 text-xl">{c.flag}</span>
          </div>
          <div className="p-3">
            <p className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</p>
            <p className="text-xs text-slate-400">${c.budget.backpacker.perDay}/day</p>
            <Link to={`/country/${c.id}`} className="mt-2 text-xs text-brand-600 flex items-center gap-1 hover:gap-2 transition-all">
              View guide <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'expenses',  label: 'Expense Tracker', icon: Wallet },
  { id: 'trips',     label: 'Saved Trips',     icon: Map },
  { id: 'favorites', label: 'Favorites',        icon: Heart },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('expenses')
  const { favorites, savedTrips } = useApp()
  const { totalSpent, expenses } = useExpenses()

  const stats = [
    { icon: Wallet,      label: 'Total Tracked',    value: `$${totalSpent.toFixed(0)}`, sub: `${expenses.length} expenses`,         color: 'from-brand-500 to-purple-500' },
    { icon: Heart,       label: 'Favorites',         value: favorites.length,            sub: 'saved countries',                     color: 'from-rose-500 to-pink-500' },
    { icon: TrendingUp,  label: 'Saved Trips',       value: savedTrips.length,           sub: 'planned itineraries',                 color: 'from-amber-500 to-orange-500' },
    { icon: DollarSign,  label: 'Avg/Day (tracked)', value: expenses.length ? `$${(totalSpent / expenses.length).toFixed(0)}` : '—', sub: 'per expense entry', color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-700 via-purple-700 to-indigo-700 py-10">
        <div className="section-container text-white">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1 text-white/60 text-sm">
              <LayoutDashboard size={14} /> My Dashboard
            </div>
            <h1 className="font-display text-4xl font-bold">Travel Dashboard</h1>
            <p className="text-white/70 mt-1">Track spending, manage saved trips, and organize your travel plans.</p>
          </motion.div>
        </div>
      </div>

      <div className="section-container py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'expenses'  && <ExpenseTracker />}
          {activeTab === 'trips'     && <SavedTrips />}
          {activeTab === 'favorites' && <FavoritesList />}
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Explore Countries', '/explore', 'from-brand-500 to-purple-500'],
            ['Budget Calculator', '/calculator', 'from-amber-500 to-orange-500'],
            ['World Map', '/map', 'from-emerald-500 to-teal-500'],
            ['Compare Countries', '/compare', 'from-sky-500 to-blue-500'],
          ].map(([label, to, color]) => (
            <Link
              key={to}
              to={to}
              className={`rounded-2xl p-4 bg-gradient-to-br ${color} text-white font-semibold text-sm
                shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between`}
            >
              {label} <ChevronRight size={16} />
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
