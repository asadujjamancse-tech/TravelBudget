import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import ScrollToTop from './components/layout/ScrollToTop'
import BackToTop from './components/layout/BackToTop'
import Home from './pages/Home'
import Explore from './pages/Explore'
import CountryDetail from './pages/CountryDetail'
import BudgetCalculator from './pages/BudgetCalculator'
import Compare from './pages/Compare'
import Hotels from './pages/Hotels'
import Restaurants from './pages/Restaurants'
import TravelTips from './pages/TravelTips'
import About from './pages/About'
import Contact from './pages/Contact'
import Favorites from './pages/Favorites'
import NotFound from './pages/NotFound'

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
        <Route path="/about"         element={<About />} />
        <Route path="/contact"       element={<Contact />} />
        <Route path="/favorites"     element={<Favorites />} />
        {/* Catch-all: any unknown URL shows the 404 page instead of a blank screen */}
        <Route path="*"              element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          {/* ScrollToTop must be inside BrowserRouter so it can read useLocation */}
          <ScrollToTop />
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />
            <AppRoutes />
            {/* Global floating button — available on every page */}
            <BackToTop />
          </div>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
