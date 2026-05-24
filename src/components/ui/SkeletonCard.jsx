/**
 * Pulse-animated placeholder card shown while country images / data load.
 * Drop-in substitute for CountryCard — same grid dimensions, no props needed.
 */
export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-card animate-pulse">
      {/* Image area */}
      <div className="h-48 bg-slate-200 dark:bg-slate-700" />

      <div className="p-5 space-y-3">
        {/* Flag + name row */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Capital line */}
        <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />

        {/* Budget badges row */}
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  )
}
