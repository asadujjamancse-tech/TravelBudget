// FEATURE: SHARED HOOK
// PURPOSE: Register a page's live state with the AI context store on mount/filter change
// DEPENDENCIES: @context/AIContext

// ─── USAGE ───────────────────────────────────────────────────────────────────
//
//   // Basic — report page identity on mount:
//   usePageContext(() => ({ currentPage: 'hotels' }), [])
//
//   // With live state — re-report when filters change:
//   usePageContext(
//     () => ({ currentPage: 'explore', activeFilters: { continent, budget } }),
//     [continent, budget]
//   )
//
//   // Country detail — pass full country object so AI resolves implicit questions:
//   usePageContext(
//     () => ({ currentPage: 'country-detail', selectedCountry: country }),
//     [country?.id]   // dep on .id, not the object, to avoid infinite re-runs
//   )
//
// ─── WHY A FACTORY FUNCTION? ─────────────────────────────────────────────────
//  If pages passed a plain object literal, every render would create a new
//  reference and trigger the effect. The factory pattern (`() => ({...})`)
//  lets the caller control exactly when the effect re-runs via the deps array,
//  matching the same mental model as useEffect itself.
//
// ─── CLEANUP BEHAVIOR ────────────────────────────────────────────────────────
//  On unmount, clearPageContext() resets page-specific fields (currentPage,
//  selectedCountry, activeFilters) so stale data doesn't leak into the next
//  page. Session fields (budgetTier, lastMentionedCountry) are preserved.
//
// ─── FUTURE AI MEMORY SUPPORT ────────────────────────────────────────────────
//  This hook is the right place to add server-side context sync when real AI
//  memory is introduced. POST the context delta here without touching any page:
//
//    useEffect(() => {
//      const updates = contextFn()
//      updateAIContext(updates)
//      serverAISession.patch(updates)   // ← add this line
//      return clearPageContext
//    }, deps)
//
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useAICtx } from '@context/AIContext'

/**
 * @param {() => Partial<import('@context/AIContext').AIContextState>} contextFn
 *   Factory that returns the context fields this page owns.
 *   Called on mount and whenever deps change.
 * @param {React.DependencyList} deps
 *   Values that, when changed, should re-report context (e.g., [continent, budget]).
 *   Same semantics as the second argument of useEffect.
 */
export function usePageContext(contextFn, deps = []) {
  const { updateAIContext, clearPageContext } = useAICtx()

  useEffect(() => {
    updateAIContext(contextFn())
    // Cleanup: clear page-specific fields when this page unmounts / user navigates away
    return clearPageContext
    // deps are controlled by the caller — ESLint cannot statically verify them here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
