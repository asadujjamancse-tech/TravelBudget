// FEATURE: WORLD MAP
// PURPOSE: AI-powered interactive travel intelligence map — layers, search, routes, discovery
// DEPENDENCIES: @data/countries, @context/ThemeContext, @context/AppContext,
//               @hooks/useLocalStorage, @hooks/usePageContext, react-leaflet, recharts

// ─── ARCHITECTURE OVERVIEW ────────────────────────────────────────────────────
//
//  ┌─ AI Search ─────────────────────────────────────┐
//  │  Intent-detection → filter + flyTo map          │
//  └─────────────────────────────────────────────────┘
//  ┌─ Layer Control ──────────────────────────────────┐
//  │  8 data layers change marker colors + legend     │
//  └─────────────────────────────────────────────────┘
//  ┌─ MapContainer ──────────────────────────────────┐
//  │  CartoDB tiles (dark/light auto-switch)          │
//  │  Markers: color + size reflect active layer     │
//  │  Polylines: 4 predefined travel routes           │
//  │  MapController: flyTo / fitBounds inside map    │
//  └──────────────────────────────┬──────────────────┘
//                                 │ onClick
//  ┌─ Country Panel (sidebar) ────▼──────────────────┐
//  │  4 tabs: Overview | Budget | Hotels | Places     │
//  │  + Visited tracker (localStorage)                │
//  │  + Add to compare + bucket list                  │
//  └─────────────────────────────────────────────────┘
//
// ─── DATA LAYERS ─────────────────────────────────────────────────────────────
//
//  budget   — green/orange/purple by daily backpacker cost tier
//  safety   — emerald/amber/red by safety rating
//  food     — orange highlights food-tagged countries
//  adventure— teal highlights adventure-tagged countries
//  beach    — cyan highlights beach/island/tropical-tagged countries
//  visa     — green=free / amber=on arrival / red=required
//  nomad    — scores countries by budget+safety+internet speed
//  popular  — proxy for tourism density via highlights array length
//
// ─── AI SEARCH ───────────────────────────────────────────────────────────────
//
//  searchCountries() parses free-text intent without an API:
//  "cheapest in Asia" → budget < 55 AND continent === Asia
//  "safe beach" → safety=high AND beach tag
//  "digital nomad" → good internet + low budget + safe
//  Future upgrade: replace with OpenAI embeddings for semantic search.
//
// ─── PREDEFINED ROUTES ───────────────────────────────────────────────────────
//
//  4 routes drawn as Polylines (dashed animated lines).
//  Add more routes to PREDEFINED_ROUTES — no other code changes needed.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Filter, TrendingUp, DollarSign, Shield, ChevronRight,
  Search, X, Shuffle, Globe, Utensils, Wifi, Compass, Layers,
  Star, Heart, Eye, Check, Plane, Zap, ChevronDown,
} from 'lucide-react'
import { countries } from '@data/countries'
import { useTheme } from '@context/ThemeContext'
import { useApp } from '@context/AppContext'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { usePageContext } from '@hooks/usePageContext'

// ─── COORDINATES ─────────────────────────────────────────────────────────────
// Kept here (not in countries.js) so map data stays separate from travel data.
const COORDS = {
  france:      [46.23,    2.21],
  italy:       [41.87,   12.57],
  spain:       [40.46,   -3.75],
  greece:      [39.07,   21.82],
  iceland:     [64.96,  -19.02],
  portugal:    [39.40,   -8.22],
  japan:       [36.20,  138.25],
  thailand:    [15.87,  100.99],
  bali:        [-8.34,  115.09],
  vietnam:     [14.06,  108.28],
  india:       [20.59,   78.96],
  uae:         [23.42,   53.85],
  turkey:      [38.96,   35.24],
  singapore:   [1.35,   103.82],
  usa:         [37.09,  -95.71],
  canada:      [56.13, -106.35],
  mexico:      [23.63, -102.55],
  brazil:      [-14.24, -51.93],
  peru:        [-9.19,  -75.02],
  morocco:     [31.79,   -7.09],
  egypt:       [26.82,   30.80],
  australia:   [-25.27, 133.78],
  newzealand:  [-40.90, 174.89],
  southafrica: [-30.56,  22.94],
  nepal:       [28.39,   84.12],
  colombia:    [4.57,   -74.30],
}

// ─── LAYER CONFIGURATION ─────────────────────────────────────────────────────
const LAYERS = [
  { id: 'budget',    label: 'Budget',    Icon: DollarSign, desc: 'Daily cost tiers' },
  { id: 'safety',    label: 'Safety',    Icon: Shield,     desc: 'Safety ratings' },
  { id: 'food',      label: 'Food',      Icon: Utensils,   desc: 'Cuisine destinations' },
  { id: 'adventure', label: 'Adventure', Icon: Compass,    desc: 'Outdoor & adventure' },
  { id: 'beach',     label: 'Beach',     Icon: Globe,      desc: 'Coastal & island' },
  { id: 'visa',      label: 'Visa',      Icon: Check,      desc: 'Entry requirements' },
  { id: 'nomad',     label: 'Nomad',     Icon: Wifi,       desc: 'Remote work-friendly' },
  { id: 'popular',   label: 'Trending',  Icon: TrendingUp, desc: 'Most visited' },
]

const LAYER_LEGENDS = {
  budget:    [['#10b981', '<$55/day'], ['#f97316', '$55–$100'], ['#8b5cf6', '>$100']],
  safety:    [['#10b981', 'High Safety'], ['#f59e0b', 'Medium'], ['#ef4444', 'Lower']],
  food:      [['#f97316', 'Food Destination'], ['#64748b', 'Other']],
  adventure: [['#14b8a6', 'Adventure Spot'],   ['#64748b', 'Other']],
  beach:     [['#06b6d4', 'Beach / Island'],    ['#64748b', 'Other']],
  visa:      [['#10b981', 'Visa Free'], ['#f59e0b', 'On Arrival'], ['#ef4444', 'Visa Required']],
  nomad:     [['#10b981', 'Nomad-Friendly'], ['#f59e0b', 'Decent'], ['#ef4444', 'Not Ideal']],
  popular:   [['#8b5cf6', 'Very Popular'], ['#f97316', 'Popular'], ['#64748b', 'Off-Beat']],
}

// ─── PREDEFINED TRAVEL ROUTES ─────────────────────────────────────────────────
// Routes shown as animated Polylines on the map when toggled.
// To add a new route: add an entry here — no other code changes needed.
const PREDEFINED_ROUTES = [
  {
    id: 'se-asia',
    label: '🌏 Classic SE Asia',
    color: '#f97316',
    countries: ['thailand', 'vietnam', 'bali', 'singapore'],
    days: 35,
    avgPerDay: 45,
    desc: 'The iconic backpacker trail',
  },
  {
    id: 'europe-budget',
    label: '🇪🇺 Budget Europe',
    color: '#8b5cf6',
    countries: ['portugal', 'spain', 'france', 'italy', 'greece'],
    days: 40,
    avgPerDay: 70,
    desc: 'Lisbon to Athens on a budget',
  },
  {
    id: 'south-america',
    label: '🌎 South America',
    color: '#10b981',
    countries: ['colombia', 'peru', 'brazil'],
    days: 30,
    avgPerDay: 45,
    desc: 'Jungle, ruins, and beaches',
  },
  {
    id: 'middle-east',
    label: '🌍 Middle East Magic',
    color: '#f59e0b',
    countries: ['turkey', 'egypt', 'morocco', 'uae'],
    days: 25,
    avgPerDay: 55,
    desc: 'Ancient civilizations & deserts',
  },
]

// ─── MARKER COLOR PER LAYER ───────────────────────────────────────────────────
function getMarkerColor(country, layer) {
  switch (layer) {
    case 'budget': {
      const d = country.budget.backpacker.perDay
      return d < 55 ? '#10b981' : d < 100 ? '#f97316' : '#8b5cf6'
    }
    case 'safety':
      return country.safety === 'high' ? '#10b981'
           : country.safety === 'medium' ? '#f59e0b' : '#ef4444'
    case 'food':
      return country.tags.some(t => ['food', 'cuisine', 'street food', 'culinary'].includes(t))
           ? '#f97316' : '#64748b'
    case 'adventure':
      return country.tags.some(t => ['adventure', 'hiking', 'nature', 'wildlife', 'outdoor', 'trekking'].includes(t))
           ? '#14b8a6' : '#64748b'
    case 'beach':
      return country.tags.some(t => ['beach', 'island', 'tropical', 'coast', 'coastal'].includes(t))
           ? '#06b6d4' : '#64748b'
    case 'visa': {
      const v = country.visa
      if (v.cost === 'Free' || v.cost === '$0' || v.type.toLowerCase().includes('free')) return '#10b981'
      if (v.type.toLowerCase().includes('arrival')) return '#f59e0b'
      return '#ef4444'
    }
    case 'nomad': {
      const speedStr = country.internet.avgSpeed
      const speed = parseInt(speedStr) || 0
      const budgetScore = country.budget.backpacker.perDay < 55 ? 3 : country.budget.backpacker.perDay < 90 ? 2 : 1
      const safetyScore = country.safety === 'high' ? 3 : country.safety === 'medium' ? 2 : 1
      const wifiScore   = speed > 50 ? 3 : speed > 20 ? 2 : 1
      const total = budgetScore + safetyScore + wifiScore
      return total >= 8 ? '#10b981' : total >= 6 ? '#f59e0b' : '#ef4444'
    }
    case 'popular':
      return country.highlights.length >= 4 ? '#8b5cf6'
           : country.highlights.length >= 3 ? '#f97316' : '#64748b'
    default:
      return '#6366f1'
  }
}

// ─── MARKER BUILDER ───────────────────────────────────────────────────────────
// Builds a Leaflet divIcon. Selected marker is larger and has a CSS pulse ring.
// Non-highlighted markers (when search is active) are dimmed to slate-500.
// CSS animations (.map-pin-pulse) are defined in src/index.css.
function buildIcon(color, isSelected = false, isHighlighted = true) {
  const s = isSelected ? 40 : 30
  const dimStyle = !isHighlighted ? 'opacity:0.2;' : ''
  const glow     = isSelected ? `box-shadow:0 0 0 5px ${color}30,0 0 18px ${color}50,0 3px 10px rgba(0,0,0,0.4);` : 'box-shadow:0 2px 8px rgba(0,0,0,0.3);'
  const pulseRing = isSelected
    ? `<div class="map-pin-pulse" style="position:absolute;inset:-10px;border-radius:50%;background:${color};pointer-events:none;"></div>`
    : ''

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${s + 20}px;height:${s + 20}px;display:flex;align-items:center;justify-content:center;${dimStyle}">
        ${pulseRing}
        <div style="
          width:${s}px;height:${s}px;border-radius:50%;
          background:${color};border:2.5px solid white;
          ${glow}
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          position:relative;z-index:2;transition:transform 0.2s;
        ">
          <div style="width:${Math.round(s * 0.38)}px;height:${Math.round(s * 0.38)}px;border-radius:50%;background:white;opacity:0.9;"></div>
        </div>
      </div>`,
    iconSize:    [s + 20, s + 20],
    iconAnchor:  [(s + 20) / 2, (s + 20) / 2],
    popupAnchor: [0, -(s + 20) / 2],
  })
}

// ─── AI MAP SEARCH ─────────────────────────────────────────────────────────────
// Intent-detection without an API key. Returns matching country IDs.
// Future upgrade: replace with vector embeddings (OpenAI text-embedding-3-small
// → Pinecone) — return signature stays identical, no caller changes needed.
function searchCountries(query) {
  const text = query.toLowerCase().trim()
  if (!text) return countries.map(c => c.id)

  return countries.filter(c => {
    // Direct name / capital / continent match
    if (c.name.toLowerCase().includes(text)) return true
    if (c.capital.toLowerCase().includes(text)) return true
    if (c.continent.toLowerCase().includes(text)) return true
    if (c.tags.some(t => t.includes(text))) return true

    // Budget intent
    if (/cheap|budget|backpack|afford|low.?cost/.test(text) && c.budget.backpacker.perDay < 55) return true
    if (/luxury|premium|high.?end|expensive/.test(text) && c.budget.luxury.perDay > 200) return true
    if (/mid.?range|standard|moderate/.test(text) && c.budget.backpacker.perDay >= 55 && c.budget.backpacker.perDay < 100) return true

    // Safety intent
    if (/safe|safest/.test(text) && c.safety === 'high') return true

    // Tag intents
    if (/beach|island|tropical|coast/.test(text) && c.tags.some(t => ['beach', 'island', 'tropical', 'coast', 'coastal'].includes(t))) return true
    if (/adventure|hik|nature|wildlife|outdoor/.test(text) && c.tags.some(t => ['adventure', 'hiking', 'nature', 'wildlife', 'outdoor'].includes(t))) return true
    if (/food|cuisine|culinary|gastronomy|eat/.test(text) && c.tags.some(t => ['food', 'cuisine', 'street food', 'culinary'].includes(t))) return true
    if (/romantic|couple|honeymoon/.test(text) && c.tags.includes('romantic')) return true
    if (/culture|history|art|heritage|museum/.test(text) && c.tags.some(t => ['culture', 'history', 'art', 'heritage', 'cultural'].includes(t))) return true
    if (/warm|hot|sunny|tropical/.test(text) && c.tags.some(t => ['tropical', 'beach', 'island'].includes(t))) return true

    // Visa intent
    if (/visa.?free|no visa/.test(text) && (c.visa.cost === 'Free' || c.visa.cost === '$0' || c.visa.type.toLowerCase().includes('free'))) return true

    // Nomad intent — needs good WiFi + affordable + safe
    if (/nomad|remote|work|digital/.test(text)) {
      const speed = parseInt(c.internet.avgSpeed) || 0
      if (speed > 20 && c.budget.backpacker.perDay < 80 && c.safety !== 'low') return true
    }

    // Continent shortcuts
    if (text.includes('europe') && c.continent === 'Europe') return true
    if (text.includes('asia') && c.continent === 'Asia') return true
    if (text.includes('africa') && c.continent === 'Africa') return true
    if (text.includes('america') && c.continent.includes('America')) return true
    if (text.includes('oceania') && c.continent === 'Oceania') return true

    return false
  }).map(c => c.id)
}

// ─── MAP CONTROLLER ───────────────────────────────────────────────────────────
// Must render inside MapContainer to access useMap().
// Drives programmatic flyTo (Discover Mode) and fitBounds (search results).
function MapController({ flyToId, fitIds }) {
  const map = useMap()
  const prevFlyRef = useRef(null)

  useEffect(() => {
    if (flyToId && flyToId !== prevFlyRef.current && COORDS[flyToId]) {
      prevFlyRef.current = flyToId
      map.flyTo(COORDS[flyToId], 5, { duration: 1.5 })
    }
  }, [flyToId, map])

  useEffect(() => {
    if (!fitIds) return
    if (fitIds.length === 0) {
      map.flyTo([20, 10], 2, { duration: 1 })
      return
    }
    const pts = fitIds.map(id => COORDS[id]).filter(Boolean)
    if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 6, duration: 1 })
    } else if (pts.length === 1) {
      map.flyTo(pts[0], 5, { duration: 1 })
    }
  // fitIds as dependency — stringify to detect content changes, not reference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitIds?.join(','), map])

  return null
}

// ─── FILTER CONSTANTS ─────────────────────────────────────────────────────────
const BUDGET_FILTERS    = ['All', 'Budget (<$55)', 'Mid-range', 'Expensive (>$100)']
const CONTINENT_FILTERS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']
const SIDEBAR_TABS      = ['overview', 'budget', 'hotels', 'places']

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WorldMap() {
  const { dark }                              = useTheme()
  const { isFavorite, toggleFavorite, addToCompare, compareList } = useApp()
  const [visitedCountries, setVisitedCountries] = useLocalStorage('map-visited-countries', [])

  // Map controls
  const [activeLayer, setActiveLayer]         = useState('budget')
  const [budgetFilter, setBudgetFilter]       = useState('All')
  const [continentFilter, setContinentFilter] = useState('All')
  const [selected, setSelected]               = useState(null)
  const [sidebarTab, setSidebarTab]           = useState('overview')

  // AI search
  const [searchQuery, setSearchQuery]         = useState('')
  const searchInputRef                        = useRef(null)

  // Routes overlay
  const [activeRoute, setActiveRoute]         = useState(null)
  const [showRoutePanel, setShowRoutePanel]   = useState(false)

  // Discover mode
  const [discoverFlyTo, setDiscoverFlyTo]     = useState(null)

  // Budget tier for sidebar Budget tab
  const [budgetTier, setBudgetTier]           = useState('standard')

  // Report map context to AI assistant
  usePageContext(
    () => ({
      currentPage: 'map',
      activeFilters: { continent: continentFilter, budget: budgetFilter, layer: activeLayer },
    }),
    [continentFilter, budgetFilter, activeLayer]
  )

  // ── Computed data ────────────────────────────────────────────────────────
  const searchMatches = useMemo(
    () => (searchQuery ? searchCountries(searchQuery) : null),
    [searchQuery]
  )

  const visible = useMemo(() => {
    return countries.filter(c => {
      if (!COORDS[c.id]) return false
      if (continentFilter !== 'All' && c.continent !== continentFilter) return false
      const perDay = c.budget.backpacker.perDay
      if (budgetFilter === 'Budget (<$55)'     && perDay >= 55)             return false
      if (budgetFilter === 'Mid-range'          && (perDay < 55 || perDay >= 100)) return false
      if (budgetFilter === 'Expensive (>$100)' && perDay < 100)             return false
      return true
    })
  }, [budgetFilter, continentFilter])

  // Stats computed from currently filtered + matched countries
  const stats = useMemo(() => {
    const pool = searchMatches ? visible.filter(c => searchMatches.includes(c.id)) : visible
    if (!pool.length) return null
    const avgBudget    = Math.round(pool.reduce((s, c) => s + c.budget.backpacker.perDay, 0) / pool.length)
    const safeCount    = pool.filter(c => c.safety === 'high').length
    const visitedCount = pool.filter(c => visitedCountries.includes(c.id)).length
    return { count: pool.length, avgBudget, safeCount, visitedCount }
  }, [visible, searchMatches, visitedCountries])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCountryClick = useCallback(c => {
    setSelected(c)
    setSidebarTab('overview')
  }, [])

  const toggleVisited = useCallback(countryId => {
    setVisitedCountries(prev =>
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    )
  }, [setVisitedCountries])

  // Discover Mode — picks a random unvisited country and flies to it
  const handleSurpriseMe = useCallback(() => {
    const unvisited = visible.filter(c => !visitedCountries.includes(c.id))
    const pool = unvisited.length > 0 ? unvisited : visible
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (pick) {
      setSelected(pick)
      setSidebarTab('overview')
      setDiscoverFlyTo(pick.id)
    }
  }, [visible, visitedCountries])

  // CartoDB tiles: no API key, polished dark/light variants
  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const activeLegend = LAYER_LEGENDS[activeLayer] || []

  // Route polyline coordinates for the active route
  const routePolylines = useMemo(() => {
    if (!activeRoute) return []
    const route = PREDEFINED_ROUTES.find(r => r.id === activeRoute)
    if (!route) return []
    return route.countries.slice(0, -1).map((id, i) => ({
      key: `${id}-${route.countries[i + 1]}`,
      from: COORDS[id],
      to:   COORDS[route.countries[i + 1]],
      color: route.color,
    })).filter(seg => seg.from && seg.to)
  }, [activeRoute])

  return (
    <div className="min-h-screen bg-slate-950 pt-16 lg:pt-20 flex flex-col">

      {/* ── Page header with AI search ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 border-b border-slate-800 py-6">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-brand-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Travel Intelligence Map</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              World Travel Map
            </h1>
          </motion.div>

          {/* AI Search bar */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl">
            <div className="relative flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 focus-within:border-brand-500/50 transition-colors">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Try: "cheapest in Asia" · "safe beach destinations" · "digital nomad"'
                className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white transition-colors flex-shrink-0">
                  <X size={15} />
                </button>
              )}
            </div>
            {searchQuery && stats && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-brand-400 mt-1.5 ml-1">
                {stats.count} destination{stats.count !== 1 ? 's' : ''} match — map updated
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Layer control bar ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="section-container py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 mr-1">
              <Layers size={13} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Layer</span>
            </div>
            {LAYERS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveLayer(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeLayer === id
                    ? 'bg-brand-600 text-white shadow-glow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter + legend bar ───────────────────────────────────────────── */}
      <div className="bg-slate-900/80 border-b border-slate-800">
        <div className="section-container py-2 flex flex-wrap items-center gap-3">
          {/* Budget filter */}
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-slate-500" />
            <div className="flex gap-1 flex-wrap">
              {BUDGET_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setBudgetFilter(f)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    budgetFilter === f
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Region filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={continentFilter}
              onChange={e => setContinentFilter(e.target.value)}
              className="text-xs font-medium rounded-lg px-2 py-1 bg-slate-800 border border-slate-700
                text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {CONTINENT_FILTERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Legend */}
          <div className="ml-auto flex items-center gap-2.5 flex-wrap">
            {activeLegend.map(([col, label]) => (
              <span key={label} className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: col }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats + action bar ────────────────────────────────────────────── */}
      <div className="bg-slate-900/60 border-b border-slate-800/60">
        <div className="section-container py-2 flex items-center gap-4 flex-wrap">
          {stats && (
            <>
              <span className="text-xs text-slate-400">
                <span className="font-bold text-white">{stats.count}</span> destinations
              </span>
              <span className="text-xs text-slate-400">
                Avg <span className="font-bold text-emerald-400">${stats.avgBudget}</span>/day
              </span>
              <span className="text-xs text-slate-400">
                <span className="font-bold text-emerald-400">{stats.safeCount}</span> high-safety
              </span>
              <span className="text-xs text-slate-400">
                <span className="font-bold text-brand-400">{stats.visitedCount}</span> visited
                <span className="text-slate-600"> / {stats.count}</span>
              </span>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Discover / Surprise Me */}
            <button
              onClick={handleSurpriseMe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                bg-gradient-to-r from-brand-600 to-purple-600 text-white
                hover:opacity-90 transition-all duration-200"
            >
              <Shuffle size={12} />
              Surprise Me
            </button>

            {/* Routes toggle */}
            <button
              onClick={() => setShowRoutePanel(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                showRoutePanel
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Plane size={12} />
              Routes
              <ChevronDown size={11} className={`transition-transform ${showRoutePanel ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Routes panel */}
        <AnimatePresence>
          {showRoutePanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-800"
            >
              <div className="section-container py-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveRoute(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${!activeRoute ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  No Route
                </button>
                {PREDEFINED_ROUTES.map(route => (
                  <button
                    key={route.id}
                    onClick={() => setActiveRoute(r => r === route.id ? null : route.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      activeRoute === route.id
                        ? 'text-white border-transparent'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    style={activeRoute === route.id ? { background: route.color + '33', borderColor: route.color } : {}}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: route.color }} />
                    {route.label}
                    <span className="text-slate-400 font-normal hidden sm:inline">· {route.days}d · ${route.avgPerDay}/day</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Map + Sidebar layout ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 260px)', minHeight: 440 }}>

        {/* Leaflet map — re-mounts on dark change so tile URL updates */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20, 10]}
            zoom={2}
            style={{ height: '100%', width: '100%', background: dark ? '#0f172a' : '#e2e8f0' }}
            scrollWheelZoom
            key={dark ? 'dark' : 'light'}
          >
            <TileLayer
              url={tileUrl}
              attribution='&copy; <a href="https://carto.com">CartoDB</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
            />

            {/* Programmatic map control — must be inside MapContainer */}
            <MapController
              flyToId={discoverFlyTo}
              fitIds={searchQuery ? (searchMatches || []) : null}
            />

            {/* Travel route Polylines */}
            {routePolylines.map(seg => (
              <Polyline
                key={seg.key}
                positions={[seg.from, seg.to]}
                color={seg.color}
                weight={2.5}
                dashArray="10 7"
                opacity={0.85}
              />
            ))}

            {/* Country markers */}
            {visible.map(c => {
              const coords = COORDS[c.id]
              const isSelected    = selected?.id === c.id
              const isHighlighted = !searchMatches || searchMatches.includes(c.id)
              const color         = getMarkerColor(c, activeLayer)

              return (
                <Marker
                  key={c.id}
                  position={coords}
                  icon={buildIcon(isHighlighted ? color : '#475569', isSelected, isHighlighted)}
                  eventHandlers={{ click: () => handleCountryClick(c) }}
                >
                  {/* Minimal popup — sidebar has the full data */}
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 190 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{c.flag}</span>
                        <div>
                          <strong style={{ fontSize: 14 }}>{c.name}</strong>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.continent}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 10 }}>
                        {[
                          ['Backpacker', c.budget.backpacker.perDay, '#10b981'],
                          ['Standard',   c.budget.standard.perDay,   '#f97316'],
                          ['Luxury',     c.budget.luxury.perDay,     '#8b5cf6'],
                        ].map(([label, val, col]) => (
                          <div key={label} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 8, padding: '5px 3px' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: col }}>${val}</div>
                            <div style={{ fontSize: 9, color: '#94a3b8' }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleCountryClick(c)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'center', padding: '6px 0',
                          background: 'linear-gradient(to right,#7c3aed,#8b5cf6)',
                          color: 'white', borderRadius: 8, fontSize: 11, fontWeight: 600,
                          border: 'none', cursor: 'pointer',
                        }}
                      >
                        Full details →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>

          {/* Visited progress — floating bottom-left */}
          {visitedCountries.length > 0 && (
            <div className="absolute bottom-3 left-3 z-[999] bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2">
              <Eye size={13} className="text-brand-400" />
              <span className="text-xs text-white font-semibold">
                {visitedCountries.length} <span className="text-slate-400 font-normal">visited</span>
              </span>
              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-1">
                <div
                  className="h-1.5 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(visitedCountries.length / countries.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">/ {countries.length}</span>
            </div>
          )}
        </div>

        {/* ── Country detail sidebar ─────────────────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <motion.aside
              key={selected.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="w-72 bg-slate-900 border-l border-slate-700 overflow-y-auto flex-shrink-0"
            >
              {/* Hero image */}
              <div className="relative h-40 overflow-hidden flex-shrink-0">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=300&auto=format&fit=crop&q=80' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-black/30 to-transparent" />

                {/* Close */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X size={14} />
                </button>

                {/* Country label */}
                <div className="absolute bottom-2.5 left-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selected.flag}</span>
                    <div>
                      <div className="font-bold text-white text-base leading-tight">{selected.name}</div>
                      <div className="text-xs text-white/60">{selected.continent}</div>
                    </div>
                  </div>
                </div>

                {/* Favorite + Visited */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <button
                    onClick={() => toggleFavorite(selected.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isFavorite(selected.id) ? 'bg-rose-500' : 'bg-black/50 hover:bg-black/70'}`}
                  >
                    <Heart size={13} className={isFavorite(selected.id) ? 'text-white fill-white' : 'text-white'} />
                  </button>
                  <button
                    onClick={() => toggleVisited(selected.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${visitedCountries.includes(selected.id) ? 'bg-emerald-500' : 'bg-black/50 hover:bg-black/70'}`}
                    title={visitedCountries.includes(selected.id) ? 'Mark as unvisited' : 'Mark as visited'}
                  >
                    <Check size={13} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                {SIDEBAR_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSidebarTab(tab)}
                    className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${
                      sidebarTab === tab
                        ? 'text-brand-400 border-b-2 border-brand-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-4">
                {/* ── OVERVIEW ─────────────────────────────────────────── */}
                {sidebarTab === 'overview' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {selected.description}
                    </p>

                    {/* Quick facts grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        [DollarSign, selected.currency.code, 'Currency'],
                        [Shield,     selected.safety.charAt(0).toUpperCase() + selected.safety.slice(1), 'Safety'],
                        [MapPin,     selected.capital, 'Capital'],
                        [Globe,      selected.visa.type.split('(')[0].trim(), 'Visa'],
                        [Wifi,       selected.internet.avgSpeed, 'Internet'],
                        [Star,       selected.population, 'Population'],
                      ].map(([Icon, val, lbl]) => (
                        <div key={lbl} className="bg-slate-800 rounded-xl p-2.5">
                          <div className="flex items-center gap-1 text-brand-400 mb-0.5">
                            <Icon size={10} />
                            <span className="text-[9px] text-slate-500 uppercase tracking-wide">{lbl}</span>
                          </div>
                          <div className="font-semibold text-white text-xs truncate">{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Best seasons */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Best Seasons</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.bestSeasons.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand-900/40 text-brand-300 border border-brand-800/50">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {selected.tags.slice(0, 6).map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── BUDGET ───────────────────────────────────────────── */}
                {sidebarTab === 'budget' && (
                  <div className="space-y-4">
                    {/* Tier selector */}
                    <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
                      {['backpacker', 'standard', 'luxury'].map(t => (
                        <button
                          key={t}
                          onClick={() => setBudgetTier(t)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                            budgetTier === t ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {t === 'backpacker' ? '🎒' : t === 'standard' ? '✈️' : '👑'} {t}
                        </button>
                      ))}
                    </div>

                    {/* Per day highlight */}
                    <div className="text-center py-3 bg-slate-800 rounded-xl">
                      <div className="text-3xl font-bold text-white">${selected.budget[budgetTier].perDay}</div>
                      <div className="text-xs text-slate-400 mt-0.5">per day · {budgetTier}</div>
                    </div>

                    {/* Category breakdown bars */}
                    {(() => {
                      const t = selected.budget[budgetTier]
                      const max = Math.max(t.hotel, t.food, t.transport, t.activities)
                      const cats = [
                        { name: 'Hotel',      val: t.hotel,      bar: 'bg-brand-500' },
                        { name: 'Food',       val: t.food,       bar: 'bg-amber-500' },
                        { name: 'Transport',  val: t.transport,  bar: 'bg-emerald-500' },
                        { name: 'Activities', val: t.activities, bar: 'bg-cyan-500' },
                      ]
                      return (
                        <div className="space-y-2.5">
                          {cats.map(cat => (
                            <div key={cat.name} className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 w-16 flex-shrink-0">{cat.name}</span>
                              <div className="flex-1 h-2 rounded-full bg-slate-700">
                                <div
                                  className={`h-2 rounded-full ${cat.bar} transition-all duration-500`}
                                  style={{ width: `${Math.round((cat.val / max) * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-white w-9 text-right">${cat.val}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}

                    {/* Visa cost */}
                    <div className="flex justify-between items-center text-xs py-2 border-t border-slate-800">
                      <span className="text-slate-400">Visa cost</span>
                      <span className="font-semibold text-white">{selected.visa.cost}</span>
                    </div>
                  </div>
                )}

                {/* ── HOTELS ───────────────────────────────────────────── */}
                {sidebarTab === 'hotels' && (
                  <div className="space-y-3">
                    {selected.hotels.map(h => (
                      <div key={h.name} className="bg-slate-800 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <div className="font-semibold text-white text-xs leading-tight">{h.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{h.area}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-emerald-400 text-sm">${h.pricePerNight}</div>
                            <div className="text-[10px] text-slate-500">/night</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: h.stars }, (_, i) => (
                              <Star key={i} size={9} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                            h.type === 'luxury'   ? 'bg-brand-900/50 text-brand-300' :
                            h.type === 'standard' ? 'bg-blue-900/50 text-blue-300'  :
                                                    'bg-emerald-900/50 text-emerald-300'
                          }`}>
                            {h.type}
                          </span>
                          <span className="text-[9px] text-amber-400 ml-auto">★ {h.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── PLACES ───────────────────────────────────────────── */}
                {sidebarTab === 'places' && (
                  <div className="space-y-3">
                    {/* Top attractions */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Top Attractions</p>
                      <div className="space-y-2">
                        {selected.attractions.slice(0, 4).map(a => (
                          <div key={a.name} className="flex items-center justify-between bg-slate-800 rounded-xl px-3 py-2">
                            <div>
                              <div className="text-xs font-semibold text-white">{a.name}</div>
                              <div className="text-[10px] text-slate-400">{a.type} · {a.duration}</div>
                            </div>
                            <div className="text-xs font-semibold text-emerald-400 flex-shrink-0 ml-2">
                              {a.entryFee === 0 ? 'Free' : `$${a.entryFee}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights chips */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Highlights</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.highlights.map(h => (
                          <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-900/30 text-brand-300 border border-brand-800/40">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Best restaurants */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Must-Try Food</p>
                      <div className="space-y-1.5">
                        {selected.restaurants.slice(0, 2).map(r => (
                          <div key={r.name} className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">{r.name}</span>
                            <span className="text-amber-400">{r.priceRange}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer CTAs ─────────────────────────────────────────── */}
              <div className="p-4 pt-0 space-y-2 border-t border-slate-800 mt-2">
                <Link
                  to={`/country/${selected.id}`}
                  className="btn-primary w-full justify-center py-2.5 text-xs"
                >
                  Full Country Guide <ChevronRight size={13} />
                </Link>
                <button
                  onClick={() => addToCompare(selected.id)}
                  disabled={compareList.includes(selected.id) || compareList.length >= 3}
                  className="w-full py-2 text-xs font-semibold rounded-xl border border-slate-700
                    text-slate-300 hover:border-brand-500 hover:text-brand-300
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {compareList.includes(selected.id) ? '✓ In Compare' : '+ Compare'}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
