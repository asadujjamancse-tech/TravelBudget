import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Star, MapPin, Shield, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function CountryCard({ country, index = 0 }) {
  const { isFavorite, toggleFavorite, currencySymbol, convertCurrency } = useApp()
  const fav = isFavorite(country.id)

  const safetyColor = {
    high:   'safety-high',
    medium: 'safety-medium',
    low:    'safety-low',
  }[country.safety] ?? 'safety-medium'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card card-hover border border-slate-100 dark:border-slate-700"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={country.image}
          alt={country.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); toggleFavorite(country.id) }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors duration-200"
        >
          <Heart
            size={16}
            className={fav ? 'text-rose-400 fill-rose-400' : 'text-white'}
          />
        </button>

        {/* Continent badge */}
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white rounded-full">
          {country.continent}
        </span>

        {/* Country name overlay */}
        <div className="absolute bottom-3 left-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{country.flag}</span>
            <div>
              <h3 className="font-bold text-lg leading-tight">{country.name}</h3>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <MapPin size={11} /> {country.capital}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <Link to={`/country/${country.id}`} className="block p-4">
        {/* Budget preview */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Backpacker', value: country.budget.backpacker.perDay, cls: 'badge-backpacker' },
            { label: 'Standard', value: country.budget.standard.perDay, cls: 'badge-standard' },
            { label: 'Luxury', value: country.budget.luxury.perDay, cls: 'badge-luxury' },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`text-center rounded-xl py-2 px-1 ${cls}`}>
              <div className="text-xs font-medium opacity-80">{label}</div>
              <div className="font-bold text-sm">{currencySymbol}{convertCurrency(value)}<span className="text-[10px] font-normal opacity-70">/day</span></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${safetyColor}`}>
              <Shield size={10} className="inline mr-0.5" />
              {country.safety.charAt(0).toUpperCase() + country.safety.slice(1)} Safety
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all duration-200">
            View Details <ChevronRight size={14} />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
