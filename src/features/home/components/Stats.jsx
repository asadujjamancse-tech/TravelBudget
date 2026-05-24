import { useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { Globe, Users, MapPin, DollarSign } from 'lucide-react'

function Counter({ to, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(0)

  useEffect(() => {
    if (inView) {
      animate(count, to, { duration: 2, ease: 'easeOut' })
    }
  }, [inView, to, count])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <motion.span>{useTransform(count, v => Math.round(v).toLocaleString())}</motion.span>
      {suffix}
    </span>
  )
}

const stats = [
  { icon: Globe, label: 'Countries Covered', value: 25, suffix: '+', color: 'text-brand-500' },
  { icon: Users, label: 'Travelers Helped', value: 50000, suffix: '+', color: 'text-purple-500' },
  { icon: MapPin, label: 'Destinations', value: 500, suffix: '+', color: 'text-pink-500' },
  { icon: DollarSign, label: 'Avg Savings Found', value: 35, suffix: '%', color: 'text-emerald-500' },
]

export default function Stats() {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, label, value, suffix, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center text-white"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Icon size={24} className="text-white" />
              </div>
              <div className="text-4xl font-bold mb-1">
                <Counter to={value} suffix={suffix} />
              </div>
              <div className="text-white/70 text-sm">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
