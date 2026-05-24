import { motion } from 'framer-motion'
import { Calculator, Globe, BarChart2, Heart, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Real Cost Data',
    description: '25+ countries with verified average daily costs for hotels, food, transport, and activities.',
    color: 'from-brand-500 to-brand-600',
  },
  {
    icon: Calculator,
    title: 'Smart Budget Calculator',
    description: 'Select your travel style, duration, and preferences. Get an instant detailed budget breakdown.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: BarChart2,
    title: 'Compare Countries',
    description: 'Side-by-side comparison of costs, safety, visa requirements, and travel conditions.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Heart,
    title: 'Save Favorites',
    description: 'Build your bucket list. Save countries and destinations for future trip planning.',
    color: 'from-orange-500 to-accent-600',
  },
  {
    icon: Shield,
    title: 'Safety Ratings',
    description: 'Up-to-date safety ratings and practical advice for every destination.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'No sign-up needed. Search, calculate, and plan your trip in seconds.',
    color: 'from-sky-500 to-blue-600',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="section-container">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3"
          >
            Why TravelBudget
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            Everything You Need to Plan Smarter
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
          >
            We do the research so you don't have to. Real data, real prices, zero surprises.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
