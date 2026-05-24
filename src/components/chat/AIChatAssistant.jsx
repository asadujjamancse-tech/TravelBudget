import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'
import { countries } from '../../data/countries'
import { Link } from 'react-router-dom'

// ─── AI response engine ───────────────────────────────────────────────────────
// No API key needed — we use our rich countries dataset to produce intelligent,
// data-driven answers. The function handles: country lookups, trip cost
// calculations, cheapest/safest destination queries, tag-based searches, and
// general travel questions.

function buildResponse(input) {
  const text = input.toLowerCase().trim()

  // ── Greetings ──
  if (/^(hi|hello|hey|yo|sup|good\s*(morning|evening|afternoon))/.test(text)) {
    return {
      text: "Hey! I'm your AI travel assistant. Ask me anything like:\n• \"Cheapest countries in Asia\"\n• \"7 days in Japan — how much?\"\n• \"Best beach destinations under $60/day\"\n• \"Is Thailand safe for solo travelers?\"",
      links: [],
    }
  }

  // ── Try to detect a country name in the message ──
  const mentionedCountry = countries.find(c =>
    text.includes(c.name.toLowerCase()) ||
    text.includes(c.id.toLowerCase()) ||
    (c.id === 'uae' && text.includes('dubai'))
  )

  // ── Detect number of days ──
  const daysMatch = text.match(/(\d+)\s*(?:days?|nights?|weeks?)/)
  const days = daysMatch
    ? (text.includes('week') ? parseInt(daysMatch[1]) * 7 : parseInt(daysMatch[1]))
    : null

  // ── Detect budget amount ──
  const budgetMatch = text.match(/\$(\d+)|(\d+)\s*(?:dollars?|usd)/i)
  const budget = budgetMatch ? parseInt(budgetMatch[1] || budgetMatch[2]) : null

  // ── Trip cost calculation: "7 days in Japan" ──
  if (mentionedCountry && days) {
    const style = text.includes('luxury')  ? 'luxury'
                : text.includes('standard') ? 'standard'
                : 'backpacker'
    const perDay = mentionedCountry.budget[style].perDay
    const total  = perDay * days
    const c = mentionedCountry
    return {
      text: `${c.flag} **${c.name} — ${days}-day ${style} trip**\n\n` +
            `• Daily budget: **$${perDay}/day**\n` +
            `• Total estimate: **$${total.toLocaleString()}**\n` +
            `• Includes hotel ($${c.budget[style].hotel}), food ($${c.budget[style].food}), transport ($${c.budget[style].transport})\n\n` +
            `Best seasons: ${c.bestSeasons.join(', ')}\n` +
            `Safety: ${c.safety.charAt(0).toUpperCase() + c.safety.slice(1)}`,
      links: [{ label: `Explore ${c.name}`, to: `/country/${c.id}` }],
    }
  }

  // ── Single country info ──
  if (mentionedCountry) {
    const c = mentionedCountry
    return {
      text: `${c.flag} **${c.name}** (${c.continent})\n\n` +
            `**Daily costs:**\n• Backpacker: $${c.budget.backpacker.perDay}/day\n` +
            `• Standard: $${c.budget.standard.perDay}/day\n` +
            `• Luxury: $${c.budget.luxury.perDay}/day\n\n` +
            `**Capital:** ${c.capital}  |  **Safety:** ${c.safety}\n` +
            `**Visa:** ${c.visa.type} (${c.visa.cost})\n` +
            `**Best time to visit:** ${c.bestSeasons.join(', ')}\n\n` +
            `${c.description.slice(0, 120)}…`,
      links: [{ label: `Full ${c.name} guide`, to: `/country/${c.id}` }],
    }
  }

  // ── Cheapest destinations, optionally filtered by continent ──
  if (/cheap|budget|afford|cheapest|low.?cost|inexpensive/.test(text)) {
    let pool = [...countries]
    if (text.includes('europe')) pool = pool.filter(c => c.continent === 'Europe')
    else if (text.includes('asia')) pool = pool.filter(c => c.continent === 'Asia')
    else if (text.includes('america')) pool = pool.filter(c => c.continent.includes('America'))
    else if (text.includes('africa')) pool = pool.filter(c => c.continent === 'Africa')

    const sorted = pool.sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay).slice(0, 4)
    return {
      text: `Most affordable destinations:\n\n` +
            sorted.map((c, i) => `${i + 1}. ${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: sorted.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Safest destinations ──
  if (/safe|safety|dangerous|crime/.test(text)) {
    const safe = countries.filter(c => c.safety === 'high')
      .sort((a, b) => a.budget.standard.perDay - b.budget.standard.perDay)
      .slice(0, 4)
    return {
      text: `Destinations with **High Safety** rating:\n\n` +
            safe.map(c => `${c.flag} **${c.name}** — $${c.budget.standard.perDay}/day standard`).join('\n'),
      links: safe.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Beach / island search ──
  if (/beach|island|tropical|sea|coast|ocean/.test(text)) {
    const beach = countries.filter(c => c.tags.some(t => ['beach', 'island', 'tropical', 'coast'].includes(t))).slice(0, 4)
    return {
      text: `Top beach & island destinations:\n\n` +
            beach.map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: beach.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Backpacker destinations ──
  if (/backpacker|solo|hostel|shoestring/.test(text)) {
    const top = [...countries].sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay).slice(0, 5)
    return {
      text: `Best backpacker destinations (by daily cost):\n\n` +
            top.map((c, i) => `${i + 1}. ${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
      links: top.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Luxury travel ──
  if (/luxury|premium|five.?star|high.?end|splurge/.test(text)) {
    const top = [...countries].sort((a, b) => b.budget.luxury.perDay - a.budget.luxury.perDay).slice(0, 4)
    return {
      text: `Top luxury destinations:\n\n` +
            top.map(c => `${c.flag} **${c.name}** — from $${c.budget.luxury.perDay}/day`).join('\n') +
            '\n\nThese destinations offer world-class hotels, Michelin-star dining, and exclusive experiences.',
      links: top.map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Budget-filtered search: "under $50 a day" ──
  if (budget) {
    const fits = countries.filter(c => c.budget.backpacker.perDay <= budget)
      .sort((a, b) => a.budget.backpacker.perDay - b.budget.backpacker.perDay)
    if (fits.length) {
      return {
        text: `Destinations with a backpacker budget **under $${budget}/day**:\n\n` +
              fits.slice(0, 5).map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day`).join('\n'),
        links: fits.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
      }
    }
    return { text: `No destinations found under $${budget}/day in our database.`, links: [] }
  }

  // ── Continent-based query ──
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
        text: `${continent} destinations (cheapest first):\n\n` +
              inContinent.map(c => `${c.flag} **${c.name}** — $${c.budget.backpacker.perDay}/day backpacker`).join('\n'),
        links: inContinent.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
      }
    }
  }

  // ── Visa-free / visa on arrival ──
  if (/visa.?free|no visa|visa on arrival/.test(text)) {
    const free = countries.filter(c => c.visa.type.toLowerCase().includes('free') || c.visa.cost === '$0' || c.visa.cost === 'Free')
    return {
      text: free.length
        ? `Destinations with easy/free visa access:\n\n` + free.map(c => `${c.flag} **${c.name}** — ${c.visa.type}`).join('\n')
        : 'Visa requirements vary by your passport. Check individual country pages for up-to-date details.',
      links: free.slice(0, 4).map(c => ({ label: c.name, to: `/country/${c.id}` })),
    }
  }

  // ── Fallback ──
  return {
    text: "I can help with:\n• Budget estimates (\"10 days in Bali\")\n• Finding cheap destinations (\"cheapest in Europe\")\n• Safety info (\"safest countries\")\n• Beach trips, backpacker routes, luxury travel\n• Any specific country (\"tell me about Japan\")\n\nWhat are you planning?",
    links: [],
  }
}

// ─── Message renderer — supports **bold** markdown syntax ─────────────────────
function MessageText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        // Replace **bold** with <strong>
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

// ─── Suggested starter questions ─────────────────────────────────────────────
const SUGGESTIONS = [
  'Cheapest countries in Asia',
  '7 days in Japan — cost?',
  'Best beach destinations',
  'Safest places to travel',
]

// ─── Main component ────────────────────────────────────────────────────────────
export default function AIChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 0, role: 'bot',
      text: "Hi! I'm your AI travel assistant. Ask me about destinations, budgets, safety, or plan a trip. What's on your mind?",
      links: [],
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const send = (text = input) => {
    const q = text.trim()
    if (!q) return

    // Add user message immediately
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: q, links: [] }])
    setInput('')
    setThinking(true)

    // Simulate a brief "thinking" delay — makes it feel like real AI
    setTimeout(() => {
      const response = buildResponse(q)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', ...response }])
      setThinking(false)
    }, 600)
  }

  return (
    <>
      {/* ── Toggle bubble (bottom-left, away from BackToTop on right) ── */}
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

      {/* ── Chat panel ───────────────────────────────────────────────── */}
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
            style={{ maxHeight: 520 }}
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
              <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

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

                  {/* Bubble */}
                  <div className={`max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.role === 'bot'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-brand-600 text-white rounded-tr-sm'
                    }`}>
                      <MessageText text={msg.text} />
                    </div>
                    {/* Country shortcut links inside bot messages */}
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

              {/* Thinking indicator */}
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

            {/* Suggestion chips — only shown when there are no user messages yet */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
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
                placeholder="Ask about any destination…"
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
