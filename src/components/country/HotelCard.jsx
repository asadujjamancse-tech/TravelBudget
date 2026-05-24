import { Star, MapPin } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const typeColors = {
  luxury:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  budget:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

export default function HotelCard({ hotel }) {
  const { currencySymbol, convertCurrency } = useApp()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-card card-hover">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">{hotel.name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {hotel.area}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeColors[hotel.type]}`}>
          {hotel.type}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, i) => (
          <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
        ))}
        {hotel.stars > 5 && <span className="text-xs text-amber-500 font-bold ml-1">7★</span>}
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">({hotel.rating})</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {currencySymbol}{convertCurrency(hotel.pricePerNight)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/night</span>
        </div>
        <button className="btn-primary py-2 px-4 text-sm">View Deal</button>
      </div>
    </div>
  )
}
