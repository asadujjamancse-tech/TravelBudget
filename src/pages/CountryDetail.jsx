import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Heart, MapPin, Globe, Shield, Wifi, Calendar, Car, Train,
  ChevronLeft, Star, Info, DollarSign, Clock, Plane
} from 'lucide-react'
import { getCountryById } from '../data/countries'
import { useApp } from '../context/AppContext'
import BudgetChart from '../components/country/BudgetChart'
import HotelCard from '../components/country/HotelCard'
import RestaurantCard from '../components/country/RestaurantCard'
import AttractionCard from '../components/country/AttractionCard'
import Footer from '../components/layout/Footer'

export default function CountryDetail() {
  const { id } = useParams()
  const country = getCountryById(id)
  const { isFavorite, toggleFavorite, addToCompare, compareList } = useApp()

  if (!country) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="text-6xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Country not found</h2>
        <Link to="/explore" className="btn-primary mt-4">Back to Explore</Link>
      </div>
    )
  }

  const fav = isFavorite(country.id)
  const inCompare = compareList.includes(country.id)

  const safetyBadge = { high: 'safety-high', medium: 'safety-medium', low: 'safety-low' }[country.safety]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px]">
        <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Back */}
        <Link to="/explore" className="absolute top-24 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft size={18} /> All Destinations
        </Link>

        {/* Actions */}
        <div className="absolute top-24 right-6 flex gap-2">
          <button
            onClick={() => toggleFavorite(country.id)}
            className={`w-10 h-10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 ${fav ? 'bg-rose-500' : 'bg-black/30 hover:bg-black/50'}`}
          >
            <Heart size={18} className={fav ? 'text-white fill-white' : 'text-white'} />
          </button>
          <button
            onClick={() => addToCompare(country.id)}
            disabled={inCompare}
            className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20 transition-all duration-200 ${inCompare ? 'bg-brand-600 text-white' : 'bg-black/30 hover:bg-black/50 text-white'}`}
          >
            {inCompare ? '✓ In Compare' : '+ Compare'}
          </button>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="section-container">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-5xl">{country.flag}</span>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-white">{country.name}</h1>
                    <p className="text-white/70 flex items-center gap-2 mt-1">
                      <MapPin size={14} /> {country.capital}
                      <span className="text-white/40">·</span>
                      <Globe size={14} /> {country.continent}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${safetyBadge}`}>
                    <Shield size={11} className="inline mr-1" />
                    {country.safety.charAt(0).toUpperCase() + country.safety.slice(1)} Safety
                  </span>
                  {country.bestSeasons.slice(0, 1).map(s => (
                    <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      <Calendar size={11} className="inline mr-1" /> {s}
                    </span>
                  ))}
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {country.currency.code} {country.currency.symbol}
                  </span>
                </div>
              </div>
              <Link to="/calculator" className="btn-accent">
                <Plane size={16} /> Plan This Trip
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About {country.name}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{country.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {country.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full capitalize">{tag}</span>
                ))}
              </div>
            </section>

            {/* Budget */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Travel Budget</h2>
              <BudgetChart country={country} />
            </section>

            {/* Hotels */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Where to Stay</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {country.hotels.map(h => <HotelCard key={h.name} hotel={h} />)}
              </div>
            </section>

            {/* Restaurants */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Where to Eat</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {country.restaurants.map(r => <RestaurantCard key={r.name} restaurant={r} />)}
              </div>
            </section>

            {/* Attractions */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Top Attractions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {country.attractions.map(a => <AttractionCard key={a.name} attraction={a} />)}
              </div>
            </section>

            {/* Weather */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Climate & Weather</h2>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={country.weather}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="°C" />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }}
                      formatter={(v) => [`${v}°C`, 'Avg Temp']}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#8b5cf6" strokeWidth={2} fill="url(#tempGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-3">
                  {country.bestSeasons.map(s => (
                    <span key={s} className="text-xs px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full font-medium">
                      Best: {s}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: sidebar */}
          <aside className="space-y-5">
            {/* Quick Facts */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Facts</h3>
              {[
                { icon: Globe, label: 'Capital', value: country.capital },
                { icon: Info, label: 'Language', value: country.language },
                { icon: Clock, label: 'Timezone', value: country.timezone },
                { icon: DollarSign, label: 'Currency', value: `${country.currency.code} (${country.currency.symbol})` },
                { icon: Globe, label: 'Population', value: country.population },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <Icon size={15} className="text-brand-500 flex-shrink-0" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 w-24">{label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</span>
                </div>
              ))}
            </div>

            {/* Visa */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Plane size={16} className="text-brand-500" /> Visa Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Type</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{country.visa.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Duration</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{country.visa.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cost</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{country.visa.cost}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">{country.visa.notes}</p>
            </div>

            {/* Transport */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Car size={16} className="text-brand-500" /> Getting Around
              </h3>
              {[
                { icon: Train, label: 'Public Transit', value: country.transport.publicTransport },
                { icon: Car, label: 'Car Rental', value: country.transport.carRental },
                { icon: MapPin, label: 'Taxi / Rideshare', value: country.transport.taxi },
                { icon: Plane, label: 'Airport', value: country.transport.airport },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={13} className="text-brand-500" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
                </div>
              ))}
            </div>

            {/* Internet */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Wifi size={16} className="text-brand-500" /> Internet & SIM
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{country.internet.simCard}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full" style={{ width: `${Math.min((parseFloat(country.internet.avgSpeed) / 150) * 100, 100)}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{country.internet.avgSpeed}</span>
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-4">Top Highlights</h3>
              <ul className="space-y-2">
                {country.highlights.map(h => (
                  <li key={h} className="flex items-center gap-2 text-sm text-white/90">
                    <Star size={13} className="text-amber-400 fill-amber-400 flex-shrink-0" /> {h}
                  </li>
                ))}
              </ul>
              <Link to="/calculator" className="btn-glass w-full justify-center mt-5">
                Calculate Budget
              </Link>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}
