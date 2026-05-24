import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, TrendingUp, Globe, Plane } from 'lucide-react'
import { countries } from '../../data/countries'

const heroImages = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1480796927426-3308e9062a91?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&auto=format&fit=crop&q=80',
]

const floatingCards = [
  { icon: '🇫🇷', country: 'Paris', price: '$65/day', top: '20%', left: '5%' },
  { icon: '🇯🇵', country: 'Tokyo', price: '$50/day', top: '60%', right: '5%' },
  { icon: '🇮🇩', country: 'Bali', price: '$28/day', bottom: '20%', left: '8%' },
]

export default function Hero() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const navigate = useNavigate()

  const handleSearch = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.length > 1) {
      setSuggestions(
        countries.filter(c =>
          c.name.toLowerCase().includes(val.toLowerCase()) ||
          c.capital.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 5)
      )
    } else {
      setSuggestions([])
    }
  }

  const go = (id) => { setSuggestions([]); setQuery(''); navigate(`/country/${id}`) }
  const submit = (e) => {
    e.preventDefault()
    if (suggestions.length > 0) go(suggestions[0].id)
    else navigate(`/explore?q=${query}`)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImages[0]}
          alt="Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/40 via-transparent to-purple-900/30" />
      </div>

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse2" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse2" style={{ animationDelay: '1.5s' }} />

      {/* Floating Cards */}
      {floatingCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 + i * 0.2, duration: 0.5 }}
          style={{ top: card.top, left: card.left, right: card.right, bottom: card.bottom, position: 'absolute', animationDelay: `${i * 0.8}s` }}
          className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white animate-float"
        >
          <span className="text-2xl">{card.icon}</span>
          <div>
            <div className="font-semibold text-sm">{card.country}</div>
            <div className="text-xs text-white/70">{card.price}</div>
          </div>
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative section-container text-white text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
            <TrendingUp size={15} className="text-brand-300" />
            <span className="text-white/90">Trusted by 50,000+ travelers worldwide</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-balance"
        >
          Plan Your Dream Trip
          <span className="block bg-gradient-to-r from-brand-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Without Surprises
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          Real travel cost data for 25+ countries — hotels, food, transport, and activities — so you can budget with confidence.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative max-w-2xl mx-auto"
        >
          <form onSubmit={submit} className="relative">
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 pl-5 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search destinations, countries, cities..."
                className="flex-1 px-4 py-5 text-slate-900 dark:text-white bg-transparent text-base focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="m-2 btn-primary rounded-xl py-3 px-6 whitespace-nowrap"
              >
                <Plane size={16} />
                Explore
              </button>
            </div>
          </form>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
            >
              {suggestions.map(c => (
                <button
                  key={c.id}
                  onClick={() => go(c.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors duration-150"
                >
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={11} /> {c.capital} · {c.continent}
                    </div>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-brand-600 dark:text-brand-400">
                    from ${c.budget.backpacker.perDay}/day
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6"
        >
          <span className="text-white/60 text-sm">Popular:</span>
          {['France', 'Japan', 'Bali', 'Thailand', 'Italy'].map(name => (
            <button
              key={name}
              onClick={() => {
                const c = countries.find(c => c.name === name)
                if (c) navigate(`/country/${c.id}`)
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/90 hover:text-white transition-all duration-200"
            >
              {name}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-xs">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
