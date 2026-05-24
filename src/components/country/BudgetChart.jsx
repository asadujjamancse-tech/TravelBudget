import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { useApp } from '../../context/AppContext'

const TIER_COLORS = { backpacker: '#10b981', standard: '#3b82f6', luxury: '#8b5cf6' }

export default function BudgetChart({ country }) {
  const { currencySymbol, convertCurrency } = useApp()

  const barData = [
    {
      category: 'Hotel',
      Backpacker: country.budget.backpacker.hotel,
      Standard: country.budget.standard.hotel,
      Luxury: country.budget.luxury.hotel,
    },
    {
      category: 'Food',
      Backpacker: country.budget.backpacker.food,
      Standard: country.budget.standard.food,
      Luxury: country.budget.luxury.food,
    },
    {
      category: 'Transport',
      Backpacker: country.budget.backpacker.transport,
      Standard: country.budget.standard.transport,
      Luxury: country.budget.luxury.transport,
    },
    {
      category: 'Activities',
      Backpacker: country.budget.backpacker.activities,
      Standard: country.budget.standard.activities,
      Luxury: country.budget.luxury.activities,
    },
  ]

  const tiers = [
    { key: 'backpacker', label: 'Backpacker', cls: 'badge-backpacker' },
    { key: 'standard',   label: 'Standard',   cls: 'badge-standard' },
    { key: 'luxury',     label: 'Luxury',      cls: 'badge-luxury' },
  ]

  return (
    <div className="space-y-6">
      {/* Tier summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {tiers.map(({ key, label, cls }) => {
          const b = country.budget[key]
          return (
            <div key={key} className={`rounded-2xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">{label}</p>
              <p className="text-2xl font-bold">{currencySymbol}{convertCurrency(b.perDay)}</p>
              <p className="text-xs opacity-70">per day</p>
              <div className="mt-3 space-y-1 text-left text-xs opacity-80">
                <div className="flex justify-between"><span>Hotel</span><span>{currencySymbol}{convertCurrency(b.hotel)}</span></div>
                <div className="flex justify-between"><span>Food</span><span>{currencySymbol}{convertCurrency(b.food)}</span></div>
                <div className="flex justify-between"><span>Transport</span><span>{currencySymbol}{convertCurrency(b.transport)}</span></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Cost Breakdown by Category (USD)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barSize={14} barGap={3}>
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }}
              formatter={(v) => [`$${v}`, '']}
            />
            <Bar dataKey="Backpacker" fill={TIER_COLORS.backpacker} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Standard"   fill={TIER_COLORS.standard}   radius={[4, 4, 0, 0]} />
            <Bar dataKey="Luxury"     fill={TIER_COLORS.luxury}      radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          {Object.entries(TIER_COLORS).map(([k, c]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 capitalize">
              <div className="w-3 h-3 rounded-full" style={{ background: c }} />
              {k}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
