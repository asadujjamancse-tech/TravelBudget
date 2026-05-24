import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight, MapPin } from 'lucide-react'
import { trendingCountries } from '../../data/countries'
import { useApp } from '../../context/AppContext'

export default function TrendingSection() {
  const { currencySymbol, convertCurrency } = useApp()

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="section-container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-accent-500 font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-2"
            >
              <TrendingUp size={14} /> Rising Fast
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Trending Destinations
            </motion.h2>
          </div>
          <Link to="/explore" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all duration-200">
            See all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingCountries.map((country, i) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={`/country/${country.id}`}
                className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card card-hover"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={country.image}
                    alt={country.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{country.flag}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{country.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                    <MapPin size={11} /> {country.capital}, {country.continent}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {currencySymbol}{convertCurrency(country.budget.backpacker.perDay)}
                      <span className="text-xs text-slate-400 font-normal">/day</span>
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-semibold">
                      Trending
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
