import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Home, Map, Calculator } from 'lucide-react'

// Quick links shown below the 404 message to help the user recover
const suggestions = [
  { label: 'Back to Home',       to: '/',           icon: Home },
  { label: 'Explore Countries',  to: '/explore',    icon: Map },
  { label: 'Budget Calculator',  to: '/calculator', icon: Calculator },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-lg"
      >
        {/* Decorative globe */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-600 to-purple-500 flex items-center justify-center shadow-glow">
            <Globe size={44} className="text-white" />
          </div>
        </div>

        {/* 404 headline */}
        <h1 className="font-display text-8xl font-bold gradient-text mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          Destination Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          Looks like this page wandered off the map. It may have been moved,
          deleted, or perhaps it never existed. Let's get you back on track.
        </p>

        {/* Recovery links */}
        <div className="flex flex-wrap gap-3 justify-center">
          {suggestions.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
                         bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                         text-slate-700 dark:text-slate-200 shadow-card
                         hover:bg-brand-50 dark:hover:bg-slate-700 hover:-translate-y-0.5
                         transition-all duration-200"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
