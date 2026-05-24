export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton w-3/4" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 skeleton rounded-xl" />
          <div className="h-12 skeleton rounded-xl" />
          <div className="h-12 skeleton rounded-xl" />
        </div>
        <div className="h-4 skeleton w-1/2" />
      </div>
    </div>
  )
}

export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 skeleton ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}
