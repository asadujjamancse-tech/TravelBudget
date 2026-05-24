import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Clock, Tag, ArrowRight } from 'lucide-react'
import { travelTips, tipCategories } from '../data/tips'
import Footer from '../components/layout/Footer'

export default function TravelTips() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = travelTips.filter(t => {
    const q = query.toLowerCase()
    const matchQ = !q || t.title.toLowerCase().includes(q) || t.excerpt.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q))
    const matchCat = category === 'All' || t.category === category
    return matchQ && matchCat
  })

  const featured = travelTips.filter(t => t.featured).slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-16">
        <div className="section-container text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold mb-3">Travel Tips & Guides</motion.h1>
          <p className="text-white/80 text-lg mb-8">Expert advice to travel smarter, safer, and cheaper</p>
          <div className="max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tips, topics..." className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm" />
          </div>
        </div>
      </div>

      <div className="section-container py-10">
        {/* Featured */}
        {!query && category === 'All' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map((tip, i) => (
                <motion.article key={tip.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card card-hover">
                  <div className="relative h-44 overflow-hidden">
                    <img src={tip.image} alt={tip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 bg-emerald-500 text-white rounded-full">{tip.category}</span>
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full"><Clock size={11} /> {tip.readTime}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 leading-snug line-clamp-2">{tip.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{tip.excerpt}</p>
                    <button className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-2.5 transition-all duration-200">
                      Read more <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tipCategories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${category === c ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'}`}>{c}</button>
          ))}
        </div>

        {/* All tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tip, i) => (
            <motion.article key={tip.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card card-hover flex flex-col">
              <div className="relative h-40 overflow-hidden">
                <img src={tip.image} alt={tip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full">{tip.category}</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 leading-snug line-clamp-2">{tip.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{tip.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {tip.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full capitalize">{tag}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} /> {tip.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tips found</h3>
            <p className="text-slate-500">Try a different search or category</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
