// FEATURE: AI CONTEXT
// PURPOSE: Centralized store for all live page/session context the AI assistant reads
// DEPENDENCIES: React only — no other imports, keeping this a pure isolated store

// ─── ARCHITECTURE OVERVIEW ────────────────────────────────────────────────────
//
//  ┌────────────────┐   updateAIContext()    ┌──────────────────────┐
//  │  Any Page      │ ─────────────────────► │  AIContext (store)   │
//  │  (via hook)    │                         │                      │
//  └────────────────┘                         │  currentPage         │
//                                             │  selectedCountry     │
//  ┌────────────────┐   useAICtx()            │  activeFilters       │
//  │ AIChatAssistant│ ◄───────────────────── │  budgetTier          │
//  │  (consumer)    │                         │  travelDays          │
//  └────────────────┘                         │  lastMentionedCountry│
//                                             └──────────────────────┘
//
// ─── THREE TIERS OF CONTEXT ──────────────────────────────────────────────────
//
//  1. PAGE-LEVEL  (cleared on navigation — owned by the current route)
//     currentPage, selectedCountry, selectedCity, activeFilters
//     Set by usePageContext() hook; cleared on unmount via clearPageContext().
//
//  2. SESSION-LEVEL  (persists across navigation — owned by the user's session)
//     budgetTier, travelDays, travelStyle
//     Set by BudgetCalculator; preserved even after leaving that page so the
//     AI can say "based on your 7-day standard budget..." anywhere in the app.
//
//  3. CONVERSATION MEMORY  (persists within a chat session)
//     lastMentionedCountry — country ID from the most recent AI response turn.
//     Lets the AI resolve follow-up messages like "what about hotels?" after
//     a prior message established Japan as the topic.
//     Reset only when the chat is explicitly cleared by the user.
//
// ─── HOW TO EXTEND ───────────────────────────────────────────────────────────
//  1. Add the field to DEFAULT_CONTEXT with null as default.
//  2. Document it in the AIContextState typedef below.
//  3. Have the owning page call updateAIContext({ newField: value }).
//  4. Decide which tier it belongs to:
//       Page-level → add to clearPageContext() so it resets on navigation.
//       Session/conversation → do NOT add to clearPageContext().
//
// ─── FUTURE AI API INTEGRATION ───────────────────────────────────────────────
//  When connecting a real AI API (e.g., Anthropic Claude), this context object
//  becomes the system prompt payload. No page code needs to change:
//
//    const systemPrompt = buildSystemPrompt(aiCtx)   // serialize this store
//    const response = await claude.complete({ system: systemPrompt, ... })
//
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useState } from 'react'

/**
 * Union of all valid page identifiers. Null means between navigations.
 * @typedef {'home'|'explore'|'country-detail'|'calculator'|'compare'|
 *           'hotels'|'restaurants'|'tips'|'map'|'dashboard'|'favorites'|null} PageId
 */

/**
 * Shape of the AI context store.
 * All fields nullable so pages only set what they own — the AI degrades gracefully.
 *
 * @typedef {Object} AIContextState
 * @property {PageId}      currentPage          - Which route the user is on right now
 * @property {Object|null} selectedCountry      - Full country object from countries.js
 * @property {string|null} selectedCity         - City name (future: hotel/map city picker)
 * @property {'backpacker'|'standard'|'luxury'|null} budgetTier - Budget tier from Calculator
 * @property {number|null} travelDays           - Trip duration in days (from Calculator)
 * @property {'solo'|'couple'|'family'|'group'|null} travelStyle
 * @property {Object}      activeFilters        - { continent, budget, tags, query, type }
 * @property {string|null} lastMentionedCountry - Country ID from last AI turn (conversation memory)
 */
const DEFAULT_CONTEXT = {
  currentPage: null,
  selectedCountry: null,
  selectedCity: null,
  budgetTier: null,
  travelDays: null,
  travelStyle: null,
  activeFilters: {},
  lastMentionedCountry: null,
}

const AIContext = createContext({
  aiCtx: DEFAULT_CONTEXT,
  updateAIContext: () => {},
  clearPageContext: () => {},
})

export function AIContextProvider({ children }) {
  const [aiCtx, setAICtx] = useState(DEFAULT_CONTEXT)

  /** Merge partial updates — pages only set the fields they own, others untouched */
  const updateAIContext = useCallback((updates) => {
    setAICtx(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Reset page-specific fields when navigating away from a page.
   * Called automatically by usePageContext's useEffect cleanup.
   *
   * Session-level fields (budgetTier, travelDays, travelStyle) are intentionally
   * NOT cleared here — they persist across navigation so the AI can reference
   * "your 7-day budget" after the user leaves the Calculator page.
   *
   * Conversation memory (lastMentionedCountry) is also preserved — it resets
   * only when the user explicitly clears the chat.
   */
  const clearPageContext = useCallback(() => {
    setAICtx(prev => ({
      ...prev,
      currentPage: null,
      selectedCountry: null,
      selectedCity: null,
      activeFilters: {},
    }))
  }, [])

  return (
    <AIContext.Provider value={{ aiCtx, updateAIContext, clearPageContext }}>
      {children}
    </AIContext.Provider>
  )
}

/** Access the AI context store from any component or hook */
export const useAICtx = () => useContext(AIContext)
