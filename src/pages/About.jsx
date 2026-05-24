import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Globe, Heart, Shield, Zap } from 'lucide-react'
import Footer from '../components/layout/Footer'

const team = [
  { name: 'Alex Chen', role: 'Founder & Lead Developer', avatar: 'https://i.pravatar.cc/80?img=11', bio: 'Former Google engineer who quit to backpack 60 countries and build tools for real travelers.' },
  { name: 'Sarah Mitchell', role: 'Travel Data Researcher', avatar: 'https://i.pravatar.cc/80?img=47', bio: 'Spent 4 years researching real travel costs across Asia and Europe. Obsessed with data accuracy.' },
  { name: 'Marcus Johnson', role: 'UX Designer', avatar: 'https://i.pravatar.cc/80?img=68', bio: 'Believes travel planning should feel as exciting as the trip itself. Designing for delight.' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 py-20">
        <div className="section-container text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl font-bold mb-4">Our Story</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-white/80 max-w-2xl mx-auto">
            TravelBudget was born from a simple frustration: travel budget guides were either too vague or way out of date. We built what we wished existed.
          </motion.p>
        </div>
      </div>

      <div className="section-container py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-5">Why We Built This</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              After getting badly burned by outdated budget guides that claimed you could survive in Tokyo on $30/day (you can't), we decided to build something better. TravelBudget uses real, regularly updated data from travelers on the ground.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our mission is simple: give every traveler the information they need to plan a trip that fits their budget — whether they're a student backpacking Southeast Asia or a couple celebrating an anniversary in the Maldives.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Globe, label: '25+ Countries', sub: 'And growing monthly', color: 'from-brand-500 to-purple-500' },
              { icon: Heart, label: '50K+ Travelers', sub: 'Trust our data', color: 'from-rose-500 to-pink-500' },
              { icon: Shield, label: 'Verified Data', sub: 'Updated regularly', color: 'from-emerald-500 to-teal-500' },
              { icon: Zap, label: 'Free Forever', sub: 'No paywalls ever', color: 'from-amber-500 to-orange-500' },
            ].map(({ icon: Icon, label, sub, color }) => (
              <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-card">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-8 text-center">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map(({ name, role, avatar, bio }) => (
              <div key={name} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-card text-center">
                <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-brand-100 dark:border-brand-900" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{name}</h3>
                <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-3">{role}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-3xl p-10 text-white text-center">
          <h2 className="font-display text-3xl font-bold mb-3">Ready to plan your trip?</h2>
          <p className="text-white/80 mb-6">Explore 25+ destinations and calculate your exact budget in minutes.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/explore" className="btn-glass">Explore Countries</Link>
            <Link to="/calculator" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors">Calculate Budget</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
