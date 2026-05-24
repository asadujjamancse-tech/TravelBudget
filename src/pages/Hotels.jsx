import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, MapPin } from 'lucide-react'
import { countries } from '../data/countries'
import { useApp } from '../context/AppContext'
import Footer from '../components/layout/Footer'

const TYPE_FILTERS = ['All', 'luxury', 'standard', 'budget']

export default function Hotels() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const { currencySymbol, convertCurrency } = useApp()

  const allHotels = useMemo(() =>
    countries.flatMap(c =>
      c.hotels.map(h => ({ ...h, country: c.name, countryId: c.id, flag: c.flag, countryImage: c.image }))
    ), [])

  const filtered = useMemo(() => allHotels.filter(h => {
    const q = query.toLowerCase()
    const matchQ = !q || h.name.toLowerCase().includes(q) || h.country.toLowerCase().includes(q) || h.area.toLowerCase().includes(q)
    const matchType = typeFilter === 'All' || h.type === typeFilter
    return matchQ && matchType
  }), [allHotels, query, typeFilter])

  const typeColors = {
    luxury:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    budget:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 py-16">
        <div className="section-container text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold mb-3">Hotels Worldwide</motion.h1>
          <p className="text-white/80 text-lg mb-8">From budget hostels to 7-star luxury — find your perfect stay</p>
          <div className="max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search hotels, countries, areas..." className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm" />
          </div>
        </div>
      </div>
      <div className="section-container py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPE_FILTERS.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${typeFilter === t ? 'bg-brand-600 text-white shadow-glow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-400'}`}>
              {t === 'All' ? 'All Types' : t}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400 self-center">{filtered.length} hotels</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((hotel, i) => (
            <motion.div key={`${hotel.countryId}-${hotel.name}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card card-hover">
              <div className="relative h-36 overflow-hidden">
                <img src={hotel.countryImage} alt={hotel.country} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-white">
                  <span className="text-lg">{hotel.flag}</span>
                  <span className="text-xs font-semibold">{hotel.country}</span>
                </div>
                <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full capitalize ${typeColors[hotel.type]}`}>{hotel.type}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 leading-tight">{hotel.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3"><MapPin size={10} /> {hotel.area}</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, j) => <Star key={j} size={11} className="text-amber-400 fill-amber-400" />)}
                  {hotel.stars > 5 && <span className="text-[10px] text-amber-500 font-bold">+{hotel.stars - 5}★</span>}
                  <span className="text-xs text-slate-400 ml-1">({hotel.rating})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{currencySymbol}{convertCurrency(hotel.pricePerNight)}</span>
                    <span className="text-xs text-slate-400">/night</span>
                  </div>
                  <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors">Book →</button>
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
