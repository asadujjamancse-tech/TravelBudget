import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { popularDestinations } from '@data/countries'
import { useApp } from '@context/AppContext'

export default function PopularDestinations() {
  const scrollRef = useRef(null)
  const { currencySymbol, convertCurrency } = useApp()

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="section-container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider mb-2"
            >
              Most Visited
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Popular Destinations
            </motion.h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        >
          {popularDestinations.map((country, i) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-none w-72"
            >
              <Link to={`/country/${country.id}`} className="group block">
                <div className="relative h-80 rounded-2xl overflow-hidden shadow-card">
                  <img
                    src={country.image}
                    alt={country.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {country.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{country.flag}</span>
                      <h3 className="text-white font-bold text-xl">{country.name}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs mb-0.5">Budget from</p>
                        <p className="text-white font-bold text-lg">
                          {currencySymbol}{convertCurrency(country.budget.backpacker.perDay)}
                          <span className="text-white/60 text-xs font-normal">/day</span>
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-brand-600 backdrop-blur-sm flex items-center justify-center transition-colors duration-300">
                        <ArrowRight size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/explore" className="btn-ghost">
            View All Destinations <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
