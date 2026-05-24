import { Star, Clock, DollarSign } from 'lucide-react'
import { useApp } from '@context/AppContext'

const typeEmoji = {
  Historic: '🏛️', Museum: '🖼️', Nature: '🌿', Spiritual: '⛩️',
  Adventure: '🧗', Landmark: '🗼', Culture: '🎭', Beach: '🏖️',
  Wildlife: '🦁', Hiking: '🥾', 'Theme Park': '🎡', Wellness: '🧘',
  Art: '🎨', Urban: '🌆',
}

export default function AttractionCard({ attraction }) {
  const { currencySymbol, convertCurrency } = useApp()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-card card-hover">
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{typeEmoji[attraction.type] ?? '📍'}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{attraction.name}</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">{attraction.type}</span>

          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-slate-600 dark:text-slate-300">{attraction.rating}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {attraction.duration}
        </span>
        <span className={`font-semibold ${attraction.entryFee === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {attraction.entryFee === 0 ? 'Free entry' : `${currencySymbol}${convertCurrency(attraction.entryFee)}`}
        </span>
      </div>
    </div>
  )
}
