import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Solo Traveler · 32 countries',
    avatar: 'https://i.pravatar.cc/80?img=47',
    text: 'TravelBudget saved my Southeast Asia trip. I had an exact daily budget for each country and never ran short. The hotel and food breakdowns are incredibly accurate.',
    rating: 5,
    destination: 'Thailand & Bali',
  },
  {
    name: 'James Okonkwo',
    role: 'Family Travel Blogger',
    avatar: 'https://i.pravatar.cc/80?img=12',
    text: 'Planning a family trip to Europe used to be a nightmare. This tool made it effortless — I compared costs across 6 countries and found we could afford Italy AND Portugal.',
    rating: 5,
    destination: 'Italy & Portugal',
  },
  {
    name: 'Priya Sharma',
    role: 'Digital Nomad · Remote Worker',
    avatar: 'https://i.pravatar.cc/80?img=45',
    text: 'The digital nomad cost breakdown is chef\'s kiss. Knowing the SIM card costs, coworking spaces, and average rent helped me choose Lisbon over Amsterdam — perfect decision.',
    rating: 5,
    destination: 'Lisbon, Portugal',
  },
  {
    name: 'Marco Bianchi',
    role: 'Backpacker & Adventurer',
    avatar: 'https://i.pravatar.cc/80?img=68',
    text: 'I budgeted $2,800 for 3 months in South America using this calculator. I came back with $400 to spare. The accuracy of the budget tiers is unmatched.',
    rating: 5,
    destination: 'Peru, Colombia & Brazil',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">Traveler Reviews</p>
          <h2 className="section-title mb-4">Loved by Travelers Worldwide</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Real stories from travelers who planned with TravelBudget</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map(({ name, role, avatar, text, rating, destination }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-card"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote size={24} className="text-brand-200 dark:text-brand-800 mb-3" />
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5">{text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{role}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-full">
                  {destination}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
