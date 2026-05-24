import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, Utensils } from 'lucide-react'
// FEATURE: RESTAURANTS
// PURPOSE: Browse all restaurants across countries, filtered by price range
// DEPENDENCIES: @data/countries
import { countries } from '@data/countries'
import Footer from '@components/layout/Footer'

const PRICE_FILTERS = ['All', '$', '$$', '$$$', '$$$$']

export default function Restaurants() {
  const [query, setQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('All')

  const allRestaurants = useMemo(() =>
    countries.flatMap(c =>
      c.restaurants.map(r => ({ ...r, country: c.name, countryId: c.id, flag: c.flag, countryImage: c.image }))
    ), [])

  const filtered = useMemo(() => allRestaurants.filter(r => {
    const q = query.toLowerCase()
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    const matchPrice = priceFilter === 'All' || r.priceRange === priceFilter
    return matchQ && matchPrice
  }), [allRestaurants, query, priceFilter])

  const priceColor = { '$': 'text-emerald-600', '$$': 'text-blue-600', '$$$': 'text-purple-600', '$$$$': 'text-rose-600' }
  const priceLabel = { '$': 'Budget', '$$': 'Moderate', '$$$': 'Upscale', '$$$$': 'Fine Dining' }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-gradient-to-r from-accent-500 via-rose-500 to-pink-600 py-16">
        <div className="section-container text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold mb-3">Restaurants Worldwide</motion.h1>
          <p className="text-white/80 text-lg mb-8">From street food stalls to Michelin-starred tables</p>
          <div className="max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search restaurants, cuisines, countries..." className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm" />
          </div>
        </div>
      </div>
      <div className="section-container py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {PRICE_FILTERS.map(p => (
            <button key={p} onClick={() => setPriceFilter(p)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${priceFilter === p ? 'bg-accent-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-accent-400'}`}>
              {p === 'All' ? 'All Prices' : `${p} · ${priceLabel[p]}`}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400 self-center">{filtered.length} restaurants</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((r, i) => (
            <motion.div key={`${r.countryId}-${r.name}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card card-hover">
              <div className="relative h-32 overflow-hidden">
                <img src={r.countryImage} alt={r.country} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white text-xs font-semibold flex items-center gap-1">
                  <span>{r.flag}</span><span>{r.country}</span>
                </div>
                <span className={`absolute top-2 right-2 text-sm font-bold ${priceColor[r.priceRange] ?? 'text-slate-400'} bg-white dark:bg-slate-800 rounded-full px-2 py-0.5`}>{r.priceRange}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <Utensils size={14} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{r.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.type} · {r.cuisine}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: Math.round(r.rating) }).map((_, j) => <Star key={j} size={11} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-xs text-slate-400 ml-1">{r.rating}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 mb-0.5">Must try</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{r.mustTry}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
