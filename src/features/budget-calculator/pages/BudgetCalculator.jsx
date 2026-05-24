import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calculator, Plane, Bed, UtensilsCrossed, Train, MapPin, DollarSign, Download } from 'lucide-react'
// FEATURE: BUDGET CALCULATOR
// PURPOSE: Select country + duration + style → instant cost breakdown with pie chart
// DEPENDENCIES: @data/countries, @context/AppContext
import { countries } from '@data/countries'
import { useApp } from '@context/AppContext'
import Footer from '@components/layout/Footer'

const TIERS = ['backpacker', 'standard', 'luxury']
const TIER_LABELS = { backpacker: '🎒 Backpacker', standard: '✈️ Standard', luxury: '👑 Luxury' }
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316']

export default function BudgetCalculator() {
  const [selectedCountry, setSelectedCountry] = useState('')
  const [tier, setTier] = useState('standard')
  const [days, setDays] = useState(7)
  const [travelers, setTravelers] = useState(1)
  const [flightCost, setFlightCost] = useState(600)
  const [calculated, setCalculated] = useState(false)

  const { currencySymbol, convertCurrency } = useApp()

  const country = useMemo(() => countries.find(c => c.id === selectedCountry), [selectedCountry])

  const budget = useMemo(() => {
    if (!country) return null
    const b = country.budget[tier]
    const hotelTotal      = b.hotel      * days
    const foodTotal       = b.food       * days
    const transportTotal  = b.transport  * days
    const activitiesTotal = b.activities * days
    const perPersonTotal  = hotelTotal + foodTotal + transportTotal + activitiesTotal
    const flightPerPerson = flightCost / travelers
    const grandTotal      = (perPersonTotal + flightPerPerson) * travelers

    return {
      hotel:      hotelTotal,
      food:       foodTotal,
      transport:  transportTotal,
      activities: activitiesTotal,
      perDay:     b.perDay,
      perPerson:  perPersonTotal + flightPerPerson,
      flight:     flightPerPerson,
      grand:      grandTotal,
    }
  }, [country, tier, days, travelers, flightCost])

  const pieData = budget ? [
    { name: 'Hotel',      value: budget.hotel },
    { name: 'Food',       value: budget.food },
    { name: 'Transport',  value: budget.transport },
    { name: 'Activities', value: budget.activities },
  ] : []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 py-16">
        <div className="section-container text-white text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm mb-5">
            <Calculator size={15} className="text-brand-300" /> Smart Budget Calculator
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl sm:text-5xl font-bold mb-3">
            Plan Your Trip Budget
          </motion.h1>
          <p className="text-white/80 text-lg">Get an instant, realistic cost estimate for any destination</p>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trip Details</h2>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <MapPin size={14} className="inline mr-1.5" /> Destination
              </label>
              <select
                value={selectedCountry}
                onChange={e => { setSelectedCountry(e.target.value); setCalculated(false) }}
                className="input-base"
              >
                <option value="">Select a country...</option>
                {countries.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                  <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Travel Style</label>
              <div className="grid grid-cols-3 gap-3">
                {TIERS.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTier(t); setCalculated(false) }}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                      tier === t
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
                    }`}
                  >
                    {TIER_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Duration: <span className="text-brand-600 dark:text-brand-400">{days} days</span>
              </label>
              <input
                type="range" min={1} max={90} value={days}
                onChange={e => { setDays(Number(e.target.value)); setCalculated(false) }}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 day</span><span>90 days</span>
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Travelers</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setTravelers(t => Math.max(1, t - 1))} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">−</button>
                <span className="w-12 text-center text-xl font-bold text-slate-900 dark:text-white">{travelers}</span>
                <button onClick={() => setTravelers(t => Math.min(20, t + 1))} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">+</button>
              </div>
            </div>

            {/* Flights */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Plane size={14} className="inline mr-1.5" /> Total Return Flight Cost: <span className="text-brand-600 dark:text-brand-400">{currencySymbol}{convertCurrency(flightCost)}</span>
              </label>
              <input
                type="range" min={0} max={5000} step={50} value={flightCost}
                onChange={e => { setFlightCost(Number(e.target.value)); setCalculated(false) }}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Free (already have flights)</span><span>{currencySymbol}{convertCurrency(5000)}</span>
              </div>
            </div>

            <button
              onClick={() => setCalculated(true)}
              disabled={!selectedCountry}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator size={18} /> Calculate Budget
            </button>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {calculated && budget && country ? (
              <div className="space-y-5">
                {/* Grand Total */}
                <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-6 text-white text-center shadow-glow">
                  <p className="text-white/70 text-sm mb-1">Total estimated budget</p>
                  <p className="text-5xl font-display font-bold mb-1">
                    {currencySymbol}{convertCurrency(budget.grand)}
                  </p>
                  <p className="text-white/70 text-sm">
                    for {travelers} {travelers === 1 ? 'person' : 'people'} · {days} days · {country.name} · {TIER_LABELS[tier]}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-white/60 text-xs">Per person total</p>
                      <p className="text-xl font-bold">{currencySymbol}{convertCurrency(budget.perPerson)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-white/60 text-xs">Daily budget</p>
                      <p className="text-xl font-bold">{currencySymbol}{convertCurrency(budget.perDay)}/day</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-card">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Cost Breakdown (total trip)</h3>
                  {[
                    { icon: Plane,           label: 'Flights',    value: budget.flight * travelers, color: 'text-purple-500' },
                    { icon: Bed,             label: 'Hotel',      value: budget.hotel * travelers,  color: 'text-blue-500' },
                    { icon: UtensilsCrossed, label: 'Food',       value: budget.food * travelers,   color: 'text-emerald-500' },
                    { icon: Train,           label: 'Transport',  value: budget.transport * travelers, color: 'text-accent-500' },
                    { icon: MapPin,          label: 'Activities', value: budget.activities * travelers, color: 'text-rose-500' },
                  ].map(({ icon: Icon, label, value, color }) => {
                    const pct = Math.round((value / budget.grand) * 100)
                    return (
                      <div key={label} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                        <Icon size={16} className={color} />
                        <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{label}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white w-20 text-right">
                            {currencySymbol}{convertCurrency(value)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pie chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-card">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">In-Destination Spending</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${currencySymbol}${convertCurrency(v * travelers)}`, '']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12, color: '#f1f5f9' }} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Link to={`/country/${country.id}`} className="btn-ghost w-full justify-center">
                  View Full {country.name} Guide
                </Link>
              </div>
            ) : (
              <div className="h-full min-h-[400px] bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center">
                <DollarSign size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your budget estimate will appear here</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Select a destination and travel style, then click Calculate</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
