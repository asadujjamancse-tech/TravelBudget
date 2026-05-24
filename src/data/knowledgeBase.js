// FEATURE: AI KNOWLEDGE BASE
// PURPOSE: Structured travel FAQ dataset for the AI assistant's retrieval system
// DEPENDENCIES: None — pure data

// ─── WHAT THIS IS ─────────────────────────────────────────────────────────────
//
//  A lightweight local RAG (Retrieval-Augmented Generation) system.
//  The AI searches this dataset before answering, so it can handle questions
//  like "do I need travel insurance?" or "how to beat jet lag?" — questions
//  that are NOT in the countries dataset.
//
//  Without this: AI could only answer from countries.js structure.
//  With this: AI becomes a genuine travel advisor.
//
// ─── HOW RETRIEVAL WORKS ─────────────────────────────────────────────────────
//
//  retrieveKnowledge(query) scores each entry by how many query words appear
//  in its `searchTerms` array. Returns the best-matching entry.
//
//  This is keyword-based matching (no vector DB, no API key needed).
//  Trade-off vs real embeddings: lower semantic understanding, but zero cost,
//  zero latency, and 100% predictable for the vocabulary used in travel FAQs.
//
// ─── FUTURE UPGRADE PATH ─────────────────────────────────────────────────────
//
//  Replace retrieveKnowledge() with a vector similarity search:
//    1. Embed searchTerms + question via OpenAI text-embedding-3-small
//    2. Store in Pinecone / ChromaDB
//    3. At query time: embed user input → ANN search → return top entry
//  The API contract (returns entry | null) stays identical — no caller changes.
//
// ─── HOW TO ADD NEW ENTRIES ──────────────────────────────────────────────────
//
//  1. Add an object to the `knowledgeBase` array below.
//  2. Give it a unique `id` (kebab-case).
//  3. Fill `searchTerms` with every word or phrase a user might say to ask
//     this question — more terms = better recall, but avoid noise words.
//  4. `followUps` are IDs of other entries that are naturally related —
//     they become clickable chips after the AI answers.
//
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeBase = [
  // ── Insurance ──────────────────────────────────────────────────────────────
  {
    id: 'travel-insurance',
    category: 'safety',
    searchTerms: [
      'insurance', 'travel insurance', 'medical', 'emergency', 'sick abroad',
      'health coverage', 'protection', 'claim', 'cover', 'covered', 'policy',
    ],
    question: "Do I need travel insurance?",
    answer:
      "**Yes — especially for medical emergencies.**\n\n" +
      "Hospital bills abroad can reach $50,000+. A good policy covers:\n" +
      "• Medical emergencies & evacuation\n" +
      "• Trip cancellation / interruption\n" +
      "• Lost or delayed luggage\n" +
      "• Flight delays\n\n" +
      "**Recommended providers:**\n" +
      "• **SafetyWing** — ~$42/month, ideal for backpackers\n" +
      "• **World Nomads** — covers adventure activities\n" +
      "• **Allianz** — solid for short leisure trips\n\n" +
      "Cost is typically $4–10/day. Never skip it.",
    followUps: ['staying-safe', 'packing-tips', 'money-tips'],
  },

  // ── Money ───────────────────────────────────────────────────────────────────
  {
    id: 'money-tips',
    category: 'money',
    searchTerms: [
      'money', 'cash', 'atm', 'credit card', 'currency', 'exchange', 'fees',
      'bank', 'withdraw', 'payment', 'spending', 'card', 'revolut', 'wise',
      'how to pay', 'payment abroad',
    ],
    question: "How do I handle money while traveling?",
    answer:
      "**Smart money tips for travelers:**\n\n" +
      "• **Always carry local cash** — many local restaurants, markets, and taxis are cash-only\n" +
      "• **Use a fee-free travel card** — Wise, Revolut, or Charles Schwab charge zero ATM fees\n" +
      "• **Avoid airport currency exchange** — rates are typically 15–20% worse than ATMs in town\n" +
      "• **Use ATMs inside banks**, not standalone machines (lower skimming risk)\n" +
      "• **Notify your bank** before traveling to avoid card blocks\n" +
      "• **Keep backup cash** in a separate bag in case of theft or card issues",
    followUps: ['travel-insurance', 'staying-safe', 'bargaining'],
  },

  // ── Flights ─────────────────────────────────────────────────────────────────
  {
    id: 'cheap-flights',
    category: 'flights',
    searchTerms: [
      'flight', 'flights', 'cheap flight', 'airfare', 'airline', 'booking',
      'ticket', 'air ticket', 'fly', 'cheapest flight', 'book flight', 'skyscanner',
      'google flights', 'how to find cheap flights', 'flight deal',
    ],
    question: "How do I find cheap flights?",
    answer:
      "**Best strategies for cheap flights:**\n\n" +
      "• **Book 6–8 weeks ahead** for international, 3–4 weeks for domestic\n" +
      "• **Be flexible with dates** — midweek flights (Tue/Wed) are often cheapest\n" +
      "• **Use Google Flights** — set price alerts and use the calendar view\n" +
      "• **Try nearby airports** — flying into a hub city can save hundreds\n" +
      "• **Use incognito mode** — prevents airlines tracking your searches and raising prices\n" +
      "• **Budget airlines:** Ryanair (Europe), AirAsia (Asia), Spirit (Americas)\n" +
      "• **Skyscanner + Kayak** — compare all airlines at once",
    followUps: ['layover-tips', 'packing-tips', 'travel-insurance'],
  },

  // ── Packing ─────────────────────────────────────────────────────────────────
  {
    id: 'packing-tips',
    category: 'packing',
    searchTerms: [
      'pack', 'packing', 'luggage', 'bag', 'backpack', 'suitcase', 'carry-on',
      'what to bring', 'what to pack', 'baggage', 'essentials', 'checklist',
      'travel bag', 'packing list',
    ],
    question: "What should I pack for a trip?",
    answer:
      "**Universal packing essentials:**\n\n" +
      "**Documents:** Passport (+ 2 copies), visa docs, insurance card, emergency contacts\n\n" +
      "**Tech:** Universal power adapter, portable charger, unlocked phone, offline maps (Maps.me)\n\n" +
      "**Health:** Prescription meds (extra supply), basic first aid kit, hand sanitizer, electrolytes\n\n" +
      "**Clothing:** Apply the 3-day rule — pack for 3 days and do laundry. Merino wool resists odour.\n\n" +
      "**Pro tips:**\n" +
      "• **Roll clothes**, don't fold — saves ~30% space\n" +
      "• Carry-on only when possible — no baggage fees, no carousel waiting",
    followUps: ['cheap-flights', 'travel-insurance', 'staying-safe'],
  },

  // ── Safety ──────────────────────────────────────────────────────────────────
  {
    id: 'staying-safe',
    category: 'safety',
    searchTerms: [
      'safe', 'safety', 'crime', 'theft', 'scam', 'danger', 'secure', 'protect',
      'pickpocket', 'robbery', 'stay safe', 'how to stay safe', 'tourist scam',
      'street crime', 'mugging',
    ],
    question: "How do I stay safe while traveling?",
    answer:
      "**Stay safe abroad — key rules:**\n\n" +
      "• **Look confident** — walk with purpose, avoid looking lost while staring at your phone\n" +
      "• **Use hotel safes** for passport, extra cash, and backup cards\n" +
      "• **Dress like locals** — flashy jewelry and expensive cameras attract thieves\n" +
      "• **Trust your gut** — if a situation feels wrong, leave immediately\n" +
      "• **Share your itinerary** with someone at home (Google Maps live location)\n" +
      "• **Register with your embassy** for emergency alerts in your destination\n" +
      "• **Avoid fake taxis** — use official stands or Uber/Grab\n" +
      "• **Photocopy your passport** and keep a copy at your hotel separately",
    followUps: ['travel-insurance', 'money-tips', 'packing-tips'],
  },

  // ── Jet lag ─────────────────────────────────────────────────────────────────
  {
    id: 'jet-lag',
    category: 'health',
    searchTerms: [
      'jet lag', 'jetlag', 'time zone', 'sleep', 'tired', 'exhausted',
      'adjust', 'clock', 'fatigue', 'recover', 'time difference', 'circadian',
    ],
    question: "How do I beat jet lag?",
    answer:
      "**Jet lag recovery — proven strategies:**\n\n" +
      "• **Start shifting your sleep schedule** 2–3 days before departure (+/- 1 hr/day)\n" +
      "• **Get on local time immediately** when you land — resist the urge to nap at 2pm\n" +
      "• **Stay hydrated on the flight** — plane cabins are at 10–20% humidity (desert-dry)\n" +
      "• **Get morning sunlight** at your destination — fastest way to reset your circadian clock\n" +
      "• **Melatonin (0.5–1mg)** taken at destination bedtime speeds adjustment\n" +
      "• **Avoid alcohol on long flights** — it disrupts sleep quality\n\n" +
      "Most travelers adjust within 2–3 days when they follow natural daylight patterns.",
    followUps: ['packing-tips', 'cheap-flights', 'staying-safe'],
  },

  // ── Solo travel ─────────────────────────────────────────────────────────────
  {
    id: 'solo-travel',
    category: 'travel-style',
    searchTerms: [
      'solo', 'alone', 'solo travel', 'traveling alone', 'solo female', 'by myself',
      'single traveler', 'first time solo', 'solo trip', 'traveling solo',
    ],
    question: "Tips for solo travel?",
    answer:
      "**Solo travel — how to make it amazing:**\n\n" +
      "• **Stay in hostels** — the fastest way to meet other travelers. Common room = instant friends.\n" +
      "• **Join free walking tours** in every city — great for orientation and meeting people\n" +
      "• **Use Meetup.com and Couchsurfing events** — locals host hangouts for travelers\n" +
      "• **Share location** with someone trusted at home using Google Maps\n" +
      "• **Trust your instincts** — solo travelers are not as vulnerable as they feel\n\n" +
      "**Best solo destinations:** 🇯🇵 Japan, 🇵🇹 Portugal, 🇳🇿 New Zealand, 🇮🇸 Iceland, 🇻🇳 Vietnam\n\n" +
      "Solo travel is the fastest way to build confidence and make lifelong global friends.",
    followUps: ['staying-safe', 'budget-tips', 'travel-insurance'],
  },

  // ── Family travel ───────────────────────────────────────────────────────────
  {
    id: 'family-travel',
    category: 'travel-style',
    searchTerms: [
      'family', 'kids', 'children', 'family travel', 'traveling with kids',
      'toddler', 'baby', 'child-friendly', 'travel with children', 'family trip',
    ],
    question: "Tips for traveling with family / kids?",
    answer:
      "**Family travel — making it stress-free:**\n\n" +
      "• **Book direct flights** when possible — layovers with kids multiply the stress\n" +
      "• **Pack a kids activity bag** for flights: snacks, tablet, headphones, small toys\n" +
      "• **Book family rooms early** — they sell out faster than standard rooms\n" +
      "• **Visit in shoulder season** — smaller crowds make it easier with strollers\n\n" +
      "**Best family destinations:**\n" +
      "• 🇹🇭 Thailand — wonderfully child-friendly culture\n" +
      "• 🇦🇺 Australia — wildlife + beaches kids love\n" +
      "• 🇯🇵 Japan — incredibly safe and welcoming to families\n" +
      "• 🇵🇹 Portugal — affordable, relaxed, beach-friendly",
    followUps: ['travel-insurance', 'packing-tips', 'cheap-flights'],
  },

  // ── Digital nomad ───────────────────────────────────────────────────────────
  {
    id: 'digital-nomad',
    category: 'travel-style',
    searchTerms: [
      'digital nomad', 'remote work', 'work remotely', 'work from anywhere',
      'nomad', 'coworking', 'co-working', 'laptop', 'freelance abroad',
      'work and travel', 'remote job', 'work abroad',
    ],
    question: "Best countries for digital nomads?",
    answer:
      "**Top digital nomad destinations:**\n\n" +
      "🇹🇭 **Chiang Mai, Thailand** — $600–900/month, fast WiFi, massive nomad community\n" +
      "🇵🇹 **Lisbon, Portugal** — Digital Nomad Visa, EU access, English widely spoken\n" +
      "🇮🇩 **Bali, Indonesia** — tropical vibes, co-working spaces, $700–1,200/month\n" +
      "🇻🇳 **Vietnam** — ultra affordable at $500–800/month, great food, fast internet\n" +
      "🇲🇽 **Mexico City** — North American time zone, vibrant culture, very affordable\n\n" +
      "**Essentials to verify:**\n" +
      "• Reliable internet speed (minimum 25Mbps for video calls)\n" +
      "• Visa rules for long stays (90-day tourist visas are common)\n" +
      "• Co-working space availability",
    followUps: ['visa-tips', 'money-tips', 'sim-card-tips'],
  },

  // ── Visa general ────────────────────────────────────────────────────────────
  {
    id: 'visa-tips',
    category: 'documents',
    searchTerms: [
      'visa', 'passport', 'entry', 'border', 'documents', 'permit',
      'visa on arrival', 'visa free', 'application', 'e-visa', 'tourist visa',
      'schengen', 'visa requirements', 'visa general',
    ],
    question: "General visa tips and advice?",
    answer:
      "**Visa essentials every traveler should know:**\n\n" +
      "• **Check requirements early** — some visas take 4–8 weeks to process\n" +
      "• **Passport validity** — most countries require 6+ months remaining\n" +
      "• **E-Visas** — many countries now offer fast online applications (India, Turkey, Sri Lanka)\n" +
      "• **Visa on arrival** — common in SE Asia (Thailand, Indonesia, Cambodia)\n" +
      "• **EU Schengen** — one visa for 26 countries, up to 90 days\n\n" +
      "**Pro tip:** Carry printed copies of your visa + hotel booking for border crossings.\n\n" +
      "Check specific country visa requirements on individual country pages in this app!",
    followUps: ['packing-tips', 'staying-safe', 'travel-insurance'],
  },

  // ── Budget travel ───────────────────────────────────────────────────────────
  {
    id: 'budget-tips',
    category: 'budget',
    searchTerms: [
      'save money', 'budget tips', 'travel cheap', 'how to save', 'reduce costs',
      'affordable travel', 'penny pinch', 'frugal', 'low budget', 'spend less',
      'how to travel cheap', 'tight budget',
    ],
    question: "How to travel on a tight budget?",
    answer:
      "**Top budget travel strategies:**\n\n" +
      "• **Slow travel** — staying longer in one place costs less than constant moving\n" +
      "• **Cook your own meals** — kitchenette accommodation saves 50%+ on food\n" +
      "• **Shoulder season** — 30–40% cheaper than peak, with fewer crowds too\n" +
      "• **Free activities** — free walking tours, parks, beaches, many museums are free on Mondays\n" +
      "• **Local transport** — buses and trains always beat taxis\n" +
      "• **Workaway** — work 4 hrs/day at workaway.info for free accommodation\n" +
      "• **Hostels** — dorm beds from $8–15/night in most countries\n\n" +
      "**Best value destinations:** 🇻🇳 Vietnam, 🇰🇭 Cambodia, 🇲🇦 Morocco, 🇳🇵 Nepal, 🇮🇳 India",
    followUps: ['cheap-flights', 'packing-tips', 'solo-travel'],
  },

  // ── Culture & etiquette ─────────────────────────────────────────────────────
  {
    id: 'culture-tips',
    category: 'culture',
    searchTerms: [
      'culture', 'cultural', 'customs', 'etiquette', 'respect', 'local culture',
      'dress code', 'tipping', 'religion', 'traditions', 'dos and donts', 'manners',
      'respectful', 'offensive', 'taboo',
    ],
    question: "How to be a respectful traveler?",
    answer:
      "**Cultural etiquette for responsible travel:**\n\n" +
      "• **Research dress codes** — temples in Asia require covered shoulders & knees\n" +
      "• **Learn basic phrases** — \"hello\", \"thank you\", \"sorry\" in the local language goes a long way\n" +
      "• **Remove shoes at doors** — mandatory in Japan, Thailand, and most Muslim homes\n" +
      "• **Tipping culture varies:**\n" +
      "  — Expected in USA (15–20%), can be offensive in Japan\n" +
      "  — Optional in Europe (round up), appreciated in SE Asia\n" +
      "• **Photography** — always ask before photographing people\n" +
      "• **Bargaining** — normal in markets in Asia/Africa, not in price-tagged shops",
    followUps: ['staying-safe', 'solo-travel', 'bargaining'],
  },

  // ── Best apps ───────────────────────────────────────────────────────────────
  {
    id: 'best-apps',
    category: 'technology',
    searchTerms: [
      'apps', 'app', 'best apps', 'travel apps', 'phone', 'tools', 'websites',
      'resources', 'useful apps', 'download', 'travel tools', 'mobile app',
    ],
    question: "Best apps for traveling?",
    answer:
      "**Must-have travel apps:**\n\n" +
      "📍 **Navigation:** Google Maps (works offline!), Maps.me\n" +
      "✈️ **Flights:** Google Flights, Skyscanner, Kayak\n" +
      "🏨 **Accommodation:** Booking.com, Hostelworld, Airbnb\n" +
      "💰 **Money:** Wise (transfers), Revolut (no-fee card), XE Currency\n" +
      "🌐 **Translation:** Google Translate (offline + camera mode), DeepL\n" +
      "🚕 **Transport:** Uber, Grab (SE Asia), Rome2Rio (route planning)\n" +
      "💬 **Communication:** WhatsApp (universal), Signal\n\n" +
      "**Always download offline maps before your trip** — WiFi is never guaranteed.",
    followUps: ['packing-tips', 'staying-safe', 'sim-card-tips'],
  },

  // ── Layovers ────────────────────────────────────────────────────────────────
  {
    id: 'layover-tips',
    category: 'flights',
    searchTerms: [
      'layover', 'stopover', 'transit', 'connecting flight', 'airport',
      'long wait', 'stuck airport', 'airport tips', 'connection', 'long layover',
    ],
    question: "How to survive (and enjoy) long layovers?",
    answer:
      "**Making the most of a long layover:**\n\n" +
      "• **Over 6 hours?** Consider leaving the airport — many cities offer visa-free transit entry\n" +
      "• **Airport lounges** — Priority Pass or day passes ($35–50) offer showers, food, and WiFi\n" +
      "• **Find the quiet terminal** — most passengers cluster near gates; walk to find empty areas\n" +
      "• **Bring an empty water bottle** — fill after security for free\n" +
      "• **Compression socks** for long flights — reduces swelling and DVT risk\n\n" +
      "**Best cities for layover day trips:** 🇸🇬 Singapore, 🇦🇪 Dubai, 🇳🇱 Amsterdam, 🇯🇵 Tokyo, 🇹🇷 Istanbul",
    followUps: ['cheap-flights', 'packing-tips', 'jet-lag'],
  },

  // ── Vaccinations ────────────────────────────────────────────────────────────
  {
    id: 'vaccinations',
    category: 'health',
    searchTerms: [
      'vaccine', 'vaccination', 'shot', 'immunization', 'malaria', 'hepatitis',
      'typhoid', 'yellow fever', 'health', 'doctor', 'travel health', 'jab',
      'immunize', 'travel medicine', 'health requirements',
    ],
    question: "What vaccinations do I need for travel?",
    answer:
      "**Travel vaccinations — general guide:**\n\n" +
      "**Standard (recommended for most destinations):**\n" +
      "• Hepatitis A & B, Typhoid, Tetanus-Diphtheria, MMR\n\n" +
      "**Region-specific:**\n" +
      "• **SE Asia / Africa:** Malaria prevention (pills or doxycycline)\n" +
      "• **Sub-Saharan Africa / South America:** Yellow Fever (often required for entry)\n" +
      "• **India / South Asia:** Hepatitis A + Typhoid essential\n" +
      "• **Remote areas:** Rabies, Japanese Encephalitis\n\n" +
      "**Important:** Visit a travel health clinic 4–8 weeks before departure — some vaccines need multiple doses.\n" +
      "CDC Traveler's Health (cdc.gov/travel) has country-specific requirements.",
    followUps: ['travel-insurance', 'packing-tips', 'staying-safe'],
  },

  // ── Sustainable travel ──────────────────────────────────────────────────────
  {
    id: 'eco-travel',
    category: 'sustainability',
    searchTerms: [
      'eco', 'sustainable', 'green travel', 'environment', 'carbon', 'responsible',
      'ethical', 'footprint', 'eco-friendly', 'impact', 'offset', 'climate',
      'sustainable travel', 'responsible tourism',
    ],
    question: "How to travel sustainably?",
    answer:
      "**Sustainable travel habits that actually make a difference:**\n\n" +
      "• **Choose direct flights** when possible — takeoffs burn the most fuel per km\n" +
      "• **Take trains over short flights** — rail emits ~80% less CO₂\n" +
      "• **Stay in locally-owned accommodation** — money stays in the community\n" +
      "• **Eat local food** — supports farmers and has a lower carbon footprint\n" +
      "• **Bring a reusable bottle + bag** — avoid single-use plastic\n" +
      "• **Carbon offset** — Gold Standard projects cost ~$10–15 per transatlantic flight\n" +
      "• **Slow travel** — longer stays in fewer places reduces total transport emissions",
    followUps: ['culture-tips', 'budget-tips', 'best-apps'],
  },

  // ── When to travel ──────────────────────────────────────────────────────────
  {
    id: 'best-season',
    category: 'planning',
    searchTerms: [
      'best time', 'when to go', 'season', 'peak season', 'off season',
      'shoulder season', 'rainy season', 'monsoon', 'summer winter',
      'best month', 'when should I travel', 'travel season',
    ],
    question: "When is the best time to travel?",
    answer:
      "**Understanding travel seasons:**\n\n" +
      "• **Peak season** — best weather, most tourists, highest prices\n" +
      "• **Shoulder season** *(recommended)* — good weather, 30% cheaper, fewer crowds\n" +
      "• **Off season** — lowest prices, but weather risk (monsoon, extreme cold)\n\n" +
      "**Quick seasonal guide:**\n" +
      "• **Europe:** Apr–Jun & Sep–Oct are the sweet spot\n" +
      "• **SE Asia:** Nov–Mar (dry season); avoid Jun–Oct monsoon\n" +
      "• **Australia:** Oct–Apr (austral summer) for beaches\n" +
      "• **Japan:** Mar–May (cherry blossom) and Sep–Nov (fall foliage)\n\n" +
      "Check individual country pages for month-by-month weather charts.",
    followUps: ['cheap-flights', 'budget-tips', 'packing-tips'],
  },

  // ── SIM cards ───────────────────────────────────────────────────────────────
  {
    id: 'sim-card-tips',
    category: 'technology',
    searchTerms: [
      'sim', 'sim card', 'local sim', 'data plan', 'internet abroad', 'roaming',
      'connectivity', 'esim', 'phone plan', 'data', 'mobile data', 'airalo',
    ],
    question: "Should I buy a local SIM or use roaming?",
    answer:
      "**Local SIM wins almost every time:**\n\n" +
      "**Why local SIM beats roaming:**\n" +
      "• 10–20× cheaper than international roaming\n" +
      "• Usually 5–15GB data for $5–15 at the airport\n" +
      "• Works with local apps (Grab, local payment systems)\n\n" +
      "**Best options:**\n" +
      "• **eSIM (no physical SIM)** — Airalo app offers global eSIMs from $5\n" +
      "• **Airport SIM shops** — convenient, slightly more expensive\n" +
      "• **Convenience stores** — cheapest (7-Eleven in Thailand and Japan)\n\n" +
      "**Make sure your phone is unlocked** before you travel — check with your carrier.\n\n" +
      "Check the internet & SIM speed for specific countries on their detail pages.",
    followUps: ['best-apps', 'packing-tips', 'money-tips'],
  },

  // ── Bargaining ──────────────────────────────────────────────────────────────
  {
    id: 'bargaining',
    category: 'culture',
    searchTerms: [
      'bargain', 'haggle', 'negotiate', 'price', 'market', 'shopping', 'discount',
      'negotiate price', 'how to bargain', 'souvenir', 'bazaar', 'barter',
    ],
    question: "How to bargain at markets?",
    answer:
      "**Bargaining guide for markets:**\n\n" +
      "• **Only bargain where it's normal** — markets and street stalls, not in malls or restaurants\n" +
      "• **Start at 40–50% of the asking price** — seller expects to meet somewhere in the middle\n" +
      "• **Be friendly, not aggressive** — a smile gets better prices than hard negotiating\n" +
      "• **Walk away technique** — start leaving; they'll often call you back with a better price\n" +
      "• **Don't show too much interest** — if you love it, they'll sense it and hold firm\n" +
      "• **Know when to stop** — once at a fair price, don't push further over $1\n\n" +
      "**Where bargaining is expected:** 🇲🇦 Morocco, 🇪🇬 Egypt, 🇹🇭 Thailand, 🇮🇳 India, 🇹🇷 Turkey, 🇻🇳 Vietnam",
    followUps: ['money-tips', 'culture-tips', 'staying-safe'],
  },

  // ── Accommodation ───────────────────────────────────────────────────────────
  {
    id: 'accommodation-tips',
    category: 'accommodation',
    searchTerms: [
      'hostel', 'guesthouse', 'airbnb', 'where to stay', 'accommodation',
      'cheap accommodation', 'booking', 'hotel tips', 'find a room', 'dorm',
    ],
    question: "How to find great affordable accommodation?",
    answer:
      "**Finding the right place to stay:**\n\n" +
      "• **Hostels** — not just for students. Many have private rooms for $20–35/night.\n" +
      "  Best booking sites: Hostelworld, Booking.com, HostelGenius\n" +
      "• **Guesthouses** — family-run, often half the price of hotels with more character\n" +
      "• **Airbnb** — great for longer stays (1+ week gets discounts) and cooking facilities\n" +
      "• **Booking.com** — largest selection; use the map view to find deals near transport\n\n" +
      "**Pro tips:**\n" +
      "• Read the most recent reviews, not the average star rating\n" +
      "• Book non-refundable for the best price, but only when 90% sure about dates\n" +
      "• Arrive in the late afternoon — morning arrivals often can't check in",
    followUps: ['money-tips', 'budget-tips', 'packing-tips'],
  },
]

// ─── RETRIEVAL FUNCTION ───────────────────────────────────────────────────────

/**
 * Search the knowledge base for the best-matching entry.
 *
 * Scoring: each query word that appears in an entry's searchTerms adds 1 point.
 * Partial matches (query word IS a substring of a searchTerm) also score.
 * Returns null when no entry scores above the threshold.
 *
 * Future upgrade: replace this with vector similarity (OpenAI embeddings →
 * Pinecone/ChromaDB). The call signature and return type stay identical.
 *
 * @param {string} query - The user's raw message text
 * @param {number} [threshold=1] - Minimum score to consider a match
 * @returns {Object|null} Best-matching KB entry or null
 */
export function retrieveKnowledge(query, threshold = 1) {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)   // ignore tiny stop words

  if (words.length === 0) return null

  const scored = knowledgeBase.map(entry => {
    const score = words.reduce((acc, word) => {
      const termScore = entry.searchTerms.reduce((s, term) => {
        if (term === word) return s + 1.5         // exact match
        if (term.includes(word)) return s + 1     // term contains query word
        if (word.includes(term)) return s + 0.5   // query word contains term
        return s
      }, 0)
      return acc + termScore
    }, 0)
    return { entry, score }
  })

  const best = scored.sort((a, b) => b.score - a.score)[0]
  return best && best.score >= threshold ? best.entry : null
}

/**
 * Look up a KB entry by ID — used to resolve follow-up chip labels.
 * @param {string} id
 * @returns {Object|null}
 */
export function getKBEntry(id) {
  return knowledgeBase.find(e => e.id === id) ?? null
}
