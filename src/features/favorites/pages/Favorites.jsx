import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
// FEATURE: FAVORITES
// PURPOSE: Shows all hearted countries (persisted in localStorage via AppContext)
// DEPENDENCIES: @data/countries, @context/AppContext, @features/countries/components/CountryCard
import { countries } from '@data/countries'
import { useApp } from '@context/AppContext'
import CountryCard from '@features/countries/components/CountryCard'
import Footer from '@components/layout/Footer'

export default function Favorites() {
  const { favorites } = useApp()
  const favCountries = countries.filter(c => favorites.includes(c.id))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 py-16">
        <div className="section-container text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
            <Heart className="fill-white" /> My Favourites
          </motion.h1>
          <p className="text-white/80 text-lg">Your saved destinations</p>
        </div>
      </div>

      <div className="section-container py-10">
        {favCountries.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No saved destinations yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Browse countries and tap the heart icon to save your favourites</p>
            <Link to="/explore" className="btn-primary"><ArrowRight size={16} /> Explore Destinations</Link>
          </div>
        ) : (
          <>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{favCountries.length} saved destination{favCountries.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favCountries.map((c, i) => <CountryCard key={c.id} country={c} index={i} />)}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
