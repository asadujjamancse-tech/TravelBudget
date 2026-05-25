// FEATURE: WORLD MAP
// PURPOSE: 3D globe + flat map — 10 intelligence layers, achievements, routes & discovery
// DEPENDENCIES: @data/countries, @context/ThemeContext, @context/AppContext,
//               @hooks/useLocalStorage, @hooks/usePageContext, react-globe.gl, react-leaflet, recharts

import { useState, useMemo, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  MapPin, Filter, TrendingUp, DollarSign, Shield, ChevronRight,
  Search, X, Shuffle, Globe, Utensils, Wifi, Compass, Layers,
  Star, Heart, Eye, Check, Plane, Zap, ChevronDown,
  Bookmark, Award, Thermometer, Music,
} from 'lucide-react'
import { countries } from '@data/countries'
import { useTheme } from '@context/ThemeContext'
import { useApp } from '@context/AppContext'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { usePageContext } from '@hooks/usePageContext'

// Lazy-load the WebGL globe so it doesn't block the initial page render
const GlobeGL = lazy(() => import('react-globe.gl'))

// ─── COORDINATES ──────────────────────────────────────────────────────────────
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

// ─── 10 INTELLIGENCE LAYERS ───────────────────────────────────────────────────
const LAYERS = [
  { id: 'budget',    label: 'Budget',    Icon: DollarSign,  desc: 'Daily cost tiers' },
  { id: 'safety',    label: 'Safety',    Icon: Shield,      desc: 'Safety ratings' },
  { id: 'food',      label: 'Food',      Icon: Utensils,    desc: 'Cuisine destinations' },
  { id: 'adventure', label: 'Adventure', Icon: Compass,     desc: 'Outdoor & adventure' },
  { id: 'beach',     label: 'Beach',     Icon: Globe,       desc: 'Coastal & island' },
  { id: 'nightlife', label: 'Nightlife', Icon: Music,       desc: 'Party & entertainment' },
  { id: 'weather',   label: 'Weather',   Icon: Thermometer, desc: 'Climate & temperature' },
  { id: 'visa',      label: 'Visa',      Icon: Check,       desc: 'Entry requirements' },
  { id: 'nomad',     label: 'Nomad',     Icon: Wifi,        desc: 'Remote work-friendly' },
  { id: 'popular',   label: 'Trending',  Icon: TrendingUp,  desc: 'Most visited' },
]

const LAYER_LEGENDS = {
  budget:    [['#10b981', '<$55/day'], ['#f97316', '$55–$100'], ['#8b5cf6', '>$100']],
  safety:    [['#10b981', 'High Safety'], ['#f59e0b', 'Medium'], ['#ef4444', 'Lower']],
  food:      [['#f97316', 'Food Hub'], ['#64748b', 'Other']],
  adventure: [['#14b8a6', 'Adventure Spot'], ['#64748b', 'Other']],
  beach:     [['#06b6d4', 'Beach / Island'], ['#64748b', 'Other']],
  nightlife: [['#ec4899', 'Vibrant Nightlife'], ['#a855f7', 'Moderate'], ['#64748b', 'Quiet']],
  weather:   [['#f59e0b', 'Warm >25°C'], ['#3b82f6', 'Mild 15–25°C'], ['#8b5cf6', 'Cool <15°C']],
  visa:      [['#10b981', 'Visa Free'], ['#f59e0b', 'On Arrival'], ['#ef4444', 'Required']],
  nomad:     [['#10b981', 'Nomad-Friendly'], ['#f59e0b', 'Decent'], ['#ef4444', 'Not Ideal']],
  popular:   [['#8b5cf6', 'Very Popular'], ['#f97316', 'Popular'], ['#64748b', 'Off-Beat']],
}

// ─── 6 TRAVEL ROUTES ─────────────────────────────────────────────────────────
const PREDEFINED_ROUTES = [
  { id: 'se-asia',      label: '🌏 Classic SE Asia',     color: '#f97316', countries: ['thailand','vietnam','bali','singapore'],       days: 35, avgPerDay: 45, desc: 'The iconic backpacker trail' },
  { id: 'europe-budget',label: '🇪🇺 Budget Europe',       color: '#8b5cf6', countries: ['portugal','spain','france','italy','greece'], days: 40, avgPerDay: 70, desc: 'Lisbon to Athens on a budget' },
  { id: 'south-america',label: '🌎 South America',        color: '#10b981', countries: ['colombia','peru','brazil'],                   days: 30, avgPerDay: 45, desc: 'Jungle, ruins, and beaches' },
  { id: 'middle-east',  label: '🌍 Middle East Magic',    color: '#f59e0b', countries: ['turkey','egypt','morocco','uae'],             days: 25, avgPerDay: 55, desc: 'Ancient civilizations & deserts' },
  { id: 'himalayan',    label: '🏔️ Himalayan Circuit',    color: '#14b8a6', countries: ['india','nepal','singapore'],                  days: 28, avgPerDay: 35, desc: 'Temples, mountains & spice routes' },
  { id: 'africa',       label: '🦁 African Adventure',    color: '#ef4444', countries: ['morocco','egypt','southafrica'],              days: 32, avgPerDay: 60, desc: 'Sahara, pyramids & safari' },
]

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { count: 1,  icon: '🗺️', label: 'First Steps',   desc: 'Marked your first destination!',   color: '#64748b' },
  { count: 5,  icon: '🧭', label: 'Explorer',       desc: '5 countries explored!',             color: '#10b981' },
  { count: 10, icon: '✈️', label: 'Adventurer',     desc: '10 countries — well traveled!',     color: '#f97316' },
  { count: 15, icon: '🌍', label: 'Globetrotter',   desc: '15 countries! Impressive.',         color: '#8b5cf6' },
  { count: 20, icon: '👑', label: 'World Traveler', desc: "20 countries! You're a legend.",    color: '#f59e0b' },
  { count: 26, icon: '🏆', label: 'Legend',         desc: 'All destinations visited!',         color: '#ef4444' },
]
function getCurrentAchievement(count) { return [...ACHIEVEMENTS].reverse().find(a => count >= a.count) || null }
function getNextAchievement(count) { return ACHIEVEMENTS.find(a => count < a.count) || null }

// ─── AI SEARCH SUGGESTIONS ────────────────────────────────────────────────────
const SEARCH_SUGGESTIONS = [
  'cheapest in Asia', 'safe beach destinations', 'digital nomad spots',
  'visa-free Europe', 'luxury honeymoon', 'winter warm escape',
  'adventure hiking', 'hidden gems',
]

// ─── HEADER PARTICLES ─────────────────────────────────────────────────────────
const HEADER_PARTICLES = [
  { id:0, top:15, left:8,  size:3, delay:0,   dur:3.2 },
  { id:1, top:45, left:18, size:2, delay:0.5, dur:3.8 },
  { id:2, top:22, left:33, size:4, delay:1.1, dur:2.9 },
  { id:3, top:65, left:42, size:2, delay:0.3, dur:4.1 },
  { id:4, top:30, left:56, size:3, delay:0.8, dur:3.5 },
  { id:5, top:75, left:66, size:2, delay:1.4, dur:2.7 },
  { id:6, top:20, left:73, size:4, delay:0.2, dur:3.9 },
  { id:7, top:55, left:83, size:3, delay:0.9, dur:3.1 },
  { id:8, top:40, left:91, size:2, delay:1.6, dur:4.0 },
  { id:9, top:80, left:96, size:3, delay:0.4, dur:2.8 },
  { id:10,top:10, left:51, size:2, delay:1.2, dur:3.6 },
  { id:11,top:60, left:27, size:4, delay:0.7, dur:3.3 },
]

// ─── WEATHER HELPERS ─────────────────────────────────────────────────────────
const MONTH_NAMES = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const SEASON_MONTHS = { spring:[2,3,4], summer:[5,6,7], fall:[8,9,10], autumn:[8,9,10], winter:[11,0,1] }
function isBestMonth(bestSeasons, idx) {
  return bestSeasons.some(s => {
    const sl = s.toLowerCase()
    if (sl.includes(MONTH_NAMES[idx])) return true
    return Object.entries(SEASON_MONTHS).some(([season, months]) => sl.includes(season) && months.includes(idx))
  })
}

// ─── MARKER COLOR PER LAYER ───────────────────────────────────────────────────
function getMarkerColor(country, layer) {
  switch (layer) {
    case 'budget': { const d = country.budget.backpacker.perDay; return d < 55 ? '#10b981' : d < 100 ? '#f97316' : '#8b5cf6' }
    case 'safety': return country.safety === 'high' ? '#10b981' : country.safety === 'medium' ? '#f59e0b' : '#ef4444'
    case 'food':   return country.tags.some(t => ['food','cuisine','street food','culinary'].includes(t)) ? '#f97316' : '#64748b'
    case 'adventure': return country.tags.some(t => ['adventure','hiking','nature','wildlife','outdoor','trekking'].includes(t)) ? '#14b8a6' : '#64748b'
    case 'beach':  return country.tags.some(t => ['beach','island','tropical','coast','coastal'].includes(t)) ? '#06b6d4' : '#64748b'
    case 'nightlife':
      return country.tags.some(t => ['nightlife','party','entertainment','festival'].includes(t)) ? '#ec4899'
           : country.tags.some(t => ['beach','island','city','urban'].includes(t)) ? '#a855f7' : '#64748b'
    case 'weather': {
      if (!country.weather?.length) return '#64748b'
      const avg = country.weather.reduce((s, m) => s + m.temp, 0) / country.weather.length
      return avg > 25 ? '#f59e0b' : avg > 15 ? '#3b82f6' : '#8b5cf6'
    }
    case 'visa': {
      const v = country.visa
      if (v.cost === 'Free' || v.cost === '$0' || v.type.toLowerCase().includes('free')) return '#10b981'
      if (v.type.toLowerCase().includes('arrival')) return '#f59e0b'
      return '#ef4444'
    }
    case 'nomad': {
      const speed = parseInt(country.internet.avgSpeed) || 0
      const b = country.budget.backpacker.perDay < 55 ? 3 : country.budget.backpacker.perDay < 90 ? 2 : 1
      const s = country.safety === 'high' ? 3 : country.safety === 'medium' ? 2 : 1
      const w = speed > 50 ? 3 : speed > 20 ? 2 : 1
      return b + s + w >= 8 ? '#10b981' : b + s + w >= 6 ? '#f59e0b' : '#ef4444'
    }
    case 'popular': return country.highlights.length >= 4 ? '#8b5cf6' : country.highlights.length >= 3 ? '#f97316' : '#64748b'
    default: return '#6366f1'
  }
}

// ─── FLAT MAP MARKER ─────────────────────────────────────────────────────────
function buildIcon(color, isSelected = false, isHighlighted = true, flag = '') {
  const s = isSelected ? 44 : 34
  const dimStyle = !isHighlighted ? 'opacity:0.18;' : ''
  const glow = isSelected
    ? `box-shadow:0 0 0 4px ${color}25,0 0 22px ${color}65,0 3px 14px rgba(0,0,0,0.55);`
    : 'box-shadow:0 2px 10px rgba(0,0,0,0.4);'
  const pulse = isSelected ? `<div class="map-pin-pulse" style="position:absolute;inset:-10px;border-radius:50%;background:${color};pointer-events:none;"></div>` : ''
  const ping  = isSelected ? `<div class="map-pin-ping"  style="position:absolute;inset:-5px;border-radius:50%;border:2px solid ${color};pointer-events:none;"></div>` : ''
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${s+20}px;height:${s+20}px;display:flex;align-items:center;justify-content:center;${dimStyle}">${pulse}${ping}<div style="width:${s}px;height:${s}px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.92);${glow}cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;z-index:2;"><span style="font-size:${Math.round(s*0.52)}px;line-height:1;user-select:none;">${flag}</span></div></div>`,
    iconSize:    [s+20, s+20],
    iconAnchor:  [(s+20)/2, (s+20)/2],
    popupAnchor: [0, -(s+20)/2],
  })
}

// ─── AI INSIGHT & TIPS ────────────────────────────────────────────────────────
function generateAIInsight(country) {
  const daily = country.budget.backpacker.perDay
  const speed = parseInt(country.internet.avgSpeed) || 0
  if (daily < 40 && country.safety === 'high') return `Budget paradise — safe, affordable, perfect for extended stays. One of the best value destinations globally.`
  if (daily > 150) return `Premium destination. Expect world-class experiences, cuisine, and infrastructure. Worth every dollar.`
  if (speed > 50 && daily < 65) return `Digital nomad dream — fast ${country.internet.avgSpeed} internet at $${daily}/day. Highly recommended for remote workers.`
  if (country.tags.some(t => ['beach','island','tropical'].includes(t)) && country.safety === 'high') return `Safe beach paradise. Ideal for relaxed, worry-free travel with stunning coastlines.`
  if (country.tags.some(t => t.includes('cultur') || t.includes('histor'))) return `Deep cultural immersion — ${country.highlights.slice(0,2).join(' and ').toLowerCase()}. Rich history at every turn.`
  return `${country.highlights[0] || 'Unique experiences'} define ${country.name}. ${daily < 60 ? 'Budget-friendly' : 'Well worth the investment'} with ${country.safety} safety.`
}

function generateTips(country) {
  const tips = []
  if (country.visa.type.toLowerCase().includes('free') || country.visa.cost === 'Free' || country.visa.cost === '$0')
    tips.push({ icon: '✅', tip: `Visa-free entry. Duration: ${country.visa.duration}.${country.visa.notes ? ' ' + country.visa.notes.slice(0,55) + '…' : ''}` })
  else if (country.visa.type.toLowerCase().includes('arrival'))
    tips.push({ icon: '🛂', tip: `Visa on arrival. Cost: ${country.visa.cost}. Duration: ${country.visa.duration}.` })
  else
    tips.push({ icon: '📋', tip: `Visa required. Cost: ${country.visa.cost}. Apply in advance.` })
  if (country.safety === 'high') tips.push({ icon: '🛡️', tip: 'Generally safe for solo travelers. Low crime, reliable infrastructure.' })
  else if (country.safety === 'medium') tips.push({ icon: '⚠️', tip: 'Exercise caution in some areas. Research neighborhoods before your stay.' })
  else tips.push({ icon: '🚨', tip: 'Check government travel advisory before visiting.' })
  tips.push({ icon: '💵', tip: `Currency: ${country.currency.code} (${country.currency.symbol}). $1 USD ≈ ${country.currency.rateToUSD} ${country.currency.code}.` })
  tips.push({ icon: '📱', tip: `SIM: ${country.internet.simCard}. Avg speed: ${country.internet.avgSpeed}.` })
  tips.push({ icon: '🚌', tip: `Transport: ${country.transport.publicTransport || 'Various options'}. Taxi: ${country.transport.taxi || 'Available'}.` })
  tips.push({ icon: '📅', tip: `Best time: ${country.bestSeasons.join(', ')}. Plan around local festivals.` })
  return tips
}

// ─── AI MAP SEARCH ────────────────────────────────────────────────────────────
function searchCountries(query) {
  const text = query.toLowerCase().trim()
  if (!text) return countries.map(c => c.id)
  return countries.filter(c => {
    if (c.name.toLowerCase().includes(text) || c.capital.toLowerCase().includes(text)) return true
    if (c.continent.toLowerCase().includes(text) || c.tags.some(t => t.includes(text))) return true
    if (/cheap|budget|backpack|afford|low.?cost/.test(text) && c.budget.backpacker.perDay < 55) return true
    if (/luxury|premium|high.?end/.test(text) && c.budget.luxury.perDay > 200) return true
    if (/safe|safest/.test(text) && c.safety === 'high') return true
    if (/beach|island|tropical|coast/.test(text) && c.tags.some(t => ['beach','island','tropical','coast','coastal'].includes(t))) return true
    if (/adventure|hik|nature|wildlife|outdoor/.test(text) && c.tags.some(t => ['adventure','hiking','nature','wildlife','outdoor'].includes(t))) return true
    if (/food|cuisine|culinary|gastronomy/.test(text) && c.tags.some(t => ['food','cuisine','street food','culinary'].includes(t))) return true
    if (/romantic|couple|honeymoon/.test(text) && c.tags.includes('romantic')) return true
    if (/culture|history|art|heritage/.test(text) && c.tags.some(t => ['culture','history','art','heritage','cultural'].includes(t))) return true
    if (/nightlife|party|club|bar/.test(text) && c.tags.some(t => ['nightlife','party','entertainment','beach','island'].includes(t))) return true
    if (/hidden|gem|off.?beaten|underrated/.test(text) && c.highlights.length < 4) return true
    if (/visa.?free|no visa/.test(text) && (c.visa.cost === 'Free' || c.visa.cost === '$0' || c.visa.type.toLowerCase().includes('free'))) return true
    if (/nomad|remote|work|digital/.test(text)) {
      const speed = parseInt(c.internet.avgSpeed) || 0
      if (speed > 20 && c.budget.backpacker.perDay < 80 && c.safety !== 'low') return true
    }
    if (text.includes('europe') && c.continent === 'Europe') return true
    if (text.includes('asia') && c.continent === 'Asia') return true
    if (text.includes('africa') && c.continent === 'Africa') return true
    if (text.includes('america') && c.continent.includes('America')) return true
    if (text.includes('oceania') && c.continent === 'Oceania') return true
    return false
  }).map(c => c.id)
}

// ─── MAP CONTROLLER (flat map only) ──────────────────────────────────────────
function MapController({ flyToId, fitIds }) {
  const map = useMap()
  const prevFlyRef = useRef(null)
  useEffect(() => {
    if (flyToId && flyToId !== prevFlyRef.current && COORDS[flyToId]) {
      prevFlyRef.current = flyToId
      map.flyTo(COORDS[flyToId], 5, { duration: 1.8 })
    }
  }, [flyToId, map])
  useEffect(() => {
    if (!fitIds) return
    if (fitIds.length === 0) { map.flyTo([20, 10], 2, { duration: 1 }); return }
    const pts = fitIds.map(id => COORDS[id]).filter(Boolean)
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 6, duration: 1.2 })
    else if (pts.length === 1) map.flyTo(pts[0], 5, { duration: 1.2 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitIds?.join(','), map])
  return null
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BUDGET_FILTERS    = ['All', 'Budget (<$55)', 'Mid-range', 'Expensive (>$100)']
const CONTINENT_FILTERS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']
const SIDEBAR_TABS      = ['overview', 'budget', 'hotels', 'explore']

// ─── GLOBE POINT LABEL ───────────────────────────────────────────────────────
// Returns raw HTML string — rendered inside globe.gl's label system
function makeGlobeLabel(d, layer) {
  const color = getMarkerColor(d, layer)
  return `
    <div style="font-family:Inter,system-ui,sans-serif;background:rgba(15,23,42,0.97);border:1px solid ${color}55;border-radius:14px;padding:12px 16px;min-width:170px;pointer-events:none;box-shadow:0 24px 48px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)">
      <div style="font-size:26px;margin-bottom:5px;line-height:1">${d.flag}</div>
      <div style="font-weight:800;color:#f8fafc;font-size:14px;margin-bottom:2px">${d.name}</div>
      <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:9px">${d.continent}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        ${[['🎒','$'+d.budget.backpacker.perDay,'#10b981'],['✈️','$'+d.budget.standard.perDay,'#f97316'],['👑','$'+d.budget.luxury.perDay,'#8b5cf6']].map(([ico,val,col]) =>
          `<div style="text-align:center;background:#1e293b;border-radius:7px;padding:5px 2px"><div style="font-size:12px">${ico}</div><div style="font-weight:700;color:${col};font-size:11px;margin-top:1px">${val}<span style="font-size:9px;opacity:0.7">/d</span></div></div>`
        ).join('')}
      </div>
    </div>`
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WorldMap() {
  const { dark }                                                  = useTheme()
  const { isFavorite, toggleFavorite, addToCompare, compareList } = useApp()

  // Persistent
  const [visitedCountries, setVisitedCountries]       = useLocalStorage('map-visited-countries', [])
  const [bucketList, setBucketList]                   = useLocalStorage('map-bucket-list', [])
  const [lastAchievementSeen, setLastAchievementSeen] = useLocalStorage('map-last-achievement', 0)

  // View mode — globe is the default immersive experience
  const [viewMode, setViewMode] = useState('globe')
  const globeRef                = useRef()
  const globeContainerRef       = useRef(null)
  const [globeSize, setGlobeSize] = useState({ w: 800, h: 600 })

  // Map controls
  const [activeLayer, setActiveLayer]         = useState('budget')
  const [budgetFilter, setBudgetFilter]       = useState('All')
  const [continentFilter, setContinentFilter] = useState('All')
  const [selected, setSelected]               = useState(null)
  const [sidebarTab, setSidebarTab]           = useState('overview')

  // AI search
  const [searchQuery, setSearchQuery]         = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef                        = useRef(null)

  // Routes
  const [activeRoute, setActiveRoute]       = useState(null)
  const [showRoutePanel, setShowRoutePanel] = useState(false)

  // Discover + Budget tier
  const [discoverFlyTo, setDiscoverFlyTo] = useState(null)
  const [budgetTier, setBudgetTier]       = useState('standard')

  // Achievement toast
  const [showAchievement, setShowAchievement] = useState(null)

  usePageContext(
    () => ({ currentPage: 'map', activeFilters: { continent: continentFilter, budget: budgetFilter, layer: activeLayer } }),
    [continentFilter, budgetFilter, activeLayer]
  )

  // ── Globe container resize ─────────────────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'globe' || !globeContainerRef.current) return
    const update = () => {
      const el = globeContainerRef.current
      if (el) setGlobeSize({ w: el.offsetWidth, h: el.offsetHeight })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [viewMode])

  // ── Globe auto-rotation — spins when idle, stops when country selected ─
  useEffect(() => {
    if (viewMode !== 'globe' || !globeRef.current) return
    const controls = globeRef.current.controls()
    if (!controls) return
    controls.autoRotate      = !selected
    controls.autoRotateSpeed = 0.45
  }, [selected, viewMode])

  // ── Fly globe to selected country ─────────────────────────────────────
  useEffect(() => {
    if (!selected || viewMode !== 'globe' || !globeRef.current) return
    const coords = COORDS[selected.id]
    if (coords) globeRef.current.pointOfView({ lat: coords[0], lng: coords[1], altitude: 1.8 }, 1000)
  }, [selected?.id, viewMode])

  // ── Globe fly-to for Discover Mode ────────────────────────────────────
  useEffect(() => {
    if (!discoverFlyTo || viewMode !== 'globe' || !globeRef.current) return
    const coords = COORDS[discoverFlyTo]
    if (coords) globeRef.current.pointOfView({ lat: coords[0], lng: coords[1], altitude: 1.8 }, 1300)
  }, [discoverFlyTo, viewMode])

  // ── Globe fit for AI search results ───────────────────────────────────
  useEffect(() => {
    if (!searchQuery || !searchMatches || viewMode !== 'globe' || !globeRef.current) return
    const pts = searchMatches.map(id => COORDS[id]).filter(Boolean)
    if (!pts.length) return
    if (pts.length === 1) {
      globeRef.current.pointOfView({ lat: pts[0][0], lng: pts[0][1], altitude: 1.8 }, 1000)
    } else {
      const avgLat = pts.reduce((s, p) => s + p[0], 0) / pts.length
      const avgLng = pts.reduce((s, p) => s + p[1], 0) / pts.length
      globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, altitude: 2.6 }, 1200)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMatches?.join(','), viewMode])

  // ── Achievement detection ─────────────────────────────────────────────
  useEffect(() => {
    const count = visitedCountries.length
    const achievement = getCurrentAchievement(count)
    if (achievement && count > lastAchievementSeen) {
      setLastAchievementSeen(count)
      setShowAchievement(achievement)
      const t = setTimeout(() => setShowAchievement(null), 4500)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitedCountries.length])

  // ── Computed data ─────────────────────────────────────────────────────
  const searchMatches = useMemo(
    () => (searchQuery ? searchCountries(searchQuery) : null),
    [searchQuery]
  )

  const visible = useMemo(() => countries.filter(c => {
    if (!COORDS[c.id]) return false
    if (continentFilter !== 'All' && c.continent !== continentFilter) return false
    const d = c.budget.backpacker.perDay
    if (budgetFilter === 'Budget (<$55)'     && d >= 55)           return false
    if (budgetFilter === 'Mid-range'          && (d < 55 || d >= 100)) return false
    if (budgetFilter === 'Expensive (>$100)' && d < 100)           return false
    return true
  }), [budgetFilter, continentFilter])

  const stats = useMemo(() => {
    const pool = searchMatches ? visible.filter(c => searchMatches.includes(c.id)) : visible
    if (!pool.length) return null
    return {
      count:        pool.length,
      avgBudget:    Math.round(pool.reduce((s, c) => s + c.budget.backpacker.perDay, 0) / pool.length),
      safeCount:    pool.filter(c => c.safety === 'high').length,
      visitedCount: pool.filter(c => visitedCountries.includes(c.id)).length,
    }
  }, [visible, searchMatches, visitedCountries])

  // Globe points — flat country objects with lat/lng added
  const globePoints = useMemo(() =>
    visible.map(c => ({ ...c, lat: COORDS[c.id][0], lng: COORDS[c.id][1] })),
    [visible]
  )

  const routePolylines = useMemo(() => {
    if (!activeRoute) return []
    const route = PREDEFINED_ROUTES.find(r => r.id === activeRoute)
    if (!route) return []
    return route.countries.slice(0, -1).map((id, i) => ({
      key: `${id}-${route.countries[i+1]}`,
      from: COORDS[id], to: COORDS[route.countries[i+1]], color: route.color,
    })).filter(seg => seg.from && seg.to)
  }, [activeRoute])

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleCountryClick = useCallback(c => { setSelected(c); setSidebarTab('overview') }, [])
  const toggleVisited      = useCallback(id => setVisitedCountries(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]), [setVisitedCountries])
  const toggleBucketList   = useCallback(id => setBucketList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]), [setBucketList])

  const handleSurpriseMe = useCallback(() => {
    const pool = visible.filter(c => !visitedCountries.includes(c.id))
    const pick = (pool.length ? pool : visible)[Math.floor(Math.random() * (pool.length || visible.length))]
    if (pick) { setSelected(pick); setSidebarTab('overview'); setDiscoverFlyTo(pick.id) }
  }, [visible, visitedCountries])

  // CartoDB tiles for flat map
  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const activeLegend       = LAYER_LEGENDS[activeLayer] || []
  const currentAchievement = getCurrentAchievement(visitedCountries.length)
  const nextAchievement    = getNextAchievement(visitedCountries.length)

  return (
    <div className="min-h-screen bg-slate-950 pt-16 lg:pt-20 flex flex-col">

      {/* ── Cinematic header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border-b border-slate-800 py-5">
        {HEADER_PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-brand-400/20 pointer-events-none"
            style={{ width: p.size, height: p.size, top: `${p.top}%`, left: `${p.left}%` }}
            animate={{ y: [0, -14, 0], opacity: [0.12, 0.45, 0.12] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <Zap size={11} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">AI Travel Intelligence</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              <span className="text-white">World </span>
              <span className="gradient-text">Travel Map</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{countries.length} destinations · 10 intelligence layers · 3D globe view</p>
          </motion.div>

          {/* AI Search */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl">
            <div className="relative flex items-center gap-2 bg-white/6 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 focus-within:border-brand-500/40 transition-all duration-200">
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder='Try: "cheapest in Asia" · "safe beach" · "digital nomad" · "hidden gems"'
                className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-sm outline-none"
              />
              {searchQuery
                ? <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white transition-colors flex-shrink-0"><X size={14} /></button>
                : <span className="text-[9px] font-bold text-brand-500/70 uppercase tracking-wider hidden sm:block">AI</span>
              }
            </div>
            {searchQuery && stats && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-brand-400 mt-1.5 ml-1">
                {stats.count} destination{stats.count !== 1 ? 's' : ''} matched — {viewMode === 'globe' ? 'globe' : 'map'} updated
              </motion.p>
            )}
            <AnimatePresence>
              {showSuggestions && !searchQuery && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-2 flex flex-wrap gap-1.5">
                  {SEARCH_SUGGESTIONS.map(s => (
                    <button key={s} onMouseDown={() => { setSearchQuery(s); setShowSuggestions(false) }}
                      className="text-[11px] px-3 py-1 rounded-full bg-white/6 hover:bg-white/12 border border-white/10 hover:border-brand-500/40 text-slate-300 hover:text-white transition-all duration-150">
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ── Layer control bar ──────────────────────────────────────────────*/}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="section-container py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 mr-1 flex-shrink-0">
              <Layers size={12} className="text-slate-600" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Layer</span>
            </div>
            {LAYERS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveLayer(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeLayer === id ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                <Icon size={11} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter + legend bar ────────────────────────────────────────────*/}
      <div className="bg-slate-900/80 border-b border-slate-800">
        <div className="section-container py-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter size={11} className="text-slate-600" />
            <div className="flex gap-1 flex-wrap">
              {BUDGET_FILTERS.map(f => (
                <button key={f} onClick={() => setBudgetFilter(f)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${budgetFilter === f ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <select value={continentFilter} onChange={e => setContinentFilter(e.target.value)}
            className="text-xs font-medium rounded-lg px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500">
            {CONTINENT_FILTERS.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2.5 flex-wrap">
            {activeLegend.map(([col, label]) => (
              <span key={label} className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: col }} />{label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats + action bar ─────────────────────────────────────────────*/}
      <div className="bg-slate-900/60 border-b border-slate-800/60">
        <div className="section-container py-2 flex items-center gap-3 flex-wrap">
          {stats && (
            <>
              <span className="text-xs text-slate-400"><span className="font-bold text-white">{stats.count}</span> destinations</span>
              <span className="text-xs text-slate-400">Avg <span className="font-bold text-emerald-400">${stats.avgBudget}</span>/day</span>
              <span className="text-xs text-slate-400"><span className="font-bold text-emerald-400">{stats.safeCount}</span> high-safety</span>
              <div className="flex items-center gap-1.5">
                {currentAchievement && <span className="text-base leading-none">{currentAchievement.icon}</span>}
                <span className="text-xs text-slate-400"><span className="font-bold text-brand-400">{visitedCountries.length}</span> visited</span>
                {nextAchievement && <span className="text-[10px] text-slate-600">· {nextAchievement.count - visitedCountries.length} to {nextAchievement.label}</span>}
              </div>
              {bucketList.length > 0 && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Bookmark size={11} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-amber-400">{bucketList.length}</span> saved
                </span>
              )}
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            {/* 🌍 Globe ↔ 🗺️ Map toggle */}
            <button
              onClick={() => setViewMode(m => m === 'globe' ? 'map' : 'globe')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:border-brand-500/50 hover:text-white transition-all duration-200"
            >
              {viewMode === 'globe' ? '🗺️ Flat Map' : '🌍 3D Globe'}
            </button>
            <button onClick={handleSurpriseMe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:opacity-90 transition-all duration-200">
              <Shuffle size={12} /> Surprise Me
            </button>
            <button onClick={() => setShowRoutePanel(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${showRoutePanel ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              <Plane size={12} /> Routes <ChevronDown size={11} className={`transition-transform ${showRoutePanel ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Routes panel */}
        <AnimatePresence>
          {showRoutePanel && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-800">
              <div className="section-container py-3 flex flex-wrap gap-2">
                <button onClick={() => setActiveRoute(null)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${!activeRoute ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>No Route</button>
                {PREDEFINED_ROUTES.map(route => (
                  <button key={route.id} onClick={() => setActiveRoute(r => r === route.id ? null : route.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${activeRoute === route.id ? 'text-white border-transparent' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                    style={activeRoute === route.id ? { background: route.color + '33', borderColor: route.color } : {}}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: route.color }} />
                    {route.label}
                    <span className="text-slate-400 font-normal hidden sm:inline">· {route.days}d · ${route.avgPerDay}/day</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Globe / Map + Sidebar ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 260px)', minHeight: 440 }}>

        <div className="flex-1 relative" ref={globeContainerRef}
          style={{ background: viewMode === 'globe' ? '#060b16' : (dark ? '#0f172a' : '#e2e8f0') }}>

          {/* ── 3D GLOBE VIEW ──────────────────────────────────────────── */}
          {viewMode === 'globe' && (
            <Suspense fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border-2 border-brand-500/30 border-t-brand-500" />
                <p className="text-xs text-slate-500">Rendering 3D globe…</p>
              </div>
            }>
              <GlobeGL
                ref={globeRef}
                width={globeSize.w}
                height={globeSize.h}
                // Earth appearance
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                atmosphereColor="rgba(99,102,241,0.65)"
                atmosphereAltitude={0.28}
                // Country markers
                pointsData={globePoints}
                pointLat="lat"
                pointLng="lng"
                pointColor={d => {
                  const isHighlighted = !searchMatches || searchMatches.includes(d.id)
                  return isHighlighted ? getMarkerColor(d, activeLayer) : '#334155'
                }}
                pointAltitude={d => selected?.id === d.id ? 0.14 : 0.03}
                pointRadius={d => {
                  const isHighlighted = !searchMatches || searchMatches.includes(d.id)
                  return selected?.id === d.id ? 1.5 : isHighlighted ? 0.75 : 0.45
                }}
                pointLabel={d => makeGlobeLabel(d, activeLayer)}
                onPointClick={d => handleCountryClick(d)}
              />
            </Suspense>
          )}

          {/* ── FLAT MAP VIEW ───────────────────────────────────────────── */}
          {viewMode === 'map' && (
            <MapContainer
              center={[20, 10]} zoom={2}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom key={dark ? 'dark' : 'light'}
            >
              <TileLayer url={tileUrl} attribution='&copy; <a href="https://carto.com">CartoDB</a> &copy; <a href="https://openstreetmap.org">OSM</a>' />
              <MapController flyToId={discoverFlyTo} fitIds={searchQuery ? (searchMatches || []) : null} />
              {routePolylines.map(seg => (
                <Polyline key={seg.key} positions={[seg.from, seg.to]} color={seg.color} weight={3} dashArray="10 7" opacity={0.9} />
              ))}
              {visible.map(c => {
                const isSelected    = selected?.id === c.id
                const isHighlighted = !searchMatches || searchMatches.includes(c.id)
                return (
                  <Marker key={c.id} position={COORDS[c.id]}
                    icon={buildIcon(isHighlighted ? getMarkerColor(c, activeLayer) : '#475569', isSelected, isHighlighted, c.flag)}
                    eventHandlers={{ click: () => handleCountryClick(c) }}>
                    <Popup>
                      <div style={{ fontFamily:'Inter,sans-serif', minWidth: 200 }}>
                        <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 22 }}>{c.flag}</span>
                          <div><strong style={{ fontSize: 14 }}>{c.name}</strong><div style={{ fontSize:11, color:'#94a3b8' }}>{c.continent}</div></div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 5, marginBottom: 10 }}>
                          {[['🎒',c.budget.backpacker.perDay,'#10b981'],['✈️',c.budget.standard.perDay,'#f97316'],['👑',c.budget.luxury.perDay,'#8b5cf6']].map(([l,v,col]) => (
                            <div key={l} style={{ textAlign:'center', background:'#f8fafc', borderRadius: 8, padding:'5px 2px' }}>
                              <div style={{ fontSize:12, fontWeight:700, color:col }}>${v}</div>
                              <div style={{ fontSize:9, color:'#94a3b8' }}>{l}/day</div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => handleCountryClick(c)} style={{ display:'block', width:'100%', textAlign:'center', padding:'6px 0', background:'linear-gradient(to right,#7c3aed,#8b5cf6)', color:'white', borderRadius:8, fontSize:11, fontWeight:600, border:'none', cursor:'pointer' }}>View full details →</button>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          )}

          {/* Visited progress — floating bottom-left */}
          {visitedCountries.length > 0 && (
            <div className="absolute bottom-3 left-3 z-[999] bg-slate-900/93 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2">
              <Eye size={12} className="text-brand-400" />
              <span className="text-xs text-white font-semibold">{visitedCountries.length}<span className="text-slate-400 font-normal"> visited</span></span>
              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-1">
                <div className="h-1.5 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${(visitedCountries.length / countries.length) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-600">/ {countries.length}</span>
              {currentAchievement && <span className="text-sm leading-none ml-0.5">{currentAchievement.icon}</span>}
            </div>
          )}

          {/* Globe-mode hint */}
          {viewMode === 'globe' && !selected && (
            <div className="absolute bottom-3 right-3 z-[999] bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl px-3 py-2">
              <p className="text-[10px] text-slate-500">Drag to rotate · Scroll to zoom · Click a marker</p>
            </div>
          )}

          {/* Achievement toast */}
          <AnimatePresence>
            {showAchievement && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="absolute bottom-14 right-3 z-[1000] bg-slate-900/96 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl max-w-[230px]"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none flex-shrink-0">{showAchievement.icon}</span>
                  <div>
                    <div className="text-[9px] font-bold text-brand-400 uppercase tracking-widest mb-0.5">Achievement Unlocked!</div>
                    <div className="font-bold text-white text-sm leading-tight">{showAchievement.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{showAchievement.desc}</div>
                  </div>
                </div>
                <div className="mt-3 h-1 rounded-full" style={{ background: showAchievement.color }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Country detail sidebar ─────────────────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <motion.aside
              key={selected.id}
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 290, damping: 28 }}
              className="w-80 bg-slate-900 border-l border-slate-700 overflow-y-auto flex-shrink-0"
            >
              {/* Hero image */}
              <div className="relative h-44 overflow-hidden flex-shrink-0">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&h=400&auto=format&fit=crop&q=80' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-black/25 to-transparent" />
                <button onClick={() => setSelected(null)} className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"><X size={14} /></button>
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl leading-none">{selected.flag}</span>
                    <div>
                      <div className="font-bold text-white text-base leading-tight">{selected.name}</div>
                      <div className="text-xs text-white/55">{selected.continent} · {selected.capital}</div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <button onClick={() => toggleFavorite(selected.id)} title="Favorite" className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isFavorite(selected.id) ? 'bg-rose-500' : 'bg-black/50 hover:bg-black/70'}`}>
                    <Heart size={13} className={isFavorite(selected.id) ? 'text-white fill-white' : 'text-white'} />
                  </button>
                  <button onClick={() => toggleVisited(selected.id)} title={visitedCountries.includes(selected.id) ? 'Unmark visited' : 'Mark as visited'} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${visitedCountries.includes(selected.id) ? 'bg-emerald-500' : 'bg-black/50 hover:bg-black/70'}`}>
                    <Check size={13} className="text-white" />
                  </button>
                  <button onClick={() => toggleBucketList(selected.id)} title="Bucket list" className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${bucketList.includes(selected.id) ? 'bg-amber-500' : 'bg-black/50 hover:bg-black/70'}`}>
                    <Bookmark size={13} className={bucketList.includes(selected.id) ? 'text-white fill-white' : 'text-white'} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                {SIDEBAR_TABS.map(tab => (
                  <button key={tab} onClick={() => setSidebarTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${sidebarTab === tab ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-4">

                {/* OVERVIEW */}
                {sidebarTab === 'overview' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{selected.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[[DollarSign,selected.currency.code,'Currency'],[Shield,selected.safety.charAt(0).toUpperCase()+selected.safety.slice(1),'Safety'],[MapPin,selected.capital,'Capital'],[Globe,selected.visa.type.split('(')[0].trim(),'Visa'],[Wifi,selected.internet.avgSpeed,'Internet'],[Star,selected.population,'Population']].map(([Icon,val,lbl]) => (
                        <div key={lbl} className="bg-slate-800 rounded-xl p-2.5">
                          <div className="flex items-center gap-1 text-brand-400 mb-0.5"><Icon size={9} /><span className="text-[9px] text-slate-500 uppercase tracking-wide">{lbl}</span></div>
                          <div className="font-semibold text-white text-xs truncate">{val}</div>
                        </div>
                      ))}
                    </div>
                    {selected.weather?.length === 12 && (() => {
                      const temps = selected.weather.map(w => w.temp)
                      const maxT = Math.max(...temps), minT = Math.min(...temps), rng = maxT - minT || 1
                      return (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Monthly Climate</p>
                          <div className="flex items-end gap-px h-10 mb-1">
                            {selected.weather.map((w, i) => (
                              <div key={w.month} title={`${w.month}: ${w.temp}°C`} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                                <div className={`w-full rounded-sm ${isBestMonth(selected.bestSeasons, i) ? 'bg-brand-500' : 'bg-slate-700'}`} style={{ height: `${15 + ((w.temp - minT) / rng) * 85}%` }} />
                                <span className="text-[7px] text-slate-600 leading-none">{MONTH_NAMES[i].charAt(0).toUpperCase()}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[9px] text-slate-600 flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-brand-500" />Best months highlighted</p>
                        </div>
                      )
                    })()}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Best Time to Visit</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.bestSeasons.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand-900/40 text-brand-300 border border-brand-800/50">{s}</span>)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selected.tags.slice(0, 7).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">{t}</span>)}
                    </div>
                    <div className="bg-gradient-to-br from-brand-900/40 to-purple-900/30 border border-brand-700/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-4 h-4 rounded-md bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0"><Zap size={9} className="text-white" /></div>
                        <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest">AI Insight</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{generateAIInsight(selected)}</p>
                    </div>
                  </div>
                )}

                {/* BUDGET */}
                {sidebarTab === 'budget' && (
                  <div className="space-y-4">
                    <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
                      {['backpacker','standard','luxury'].map(t => (
                        <button key={t} onClick={() => setBudgetTier(t)} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${budgetTier === t ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                          {t === 'backpacker' ? '🎒' : t === 'standard' ? '✈️' : '👑'} {t}
                        </button>
                      ))}
                    </div>
                    <div className="text-center py-4 bg-slate-800 rounded-xl">
                      <div className="text-4xl font-bold text-white">${selected.budget[budgetTier].perDay}</div>
                      <div className="text-xs text-slate-400 mt-1">per day · {budgetTier}</div>
                    </div>
                    {(() => {
                      const t = selected.budget[budgetTier]
                      const chartData = [{ name:'Hotel',value:t.hotel,color:'#8b5cf6' },{ name:'Food',value:t.food,color:'#f59e0b' },{ name:'Transport',value:t.transport,color:'#10b981' },{ name:'Activities',value:t.activities,color:'#06b6d4' }]
                      return (
                        <div className="flex items-center gap-2">
                          <ResponsiveContainer width={110} height={110}>
                            <PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={52} dataKey="value" strokeWidth={0}>{chartData.map(e => <Cell key={e.name} fill={e.color} />)}</Pie></PieChart>
                          </ResponsiveContainer>
                          <div className="flex-1 space-y-2">
                            {chartData.map(d => (
                              <div key={d.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} /><span className="text-slate-400">{d.name}</span></div>
                                <span className="font-bold text-white">${d.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    {(() => {
                      const t = selected.budget[budgetTier], max = Math.max(t.hotel,t.food,t.transport,t.activities)
                      return (
                        <div className="space-y-2.5">
                          {[['Hotel',t.hotel,'bg-brand-500'],['Food',t.food,'bg-amber-500'],['Transport',t.transport,'bg-emerald-500'],['Activities',t.activities,'bg-cyan-500']].map(([n,v,b]) => (
                            <div key={n} className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 w-16 flex-shrink-0">{n}</span>
                              <div className="flex-1 h-1.5 rounded-full bg-slate-700"><div className={`h-1.5 rounded-full ${b} transition-all duration-500`} style={{ width:`${Math.round((v/max)*100)}%` }} /></div>
                              <span className="text-xs font-bold text-white w-9 text-right">${v}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                    <div className="flex justify-between text-xs py-2 border-t border-slate-800"><span className="text-slate-400">Visa cost</span><span className="font-semibold text-white">{selected.visa.cost}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Currency</span><span className="font-semibold text-white">{selected.currency.code} ({selected.currency.symbol})</span></div>
                  </div>
                )}

                {/* HOTELS */}
                {sidebarTab === 'hotels' && (
                  <div className="space-y-3">
                    {selected.hotels.map(h => (
                      <div key={h.name} className="bg-slate-800 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div><div className="font-semibold text-white text-xs">{h.name}</div><div className="text-[10px] text-slate-400 mt-0.5">{h.area}</div></div>
                          <div className="text-right flex-shrink-0"><div className="font-bold text-emerald-400 text-sm">${h.pricePerNight}</div><div className="text-[10px] text-slate-500">/night</div></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">{Array.from({length:h.stars},(_,i) => <Star key={i} size={9} className="text-amber-400 fill-amber-400" />)}</div>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${h.type==='luxury'?'bg-brand-900/50 text-brand-300':h.type==='standard'?'bg-blue-900/50 text-blue-300':'bg-emerald-900/50 text-emerald-300'}`}>{h.type}</span>
                          <span className="text-[9px] text-amber-400 ml-auto">★ {h.rating}</span>
                        </div>
                      </div>
                    ))}
                    <div className="bg-slate-800/60 rounded-xl p-3 mt-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Getting Around</p>
                      <div className="space-y-1.5 text-xs">
                        {[['Public transport',selected.transport.publicTransport],['Taxi',selected.transport.taxi],['Car rental',selected.transport.carRental]].map(([lbl,val]) => val && (
                          <div key={lbl} className="flex justify-between gap-2"><span className="text-slate-400 flex-shrink-0">{lbl}</span><span className="text-slate-300 text-right truncate max-w-[140px]">{val}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* EXPLORE */}
                {sidebarTab === 'explore' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Top Attractions</p>
                      <div className="space-y-2">
                        {selected.attractions.slice(0, 4).map(a => (
                          <div key={a.name} className="flex items-center justify-between bg-slate-800 rounded-xl px-3 py-2">
                            <div><div className="text-xs font-semibold text-white">{a.name}</div><div className="text-[10px] text-slate-400">{a.type} · {a.duration}</div></div>
                            <div className="text-xs font-semibold text-emerald-400 flex-shrink-0 ml-2">{a.entryFee === 0 ? 'Free' : `$${a.entryFee}`}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Must-Try Food</p>
                      <div className="space-y-1.5">
                        {selected.restaurants.slice(0, 3).map(r => (
                          <div key={r.name} className="flex items-center justify-between text-xs bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                            <div><span className="text-slate-200 font-medium">{r.name}</span><span className="text-slate-500 ml-1">· {r.mustTry}</span></div>
                            <span className="text-amber-400 flex-shrink-0 ml-1">{r.priceRange}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Highlights</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.highlights.map(h => <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-900/30 text-brand-300 border border-brand-800/40">{h}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Travel Tips</p>
                      <div className="space-y-2">
                        {generateTips(selected).map((tip, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-sm leading-none mt-0.5 flex-shrink-0">{tip.icon}</span>
                            <span className="text-[11px] text-slate-400 leading-relaxed">{tip.tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTAs */}
              <div className="p-4 pt-0 space-y-2 border-t border-slate-800 mt-2">
                <Link to={`/country/${selected.id}`} className="btn-primary w-full justify-center py-2.5 text-xs">
                  Full Country Guide <ChevronRight size={13} />
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => addToCompare(selected.id)} disabled={compareList.includes(selected.id) || compareList.length >= 3}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-700 text-slate-300 hover:border-brand-500 hover:text-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    {compareList.includes(selected.id) ? '✓ Comparing' : '+ Compare'}
                  </button>
                  <button onClick={() => toggleBucketList(selected.id)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${bucketList.includes(selected.id) ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-300 hover:border-amber-500/40 hover:text-amber-400'}`}>
                    <Bookmark size={12} className={bucketList.includes(selected.id) ? 'fill-amber-400' : ''} />
                    {bucketList.includes(selected.id) ? 'Saved' : 'Bucket List'}
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
