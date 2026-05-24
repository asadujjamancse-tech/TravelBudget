import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Automatically scrolls the window to the top whenever the route changes.
 * Without this, React Router keeps the previous scroll position when navigating
 * between pages (e.g. scrolled halfway down Explore → click country → still halfway down).
 *
 * Place this component once, inside <BrowserRouter> but outside <Routes>, in App.jsx.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname]) // re-runs on every route change

  // Renders nothing — purely a side-effect component
  return null
}
