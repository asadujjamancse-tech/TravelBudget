import { Link } from 'react-router-dom'
import { Globe, Share2, AtSign, Rss, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-24">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-500 flex items-center justify-center">
                <Globe size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Travel<span className="text-brand-400">Budget</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Plan your perfect trip with real travel cost data for 30+ countries. From budget backpacking to luxury escapes.
            </p>
            <div className="flex items-center gap-3">
              {[Share2, AtSign, Rss].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[['Europe', '/explore?continent=Europe'], ['Asia', '/explore?continent=Asia'], ['Americas', '/explore?continent=North America'], ['Africa', '/explore?continent=Africa'], ['Oceania', '/explore?continent=Oceania']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-white mb-4">Tools</h4>
            <ul className="space-y-2.5">
              {[['Budget Calculator', '/calculator'], ['Compare Countries', '/compare'], ['Hotels & Stays', '/hotels'], ['Restaurants', '/restaurants'], ['Travel Tips', '/tips']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail size={15} className="text-brand-400 flex-shrink-0" />
                hello@travelbudget.com
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <MapPin size={15} className="text-brand-400 flex-shrink-0" />
                Remote — Worldwide
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-2">Subscribe to travel deals</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
                <button className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors duration-200">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2025 TravelBudget. All prices are approximate and updated regularly.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">About</Link>
            <Link to="/contact" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Contact</Link>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
