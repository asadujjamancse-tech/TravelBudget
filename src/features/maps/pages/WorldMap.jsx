import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
// Leaflet's default CSS is required for the map to render correctly
import 'leaflet/dist/leaflet.css'
import { MapPin, Filter, TrendingUp, DollarSign, Shield, ChevronRight } from 'lucide-react'
import { countries } from '@data/countries'
import { useTheme } from '@context/ThemeContext'

// ─── Coordinates for every country in countries.js ───────────────────────────
// Stored here to keep countries.js clean of map-specific data.
const COORDS = {
  france:      [46.23,   2.21],
  italy:       [41.87,  12.57],
  spain:       [40.46,  -3.75],
  greece:      [39.07,  21.82],
  iceland:     [64.96, -19.02],
  portugal:    [39.40,  -8.22],
  japan:       [36.20, 138.25],
  thailand:    [15.87, 100.99],
  bali:        [-8.34, 115.09],
  vietnam:     [14.06, 108.28],
  india:       [20.59,  78.96],
  uae:         [23.42,  53.85],
  turkey:      [38.96,  35.24],
  singapore:   [1.35,  103.82],
  usa:         [37.09, -95.71],
  canada:      [56.13, -106.35],
  mexico:      [23.63, -102.55],
  brazil:      [-14.24, -51.93],
  peru:        [-9.19,  -75.02],
  morocco:     [31.79,   -7.09],
  egypt:       [26.82,  30.80],
  australia:   [-25.27, 133.78],
  newzealand:  [-40.90, 174.89],
  southafrica: [-30.56,  22.94],
  nepal:       [28.39,  84.12],
  colombia:    [4.57,  -74.30],
}

// Color-code pins by daily backpacker cost tier
function pinColor(perDay) {
  if (perDay < 55)  return '#10b981' // emerald  — budget
  if (perDay < 100) return '#f97316' // orange   — mid-range
  return '#8b5cf6'                   // violet   — expensive
}

// Build a branded circular map pin using Leaflet's divIcon
function buildIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:${color};border:3px solid white;
        box-shadow:0 3px 10px rgba(0,0,0,0.35);
        transform:rotate(-45deg);
        cursor:pointer;
      "></div>`,
    iconSize:    [36, 36],
    iconAnchor:  [18, 36],
    popupAnchor: [0, -38],
  })
}

const BUDGET_FILTERS = ['All', 'Budget (<$55)', 'Mid-range', 'Expensive (>$100)']
const CONTINENT_FILTERS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']

export default function WorldMap() {
  const { dark } = useTheme()
  const [budgetFilter, setBudgetFilter] = useState('All')
  const [continentFilter, setContinentFilter] = useState('All')
  const [selected, setSelected] = useState(null) // currently highlighted country

  // Apply filters to reduce which pins are shown
  const visible = useMemo(() => {
    return countries.filter(c => {
      if (!COORDS[c.id]) return false // skip any country without coordinates

      if (continentFilter !== 'All' && c.continent !== continentFilter) return false

      const perDay = c.budget.backpacker.perDay
      if (budgetFilter === 'Budget (<$55)'     && perDay >= 55)  return false
      if (budgetFilter === 'Mid-range'          && (perDay < 55 || perDay >= 100)) return false
      if (budgetFilter === 'Expensive (>$100)' && perDay < 100) return false

      return true
    })
  }, [budgetFilter, continentFilter])

  // CartoDB tiles look far more polished than default OSM; they're free & no key needed.
  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 lg:pt-20 flex flex-col">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-700 via-purple-600 to-indigo-600 py-8">
        <div className="section-container text-white">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={20} />
              <span className="text-sm font-medium text-white/70 uppercase tracking-wider">Interactive</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">World Travel Map</h1>
            <p className="text-white/75 mt-1 text-sm">
              Click any pin to see real daily costs, safety, and visa info — then jump straight to the full country guide.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="section-container py-3 flex flex-wrap items-center gap-4">
          {/* Budget filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Budget</span>
            <div className="flex gap-1 flex-wrap">
              {BUDGET_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setBudgetFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    budgetFilter === f
                      ? 'bg-brand-600 text-white shadow-glow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Continent filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Region</span>
            <select
              value={continentFilter}
              onChange={e => setContinentFilter(e.target.value)}
              className="text-xs font-medium rounded-lg px-2 py-1 border bg-white dark:bg-slate-800
                border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300
                focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CONTINENT_FILTERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Legend */}
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {[['#10b981', '<$55/day'], ['#f97316', '$55–$100'], ['#8b5cf6', '>$100']].map(([col, label]) => (
              <span key={label} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: col }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map + sidebar layout ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: 460 }}>
        {/* Leaflet map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20, 10]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            // Re-create map when dark mode changes so the tile URL updates
            key={dark ? 'dark' : 'light'}
          >
            <TileLayer
              url={tileUrl}
              attribution='&copy; <a href="https://carto.com">CartoDB</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />

            {visible.map(c => {
              const coords = COORDS[c.id]
              const color = pinColor(c.budget.backpacker.perDay)
              return (
                <Marker
                  key={c.id}
                  position={coords}
                  icon={buildIcon(color)}
                  eventHandlers={{ click: () => setSelected(c) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 22 }}>{c.flag}</span>
                        <div>
                          <strong style={{ fontSize: 15 }}>{c.name}</strong>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.continent}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                        {[
                          ['Backpacker', c.budget.backpacker.perDay, '#10b981'],
                          ['Standard',   c.budget.standard.perDay,   '#f97316'],
                          ['Luxury',     c.budget.luxury.perDay,     '#8b5cf6'],
                        ].map(([label, val, col]) => (
                          <div key={label} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 8, padding: '6px 4px' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: col }}>${val}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      <a
                        href={`/country/${c.id}`}
                        style={{
                          display: 'block', textAlign: 'center', padding: '6px 0',
                          background: 'linear-gradient(to right,#7c3aed,#8b5cf6)',
                          color: 'white', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Full Country Guide →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>

        {/* Country detail sidebar — shows when a pin is clicked */}
        {selected && (
          <motion.aside
            key={selected.id}
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700
              overflow-y-auto flex-shrink-0 shadow-xl"
          >
            <div className="relative h-36 overflow-hidden">
              <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 text-white text-sm flex items-center justify-center hover:bg-black/60"
              >
                ×
              </button>
              <div className="absolute bottom-3 left-3 text-white">
                <div className="text-xl">{selected.flag}</div>
                <div className="font-bold text-lg leading-none">{selected.name}</div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Budget tiers */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Daily Budget</p>
                {[
                  ['Backpacker', selected.budget.backpacker.perDay, 'text-emerald-600'],
                  ['Standard',   selected.budget.standard.perDay,   'text-amber-600'],
                  ['Luxury',     selected.budget.luxury.perDay,     'text-brand-600'],
                ].map(([tier, cost, cls]) => (
                  <div key={tier} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{tier}</span>
                    <span className={`font-bold text-sm ${cls}`}>${cost}/day</span>
                  </div>
                ))}
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  [DollarSign, selected.currency.code, 'Currency'],
                  [Shield, selected.safety.charAt(0).toUpperCase() + selected.safety.slice(1), 'Safety'],
                  [MapPin, selected.capital, 'Capital'],
                  [TrendingUp, selected.visa.type.split(' ')[0], 'Visa'],
                ].map(([Icon, val, lbl]) => (
                  <div key={lbl} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5">
                    <div className="flex items-center gap-1 text-brand-500 mb-0.5">
                      <Icon size={12} />
                      <span className="text-[10px] text-slate-400">{lbl}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-white">{val}</div>
                  </div>
                ))}
              </div>

              <Link
                to={`/country/${selected.id}`}
                className="btn-primary w-full justify-center py-2.5 text-sm"
              >
                Full Country Guide <ChevronRight size={14} />
              </Link>
            </div>
          </motion.aside>
        )}
      </div>
    </div>
  )
}
