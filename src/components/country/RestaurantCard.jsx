import { Star, Utensils } from 'lucide-react'

const priceColor = {
  '$':    'text-emerald-600 dark:text-emerald-400',
  '$$':   'text-blue-600 dark:text-blue-400',
  '$$$':  'text-purple-600 dark:text-purple-400',
  '$$$$': 'text-rose-600 dark:text-rose-400',
}

export default function RestaurantCard({ restaurant }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-card card-hover">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-rose-500 flex items-center justify-center flex-shrink-0 mr-3">
          <Utensils size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{restaurant.name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{restaurant.type} · {restaurant.cuisine}</p>
        </div>
        <span className={`font-bold text-sm ml-2 ${priceColor[restaurant.priceRange] ?? 'text-slate-500'}`}>
          {restaurant.priceRange}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-3 mb-3">
        {Array.from({ length: Math.round(restaurant.rating) }).map((_, i) => (
          <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
        ))}
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{restaurant.rating}</span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Must try</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{restaurant.mustTry}</p>
      </div>
    </div>
  )
}
