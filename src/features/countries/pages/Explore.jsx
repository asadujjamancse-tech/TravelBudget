import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
// FEATURE: COUNTRY EXPLORER
// PURPOSE: Browse + filter all destinations by continent, budget, and tags
// DEPENDENCIES: @data/countries, CountryCard (within feature), @components/layout/Footer
import { countries, continents, allTags } from '@data/countries'
import CountryCard from '../components/CountryCard'
import Footer from '@components/layout/Footer'
import { usePageContext } from '@hooks/usePageContext'

export default function Explore() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [continent, setContinent] = useState(searchParams.get('continent') || 'All')
  const [budget, setBudget] = useState('All')
  const [selectedTags, setSelectedTags] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const budgetRanges = {
    All: null,
    Budget: [0, 50],
    Mid: [50, 120],
    Luxury: [120, Infinity],
  }

  const toggleTag = (tag) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const filtered = useMemo(() => {
    return countries.filter(c => {
      const q = query.toLowerCase()
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q) || c.tags.some(t => t.includes(q))
      const matchContinent = continent === 'All' || c.continent === continent
      const range = budgetRanges[budget]
      const matchBudget = !range || (c.budget.backpacker.perDay >= range[0] && c.budget.backpacker.perDay < range[1])
      const matchTags = selectedTags.length === 0 || selectedTags.every(t => c.tags.includes(t))
      return matchSearch && matchContinent && matchBudget && matchTags
    })
  }, [query, continent, budget, selectedTags])

  const clearAll = () => { setQuery(''); setContinent('All'); setBudget('All'); setSelectedTags([]) }
  const hasFilters = query || continent !== 'All' || budget !== 'All' || selectedTags.length > 0

  // Report active filters so the AI can give scoped answers like
  // "cheapest in Asia" when the user already has Asia selected.
  usePageContext(
    () => ({ currentPage: 'explore', activeFilters: { continent, budget, tags: selectedTags, query } }),
    [continent, budget, selectedTags.join(','), query]
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 py-16">
        <div className="section-container text-white text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl font-bold mb-4"
          >
            Explore the World
          </motion.h1>
          <p className="text-white/80 text-lg mb-8">Real travel budgets for every destination</p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search countries, cities..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="section-container py-10">
        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Continent Pills */}
          <div className="flex flex-wrap gap-2">
            {continents.map(c => (
              <button
                key={c}
                onClick={() => setContinent(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  continent === c
                    ? 'bg-brand-600 text-white shadow-glow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-brand-400 transition-all"
            >
              <SlidersHorizontal size={15} /> Filters
              {hasFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
            </button>
            {hasFilters && (
              <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Budget Range</p>
                <div className="flex gap-2">
                  {['All', 'Budget', 'Mid', 'Luxury'].map(b => (
                    <button key={b} onClick={() => setBudget(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${budget === b ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20'}`}
                    >{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Travel Style Tags</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${selectedTags.includes(tag) ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20'}`}
                    >{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {filtered.length} destination{filtered.length !== 1 ? 's' : ''} found
          {continent !== 'All' && ` in ${continent}`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((country, i) => (
              <CountryCard key={country.id} country={country} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No destinations found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters</p>
            <button onClick={clearAll} className="btn-primary">Clear All Filters</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
