// FEATURE: AI ASSISTANT
// PURPOSE: Floating context-aware chat panel — answers travel questions using live page data
// DEPENDENCIES: @data/countries, @context/AIContext, react-router-dom (Link), framer-motion

// ─── HOW CONTEXT-AWARENESS WORKS ─────────────────────────────────────────────
//
//  Every page in the app writes its live state into AIContext (via usePageContext).
//  When the user sends a message, buildResponse() reads that context to resolve
//  implicit references before trying any keyword pattern:
//
//    User is on /country/japan and types "cheap food?"
//    → resolvedCountry = japan (from ctx.selectedCountry)
//    → food handler fires → returns Japan food data
//    → no need for the user to say "Japan"
//
//  PRIORITY ORDER for resolving which country to answer about:
//    1. Explicit mention in the message  ("tell me about France")
//    2. Currently viewing page           (ctx.selectedCountry)
//    3. Conversation memory              (ctx.lastMentionedCountry — last AI turn)
//
// ─── CONVERSATION MEMORY ─────────────────────────────────────────────────────
//  After each response that involves a specific country, the component calls
//  updateAIContext({ lastMentionedCountry: c.id }). This lets the AI resolve
//  follow-up questions ("what about hotels there?") without the page providing
//  the country — the chat itself remembers.
//
// ─── FUTURE AI API INTEGRATION ───────────────────────────────────────────────
//  Replace buildResponse() with a call to the Anthropic Claude API.
//  The AIContext object maps directly to a structured system prompt:
//
//    const systemPrompt = buildSystemPrompt(aiCtx)
//    const reply = await claude.messages.create({ system: systemPrompt, ... })
//
//  No page code changes needed — context is already centralized in AIContext.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { countries } from '@data/countries'
import { useAICtx } from '@context/AIContext'

// ─── RESPONSE ENGINE ─────────────────────────────────────────────────────────
//
// No API key required — the engine uses our countries dataset for intelligent,
// data-driven responses. All query types below are context-enhanced: if the
// user is on a country page, that country is the implicit subject.
//
// ADDING A NEW QUERY TYPE:
//   1. Add a regex check after the existing ones (order matters — specific before general)
//   2. Use resolvedCountry (not mentionedCountry) so context-awareness is automatic
//   3. Call notifyCountry(c) so conversation memory is updated
//   4. Return { text: string, links: Array<{label, to}> }

/**
 * @param {string} input - Raw user message text
 * @param {import('@context/AIContext').AIContextState} ctx - Live page/session context
 * @param {(countryId: string) => void} onCountryResolved - Updates conversation memory
 * @returns {{ text: string, links: Array<{label: string, to: string}> }}
 */
function buildResponse(input, ctx = {}, onCountryResolved = null) {
  const text = input.toLowerCase().trim()

  // ── Step 1: Resolve the active country ──────────────────────────────────────
  // Explicit mention takes highest priority so the user can always override context.
  const mentionedCountry = countries.find(c =>
    text.includes(c.name.toLowerCase()) ||
    text.includes(c.id.toLowerCase()) ||
    (c.id === 'uae' && (text.includes('dubai') || text.includes('emirates')))
  )

  // Page context (e.g., currently on /country/japan) is the second priority.
  // Conversation memory (last country discussed in chat) is the fallback.
  const resolvedCountry =
    mentionedCountry ||
    ctx.selectedCountry ||
    (ctx.lastMentionedCountry ? countries.find(c => c.id === ctx.lastMentionedCountry) : null)

  // Shorthand — call after choosing a country to respond about
  const notifyCountry = c => { if (onCountryResolved && c) onCountryResolved(c.id) }

  // ── Step 2: Derive trip parameters (message → session ctx → defaults) ───────
  const daysMatch = text.match(/(\d+)\s*(?:days?|nights?|weeks?)/)
  const days = daysMatch
    ? (text.includes('week') ? parseInt(daysMatch[1]) * 7 : parseInt(daysMatch[1]))
    : (ctx.travelDays || null)                  // fall back to Calculator setting

  const budgetAmountMatch = text.match(/\$(\d+)|(\d+)\s*(?:dollars?|usd)/i)
  const budgetAmount = budgetAmountMatch
    ? parseInt(budgetAmountMatch[1] || budgetAmountMatch[2])
    : null

  // Tier detection: message keyword → session preference → standard default
  const tier =
    /luxury|premium|five.?star|high.?end|splurge/.test(text) ? 'luxury' :
    /standard|mid.?range/.test(text)                          ? 'standard' :
    /backpacker|budget|cheap|hostel|shoestring/.test(text)    ? 'backpacker' :
    (ctx.budgetTier || 'standard')

  // ── Greetings ────────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|yo|sup|good\s*(morning|evening|afternoon))/.test(text)) {
    // Personalize the greeting if there's an active country in context
    const hint = ctx.selectedCountry
      ? `You're browsing **${ctx.selectedCountry.flag} ${ctx.selectedCountry.name}** — ask me anything about it without mentioning the name!\n\nTry: "cheap food?", "best hotels?", "visa?", or "how many days?"`
      : "Ask me anything like:\n• \"Cheapest countries in Asia\"\n• \"7 days in Japan — how much?\"\n• \"Best beach destinations under $60/day\"\n• \"Is Thailand safe for solo travelers?\""
    return { text: `Hey! I'm your AI travel assistant.\n\n${hint}`, links: [] }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTEXT-AWARE HANDLERS
  // These fire when a query topic is detected AND a country is resolved.
  // They work both explicitly ("food in Japan?") and implicitly ("food?" on Japan page).
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Food / restaurants ───────────────────────────────────────────────────────
  if (resolvedCountry && /food|eat|restaurant|cuisine|meal|dish|snack|drink|dining/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    const foodBudget = c.budget[tier].food
    return {
      text:
        `${c.flag} **Food in ${c.name}** (${tier} budget)\n\n` +
        `Daily food budget: **$${foodBudget}/day**\n\n` +
        `Top restaurants:\n` +
        c.restaurants
          .map(r => `• **${r.name}** — ${r.cuisine}, ${r.priceRange}\n  Must try: ${r.mustTry}`)
          .join('\n'),
      links: [
        { label: `${c.name} full guide`, to: `/country/${c.id}` },
        { label: 'All Restaurants', to: '/restaurants' },
      ],
    }
  }

  // ── Hotels / accommodation ───────────────────────────────────────────────────
  if (resolvedCountry && /hotel|stay|accommodation|hostel|sleep|lodge|resort|where to stay|airbnb/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Hotels in ${c.name}** (${tier})\n\n` +
        `Typical nightly cost: **$${c.budget[tier].hotel}/night**\n\n` +
        c.hotels
          .map(h =>
            `• **${h.name}** (${h.stars}★) — $${h.pricePerNight}/night\n` +
            `  ${h.type.charAt(0).toUpperCase() + h.type.slice(1)} · ${h.area}`
          )
          .join('\n'),
      links: [
        { label: `${c.name} guide`, to: `/country/${c.id}` },
        { label: 'All Hotels', to: '/hotels' },
      ],
    }
  }

  // ── Transport / getting around ───────────────────────────────────────────────
  if (resolvedCountry && /transport|bus|train|taxi|metro|subway|car rental|getting around|travel around|move|commute/.test(text)) {
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
    }
  }

  // ── Attractions / things to do ───────────────────────────────────────────────
  if (resolvedCountry && /what to do|things to do|attraction|sight|visit|see|activity|activities|explore|tourist|must.?see/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Top things to do in ${c.name}**\n\n` +
        c.attractions
          .slice(0, 4)
          .map(a =>
            `• **${a.name}** — ${a.type}, ${a.duration}\n` +
            `  Entry: ${a.entryFee === 0 ? 'Free' : '$' + a.entryFee}`
          )
          .join('\n') +
        `\n\nMust-see highlights: ${c.highlights.join(', ')}`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
    }
  }

  // ── Best time to visit / weather / seasons ───────────────────────────────────
  if (resolvedCountry && /best time|when to go|season|weather|month|when should|climate|temperature/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Best time to visit ${c.name}**\n\n` +
        `Best seasons: **${c.bestSeasons.join(', ')}**\n\n` +
        `${c.name} offers something year-round, but visiting during these months means better weather, fewer crowds, and often lower prices.`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
    }
  }

  // ── Visa / entry requirements ────────────────────────────────────────────────
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
    }
  }

  // ── Internet / SIM / connectivity ────────────────────────────────────────────
  if (resolvedCountry && /internet|wifi|wi-fi|sim|data|connectivity|mobile|network|speed/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    return {
      text:
        `${c.flag} **Internet & connectivity in ${c.name}**\n\n` +
        `• SIM card: ${c.internet.simCard}\n` +
        `• Average speed: ${c.internet.avgSpeed}`,
      links: [],
    }
  }

  // ── Safety (context-enhanced: "is it safe?" on Japan page → Japan safety) ────
  if (resolvedCountry && /safe|safety|dangerous|crime|risk|solo travel|solo female|secure/.test(text)) {
    const c = resolvedCountry
    notifyCountry(c)
    const detail =
      c.safety === 'high'
        ? `${c.name} is considered very safe for tourists, including solo travelers. Standard precautions apply.`
        : c.safety === 'medium'
        ? `${c.name} is generally safe but exercise normal caution, especially in crowded tourist areas. Research your specific regions.`
        : `Exercise extra caution in ${c.name}. Check current travel advisories and avoid isolated areas.`
    return {
      text:
        `${c.flag} **Safety in ${c.name}**\n\n` +
        `Safety rating: **${c.safety.charAt(0).toUpperCase() + c.safety.slice(1)}**\n\n${detail}`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
    }
  }

  // ── Trip cost calculation (works with explicit mention OR resolved context) ───
  // e.g., "how much for 7 days?" on Japan page = 7-day Japan trip
  if (resolvedCountry && days) {
    const c = resolvedCountry
    notifyCountry(c)
    const perDay = c.budget[tier].perDay
    const total  = perDay * days
    return {
      text:
        `${c.flag} **${c.name} — ${days}-day ${tier} trip**\n\n` +
        `• Daily budget: **$${perDay}/day**\n` +
        `• Total estimate: **$${total.toLocaleString()}**\n` +
        `• Hotel: $${c.budget[tier].hotel}/day · Food: $${c.budget[tier].food}/day\n` +
        `• Transport: $${c.budget[tier].transport}/day · Activities: $${c.budget[tier].activities}/day\n\n` +
        `Best seasons: ${c.bestSeasons.join(', ')}  |  Safety: ${c.safety}`,
      links: [
        { label: `Explore ${c.name}`, to: `/country/${c.id}` },
        { label: 'Budget Calculator', to: '/calculator' },
      ],
    }
  }

  // ── General country overview (explicit name OR "tell me more" on a country page) ──
  if (resolvedCountry && (/tell me|about|overview|summary|info|details|what is|how is|describe/.test(text) || mentionedCountry)) {
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
    }
  }

  // ── Contextual fallback — vague question while on a country page ──────────────
  // Instead of the generic fallback, prompt for a specific question about the current country
  if (ctx.selectedCountry && !mentionedCountry) {
    const c = ctx.selectedCountry
    return {
      text:
        `I can help with ${c.flag} **${c.name}** specifically! Try:\n` +
        `• "Cheap food?"\n• "Best hotels?"\n• "How to get around?"\n` +
        `• "Best time to visit?"\n• "Visa requirements?"\n• "7 days — how much?"`,
      links: [{ label: `${c.name} full guide`, to: `/country/${c.id}` }],
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GLOBAL HANDLERS (no country context required)
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Cheapest destinations (optionally scoped to continent from active filters) ──
  if (/cheap|budget|afford|cheapest|low.?cost|inexpensive/.test(text)) {
    let pool = [...countries]
    // Use explicit continent mention OR the filter the user has active on Explore
    const explicitContinent =
      text.includes('europe') ? 'Europe' :
      text.includes('asia') ? 'Asia' :
      text.includes('africa') ? 'Africa' :
      (text.includes('america') ? null : null)

    const activeContinent = ctx.activeFilters?.continent && ctx.activeFilters.continent !== 'All'
      ? ctx.activeFilters.continent
      : null

    const scopeContinent = explicitContinent || activeContinent
    if (scopeContinent) pool = pool.filter(c => c.continent === scopeContinent)

    const sorted = pool.sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay).slice(0, 4)
    const scope = scopeContinent ? ` in ${scopeContinent}` : ''
    return {
      text:
        `Most affordable destinations${scope}:\n\n` +
        sorted.map((c, i) => `${i + 1}. ${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: sorted.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Safest destinations ───────────────────────────────────────────────────────
  if (/safe|safety|dangerous|crime/.test(text)) {
    const safe = countries
      .filter(c => c.safety === 'high')
      .sort((a, b) => a.budget.standard.perDay - b.budget.standard.perDay)
      .slice(0, 4)
    return {
      text:
        `Destinations with **High Safety** rating:\n\n` +
        safe.map(c => `${c.flag} **${c.name}** — $${c.budget.standard.perDay}/day standard`).join('\n'),
      links: safe.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Beach / island / tropical ─────────────────────────────────────────────────
  if (/beach|island|tropical|sea|coast|ocean/.test(text)) {
    const beach = countries
      .filter(c => c.tags.some(t => ['beach', 'island', 'tropical', 'coast'].includes(t)))
      .slice(0, 4)
    return {
      text:
        `Top beach & island destinations:\n\n` +
        beach.map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: beach.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Backpacker routes ─────────────────────────────────────────────────────────
  if (/backpacker|solo|hostel|shoestring/.test(text)) {
    const top = [...countries]
      .sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay)
      .slice(0, 5)
    return {
      text:
        `Best backpacker destinations (by daily cost):\n\n` +
        top.map((c, i) => `${i + 1}. ${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: top.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Luxury travel ─────────────────────────────────────────────────────────────
  if (/luxury|premium|five.?star|high.?end|splurge/.test(text)) {
    const top = [...countries]
      .sort((a, b) => b.budget.luxury.perDay - a.budget.luxury.perDay)
      .slice(0, 4)
    return {
      text:
        `Top luxury destinations:\n\n` +
        top.map(c => `${c.flag} **${c.name}** — from $${c.budget.luxury.perDay}/day`).join('\n') +
        '\n\nThese offer world-class hotels, Michelin-star dining, and exclusive experiences.',
      links: top.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Budget-filtered search: "destinations under $50/day" ─────────────────────
  if (budgetAmount) {
    const fits = countries
      .filter(c => c.budget.backpacker.perDay <= budgetAmount)
      .sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay)
    if (fits.length) {
      return {
        text:
          `Destinations with a backpacker budget **under $${budgetAmount}/day**:\n\n` +
          fits.slice(0, 5).map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
        links: fits.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
      }
    }
    return { text: `No destinations found under $${budgetAmount}/day in our database.`, links: [] }
  }

  // ── Continent-based listing ───────────────────────────────────────────────────
  const continentMap = {
    europe: 'Europe', asia: 'Asia',
    'north america': 'North America', 'south america': 'South America',
    africa: 'Africa', oceania: 'Oceania',
  }
  for (const [keyword, continent] of Object.entries(continentMap)) {
    if (text.includes(keyword)) {
      const inContinent = countries
        .filter(c => c.continent === continent)
        .sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay)
      return {
        text:
          `${continent} destinations (cheapest first):\n\n` +
          inContinent
            .map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day backpacker`)
            .join('\n'),
        links: inContinent.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
      }
    }
  }

  // ── Visa-free / visa on arrival ───────────────────────────────────────────────
  if (/visa.?free|no visa|visa on arrival/.test(text)) {
    const free = countries.filter(
      c => c.visa.type.toLowerCase().includes('free') || c.visa.cost === '$0' || c.visa.cost === 'Free'
    )
    return {
      text: free.length
        ? `Destinations with easy/free visa access:\n\n` +
          free.map(c => `${c.flag} **${c.name}** — ${c.visa.type}`).join('\n')
        : 'Visa requirements vary by passport. Check individual country pages for details.',
      links: free.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Generic fallback ─────────────────────────────────────────────────────────
  return {
    text:
      "I can help with:\n• Budget estimates (\"10 days in Bali\")\n" +
      "• Cheapest destinations (\"cheapest in Europe\")\n" +
      "• Safety info (\"safest countries\")\n" +
      "• Beach trips, backpacker routes, luxury travel\n" +
      "• Any specific country (\"tell me about Japan\")\n" +
      "• Food, hotels, transport, visa, internet for any country\n\n" +
      "What are you planning?",
    links: [],
  }
}

// ─── DYNAMIC SUGGESTIONS ─────────────────────────────────────────────────────
//
// Suggestions shown before the first user message. They update based on the
// current page context so they're always relevant to what the user is doing.

/**
 * @param {import('@context/AIContext').AIContextState} ctx
 * @returns {string[]}
 */
function getContextualSuggestions(ctx) {
  // On a specific country page — show country-specific prompts
  if (ctx.selectedCountry) {
    const c = ctx.selectedCountry
    const dayLabel = ctx.travelDays ? `${ctx.travelDays} days` : '7 days'
    return [
      `Cheap food in ${c.name}?`,
      `Hotels in ${c.name}?`,
      `${dayLabel} here — cost?`,
      `Best time to visit?`,
    ]
  }
  // On Explore with a continent filter active — scope suggestions to that continent
  if (ctx.activeFilters?.continent && ctx.activeFilters.continent !== 'All') {
    const cont = ctx.activeFilters.continent
    return [
      `Cheapest in ${cont}`,
      `Safest in ${cont}`,
      'Best beach destinations',
      'Backpacker routes',
    ]
  }
  // On the Budget Calculator — suggest budget-tier queries
  if (ctx.currentPage === 'calculator' && ctx.budgetTier) {
    return [
      `Best ${ctx.budgetTier} destinations?`,
      'Cheapest countries in Asia',
      'Safest places to travel',
      'Best beach destinations',
    ]
  }
  // Default generic suggestions
  return [
    'Cheapest countries in Asia',
    '7 days in Japan — cost?',
    'Best beach destinations',
    'Safest places to travel',
  ]
}

// ─── MARKDOWN RENDERER ───────────────────────────────────────────────────────
// Renders **bold** syntax inline. Keeping it minimal avoids a markdown library dep.
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AIChatAssistant() {
  const { aiCtx, updateAIContext } = useAICtx()

  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'bot',
      text: "Hi! I'm your AI travel assistant. Ask me about destinations, budgets, safety, or plan a trip. What's on your mind?",
      links: [],
    },
  ])

  const bottomRef = useRef(null)

  // Auto-scroll to the latest message whenever messages or thinking state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Recompute suggestions whenever page context changes
  const suggestions = useMemo(
    () => getContextualSuggestions(aiCtx),
    // Dep on selectedCountry.id (not object ref) + activeFilters + page identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aiCtx.selectedCountry?.id, aiCtx.activeFilters?.continent, aiCtx.currentPage, aiCtx.budgetTier]
  )

  const send = (text = input) => {
    const q = text.trim()
    if (!q) return

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: q, links: [] }])
    setInput('')
    setThinking(true)

    // Brief delay so it feels like the AI is processing (remove if connecting a real API)
    setTimeout(() => {
      const response = buildResponse(
        q,
        aiCtx,
        // Conversation memory callback: after each country-specific response,
        // store the country ID so follow-up messages can reference it implicitly
        countryId => updateAIContext({ lastMentionedCountry: countryId })
      )
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', ...response }])
      setThinking(false)
    }, 600)
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'bot',
      text: aiCtx.selectedCountry
        ? `Chat cleared. Still browsing ${aiCtx.selectedCountry.flag} **${aiCtx.selectedCountry.name}** — ask me anything!`
        : "Chat cleared. What would you like to know?",
      links: [],
    }])
    // Reset conversation memory when the user explicitly clears the chat
    updateAIContext({ lastMentionedCountry: null })
  }

  return (
    <>
      {/* ── Toggle bubble ───────────────────────────────────────────────────── */}
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
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden
              bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700
              flex flex-col"
            style={{ maxHeight: 560 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">AI Travel Assistant</p>
                <p className="text-white/70 text-xs">Powered by your travel data</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {/* Clear chat button */}
                {messages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="text-white/50 hover:text-white/90 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                    title="Clear conversation"
                  >
                    Clear
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Context awareness indicator ──────────────────────────────────
                Shows which page/country the AI is currently scoped to.
                Gives users confidence that the AI "knows" what they're looking at.
                Hidden when there's no active page context. */}
            <AnimatePresence>
              {(aiCtx.selectedCountry || aiCtx.currentPage) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20
                    border-b border-emerald-100 dark:border-emerald-800/40
                    flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-tight">
                    {aiCtx.selectedCountry
                      ? <>Context: {aiCtx.selectedCountry.flag} <strong>{aiCtx.selectedCountry.name}</strong> — ask without mentioning the country</>
                      : <>Context: <strong>{aiCtx.currentPage}</strong> page</>
                    }
                  </p>
                  <MapPin size={11} className="text-emerald-500 flex-shrink-0 ml-auto" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'bot'
                      ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                  </div>

                  {/* Bubble + links */}
                  <div className={`max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.role === 'bot'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-brand-600 text-white rounded-tr-sm'
                    }`}>
                      <MessageText text={msg.text} />
                    </div>
                    {msg.links?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.links.map(l => (
                          <Link
                            key={l.to}
                            to={l.to}
                            onClick={() => setOpen(false)}
                            className="text-xs px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/30
                              text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700
                              hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                          >
                            {l.label} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {thinking && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-brand-600" />
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-sm">
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

            {/* ── Contextual suggestion chips ─────────────────────────────────
                Update automatically when the user navigates between pages.
                Shown only before the first user message to keep the UI clean. */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {suggestions.map(s => (
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

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input
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
