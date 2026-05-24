// FEATURE: AI ASSISTANT
// PURPOSE: Floating context-aware, memory-enabled, action-dispatching AI travel chat
// DEPENDENCIES: @data/countries, @data/knowledgeBase, @context/AIContext,
//               @hooks/useLocalStorage, react-router-dom

// ─── FIVE CAPABILITY LAYERS ───────────────────────────────────────────────────
//
//  1. CONTEXT AWARENESS
//     Reads AIContext (page, country, filters, budget) so users can ask
//     "cheap food?" on the Japan page without saying "in Japan".
//     → useAICtx(), buildResponse(input, ctx, memory, ...)
//
//  2. FAQ KNOWLEDGE BASE (lightweight RAG)
//     retrieveKnowledge() scores the user's query against a travel FAQ dataset
//     (knowledgeBase.js). Answers: insurance, jet lag, packing, flights, safety...
//     → retrieveKnowledge() → kb.answer returned as bot response
//
//  3. AI MEMORY (localStorage-persisted)
//     Detects preference statements ("I prefer backpacking") and persists them.
//     Future responses use memory to personalize tier defaults and suggestions.
//     → useLocalStorage('ai-travel-memory'), detectPreferences()
//
//  4. STREAMING TEXT
//     Bot responses stream in character-by-character (like a real AI typing).
//     Links and follow-up chips reveal after streaming finishes.
//     → StreamingBubble component, msg.streaming flag
//
//  5. TOOL ACTIONS (website control)
//     Detects navigation commands ("show hotels in Bali", "open calculator") and
//     navigates to the correct page with a confirmatory message + delay.
//     → detectAction(), useNavigate()
//
// ─── HOW TO EXTEND ───────────────────────────────────────────────────────────
//
//  New query type: add a handler block inside buildResponse() after existing ones.
//    - Use resolvedCountry (not mentionedCountry) → auto context-aware.
//    - Call notifyCountry(c) → updates conversation memory.
//    - Return { text, links, followUps, type }.
//
//  New knowledge base topic: add entry to src/data/knowledgeBase.js.
//    - No changes to this file needed — retrieval is automatic.
//
//  New navigation action: add a case to detectAction().
//
//  New memory field: add detection pattern to detectPreferences() and
//    update DEFAULT_MEMORY. No other changes needed.
//
// ─── FUTURE AI API INTEGRATION ───────────────────────────────────────────────
//
//  Replace buildResponse() with an Anthropic Claude API call:
//
//    const systemPrompt = buildSystemPrompt(ctx, memory)   // serialize context
//    const response = await claude.messages.create({        // real streaming
//      system: systemPrompt,
//      messages: conversationHistory,
//      stream: true,
//    })
//
//  The AIContext object (ctx) maps directly to a structured system prompt.
//  Memory maps to a <memory> XML block in the system prompt.
//  No component code or page code changes needed.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles, MapPin, Brain, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { countries } from '@data/countries'
import { retrieveKnowledge, getKBEntry } from '@data/knowledgeBase'
import { useAICtx } from '@context/AIContext'
import { useLocalStorage } from '@hooks/useLocalStorage'

// ─── MEMORY ──────────────────────────────────────────────────────────────────

const DEFAULT_MEMORY = {
  travelStyle: null,      // 'backpacker' | 'standard' | 'luxury' | 'solo' | 'couple' | 'family'
  dailyBudget: null,      // number — user's stated per-day budget
  preferences: [],        // string[] — e.g. ['beach', 'culture', 'adventure']
  recentCountries: [],    // string[] — last 5 country IDs the user showed interest in
}

/**
 * Detect preference statements in a user message and return the update delta.
 * Returns null if no preference is detected (avoid unnecessary re-renders).
 *
 * @param {string} text - Lowercased user message
 * @returns {Partial<typeof DEFAULT_MEMORY>|null}
 */
function detectPreferences(text) {
  const updates = {}

  // Travel style detection
  if (/backpack|hostel|shoestring|budget travel|travel cheap/.test(text))
    updates.travelStyle = 'backpacker'
  else if (/luxury|five.?star|premium|high.?end/.test(text) && /prefer|like|love/.test(text))
    updates.travelStyle = 'luxury'
  else if (/family|kids|children|traveling with my kids/.test(text))
    updates.travelStyle = 'family'
  else if (/solo|alone|by myself|traveling alone/.test(text) && /prefer|going|i am|i'm/.test(text))
    updates.travelStyle = 'solo'
  else if (/couple|partner|wife|husband|girlfriend|boyfriend/.test(text) && /traveling|going|trip/.test(text))
    updates.travelStyle = 'couple'

  // Budget detection: "$50 per day", "50 dollars a day", "budget of 80"
  const budgetMatch = text.match(/budget\s*(?:of|is|around)?\s*\$?(\d+)|(\d+)\s*(?:dollars?|usd)\s*(?:per|a)\s*day|\$(\d+)\s*(?:per|a)\s*day/i)
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3])
    if (amount > 0 && amount < 2000) updates.dailyBudget = amount
  }

  // Preference interests
  const interests = { beach: /beach|ocean|coast|island/, culture: /culture|history|museum|art/, adventure: /adventure|hike|trekk|climb|dive/ }
  Object.entries(interests).forEach(([tag, re]) => {
    if (re.test(text) && /prefer|love|like|enjoy|into/.test(text)) {
      updates.preferences = [...(updates.preferences || []), tag]
    }
  })

  return Object.keys(updates).length > 0 ? updates : null
}

// ─── TOOL ACTIONS ─────────────────────────────────────────────────────────────

/**
 * Detect navigation commands in the user's message.
 * Returns an action object or null if no command is detected.
 *
 * Add new cases here when new routes are added to the app.
 *
 * @param {string} text - Lowercased user message
 * @returns {{ to: string, message: string }|null}
 */
function detectAction(text) {
  const t = text.toLowerCase()
  const isNav = /show|open|take me|go to|navigate|find|browse/.test(t)

  // Country-specific navigation: "show me Japan" / "take me to Japan page"
  const navCountry = countries.find(c =>
    isNav && (t.includes(c.name.toLowerCase()) || t.includes(c.id.toLowerCase()))
  )
  if (navCountry) {
    return {
      to: `/country/${navCountry.id}`,
      message: `Taking you to the ${navCountry.flag} **${navCountry.name}** page…`,
    }
  }

  if (isNav && /hotel/.test(t))
    return { to: '/hotels', message: '🏨 Opening **Hotels** section…' }

  if (isNav && /restaurant|food listing|dining/.test(t))
    return { to: '/restaurants', message: '🍜 Opening **Restaurants** section…' }

  if (/calculat|budget planner|(open|show).*calculator/.test(t))
    return { to: '/calculator', message: '🧮 Opening **Budget Calculator**…' }

  if (/compare.*countr|compare.*dest|(open|show).*compare/.test(t))
    return { to: '/compare', message: '⚖️ Opening the **Compare** tool…' }

  if ((isNav || /see the/.test(t)) && /map|world map/.test(t))
    return { to: '/map', message: '🗺️ Opening the **World Map**…' }

  if (/dashboard|my trips|my expenses|expense tracker/.test(t))
    return { to: '/dashboard', message: '📊 Opening your **Dashboard**…' }

  if (isNav && /all countries|all destinations|explore/.test(t))
    return { to: '/explore', message: '🌍 Heading to **Explore** destinations…' }

  return null
}

// ─── FOLLOW-UP GENERATORS ────────────────────────────────────────────────────

// All possible per-country follow-up topics. Keys match response `type` values.
const COUNTRY_CHIPS = {
  food:        c => ({ label: `Food costs?`,          query: `food in ${c.name}` }),
  hotels:      c => ({ label: `Hotels?`,              query: `hotels in ${c.name}` }),
  transport:   c => ({ label: `Getting around?`,      query: `transport in ${c.name}` }),
  attractions: c => ({ label: `Things to do?`,        query: `things to do in ${c.name}` }),
  weather:     c => ({ label: `Best time to visit?`,  query: `best time to visit ${c.name}` }),
  visa:        c => ({ label: `Visa info?`,            query: `visa for ${c.name}` }),
  safety:      c => ({ label: `Is it safe?`,           query: `safety in ${c.name}` }),
  cost:        c => ({ label: `Trip cost?`,            query: `7 days in ${c.name}` }),
  internet:    c => ({ label: `Internet & SIM?`,       query: `internet in ${c.name}` }),
}

/**
 * Generate contextual follow-up chips for a bot response.
 *
 * @param {string} type - The response type (matches COUNTRY_CHIPS keys, or a global type)
 * @param {Object|null} country - Resolved country object, or null for global responses
 * @param {Object|null} kbEntry - Knowledge base entry (for FAQ follow-ups)
 * @returns {Array<{label: string, query: string}>}
 */
function generateFollowUps(type, country, kbEntry = null) {
  if (country) {
    const chips = Object.entries(COUNTRY_CHIPS)
      .filter(([key]) => key !== type)          // exclude what was just answered
      .map(([, fn]) => fn(country))
      .slice(0, 3)                               // max 3 country chips

    // Add 1 KB follow-up if there's a relevant FAQ entry about a general topic
    if (kbEntry) {
      const kbChip = kbEntry.followUps?.[0]
      const kbQ = getKBEntry(kbChip)
      if (kbQ) chips.push({ label: kbQ.question, query: kbQ.searchTerms[0] })
    }

    return chips.slice(0, 4)
  }

  // Global follow-ups based on response type
  const globalChips = {
    cheapest:   [{ label: 'Safest countries?', query: 'safest countries' }, { label: 'Beach trips?', query: 'beach destinations' }, { label: 'Backpacker routes?', query: 'backpacker destinations' }],
    safest:     [{ label: 'Cheapest options?', query: 'cheapest destinations' }, { label: 'Solo travel tips?', query: 'solo travel tips' }, { label: 'Travel insurance?', query: 'travel insurance' }],
    beach:      [{ label: 'Budget beach trips?', query: 'cheapest beach destinations' }, { label: 'Best season?', query: 'best time to travel' }, { label: 'Backpacker picks?', query: 'backpacker destinations' }],
    backpacker: [{ label: 'Cheapest in Asia?', query: 'cheapest in Asia' }, { label: 'Budget tips?', query: 'budget travel tips' }, { label: 'Best apps?', query: 'travel apps' }],
    luxury:     [{ label: 'Safest luxury dest.?', query: 'safest countries' }, { label: 'Best beach luxury?', query: 'luxury beach destinations' }],
    kb:         kbEntry ? (kbEntry.followUps || []).slice(0, 3).map(id => { const e = getKBEntry(id); return e ? { label: e.question, query: e.searchTerms[0] } : null }).filter(Boolean) : [],
  }

  return (globalChips[type] || [
    { label: 'Cheapest in Asia?', query: 'cheapest in Asia' },
    { label: 'Safest countries?', query: 'safest countries' },
    { label: 'Beach destinations?', query: 'beach destinations' },
  ]).slice(0, 4)
}

// ─── RESPONSE ENGINE ──────────────────────────────────────────────────────────

/**
 * Build an AI response using context, knowledge base, and memory.
 *
 * Country resolution priority (the heart of context-awareness):
 *   1. Explicit name in message — "tell me about France"
 *   2. Currently viewed page    — ctx.selectedCountry (from usePageContext)
 *   3. Conversation memory      — ctx.lastMentionedCountry (from last AI turn)
 *
 * @param {string} input - Raw user message
 * @param {import('@context/AIContext').AIContextState} ctx - Live page context
 * @param {typeof DEFAULT_MEMORY} memory - Persisted user preferences
 * @param {(countryId: string) => void} onCountryResolved - Update conversation memory
 * @returns {{ text, links, followUps, type }}
 */
function buildResponse(input, ctx = {}, memory = {}, onCountryResolved = null) {
  const text = input.toLowerCase().trim()

  // ── Country resolution ─────────────────────────────────────────────────────
  const mentionedCountry = countries.find(c =>
    text.includes(c.name.toLowerCase()) ||
    text.includes(c.id.toLowerCase()) ||
    (c.id === 'uae' && (text.includes('dubai') || text.includes('emirates')))
  )
  const resolvedCountry =
    mentionedCountry ||
    ctx.selectedCountry ||
    (ctx.lastMentionedCountry ? countries.find(c => c.id === ctx.lastMentionedCountry) : null)

  const notifyCountry = c => { if (onCountryResolved && c) onCountryResolved(c.id) }

  // ── Trip parameters (cascade: message → session ctx → memory → defaults) ──
  const daysMatch = text.match(/(\d+)\s*(?:days?|nights?|weeks?)/)
  const days = daysMatch
    ? (text.includes('week') ? parseInt(daysMatch[1]) * 7 : parseInt(daysMatch[1]))
    : (ctx.travelDays || null)

  const budgetAmountMatch = text.match(/\$(\d+)|(\d+)\s*(?:dollars?|usd)/i)
  const budgetAmount = budgetAmountMatch ? parseInt(budgetAmountMatch[1] || budgetAmountMatch[2]) : null

  // Tier priority: message keyword → session (Calculator) → memory preference → standard
  const memoryTier = memory.travelStyle === 'backpacker' ? 'backpacker'
    : memory.travelStyle === 'luxury' ? 'luxury' : null
  const tier =
    /luxury|premium|five.?star/.test(text) ? 'luxury' :
    /standard|mid.?range/.test(text) ? 'standard' :
    /backpacker|budget|cheap|hostel/.test(text) ? 'backpacker' :
    (ctx.budgetTier || memoryTier || 'standard')

  // Memory-aware personalization prefix (used in some responses)
  const memHint = memory.travelStyle
    ? `Based on your **${memory.travelStyle}** style — `
    : ''

  // ── GREETINGS ────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|yo|sup|good\s*(morning|evening|afternoon))/.test(text)) {
    const hint = ctx.selectedCountry
      ? `You're browsing **${ctx.selectedCountry.flag} ${ctx.selectedCountry.name}** — ask anything about it without mentioning the name!\n\nTry: "cheap food?", "best hotels?", "visa?", or "7-day cost?"`
      : memory.travelStyle
      ? `Welcome back! I remember you prefer **${memory.travelStyle}** travel.\n\nAsk about destinations, budgets, visa, food, or let me recommend something!`
      : "Ask me anything like:\n• \"Cheapest countries in Asia\"\n• \"7 days in Japan — how much?\"\n• \"Best beach destinations under $60/day\"\n• \"Is Thailand safe for solo travelers?\""
    return { text: `Hey! I'm your AI travel assistant.\n\n${hint}`, links: [], followUps: [], type: 'greeting' }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTEXT-AWARE COUNTRY HANDLERS
  // Each fires when a topic keyword is detected AND a country is resolved.
  // Works both explicitly ("hotels in Japan?") and implicitly ("hotels?" on
  // the Japan page) — that's the core value of context-awareness.
  // ─────────────────────────────────────────────────────────────────────────

  // ── Food ──────────────────────────────────────────────────────────────────
  if (resolvedCountry && /food|eat|restaurant|cuisine|meal|dish|snack|drink|dining/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    const foodBudget = c.budget[tier].food
    return {
      text:
        `${c.flag} **Food in ${c.name}** (${tier} budget)\n\n` +
        `${memHint}Daily food budget: **$${foodBudget}/day**\n\n` +
        `Top restaurants:\n` +
        c.restaurants.map(r => `• **${r.name}** — ${r.cuisine}, ${r.priceRange}\n  Must try: ${r.mustTry}`).join('\n'),
      links: [
        { label: `${c.name} full guide`, to: `/country/${c.id}` },
        { label: 'All Restaurants', to: '/restaurants' },
      ],
      followUps: generateFollowUps('food', c),
      type: 'food',
    }
  }

  // ── Hotels / accommodation ────────────────────────────────────────────────
  if (resolvedCountry && /hotel|stay|accommodation|hostel|sleep|lodge|resort|where to stay/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Hotels in ${c.name}** (${tier})\n\n` +
        `${memHint}Typical nightly cost: **$${c.budget[tier].hotel}/night**\n\n` +
        c.hotels.map(h =>
          `• **${h.name}** (${h.stars}★) — $${h.pricePerNight}/night\n` +
          `  ${h.type.charAt(0).toUpperCase() + h.type.slice(1)} · ${h.area}`
        ).join('\n'),
      links: [
        { label: `${c.name} full guide`, to: `/country/${c.id}` },
        { label: 'All Hotels', to: '/hotels' },
      ],
      followUps: generateFollowUps('hotels', c),
      type: 'hotels',
    }
  }

  // ── Transport ─────────────────────────────────────────────────────────────
  if (resolvedCountry && /transport|bus|train|taxi|metro|subway|car rental|getting around|travel around|commute/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Getting around ${c.name}**\n\n` +
        `• Public transport: ${c.transport.publicTransport}\n` +
        `• Taxi: ${c.transport.taxi}\n` +
        `• Car rental: ${c.transport.carRental}\n` +
        `• Airport transfer: ${c.transport.airport}\n\n` +
        `Daily transport budget (${tier}): **$${c.budget[tier].transport}/day**`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('transport', c),
      type: 'transport',
    }
  }

  // ── Attractions / things to do ────────────────────────────────────────────
  if (resolvedCountry && /what to do|things to do|attraction|sight|visit|see|activity|activities|must.?see/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Top things to do in ${c.name}**\n\n` +
        c.attractions.slice(0, 4).map(a =>
          `• **${a.name}** — ${a.type}, ${a.duration}\n` +
          `  Entry: ${a.entryFee === 0 ? 'Free' : '$' + a.entryFee}`
        ).join('\n') +
        `\n\nMust-see highlights: ${c.highlights.join(', ')}`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('attractions', c),
      type: 'attractions',
    }
  }

  // ── Weather / best time to visit ──────────────────────────────────────────
  if (resolvedCountry && /best time|when to go|season|weather|month|when should|climate|temperature/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Best time to visit ${c.name}**\n\n` +
        `Best seasons: **${c.bestSeasons.join(', ')}**\n\n` +
        `${c.name} offers something year-round, but visiting during these months means better weather, fewer crowds, and often lower prices.`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('weather', c),
      type: 'weather',
    }
  }

  // ── Visa ──────────────────────────────────────────────────────────────────
  if (resolvedCountry && /visa|passport|entry|border|immigration|permit|arrival/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Visa info for ${c.name}**\n\n` +
        `• Type: **${c.visa.type}**\n` +
        `• Duration: ${c.visa.duration}\n` +
        `• Cost: ${c.visa.cost}\n` +
        `• Notes: ${c.visa.notes}`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('visa', c),
      type: 'visa',
    }
  }

  // ── Internet / SIM card ───────────────────────────────────────────────────
  if (resolvedCountry && /internet|wifi|wi-fi|sim|data|connectivity|mobile|network|speed/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Internet & connectivity in ${c.name}**\n\n` +
        `• SIM card: ${c.internet.simCard}\n` +
        `• Average speed: ${c.internet.avgSpeed}`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('internet', c),
      type: 'internet',
    }
  }

  // ── Safety ────────────────────────────────────────────────────────────────
  if (resolvedCountry && /safe|safety|dangerous|crime|risk|secure/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    const detail =
      c.safety === 'high'
        ? `${c.name} is considered very safe for tourists, including solo travelers. Standard travel precautions apply.`
        : c.safety === 'medium'
        ? `${c.name} is generally safe but exercise normal caution, especially in crowded tourist areas.`
        : `Exercise extra caution in ${c.name}. Check current travel advisories and avoid isolated areas.`
    return {
      text:
        `${c.flag} **Safety in ${c.name}**\n\n` +
        `Safety rating: **${c.safety.charAt(0).toUpperCase() + c.safety.slice(1)}**\n\n${detail}`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('safety', c),
      type: 'safety',
    }
  }

  // ── Trip cost calculation ─────────────────────────────────────────────────
  // Works both explicitly ("7 days in Japan") and on-page ("7 days?" on Japan page)
  if (resolvedCountry && days) {
    const c = resolvedCountry
    notifyCountry(c)
    const perDay = c.budget[tier].perDay
    const total  = perDay * days
    return {
      text:
        `${c.flag} **${c.name} — ${days}-day ${tier} trip**\n\n` +
        `${memHint}• Daily budget: **$${perDay}/day**\n` +
        `• Total estimate: **$${total.toLocaleString()}**\n` +
        `• Hotel: $${c.budget[tier].hotel}/day · Food: $${c.budget[tier].food}/day\n` +
        `• Transport: $${c.budget[tier].transport}/day · Activities: $${c.budget[tier].activities}/day\n\n` +
        `Best seasons: ${c.bestSeasons.join(', ')}  |  Safety: ${c.safety}`,
      links: [
        { label: `Explore ${c.name}`, to: `/country/${c.id}` },
        { label: 'Budget Calculator', to: '/calculator' },
      ],
      followUps: generateFollowUps('cost', c),
      type: 'cost',
    }
  }

  // ── General country overview ───────────────────────────────────────────────
  if (resolvedCountry && (/tell me|about|overview|summary|info|details|describe|what is|how is/.test(text) || mentionedCountry)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **${c.name}** (${c.continent})\n\n` +
        `**Daily costs:**\n• Backpacker: $${c.budget.backpacker.perDay}/day\n` +
        `• Standard: $${c.budget.standard.perDay}/day\n` +
        `• Luxury: $${c.budget.luxury.perDay}/day\n\n` +
        `**Capital:** ${c.capital}  |  **Safety:** ${c.safety}\n` +
        `**Visa:** ${c.visa.type} (${c.visa.cost})\n` +
        `**Best time:** ${c.bestSeasons.join(', ')}\n\n` +
        `${c.description.slice(0, 120)}…`,
      links: [{ label: `Full ${c.name} guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('overview', c),
      type: 'overview',
    }
  }

  // ── Contextual fallback on a country page ─────────────────────────────────
  // User asked something unrecognized while on a country page — prompt them.
  if (ctx.selectedCountry && !mentionedCountry) {
    const c = ctx.selectedCountry
    return {
      text:
        `I can help with ${c.flag} **${c.name}** specifically! Try:\n` +
        `• "Cheap food?"\n• "Best hotels?"\n• "Getting around?"\n` +
        `• "Best time to visit?"\n• "Visa requirements?"\n• "7 days — how much?"`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
      followUps: generateFollowUps('overview', c),
      type: 'ctx-fallback',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GLOBAL HANDLERS (no country context required)
  // ─────────────────────────────────────────────────────────────────────────

  // ── Cheapest destinations ─────────────────────────────────────────────────
  if (/cheap|budget|afford|cheapest|low.?cost|inexpensive/.test(text)) {
    let pool = [...countries]
    // Scope to active continent filter (from Explore page or explicit mention)
    const textContinent =
      text.includes('europe') ? 'Europe' :
      text.includes('asia') ? 'Asia' :
      text.includes('africa') ? 'Africa' :
      text.includes('america') ? null : null
    const scope = textContinent || (ctx.activeFilters?.continent !== 'All' ? ctx.activeFilters?.continent : null)
    if (scope) pool = pool.filter(c => c.continent === scope)

    // Memory bias: if user loves beach, prioritize beach destinations
    if (memory.preferences?.includes('beach')) pool.sort((a, b) => (b.tags.includes('beach') ? 1 : 0) - (a.tags.includes('beach') ? 1 : 0))

    const sorted = pool.sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay).slice(0, 4)
    return {
      text:
        `${memHint}Most affordable destinations${scope ? ` in ${scope}` : ''}:\n\n` +
        sorted.map((c, i) => `${i + 1}. ${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: sorted.map(c => ({ label: c.name, to: `/country/${c.id}` })),
      followUps: generateFollowUps('cheapest', null),
      type: 'cheapest',
    }
  }

  // ── Safest destinations ───────────────────────────────────────────────────
  if (/safe|safety|dangerous|crime/.test(text)) {
    const safe = countries.filter(c => c.safety === 'high')
      .sort((a, b) => a.budget.standard.perDay - b.budget.standard.perDay).slice(0, 4)
    return {
      text:
        `Destinations with **High Safety** rating:\n\n` +
        safe.map(c => `${c.flag} **${c.name}** — $${c.budget.standard.perDay}/day standard`).join('\n'),
      links: safe.map(c => ({ label: c.name, to: `/country/${c.id}` })),
      followUps: generateFollowUps('safest', null),
      type: 'safest',
    }
  }

  // ── Beach / island ────────────────────────────────────────────────────────
  if (/beach|island|tropical|sea|coast|ocean/.test(text)) {
    const beach = countries.filter(c => c.tags.some(t => ['beach', 'island', 'tropical', 'coast'].includes(t))).slice(0, 4)
    return {
      text:
        `Top beach & island destinations:\n\n` +
        beach.map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day backpacker`).join('\n'),
      links: beach.map(c => ({ label: c.name, to: `/country/${c.id}` })),
      followUps: generateFollowUps('beach', null),
      type: 'beach',
    }
  }

  // ── Backpacker routes ─────────────────────────────────────────────────────
  if (/backpacker|solo|hostel|shoestring/.test(text)) {
    const top = [...countries].sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay).slice(0, 5)
    return {
      text:
        `Best backpacker destinations (by daily cost):\n\n` +
        top.map((c, i) => `${i + 1}. ${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: top.map(c => ({ label: c.name, to: `/country/${c.id}` })),
      followUps: generateFollowUps('backpacker', null),
      type: 'backpacker',
    }
  }

  // ── Luxury ────────────────────────────────────────────────────────────────
  if (/luxury|premium|five.?star|high.?end|splurge/.test(text)) {
    const top = [...countries].sort((a, b) => b.budget.luxury.perDay - a.budget.luxury.perDay).slice(0, 4)
    return {
      text:
        `Top luxury destinations:\n\n` +
        top.map(c => `${c.flag} **${c.name}** — from $${c.budget.luxury.perDay}/day`).join('\n') +
        '\n\nThese offer world-class hotels, Michelin-star dining, and exclusive experiences.',
      links: top.map(c => ({ label: c.name, to: `/country/${c.id}` })),
      followUps: generateFollowUps('luxury', null),
      type: 'luxury',
    }
  }

  // ── Dollar-amount budget filter ────────────────────────────────────────────
  if (budgetAmount) {
    const fits = countries.filter(c => c.budget.backpacker.perDay <= budgetAmount)
      .sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay)
    if (fits.length) {
      return {
        text:
          `Destinations with a backpacker budget **under $${budgetAmount}/day**:\n\n` +
          fits.slice(0, 5).map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
        links: fits.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
        followUps: generateFollowUps('cheapest', null),
        type: 'budget-filter',
      }
    }
    return { text: `No destinations found under $${budgetAmount}/day in our database.`, links: [], followUps: [], type: 'no-match' }
  }

  // ── Continent listing ──────────────────────────────────────────────────────
  const continentMap = {
    europe: 'Europe', asia: 'Asia',
    'north america': 'North America', 'south america': 'South America',
    africa: 'Africa', oceania: 'Oceania',
  }
  for (const [keyword, continent] of Object.entries(continentMap)) {
    if (text.includes(keyword)) {
      const inContinent = countries.filter(c => c.continent === continent)
        .sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay)
      return {
        text:
          `${continent} destinations (cheapest first):\n\n` +
          inContinent.map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day backpacker`).join('\n'),
        links: inContinent.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
        followUps: generateFollowUps('cheapest', null),
        type: 'continent',
      }
    }
  }

  // ── Visa-free ─────────────────────────────────────────────────────────────
  if (/visa.?free|no visa|visa on arrival/.test(text)) {
    const free = countries.filter(c =>
      c.visa.type.toLowerCase().includes('free') || c.visa.cost === '$0' || c.visa.cost === 'Free'
    )
    return {
      text: free.length
        ? `Destinations with easy/free visa access:\n\n` + free.map(c => `${c.flag} **${c.name}** — ${c.visa.type}`).join('\n')
        : 'Visa requirements vary by passport. Check individual country pages for details.',
      links: free.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
      followUps: generateFollowUps('cheapest', null),
      type: 'visa-free',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KNOWLEDGE BASE RETRIEVAL (FAQ layer)
  // If none of the structured handlers matched, search the knowledge base.
  // This covers questions outside the countries dataset: insurance, jet lag,
  // packing, flight booking, vaccinations, digital nomad life, etc.
  // ─────────────────────────────────────────────────────────────────────────
  const kbEntry = retrieveKnowledge(input, 1)
  if (kbEntry) {
    return {
      text: kbEntry.answer,
      links: [],
      followUps: generateFollowUps('kb', null, kbEntry),
      type: 'kb',
    }
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  return {
    text:
      "I can help with:\n• Budget estimates (\"10 days in Bali\")\n" +
      "• Cheapest / safest destinations\n" +
      "• Food, hotels, transport, visa, internet — for any country\n" +
      "• Travel FAQs: insurance, packing, jet lag, flights, safety\n" +
      "• Website navigation: \"show hotels in Tokyo\", \"open calculator\"\n\n" +
      "What are you planning?",
    links: [],
    followUps: [
      { label: 'Cheapest in Asia?', query: 'cheapest in Asia' },
      { label: 'Solo travel tips?', query: 'solo travel tips' },
      { label: 'Travel insurance?', query: 'travel insurance' },
    ],
    type: 'fallback',
  }
}

// ─── DYNAMIC INITIAL SUGGESTIONS ─────────────────────────────────────────────

function getInitialSuggestions(ctx, memory) {
  if (ctx.selectedCountry) {
    const c = ctx.selectedCountry
    const dayLabel = ctx.travelDays ? `${ctx.travelDays} days` : '7 days'
    return [`Cheap food in ${c.name}?`, `Hotels here?`, `${dayLabel} — cost?`, `Best time to visit?`]
  }
  if (ctx.activeFilters?.continent && ctx.activeFilters.continent !== 'All') {
    const cont = ctx.activeFilters.continent
    return [`Cheapest in ${cont}`, `Safest in ${cont}`, 'Best beach destinations', 'Backpacker routes']
  }
  if (memory.travelStyle === 'backpacker')
    return ['Cheapest countries in Asia', 'Budget travel tips', 'Best hostels?', 'Solo travel tips']
  if (memory.travelStyle === 'luxury')
    return ['Top luxury destinations', 'Best luxury hotels?', '7 days in Dubai', 'Safe luxury trips']
  return ['Cheapest countries in Asia', '7 days in Japan — cost?', 'Best beach destinations', 'Safest places to travel']
}

// ─── MARKDOWN RENDERER ───────────────────────────────────────────────────────
function MessageText({ text }) {
  return (
    <div className="space-y-0.5">
      {text.split('\n').map((line, i) => {
        const parts = line.split(/\*\*(.+?)\*\*/g)
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        )
      })}
    </div>
  )
}

// ─── STREAMING TEXT ──────────────────────────────────────────────────────────
// Reveals text character-by-character at ~80 chars/sec to simulate AI typing.
// The blinking cursor disappears when streaming is complete.
// onDone callback triggers link + follow-up chip reveal.
function StreamingText({ text, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setDone(false)
    const id = setInterval(() => {
      indexRef.current += 2   // 2 chars per tick at 12ms = ~167 chars/sec (feels fast but readable)
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        clearInterval(id)
        setDone(true)
        onDone?.()
      }
    }, 12)
    return () => clearInterval(id)
  // text prop changes when a new message is streamed — restart effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <>
      <MessageText text={displayed} />
      {!done && <span className="inline-block w-0.5 h-3.5 bg-brand-500 dark:bg-brand-400 ml-0.5 animate-pulse align-middle" />}
    </>
  )
}

// ─── BOT MESSAGE BUBBLE ───────────────────────────────────────────────────────
// Handles streaming, link reveal, and follow-up chip reveal per message.
// Links and follow-ups appear only after streaming finishes (AnimatePresence).
function BotMessageBubble({ msg, onFollowUp, onClose }) {
  const [streamed, setStreamed] = useState(!msg.streaming)

  return (
    <div className="flex gap-2">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-brand-100 dark:bg-brand-900/50 text-brand-600">
        <Bot size={14} />
      </div>

      <div className="max-w-[85%] flex flex-col gap-1.5">
        {/* Message bubble */}
        <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm">
          {msg.streaming && !streamed
            ? <StreamingText text={msg.text} onDone={() => setStreamed(true)} />
            : <MessageText text={msg.text} />
          }
        </div>

        {/* Links and follow-ups reveal after streaming */}
        <AnimatePresence>
          {streamed && (msg.links?.length > 0 || msg.followUps?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-1.5"
            >
              {/* Page navigation links */}
              {msg.links?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {msg.links.map(l => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={onClose}
                      className="text-xs px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/30
                        text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700
                        hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                    >
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}

              {/* Smart follow-up chips — click to send as next message */}
              {msg.followUps?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {msg.followUps.map(fu => (
                    <button
                      key={fu.query}
                      onClick={() => onFollowUp(fu.query)}
                      className="text-xs px-2.5 py-1 rounded-full
                        bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300
                        border border-slate-200 dark:border-slate-600
                        hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300
                        transition-all duration-150"
                    >
                      {fu.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AIChatAssistant() {
  const { aiCtx, updateAIContext } = useAICtx()
  const navigate = useNavigate()

  // Persistent memory — survives page refresh and future sessions
  const [userMemory, setUserMemory] = useLocalStorage('ai-travel-memory', DEFAULT_MEMORY)

  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState([{
    id: 0, role: 'bot', streaming: false,
    text: "Hi! I'm your AI travel assistant. Ask me about destinations, budgets, safety, or plan a trip. What's on your mind?",
    links: [], followUps: [],
  }])

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  // Dynamic initial suggestion chips — recompute when page context or memory changes
  const initialSuggestions = useMemo(
    () => getInitialSuggestions(aiCtx, userMemory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aiCtx.selectedCountry?.id, aiCtx.activeFilters?.continent, aiCtx.currentPage, userMemory.travelStyle]
  )

  const clearChat = useCallback(() => {
    setMessages([{
      id: Date.now(), role: 'bot', streaming: false,
      text: aiCtx.selectedCountry
        ? `Chat cleared. Still on ${aiCtx.selectedCountry.flag} **${aiCtx.selectedCountry.name}** — ask away!`
        : 'Chat cleared. What would you like to know?',
      links: [], followUps: [],
    }])
    updateAIContext({ lastMentionedCountry: null })
  }, [aiCtx.selectedCountry, updateAIContext])

  const send = useCallback((text = input) => {
    const q = text.trim()
    if (!q) return

    // Add user message immediately
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: q, links: [], followUps: [], streaming: false }])
    setInput('')

    // ── Tool action detection ─────────────────────────────────────────────
    // Check for navigation commands before running the response engine.
    const action = detectAction(q)
    if (action) {
      setThinking(true)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'bot', streaming: true,
          text: action.message, links: [], followUps: [],
        }])
        setThinking(false)
        // Navigate after a short delay so the user sees the confirmation message
        setTimeout(() => { navigate(action.to); setOpen(false) }, 1300)
      }, 400)
      return
    }

    // ── Preference detection → memory update ──────────────────────────────
    // Detect preference statements before building response so the response
    // can immediately reflect the updated memory (use updatedMemory below).
    const newPrefs = detectPreferences(q.toLowerCase())
    let updatedMemory = userMemory
    if (newPrefs) {
      updatedMemory = { ...userMemory, ...newPrefs }
      setUserMemory(updatedMemory)
    }

    setThinking(true)

    // Brief thinking delay — remove this when connecting a real streaming API
    setTimeout(() => {
      const response = buildResponse(
        q,
        aiCtx,
        updatedMemory,
        countryId => updateAIContext({ lastMentionedCountry: countryId })
      )

      // Append a memory acknowledgment when preferences were just learned
      const memNote = newPrefs?.travelStyle
        ? `\n\n_Got it — I'll tailor suggestions to **${newPrefs.travelStyle}** travel from now on._`
        : newPrefs?.dailyBudget
        ? `\n\n_Noted your **$${newPrefs.dailyBudget}/day** budget preference._`
        : ''

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        streaming: true,
        text: response.text + memNote,
        links: response.links,
        followUps: response.followUps,
        type: response.type,
      }])
      setThinking(false)
    }, 600)
  }, [input, aiCtx, userMemory, navigate, setUserMemory, updateAIContext])

  return (
    <>
      {/* ── Toggle bubble ─────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl
          bg-gradient-to-br from-brand-600 to-purple-500
          text-white shadow-glow flex items-center justify-center"
        aria-label="Open AI travel assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} /></motion.div>
          }
        </AnimatePresence>

        {/* Memory indicator dot — shows when the AI knows your preferences */}
        {userMemory.travelStyle && !open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" title="AI remembers your preferences" />
        )}
      </motion.button>

      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 left-6 z-50 w-[340px] sm:w-[430px] rounded-2xl overflow-hidden
              bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700
              flex flex-col"
            style={{ maxHeight: 600 }}
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">AI Travel Assistant</p>
                <p className="text-white/70 text-xs">
                  {userMemory.travelStyle ? `Personalized · ${userMemory.travelStyle}` : 'Powered by your travel data'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {messages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="text-white/50 hover:text-white/90 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                    title="Clear conversation"
                  >
                    Clear
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white p-1">
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* ── Context awareness badge ───────────────────────────────────
                Visible green indicator shows users the AI "knows" their page.
                Animated in/out with page navigation. */}
            <AnimatePresence>
              {(aiCtx.selectedCountry || (aiCtx.currentPage && aiCtx.currentPage !== 'home')) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20
                    border-b border-emerald-100 dark:border-emerald-800/30
                    flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
                    {aiCtx.selectedCountry
                      ? <><MapPin size={10} className="inline mr-1" />{aiCtx.selectedCountry.flag} <strong>{aiCtx.selectedCountry.name}</strong> — ask without mentioning it</>
                      : <><Zap size={10} className="inline mr-1" />Context: <strong>{aiCtx.currentPage}</strong> page</>
                    }
                  </p>
                  {userMemory.travelStyle && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 flex-shrink-0">
                      <Brain size={10} />
                      {userMemory.travelStyle}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Messages ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map(msg =>
                msg.role === 'bot' ? (
                  <BotMessageBubble
                    key={msg.id}
                    msg={msg}
                    onFollowUp={send}
                    onClose={() => setOpen(false)}
                  />
                ) : (
                  // User message bubble
                  <div key={msg.id} className="flex gap-2 flex-row-reverse">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <User size={14} />
                    </div>
                    <div className="max-w-[82%]">
                      <div className="px-3 py-2 rounded-2xl rounded-tr-sm bg-brand-600 text-white text-sm">
                        <MessageText text={msg.text} />
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Thinking dots */}
              {thinking && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-brand-600" />
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 0.2, 0.4].map(delay => (
                        <motion.div
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-brand-400"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.8, delay, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Initial suggestion chips ──────────────────────────────────
                Context-aware chips shown before the first user message.
                They update when the user navigates to a new page. */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {initialSuggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700
                      text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800
                      hover:border-brand-400 hover:text-brand-600 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ────────────────────────────────────────────────────── */}
            <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={
                  aiCtx.selectedCountry
                    ? `Ask about ${aiCtx.selectedCountry.name}…`
                    : 'Ask about any destination…'
                }
                className="flex-1 text-sm px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800
                  text-slate-900 dark:text-white placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-brand-500 border-none"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || thinking}
                className="w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40
                  text-white flex items-center justify-center transition-all duration-200 flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
