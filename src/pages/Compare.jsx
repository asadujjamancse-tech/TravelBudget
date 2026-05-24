import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { X, Plus, Shield, Wifi, DollarSign, Calendar, Globe, Plane } from 'lucide-react'
import { countries } from '../data/countries'
import { useApp } from '../context/AppContext'
import Footer from '../components/layout/Footer'

const COLORS = ['#8b5cf6', '#f97316', '#10b981']

export default function Compare() {
  const { compareList, addToCompare, removeFromCompare, clearCompare, currencySymbol, convertCurrency } = useApp()

  const selected = compareList.map(id => countries.find(c => c.id === id)).filter(Boolean)
  const available = countries.filter(c => !compareList.includes(c.id))

  const radarData = ['Hotel', 'Food', 'Transport', 'Activities'].map(cat => {
    const key = cat.toLowerCase()
    const row = { subject: cat }
    selected.forEach((c, i) => {
      row[c.name] = c.budget.standard[key] ?? 0
    })
    return row
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 py-16">
        <div className="section-container text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold mb-3">
            Compare Destinations
          </motion.h1>
          <p className="text-white/80 text-lg">Side-by-side comparison of up to 3 countries</p>
        </div>
      </div>

      <div className="section-container py-10">
        {/* Add country */}
        {compareList.length < 3 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Add a destination ({3 - compareList.length} slot{3 - compareList.length !== 1 ? 's' : ''} remaining)
            </h3>
            <div className="flex flex-wrap gap-2">
              {available.slice(0, 20).map(c => (
                <button
                  key={c.id}
                  onClick={() => addToCompare(c.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm hover:border-brand-400 transition-all duration-200"
                >
                  <span>{c.flag}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                  <Plus size={13} className="text-brand-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {selected.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No countries selected</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Add up to 3 countries above to start comparing</p>
            <Link to="/explore" className="btn-primary">Browse Destinations</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comparison Results</h2>
              <button onClick={clearCompare} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5">
                <X size={14} /> Clear All
              </button>
            </div>

            {/* Country header cards */}
            <div className={`grid gap-4 mb-8 grid-cols-${selected.length}`} style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}>
              {selected.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl overflow-hidden shadow-card"
                >
                  <img src={c.image} alt={c.name} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <button
                    onClick={() => removeFromCompare(c.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <h3 className="font-bold">{c.name}</h3>
                        <p className="text-xs text-white/70">{c.continent}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <th className="text-left p-4 text-slate-500 dark:text-slate-400 font-medium w-40">Metric</th>
                      {selected.map((c, i) => (
                        <th key={c.id} className="p-4 text-center font-bold" style={{ color: COLORS[i] }}>
                          {c.flag} {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: '💰 Daily Budget (backpacker)', get: c => `${currencySymbol}${convertCurrency(c.budget.backpacker.perDay)}` },
                      { label: '🏨 Hotel / night (mid)', get: c => `${currencySymbol}${convertCurrency(c.budget.standard.hotel)}` },
                      { label: '🍽️ Food / day (mid)', get: c => `${currencySymbol}${convertCurrency(c.budget.standard.food)}` },
                      { label: '🚌 Transport / day (mid)', get: c => `${currencySymbol}${convertCurrency(c.budget.standard.transport)}` },
                      { label: '💎 Daily Budget (luxury)', get: c => `${currencySymbol}${convertCurrency(c.budget.luxury.perDay)}` },
                      { label: '🛡️ Safety', get: c => c.safety.charAt(0).toUpperCase() + c.safety.slice(1) },
                      { label: '💱 Currency', get: c => `${c.currency.code} (${c.currency.symbol})` },
                      { label: '🌐 Language', get: c => c.language },
                      { label: '📅 Best Season', get: c => c.bestSeasons[0] },
                      { label: '✈️ Visa', get: c => c.visa.type },
                      { label: '📶 Internet Speed', get: c => c.internet.avgSpeed },
                    ].map(({ label, get }) => (
                      <tr key={label} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="p-4 text-slate-600 dark:text-slate-400">{label}</td>
                        {selected.map(c => (
                          <td key={c.id} className="p-4 text-center font-medium text-slate-900 dark:text-white">{get(c)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Radar Chart */}
            {selected.length > 1 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Standard Daily Cost Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    {selected.map((c, i) => (
                      <Radar key={c.id} name={c.name} dataKey={c.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                    ))}
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }} formatter={(v) => [`$${v}/day`, '']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
