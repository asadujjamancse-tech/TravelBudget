import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage('favorites', [])
  const [savedTrips, setSavedTrips] = useLocalStorage('savedTrips', [])
  const [currency, setCurrency] = useLocalStorage('currency', 'USD')
  const [compareList, setCompareList] = useState([])

  const toggleFavorite = (countryId) => {
    setFavorites(prev =>
      prev.includes(countryId) ? prev.filter(id => id !== countryId) : [...prev, countryId]
    )
  }

  const isFavorite = (countryId) => favorites.includes(countryId)

  const addTrip = (trip) => setSavedTrips(prev => [...prev, { ...trip, id: Date.now() }])
  const removeTrip = (id) => setSavedTrips(prev => prev.filter(t => t.id !== id))

  const addToCompare = (countryId) => {
    if (compareList.length >= 3) return false
    if (compareList.includes(countryId)) return false
    setCompareList(prev => [...prev, countryId])
    return true
  }
  const removeFromCompare = (countryId) => setCompareList(prev => prev.filter(id => id !== countryId))
  const clearCompare = () => setCompareList([])

  const exchangeRates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149, AUD: 1.53, CAD: 1.36, AED: 3.67, INR: 83 }

  const convertCurrency = (amountUSD) => {
    const rate = exchangeRates[currency] ?? 1
    return (amountUSD * rate).toFixed(2)
  }

  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$', AED: 'د.إ', INR: '₹' }
  const currencySymbol = currencySymbols[currency] ?? '$'

  return (
    <AppContext.Provider value={{
      favorites, toggleFavorite, isFavorite,
      savedTrips, addTrip, removeTrip,
      compareList, addToCompare, removeFromCompare, clearCompare,
      currency, setCurrency, convertCurrency, currencySymbol, exchangeRates,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
