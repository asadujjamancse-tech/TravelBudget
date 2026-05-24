import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Menu, X, Sun, Moon, Heart, Calculator, Map, Home, BookOpen, Info, Phone, BarChart2, Hotel } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'

const navLinks = [
  { to: '/',           label: 'Home',       icon: Home },
  { to: '/explore',    label: 'Explore',    icon: Globe },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/compare',    label: 'Compare',    icon: BarChart2 },
  { to: '/hotels',     label: 'Hotels',     icon: Hotel },
  { to: '/tips',       label: 'Travel Tips',icon: BookOpen },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, toggle } = useTheme()
  const { favorites } = useApp()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isHome = location.pathname === '/'
  const glassBg = scrolled || !isHome
    ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-white/10'
    : 'bg-transparent'

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${glassBg}`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-500 flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform duration-200">
                <Globe size={18} className="text-white" />
              </div>
              <span className={`font-display font-bold text-lg ${scrolled || !isHome ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                Travel<span className="text-brand-400">Budget</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-brand-600 text-white shadow-glow-sm'
                        : scrolled || !isHome
                          ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggle}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  scrolled || !isHome
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Toggle theme"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Favorites */}
              <Link
                to="/favorites"
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                  scrolled || !isHome
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart size={18} />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* CTA */}
              <Link to="/calculator" className="hidden sm:block btn-primary py-2 px-4 text-sm">
                Plan Trip
              </Link>

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className={`lg:hidden p-2.5 rounded-xl transition-all duration-200 ${
                  scrolled || !isHome
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-xl lg:hidden"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                )
              })}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                <Link to="/calculator" className="btn-primary w-full justify-center py-3">
                  Plan Your Trip
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
