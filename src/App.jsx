// FEATURE: APP ROOT
// PURPOSE: Root router — registers all routes and mounts global UI overlays
// DEPENDENCIES: All feature pages, layout components, context providers

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider }      from '@context/AppContext'
import { ThemeProvider }    from '@context/ThemeContext'
import { AIContextProvider } from '@context/AIContext'

// Layout & global overlays (rendered on every page)
import Navbar          from '@components/layout/Navbar'
import ScrollToTop     from '@components/layout/ScrollToTop'
import BackToTop       from '@components/layout/BackToTop'
import AIChatAssistant from '@features/ai-assistant/components/AIChatAssistant'

// Feature pages
import Home            from '@features/home/pages/Home'
import Explore         from '@features/countries/pages/Explore'
import CountryDetail   from '@features/countries/pages/CountryDetail'
import BudgetCalculator from '@features/budget-calculator/pages/BudgetCalculator'
import Compare         from '@features/compare/pages/Compare'
import Hotels          from '@features/hotels/pages/Hotels'
import Restaurants     from '@features/restaurants/pages/Restaurants'
import TravelTips      from '@features/tips/pages/TravelTips'
import Favorites       from '@features/favorites/pages/Favorites'
import WorldMap        from '@features/maps/pages/WorldMap'
import Dashboard       from '@features/dashboard/pages/Dashboard'
import About           from '@features/about/pages/About'
import Contact         from '@features/contact/pages/Contact'
import NotFound        from '@components/ui/NotFound'

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"              element={<Home />} />
        <Route path="/explore"       element={<Explore />} />
        <Route path="/country/:id"   element={<CountryDetail />} />
        <Route path="/calculator"    element={<BudgetCalculator />} />
        <Route path="/compare"       element={<Compare />} />
        <Route path="/hotels"        element={<Hotels />} />
        <Route path="/restaurants"   element={<Restaurants />} />
        <Route path="/tips"          element={<TravelTips />} />
        <Route path="/favorites"     element={<Favorites />} />
        <Route path="/map"           element={<WorldMap />} />
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/about"         element={<About />} />
        <Route path="/contact"       element={<Contact />} />
        {/* Catch-all — any unknown URL shows 404 instead of blank screen */}
        <Route path="*"              element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        {/* AIContextProvider must be inside BrowserRouter's siblings but wraps the
            chat assistant so pages inside BrowserRouter can feed it context */}
        <AIContextProvider>
        <BrowserRouter>
          {/* ScrollToTop must be inside BrowserRouter so it can read useLocation */}
          <ScrollToTop />
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />
            <AppRoutes />
            {/* Global floating UI — visible on every page */}
            <BackToTop />
            <AIChatAssistant />
          </div>
        </BrowserRouter>
        </AIContextProvider>
      </AppProvider>
    </ThemeProvider>
  )
}
