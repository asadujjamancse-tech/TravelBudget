# TravelBudget — AI Development Guide

> This file is auto-loaded by Claude Code at the start of every session.
> It is the single source of truth for how to work on this project safely.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | React 19, Vite 8                  |
| Routing     | React Router v7                   |
| Styling     | Tailwind CSS v3 (class-based dark mode) |
| Animation   | Framer Motion v12                 |
| Charts      | Recharts v3                       |
| Map         | React Leaflet + Leaflet (free, no API key) |
| Icons       | Lucide React v1.16.0 — **NOTE: no Twitter/Instagram/Youtube icons; use Share2/AtSign/Rss** |
| State       | React Context API + localStorage  |
| Language    | JavaScript (JSX)                  |

---

## Path Aliases (ALWAYS use these — never use relative paths)

```js
@            → src/
@features    → src/features/
@components  → src/components/
@data        → src/data/
@hooks       → src/hooks/
@context     → src/context/
@utils       → src/utils/
@constants   → src/constants/
```

**Examples:**
```js
import Footer from '@components/layout/Footer'
import { countries } from '@data/countries'
import { useApp } from '@context/AppContext'
import CountryCard from '@features/countries/components/CountryCard'
```

---

## Feature-Based Folder Structure

```
src/
├── features/                    ← One folder per product feature
│   ├── home/                    ← Landing page
│   │   ├── components/          (Hero, Stats, PopularDestinations, TrendingSection, FeaturesSection, Testimonials)
│   │   └── pages/Home.jsx
│   ├── countries/               ← Country explorer + detail
│   │   ├── components/          (CountryCard, BudgetChart, HotelCard, RestaurantCard, AttractionCard)
│   │   └── pages/               (Explore.jsx, CountryDetail.jsx)
│   ├── budget-calculator/       ← Budget planner with pie chart
│   │   └── pages/BudgetCalculator.jsx
│   ├── compare/                 ← Side-by-side RadarChart comparison
│   │   └── pages/Compare.jsx
│   ├── hotels/                  ← Hotel listings across all countries
│   │   └── pages/Hotels.jsx
│   ├── restaurants/             ← Restaurant listings
│   │   └── pages/Restaurants.jsx
│   ├── tips/                    ← Travel tips blog
│   │   └── pages/TravelTips.jsx
│   ├── maps/                    ← Interactive Leaflet world map
│   │   └── pages/WorldMap.jsx
│   ├── dashboard/               ← User dashboard + expense tracker
│   │   ├── hooks/useExpenses.js
│   │   └── pages/Dashboard.jsx
│   ├── favorites/               ← Saved countries (localStorage)
│   │   └── pages/Favorites.jsx
│   ├── ai-assistant/            ← Floating AI chat (data-driven, no API key)
│   │   └── components/AIChatAssistant.jsx
│   ├── about/                   └── pages/About.jsx
│   └── contact/                 └── pages/Contact.jsx
│
├── components/                  ← Shared components ONLY
│   ├── layout/                  (Navbar, Footer, ScrollToTop, BackToTop)
│   └── ui/                      (SkeletonCard, NotFound)
│
├── context/                     ← Global state
│   ├── AppContext.jsx            (favorites, compareList, savedTrips, currency)
│   └── ThemeContext.jsx          (dark/light toggle)
│
├── data/                        ← Static data (shared across features)
│   ├── countries.js             (26 countries, full budget/hotels/restaurants/attractions data)
│   └── tips.js                  (12 travel tips)
│
├── hooks/                       ← Shared hooks
│   └── useLocalStorage.js
│
├── utils/                       ← Utility functions (empty — add as needed)
└── constants/                   ← App-wide constants (empty — add as needed)
```

---

## Routing (src/App.jsx)

| Path            | Component                            | Feature         |
|-----------------|--------------------------------------|-----------------|
| `/`             | Home                                 | home            |
| `/explore`      | Explore                              | countries       |
| `/country/:id`  | CountryDetail                        | countries       |
| `/calculator`   | BudgetCalculator                     | budget-calculator |
| `/compare`      | Compare                              | compare         |
| `/hotels`       | Hotels                               | hotels          |
| `/restaurants`  | Restaurants                          | restaurants     |
| `/tips`         | TravelTips                           | tips            |
| `/map`          | WorldMap                             | maps            |
| `/dashboard`    | Dashboard                            | dashboard       |
| `/favorites`    | Favorites                            | favorites       |
| `/about`        | About                                | about           |
| `/contact`      | Contact                              | contact         |
| `*`             | NotFound                             | components/ui   |

---

## Global State — AppContext

```js
const {
  // Favorites (localStorage persisted)
  favorites, toggleFavorite, isFavorite,
  // Saved trips (from calculator)
  savedTrips, addTrip, removeTrip,
  // Country comparison (max 3)
  compareList, addToCompare, removeFromCompare, clearCompare,
  // Multi-currency (localStorage persisted)
  currency, setCurrency, convertCurrency, currencySymbol, exchangeRates,
} = useApp()
```

**Supported currencies:** USD, EUR, GBP, JPY, AUD, CAD, AED, INR

---

## Design System

**Brand:** Purple/violet (`brand-*` = violet scale). Orange accent (`accent-*`).

**Dark mode:** class-based — `dark` class on `<html>`. Toggle via ThemeContext.

**Custom Tailwind classes (defined in src/index.css):**

```
.glass          — glassmorphism card (bg-white/70 + backdrop-blur-xl)
.glass-card     — glass with border and shadow
.btn-primary    — brand gradient button with glow
.btn-accent     — orange accent button
.btn-ghost      — transparent outline button
.btn-glass      — glass-style button (for dark overlays)
.gradient-text  — animated brand gradient text
.section-container — max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
.card-hover     — hover lift + shadow effect
.input-base     — full-width styled input / select / textarea
.badge-*        — pill badges
.safety-high/medium/low — colored safety rating chips
.shadow-card    — soft card shadow
.shadow-glow / shadow-glow-sm — brand-colored glow shadow
```

---

## Data Structure (countries.js)

Each country object:
```js
{
  id, name, continent, flag, image, capital, language, timezone, population,
  currency: { code, symbol, rateToUSD },
  safety: 'high' | 'medium' | 'low',
  description, highlights[], tags[],
  budget: {
    backpacker: { perDay, hotel, food, transport, activities },
    standard:   { perDay, hotel, food, transport, activities },
    luxury:     { perDay, hotel, food, transport, activities },
  },
  hotels:      [{ name, stars, pricePerNight, type, area, rating }],
  restaurants: [{ name, type, cuisine, priceRange, mustTry, rating }],
  attractions: [{ name, type, entryFee, duration, rating }],
  transport:   { publicTransport, carRental, taxi, airport },
  visa:        { type, duration, cost, notes },
  internet:    { simCard, avgSpeed },
  bestSeasons: [],
  weather:     [{ month, temp }],  // 12 months
}
```

**Exports:** `countries`, `continents`, `allTags`, `getCountryById`, `popularDestinations`, `trendingCountries`

---

## Component Tagging Convention

Every component file should begin with:
```js
// FEATURE: <feature name>
// PURPOSE: <what it does in one line>
// DEPENDENCIES: <key imports — data, context, child components>
```

---

## AI Coding Rules (read before making ANY change)

1. **Use `@` path aliases** — never relative paths that cross feature boundaries
2. **Only modify files in the stated feature** — don't touch unrelated files
3. **Reuse existing Tailwind classes** from the design system — no inline styles, no new CSS
4. **Preserve responsiveness** — mobile-first, test at all breakpoints
5. **No duplicate logic** — check if a hook/util already exists before creating
6. **Add `// FEATURE / PURPOSE / DEPENDENCIES` tag** to any new component
7. **Run `npm run build` mentally** — make sure imports resolve before finishing
8. **Lucide React limitation** — no Twitter/Instagram/Youtube icons in v1.16.0
9. **Data stays in `src/data/`** — don't move countries.js or tips.js into features
10. **Context stays in `src/context/`** — AppContext and ThemeContext are global

---

## Prompting Pattern for AI Tasks

```
TASK: [specific change]
FILE: src/features/<feature>/components/<Component>.jsx
GOALS:
- [goal 1]
- [goal 2]
RULES:
- Use @ path aliases
- Use Tailwind only (no inline styles)
- Do not modify unrelated files
- Preserve dark mode classes
```
