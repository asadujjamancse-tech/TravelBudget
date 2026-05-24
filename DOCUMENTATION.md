# TravelBudget — Complete Project Documentation

> A beginner-friendly guide to every part of this project.
> Written so that any developer — even one seeing the code for the first time —
> can understand it, run it, extend it, and contribute to it.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [The Vision & Purpose](#2-the-vision--purpose)
3. [Technology Stack](#3-technology-stack)
4. [Getting Started](#4-getting-started)
5. [Folder Structure Explained](#5-folder-structure-explained)
6. [Design System](#6-design-system)
7. [Global State Management](#7-global-state-management)
8. [The Data Layer](#8-the-data-layer)
9. [Routing System](#9-routing-system)
10. [Feature: Home Page](#10-feature-home-page)
11. [Feature: Country Explorer](#11-feature-country-explorer)
12. [Feature: Country Detail Page](#12-feature-country-detail-page)
13. [Feature: Budget Calculator](#13-feature-budget-calculator)
14. [Feature: Country Comparison](#14-feature-country-comparison)
15. [Feature: Hotels](#15-feature-hotels)
16. [Feature: Restaurants](#16-feature-restaurants)
17. [Feature: Travel Tips](#17-feature-travel-tips)
18. [Feature: World Map](#18-feature-world-map)
19. [Feature: Dashboard & Expense Tracker](#19-feature-dashboard--expense-tracker)
20. [Feature: AI Chat Assistant](#20-feature-ai-chat-assistant)
21. [Feature: Favorites](#21-feature-favorites)
22. [Feature: About & Contact](#22-feature-about--contact)
23. [Shared Components](#23-shared-components)
24. [Path Aliases](#24-path-aliases)
25. [How to Add a New Country](#25-how-to-add-a-new-country)
26. [How to Add a New Feature](#26-how-to-add-a-new-feature)
27. [PWA — Making It Installable](#27-pwa--making-it-installable)
28. [Dark Mode System](#28-dark-mode-system)
29. [Multi-Currency System](#29-multi-currency-system)
30. [Future Roadmap](#30-future-roadmap)

---

## 1. What Is This Project?

**TravelBudget** is a full-featured, production-quality travel budget planning web application.

It gives travelers **real, detailed cost data** for 26 destinations around the world — broken down into daily budgets for backpackers, standard travelers, and luxury travelers. It also includes hotel listings, restaurant recommendations, top attractions, weather charts, visa information, transport options, and internet/SIM details for every country.

On top of the data, TravelBudget provides a suite of planning tools:

- A **budget calculator** that estimates the total cost of a trip
- A **country comparison** tool to evaluate destinations side-by-side
- An **interactive world map** showing all destinations with budget color coding
- A personal **expense tracker dashboard** to log actual spending
- An **AI chat assistant** that answers travel questions in natural language
- A **favorites** system to bookmark destinations
- A **multi-currency converter** so all prices show in the user's preferred currency

The app runs entirely in the browser — no backend, no database, no login required. All user data (favorites, saved trips, expenses) is stored in the browser's `localStorage`.

---

## 2. The Vision & Purpose

### The Problem

Most travel budget guides online are:
- Too vague ("Japan costs $50–$500 per day")
- Badly outdated
- Split across dozens of different websites
- Hard to compare between destinations
- Not interactive — just static articles

### The Solution

TravelBudget puts everything in one place with a beautiful, interactive interface:

1. **Real, structured data** — not vague ranges, but specific costs broken into hotel, food, transport, and activities for three different travel styles
2. **Instant calculations** — type in your destination, duration, and style; get a total cost in seconds
3. **Visual comparisons** — charts, maps, and side-by-side tables instead of walls of text
4. **Personal tools** — save trips, track actual expenses, compare countries, bookmark favorites

### Who Is It For?

- **Backpackers** planning a trip on a tight budget
- **Families** estimating the cost of a vacation
- **Digital nomads** comparing cost-of-living across cities
- **Luxury travelers** looking for premium destinations
- **Students** who want to see the world affordably
- **Developers** who want a portfolio project to showcase

---

## 3. Technology Stack

Every technology in this project was chosen deliberately. Here is what each one does and why it was chosen.

### React 19

**What it is:** A JavaScript library for building user interfaces.

React lets you break the UI into small, reusable pieces called **components**. Instead of writing one giant HTML file, you write hundreds of small components that each manage their own piece of the screen.

**Why React?** It is the most widely used frontend framework in the world. Every tech company uses it. Knowing React is one of the most valuable skills a frontend developer can have.

### Vite 8

**What it is:** A build tool and development server for modern JavaScript projects.

When you run `npm run dev`, Vite starts a local server at `http://localhost:5173`. When you save a file, the browser updates instantly — this is called **Hot Module Replacement (HMR)**.

When you run `npm run build`, Vite compiles all your code into optimized files in the `dist/` folder that can be uploaded to any web server.

**Why Vite?** It is dramatically faster than older tools like Create React App. Cold start takes under 300ms.

### React Router v7

**What it is:** A library that enables navigation between pages in a React app without reloading the browser.

Normally, navigating to a new URL reloads the entire page. React Router intercepts those navigations and swaps in a different React component instead — this is called a **Single Page Application (SPA)**.

**Why?** All 13 pages of TravelBudget use React Router. The URL changes (e.g. `/country/japan`) but the page never fully reloads, making navigation feel instant.

### Tailwind CSS v3

**What it is:** A utility-first CSS framework. Instead of writing CSS files, you apply short class names directly in your HTML/JSX.

**Example — without Tailwind:**
```css
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

**Example — with Tailwind:**
```jsx
<div className="bg-white rounded-2xl p-5 shadow-card">
```

Every style is a class name. Dark mode is handled by adding `dark:` before any class:
```jsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
```

**Why Tailwind?** No context switching between JSX and CSS files. Styles and markup live together. Responsive design is built in (`sm:`, `md:`, `lg:`, `xl:` prefixes).

### Framer Motion v12

**What it is:** An animation library for React.

It makes elements animate in/out smoothly. Instead of CSS transitions, you describe animations declaratively:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Hello World
</motion.div>
```

**Features used in this project:**
- Page entrance animations (fade + slide up)
- AnimatePresence (exit animations when components unmount)
- Hover/tap gestures (`whileHover`, `whileTap`)
- Spring physics for the sidebar drawer on the world map
- Animated counter numbers (Stats component)

### Recharts v3

**What it is:** A chart library built specifically for React.

It renders charts using SVG. Each chart type (BarChart, AreaChart, PieChart, RadarChart) is a React component, so charts respond to state changes automatically.

**Charts used in this project:**
- `BarChart` — budget breakdown by tier (country detail)
- `AreaChart` — weather temperature over 12 months (country detail)
- `PieChart` — budget distribution (budget calculator, dashboard)
- `RadarChart` — multi-metric country comparison
- `AreaChart` — 7-day spending timeline (dashboard)

### Leaflet + React Leaflet

**What it is:** An open-source interactive map library. React Leaflet wraps it for use in React components.

**Why Leaflet instead of Google Maps?** Leaflet is completely free with no API key required. It uses OpenStreetMap tiles (also free). This project uses CartoDB's free tile service for a more polished visual style.

### Lucide React v1.16.0

**What it is:** A set of beautiful, consistent SVG icons as React components.

```jsx
import { Globe, Heart, MapPin } from 'lucide-react'

<Globe size={20} className="text-brand-600" />
```

**Important limitation:** This version does NOT include `Twitter`, `Instagram`, or `Youtube` icons. Use `Share2`, `AtSign`, and `Rss` instead.

### Context API

**What it is:** React's built-in state management system. It lets you share data between components without passing props through every level.

**Used for:**
- `AppContext` — favorites, compare list, saved trips, currency conversion
- `ThemeContext` — dark/light mode toggle

### localStorage

**What it is:** A browser API that stores key-value pairs permanently in the browser (survives page refresh, closing the tab, even restarting the computer).

**Used for:** Favorites, saved trips, expense records, currency preference, theme preference.

---

## 4. Getting Started

### Prerequisites

You need these installed on your computer:
- **Node.js** version 18 or higher — download from [nodejs.org](https://nodejs.org)
- **npm** — comes with Node.js automatically
- A code editor — **VS Code** is recommended

### Step 1 — Navigate to the project folder

```bash
cd "/Users/princerafa2025/Traveller app"
```

### Step 2 — Install dependencies

```bash
npm install
```

This reads `package.json` and downloads all the libraries into the `node_modules/` folder. This only needs to be done once (or after pulling new changes).

### Step 3 — Start the development server

```bash
npm run dev
```

You will see output like:
```
  VITE v8.0.14 ready in 312ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open `http://localhost:5173` in your browser. The app is running. Every time you save a file, the browser updates automatically.

### Step 4 — Build for production

```bash
npm run build
```

This creates a `dist/` folder with optimized, minified files ready to deploy to any web host (Vercel, Netlify, GitHub Pages, etc.).

### Available Scripts

| Command          | What it does                                    |
|------------------|-------------------------------------------------|
| `npm run dev`    | Start development server with hot reload        |
| `npm run build`  | Build optimized production bundle               |
| `npm run preview`| Preview the production build locally            |
| `npm run lint`   | Run ESLint to check for code problems           |

---

## 5. Folder Structure Explained

```
TravelBudget/
│
├── public/                     Static files served directly (not processed by Vite)
│   ├── favicon.svg             Browser tab icon
│   ├── icons.svg               Icon sprites
│   └── manifest.json           PWA manifest (makes app installable)
│
├── src/                        All source code lives here
│   │
│   ├── features/               ONE FOLDER PER PRODUCT FEATURE
│   │   │                       Each feature is self-contained with its own
│   │   │                       components, pages, hooks, and README.
│   │   │
│   │   ├── home/               Landing page feature
│   │   │   ├── components/     Hero, Stats, PopularDestinations, TrendingSection,
│   │   │   │                   FeaturesSection, Testimonials
│   │   │   ├── pages/Home.jsx  The route component for "/"
│   │   │   └── README.md       Feature documentation
│   │   │
│   │   ├── countries/          Country explorer + detail pages
│   │   │   ├── components/     CountryCard, BudgetChart, HotelCard,
│   │   │   │                   RestaurantCard, AttractionCard
│   │   │   ├── pages/          Explore.jsx, CountryDetail.jsx
│   │   │   └── README.md
│   │   │
│   │   ├── budget-calculator/  Trip cost calculator
│   │   │   ├── pages/BudgetCalculator.jsx
│   │   │   └── README.md
│   │   │
│   │   ├── compare/            Side-by-side country comparison
│   │   │   ├── pages/Compare.jsx
│   │   │   └── README.md
│   │   │
│   │   ├── hotels/             Hotel listings across all countries
│   │   │   └── pages/Hotels.jsx
│   │   │
│   │   ├── restaurants/        Restaurant listings
│   │   │   └── pages/Restaurants.jsx
│   │   │
│   │   ├── tips/               Travel tips blog
│   │   │   └── pages/TravelTips.jsx
│   │   │
│   │   ├── maps/               Interactive Leaflet world map
│   │   │   ├── pages/WorldMap.jsx
│   │   │   └── README.md
│   │   │
│   │   ├── dashboard/          Personal travel dashboard + expense tracker
│   │   │   ├── hooks/useExpenses.js   Expense CRUD logic
│   │   │   ├── pages/Dashboard.jsx
│   │   │   └── README.md
│   │   │
│   │   ├── favorites/          Saved/bookmarked countries
│   │   │   └── pages/Favorites.jsx
│   │   │
│   │   ├── ai-assistant/       Floating AI chatbot
│   │   │   ├── components/AIChatAssistant.jsx
│   │   │   └── README.md
│   │   │
│   │   ├── about/              About page
│   │   │   └── pages/About.jsx
│   │   │
│   │   └── contact/            Contact form
│   │       └── pages/Contact.jsx
│   │
│   ├── components/             SHARED components only
│   │   │                       (used by multiple features)
│   │   ├── layout/
│   │   │   ├── Navbar.jsx      Top navigation bar
│   │   │   ├── Footer.jsx      Page footer
│   │   │   ├── ScrollToTop.jsx Resets scroll on route change
│   │   │   └── BackToTop.jsx   Floating "back to top" button
│   │   └── ui/
│   │       ├── SkeletonCard.jsx Loading placeholder card
│   │       └── NotFound.jsx    404 error page
│   │
│   ├── context/                Global state providers
│   │   ├── AppContext.jsx       Favorites, compare, trips, currency
│   │   └── ThemeContext.jsx     Dark/light mode
│   │
│   ├── data/                   Static data files (the "database")
│   │   ├── countries.js        26 countries with full travel data
│   │   └── tips.js             12 travel tips articles
│   │
│   ├── hooks/                  Shared custom hooks
│   │   └── useLocalStorage.js  Read/write browser localStorage safely
│   │
│   ├── utils/                  Utility functions (empty — add as needed)
│   ├── constants/              App-wide constants (empty — add as needed)
│   ├── App.jsx                 Root component — sets up routing
│   ├── main.jsx                Entry point — mounts React into the DOM
│   └── index.css               Global styles + Tailwind custom classes
│
├── index.html                  The single HTML file (Vite injects the JS here)
├── vite.config.js              Vite configuration + path aliases
├── tailwind.config.js          Tailwind theme customization
├── jsconfig.json               IDE path alias support
├── .prettierrc                 Code formatting rules
├── CLAUDE.md                   AI assistant context file (auto-loaded)
├── AI_RULES.md                 Rules for AI coding sessions
└── package.json                Project metadata and dependency list
```

### The Golden Rule of This Structure

> Features are self-contained. Shared resources are shared. Nothing else crosses the boundary.

If you are working on the Hotels feature, you only touch `src/features/hotels/`. If you need to change the Navbar, you touch `src/components/layout/Navbar.jsx`. You never touch unrelated files.

---

## 6. Design System

The entire visual identity of TravelBudget is defined by these design decisions.

### Colors

The brand color is **violet/purple**. The accent is **orange**. These are defined in `tailwind.config.js`:

```js
brand: {
  50:  '#f5f3ff',
  100: '#ede9fe',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',  ← primary brand color
  700: '#6d28d9',
}
```

Use `text-brand-600`, `bg-brand-600`, `border-brand-500`, etc. in your Tailwind classes.

**Semantic colors used throughout:**
- `slate-*` — neutral grays for backgrounds and text
- `emerald-*` — success, safety "high", budget-tier green
- `amber-*` — warning, mid-range pricing
- `rose-*` / `pink-*` — favorites (heart icons), danger
- `sky-*` / `blue-*` — Contact page header

### Typography

Two font families:

| Font              | Class            | Usage                                   |
|-------------------|------------------|-----------------------------------------|
| **Inter**         | (default)        | All body text, labels, numbers          |
| **Playfair Display** | `font-display` | Headings, hero titles, page headers     |

```jsx
<h1 className="font-display text-5xl font-bold">Explore the World</h1>
<p className="text-slate-600 text-sm leading-relaxed">Body text here.</p>
```

### Custom Tailwind Classes

These are defined in `src/index.css`. **Always reuse these instead of writing from scratch.**

#### Layout

```
.section-container   max-width container with responsive horizontal padding
```

#### Cards & Glass

```
.glass              Glassmorphism: semi-transparent white with blur
.glass-card         glass + border + shadow
.card-hover         Hover effect: lift + shadow (use on clickable cards)
.shadow-card        Soft card drop shadow
.shadow-glow        Brand-colored purple glow (use on brand elements)
.shadow-glow-sm     Smaller glow (use on active nav links, buttons)
```

#### Buttons

```
.btn-primary        Brand gradient button (purple) with glow on hover
.btn-accent         Orange accent button
.btn-ghost          Transparent with border
.btn-glass          Glass-style (for use on dark image overlays)
```

#### Text

```
.gradient-text      Animated brand gradient text (purple → orange)
```

#### Forms

```
.input-base         Full-width, styled input/select/textarea with focus ring
```

#### Badges

```
.badge-blue         Blue pill badge
.badge-green        Green pill badge
.badge-amber        Amber pill badge
```

#### Safety Chips

```
.safety-high        Green chip (safe destination)
.safety-medium      Amber chip (moderate safety)
.safety-low         Red chip (exercise caution)
```

### Shadows

```js
'shadow-card':    '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)'
'shadow-hover':   '0 20px 60px -10px rgba(0,0,0,0.15)'
'shadow-glass':   '0 8px 32px rgba(0,0,0,0.12)'
'shadow-glow':    '0 0 30px rgba(124,58,237,0.4)'
'shadow-glow-sm': '0 0 15px rgba(124,58,237,0.3)'
```

---

## 7. Global State Management

Two Context providers wrap the entire app. They are set up in `src/App.jsx`:

```jsx
<ThemeProvider>         ← outermost — dark/light mode
  <AppProvider>         ← app data — favorites, trips, currency
    <BrowserRouter>
      ...
    </BrowserRouter>
  </AppProvider>
</ThemeProvider>
```

### ThemeContext (`src/context/ThemeContext.jsx`)

Manages the dark/light mode toggle.

**What it does:**
1. Reads the saved preference from `localStorage('theme')`
2. Checks the OS preference (`prefers-color-scheme: dark`) as a fallback
3. Adds or removes the `dark` class on `<html>` (which activates all `dark:` Tailwind classes)
4. Saves the choice to localStorage so it persists on next visit

**How to use it in any component:**
```jsx
import { useTheme } from '@context/ThemeContext'

function MyComponent() {
  const { dark, toggle } = useTheme()

  return (
    <button onClick={toggle}>
      {dark ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  )
}
```

### AppContext (`src/context/AppContext.jsx`)

The main application state store. Everything that needs to persist across pages lives here.

**Full API:**

```js
const {
  // ── Favorites ──────────────────────────────────────
  favorites,          // string[] — array of country IDs e.g. ['japan', 'bali']
  toggleFavorite,     // (countryId: string) => void
  isFavorite,         // (countryId: string) => boolean

  // ── Saved Trips (from calculator) ──────────────────
  savedTrips,         // Trip[] — persisted in localStorage
  addTrip,            // (trip: object) => void — auto-assigns an ID
  removeTrip,         // (id: number) => void

  // ── Compare List ───────────────────────────────────
  compareList,        // string[] — max 3 country IDs
  addToCompare,       // (countryId: string) => boolean (false if already 3)
  removeFromCompare,  // (countryId: string) => void
  clearCompare,       // () => void

  // ── Currency Conversion ────────────────────────────
  currency,           // string — e.g. 'USD', 'EUR', 'JPY'
  setCurrency,        // (code: string) => void — persisted in localStorage
  convertCurrency,    // (amountUSD: number) => string — returns formatted number
  currencySymbol,     // string — e.g. '$', '€', '¥'
  exchangeRates,      // object — { USD: 1, EUR: 0.92, GBP: 0.79, ... }
} = useApp()
```

**Example — showing a price in the user's currency:**
```jsx
import { useApp } from '@context/AppContext'

function PriceTag({ usdAmount }) {
  const { convertCurrency, currencySymbol } = useApp()

  return (
    <span>{currencySymbol}{convertCurrency(usdAmount)}</span>
  )
}
```

**Exchange rates (hardcoded):**
```
USD → 1.00   EUR → 0.92   GBP → 0.79   JPY → 149
AUD → 1.53   CAD → 1.36   AED → 3.67   INR → 83
```

---

## 8. The Data Layer

All travel data lives in two files in `src/data/`. These are plain JavaScript files — no database, no API.

### countries.js

This is the heart of the application. It exports an array of **26 country objects**, each with the same structure:

```js
{
  // ── Identity ──────────────────────────────────────
  id: 'japan',                    // URL slug — used in /country/:id routes
  name: 'Japan',                  // Display name
  continent: 'Asia',              // Filter category
  flag: '🇯🇵',                    // Emoji flag
  image: 'https://...',           // Unsplash photo URL
  capital: 'Tokyo',
  language: 'Japanese',
  timezone: 'JST (UTC+9)',
  population: '125M',

  // ── Currency ──────────────────────────────────────
  currency: {
    code: 'JPY',
    symbol: '¥',
    rateToUSD: 0.0067,
  },

  // ── Safety & Description ──────────────────────────
  safety: 'high',                 // 'high' | 'medium' | 'low'
  description: 'Japan is...',
  highlights: ['Mt. Fuji', 'Kyoto Temples', 'Tokyo', 'Hiroshima'],
  tags: ['culture', 'food', 'history', 'nature', 'adventure'],

  // ── Budget (the core data — all amounts in USD/day) ──
  budget: {
    backpacker: { perDay: 55,  hotel: 20, food: 18, transport: 12, activities: 5 },
    standard:   { perDay: 130, hotel: 75, food: 35, transport: 15, activities: 5 },
    luxury:     { perDay: 380, hotel: 250, food: 90, transport: 30, activities: 10 },
  },

  // ── Hotels (3 per country) ─────────────────────────
  hotels: [
    { name: 'Park Hyatt Tokyo', stars: 5, pricePerNight: 680,
      type: 'luxury', area: 'Shinjuku', rating: 4.9 },
    { name: 'Richmond Hotel', stars: 3, pricePerNight: 95,
      type: 'standard', area: 'Ginza', rating: 4.4 },
    { name: 'Khaosan Tokyo', stars: 2, pricePerNight: 22,
      type: 'budget', area: 'Asakusa', rating: 4.1 },
  ],

  // ── Restaurants (3 per country) ───────────────────
  restaurants: [
    { name: 'Sukiyabashi Jiro', type: 'Fine Dining', cuisine: 'Japanese',
      priceRange: '$$$$', mustTry: 'Omakase sushi', rating: 4.9 },
    { name: 'Ichiran Ramen', type: 'Casual', cuisine: 'Japanese',
      priceRange: '$$', mustTry: 'Tonkotsu ramen', rating: 4.6 },
    { name: 'Tsukiji Fish Market', type: 'Street Food', cuisine: 'Seafood',
      priceRange: '$', mustTry: 'Tuna don', rating: 4.8 },
  ],

  // ── Attractions (4 per country) ───────────────────
  attractions: [
    { name: 'Mount Fuji', type: 'Nature', entryFee: 25, duration: 'Full day', rating: 4.9 },
    { name: 'Senso-ji Temple', type: 'Historic', entryFee: 0, duration: '2 hrs', rating: 4.8 },
    { name: 'Akihabara', type: 'Entertainment', entryFee: 0, duration: '3 hrs', rating: 4.5 },
    { name: 'Arashiyama Bamboo', type: 'Nature', entryFee: 0, duration: '2 hrs', rating: 4.7 },
  ],

  // ── Practical Info ────────────────────────────────
  transport: {
    publicTransport: 'JR Pass ¥50,000 / 7 days',
    carRental: 'From $40/day',
    taxi: '~¥730 base fare',
    airport: 'Narita — 60km from Tokyo',
  },
  visa: {
    type: 'Visa-Free (many passports)',
    duration: '90 days',
    cost: '$0',
    notes: 'Check your specific passport — over 60 countries are visa-free.',
  },
  internet: {
    simCard: 'Pocket WiFi from $4/day; SIM from ¥3,000/2 weeks',
    avgSpeed: '72 Mbps',
  },
  bestSeasons: ['Spring (Mar–May)', 'Fall (Sep–Nov)'],

  // ── Weather (12 months of average temperature in °C) ──
  weather: [
    { month: 'Jan', temp: 5 }, { month: 'Feb', temp: 6 },
    { month: 'Mar', temp: 10 }, { month: 'Apr', temp: 15 },
    { month: 'May', temp: 20 }, { month: 'Jun', temp: 24 },
    { month: 'Jul', temp: 28 }, { month: 'Aug', temp: 30 },
    { month: 'Sep', temp: 25 }, { month: 'Oct', temp: 19 },
    { month: 'Nov', temp: 13 }, { month: 'Dec', temp: 7 },
  ],
}
```

**Named exports from countries.js:**

```js
import {
  countries,              // All 26 country objects (array)
  continents,             // ['All', 'Europe', 'Asia', 'North America', ...]
  allTags,                // ['budget-friendly', 'luxury', 'beaches', ...]
  getCountryById,         // (id: string) => country | undefined
  popularDestinations,    // Subset of countries for the homepage slider
  trendingCountries,      // Subset for the "Trending Now" section
} from '@data/countries'
```

### tips.js

12 travel tip articles, each with this structure:

```js
{
  id: 1,
  title: 'How to Find Cheap Flights',
  category: 'Budget',           // Used for filter buttons
  readTime: '5 min',
  date: 'May 18, 2025',
  image: 'https://...',
  excerpt: 'Short summary...',  // Shown on card
  content: 'Full text...',      // Shown in expanded view
  tags: ['flights', 'budget'],
  featured: true,               // true for 3 tips — shown in featured row
}
```

---

## 9. Routing System

All routes are registered in `src/App.jsx`.

### How React Router Works

Without React Router, navigating to `/explore` would trigger a full browser reload. React Router intercepts the URL change and renders a different component instead — instantly, with no reload.

```jsx
<Routes>
  <Route path="/explore" element={<Explore />} />
  {/* When URL is /explore, the Explore component renders */}
</Routes>
```

### Route Table

| URL               | Component         | Feature          |
|-------------------|-------------------|------------------|
| `/`               | Home              | home             |
| `/explore`        | Explore           | countries        |
| `/country/:id`    | CountryDetail     | countries        |
| `/calculator`     | BudgetCalculator  | budget-calculator|
| `/compare`        | Compare           | compare          |
| `/hotels`         | Hotels            | hotels           |
| `/restaurants`    | Restaurants       | restaurants      |
| `/tips`           | TravelTips        | tips             |
| `/map`            | WorldMap          | maps             |
| `/dashboard`      | Dashboard         | dashboard        |
| `/favorites`      | Favorites         | favorites        |
| `/about`          | About             | about            |
| `/contact`        | Contact           | contact          |
| `/*` (any unknown)| NotFound          | components/ui    |

### Dynamic Routes

The `/country/:id` route uses a **URL parameter**. The `:id` part changes for each country:
- `/country/japan` → renders Japan's detail page
- `/country/france` → renders France's detail page

Inside `CountryDetail.jsx`:
```jsx
import { useParams } from 'react-router-dom'
import { getCountryById } from '@data/countries'

const { id } = useParams()        // id = 'japan'
const country = getCountryById(id) // looks up the full country object
```

### Page Transitions

`AnimatePresence` from Framer Motion wraps the routes, enabling smooth fade animations when navigating between pages.

### ScrollToTop

`ScrollToTop.jsx` (inside BrowserRouter, outside Routes) listens for URL changes and calls `window.scrollTo({ top: 0 })` each time — so you always start at the top of a new page.

---

## 10. Feature: Home Page

**Route:** `/`
**Files:** `src/features/home/`

The landing page is the most visual and animated part of the app. Its job is to make a strong first impression and direct users to the right tools.

### Sections (top to bottom)

#### Hero Component
The full-screen opening section. Features:
- A background image with gradient overlays
- Three floating "destination cards" showing France, Tokyo, and Bali with live prices
- A search bar with autocomplete against the countries array
- Quick-link pills ("Europe from $65/day", "Asia from $30/day", etc.)

#### Stats Component
Four animated counter statistics:
- 25+ Countries
- 50K+ Travelers
- 500+ Destinations
- 35% Average Savings

The numbers count up from zero when the section scrolls into view, using Framer Motion's `useMotionValue`, `animate`, and `useInView`.

#### Popular Destinations
A horizontal slider showing the most popular destinations with images, flags, and starting prices.

#### Features Section
A grid showcasing the app's key tools — Budget Calculator, Country Compare, Live Currency, etc.

#### Trending Section
The "Trending Now" section with destination cards that have hover-reveal overlays.

#### Testimonials
Traveler review cards with star ratings, names, and quotes.

---

## 11. Feature: Country Explorer

**Route:** `/explore`
**File:** `src/features/countries/pages/Explore.jsx`

The country grid with powerful filtering.

### How Filtering Works

All filtering happens on the client side (no server request). The `useMemo` hook ensures filters only recompute when filter values change — not on every render.

```js
const filtered = useMemo(() => {
  return countries.filter(c => {
    // 1. Search query — matches name, capital, or tags
    const matchSearch = !query || c.name.toLowerCase().includes(query)

    // 2. Continent filter
    const matchContinent = continent === 'All' || c.continent === continent

    // 3. Budget range filter
    const range = { Budget: [0, 50], Mid: [50, 120], Luxury: [120, Infinity] }[budget]
    const matchBudget = !range || (c.budget.backpacker.perDay >= range[0] &&
                                    c.budget.backpacker.perDay < range[1])

    // 4. Tag filter — ALL selected tags must be present
    const matchTags = selectedTags.length === 0 ||
                      selectedTags.every(t => c.tags.includes(t))

    return matchSearch && matchContinent && matchBudget && matchTags
  })
}, [query, continent, budget, selectedTags])
```

### Filter Controls

- **Continent pills** — "All", "Europe", "Asia", "North America", "South America", "Africa", "Oceania"
- **Budget range** — Budget (<$50), Mid ($50–$120), Luxury (>$120)
- **Travel style tags** — budget-friendly, luxury, beaches, culture, history, nature, food, adventure, etc.
- **Search input** — filters by name, capital, or tag in real time

### CountryCard Component

`src/features/countries/components/CountryCard.jsx`

Each card shows:
- Country image (from Unsplash)
- Flag emoji and country name
- Capital city
- Continent badge
- Three budget tier badges (Backpacker / Standard / Luxury daily rates)
- Safety chip (High / Medium / Low)
- Heart button (toggles favorite)
- "View Details" link

---

## 12. Feature: Country Detail Page

**Route:** `/country/:id`
**File:** `src/features/countries/pages/CountryDetail.jsx`

The most information-rich page. Divided into a main column and a sidebar.

### Main Column (left, 2/3 width)

1. **Full-width hero image** with country name, flag, capital, and action buttons (heart, compare, plan trip)
2. **About section** — description text and tag pills
3. **Budget section** — `BudgetChart` component showing a Recharts BarChart comparing backpacker/standard/luxury costs
4. **Hotels section** — three `HotelCard` components
5. **Restaurants section** — three `RestaurantCard` components
6. **Attractions section** — four `AttractionCard` components
7. **Weather section** — `AreaChart` showing 12-month temperature curve with best-season labels

### Sidebar (right, 1/3 width)

1. **Quick Facts** — capital, language, timezone, currency, population
2. **Visa Info** — type, duration, cost, notes
3. **Getting Around** — public transit, car rental, taxi, airport
4. **Internet & SIM** — provider info + speed bar
5. **Top Highlights** — bulleted list with gold stars

---

## 13. Feature: Budget Calculator

**Route:** `/calculator`
**File:** `src/features/budget-calculator/pages/BudgetCalculator.jsx`

The core utility tool. Answers the question: "How much will my trip cost?"

### How It Works

1. User selects a **country** from a dropdown
2. User sets **number of days** with a slider (1–60)
3. User sets **number of travelers** with a stepper
4. User selects **travel style** — Backpacker, Standard, or Luxury
5. User sets a **flight cost estimate** with a range slider
6. The calculator instantly shows:
   - Daily cost breakdown (hotel, food, transport, activities)
   - Total trip cost
   - Per-person cost
   - A **PieChart** showing the spending distribution

### Saving a Trip

The "Save Trip" button calls `addTrip()` from AppContext, storing the trip in localStorage. Saved trips appear in the Dashboard.

---

## 14. Feature: Country Comparison

**Route:** `/compare`
**File:** `src/features/compare/pages/Compare.jsx`

Compare up to 3 countries side-by-side.

### How Countries Are Added to the Comparison

From any CountryCard or CountryDetail page, click "Compare". This calls `addToCompare(countryId)` in AppContext, which adds the ID to the `compareList` array (max 3).

The Compare page reads `compareList` and looks up the full country data for each ID.

### What Is Compared

- Daily cost for all three budget tiers
- Safety rating (High / Medium / Low)
- Visa type and cost
- Currency
- Best travel seasons
- Internet speed
- Average backpacker cost (used for the RadarChart)

### RadarChart

A `RadarChart` from Recharts creates a visual "web" showing multiple metrics simultaneously for all selected countries. Each axis represents one metric, normalized to a 0–100 scale.

---

## 15. Feature: Hotels

**Route:** `/hotels`
**File:** `src/features/hotels/pages/Hotels.jsx`

A global listing of every hotel across all 26 countries.

The data is pulled by flattening the `hotels` array from every country:

```js
const allHotels = countries.flatMap(country =>
  country.hotels.map(hotel => ({ ...hotel, country: country.name, countryId: country.id }))
)
```

**Filter options:**
- Search by hotel name or country
- Type filter: All, Luxury, Standard, Budget

Each hotel card shows: name, stars, type badge, price per night (in selected currency), rating, and the country it belongs to with a link to the full country page.

---

## 16. Feature: Restaurants

**Route:** `/restaurants`
**File:** `src/features/restaurants/pages/Restaurants.jsx`

Same pattern as Hotels — flattens all restaurant data from every country.

**Filter options:**
- Search by restaurant name, cuisine, or country
- Price filter: All, $ (street food), $$, $$$, $$$$ (fine dining)

Each card shows: name, restaurant type, cuisine, price range, must-try dish, rating, and country.

---

## 17. Feature: Travel Tips

**Route:** `/tips`
**File:** `src/features/tips/pages/TravelTips.jsx`

A filterable blog of 12 travel tips articles.

### Featured Tips

Three tips have `featured: true` in the data (IDs 1, 4, 7). These are shown in a larger "Featured" row at the top of the page before the regular grid.

### Filtering

- **Category filter** — Budget, Safety, Food, Health, Preparation, Nomad, Sustainability, Transport, Culture
- **Search** — filters by title, excerpt, or tags in real time

---

## 18. Feature: World Map

**Route:** `/map`
**File:** `src/features/maps/pages/WorldMap.jsx`

An interactive map powered by React Leaflet and free CartoDB tiles.

### Map Pins

Each of the 26 countries has a hardcoded latitude/longitude coordinate stored in a `COORDS` object at the top of the file.

The pin color indicates the backpacker daily cost:
- **Green (#10b981)** — under $55/day (budget-friendly)
- **Orange (#f97316)** — $55–$100/day (mid-range)
- **Purple (#8b5cf6)** — over $100/day (expensive)

Pins are built using Leaflet's `divIcon` API — custom HTML rendered as a CSS map pin shape (a circle rotated 45° to create a point at the bottom).

### Map Tiles

The tiles switch automatically based on dark/light mode:
- **Light mode:** `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- **Dark mode:** `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

No API key required. CartoDB tiles are free for moderate usage.

### Country Sidebar

Clicking a pin triggers `setSelected(country)`, which renders a slide-in `motion.aside` panel on the right showing:
- Country image, flag, name
- All three budget tiers
- Quick facts (currency, safety, capital, visa)
- "Full Country Guide" button

### Filters

- **Budget filter** — All, Budget (<$55), Mid-range, Expensive (>$100)
- **Region filter** — continent dropdown

---

## 19. Feature: Dashboard & Expense Tracker

**Route:** `/dashboard`
**File:** `src/features/dashboard/pages/Dashboard.jsx`
**Hook:** `src/features/dashboard/hooks/useExpenses.js`

The personal travel management hub. Three tabs.

### Tab 1: Expense Tracker

A complete expense recording system persisted in localStorage.

**`useExpenses` hook exports:**
```js
const {
  expenses,       // All recorded expenses (array)
  addExpense,     // Add a new expense object
  removeExpense,  // Delete by ID
  clearAll,       // Delete all expenses
  totalSpent,     // Sum of all expense amounts
  byCategory,     // Aggregated totals per category (for PieChart)
  last7Days,      // Daily totals for the last 7 days (for AreaChart)
} = useExpenses()
```

**Expense categories:**
- Accommodation (purple)
- Food & Drinks (orange)
- Transport (blue)
- Activities (green)
- Shopping (pink)
- Health (red)
- Other (gray)

**Charts:**
- `PieChart` — spending breakdown by category
- `AreaChart` — last 7 days of spending (timeline)

### Tab 2: Saved Trips

Pulls `savedTrips` from AppContext. Shows each saved trip as a card with country, duration, style, and estimated total.

### Tab 3: Favorites

Pulls `favorites` (array of IDs) from AppContext, looks up each country, and shows compact cards with image, name, daily cost, and a link to the country detail page.

---

## 20. Feature: AI Chat Assistant

**File:** `src/features/ai-assistant/components/AIChatAssistant.jsx`
**Mounted in:** `src/App.jsx` (global — appears on every page)

A floating chatbot that answers travel questions using the countries dataset. **No API key is required.** All "AI" is pattern matching + data lookup.

### How It Works

The `buildResponse(input)` function processes every message:

1. Converts input to lowercase
2. Searches for a **country name** in the message
3. Searches for a **number of days** (`/(\d+)\s*days?/`)
4. Searches for a **budget amount** (`/\$(\d+)/`)
5. Checks for **keyword patterns**: cheapest, safest, beach, backpacker, luxury, etc.
6. Returns a structured response object with `{ text, links }`

**Example inputs and outputs:**

| User Input                     | Response Type         |
|--------------------------------|-----------------------|
| "7 days in Japan"              | Trip cost calculation |
| "Cheapest countries in Europe" | Sorted list           |
| "Tell me about Thailand"       | Country summary       |
| "Safest places to travel"      | Safety-filtered list  |
| "Under $40 a day"              | Budget-filtered list  |
| "Best beach destinations"      | Tag-filtered list     |
| "Asia destinations"            | Continent listing     |

### UI Components

- **Toggle bubble** — fixed bottom-left, opens/closes the panel
- **Chat panel** — slide-up with spring animation; 520px max height; scrollable message area
- **Suggestion chips** — shown on first open with starter questions
- **Typing indicator** — three bouncing dots while the "AI" is "thinking" (600ms delay)
- **Country links** — inline clickable links in bot responses

---

## 21. Feature: Favorites

**Route:** `/favorites`
**File:** `src/features/favorites/pages/Favorites.jsx`

Shows all countries the user has hearted. Favorites are managed entirely through AppContext.

**Empty state:** If no favorites have been saved, a friendly empty state with a heart icon and a link to Explore is shown.

**How it works:**
```js
const { favorites } = useApp()
// favorites = ['japan', 'thailand', 'france']

const favCountries = countries.filter(c => favorites.includes(c.id))
// Looks up the full country objects for each saved ID
```

Each country is displayed using the same `CountryCard` component as the Explore page, so behavior is identical (including the heart toggle, which un-favorites when clicked).

---

## 22. Feature: About & Contact

### About (`/about`)

Three sections:
1. **Why We Built This** — origin story + 4 stats (25+ countries, 50K travelers, verified data, free forever)
2. **Meet the Team** — three team member cards with avatars, roles, and bios
3. **CTA banner** — "Ready to plan your trip?" with Explore and Calculator links

### Contact (`/contact`)

Two-column layout:
- **Left:** Four info cards (email, live chat, response time, location)
- **Right:** Contact form with name, email, subject dropdown, message textarea

The form has a `sent` state. When submitted, it shows a success animation instead of the form.

---

## 23. Shared Components

### Navbar (`src/components/layout/Navbar.jsx`)

The top navigation bar, fixed to the top of the screen on all pages.

**Behavior:**
- **Transparent** when at the top of the Home page
- **Glass** (frosted background + border) when scrolled or on any other page

**Contents:**
- Logo (Globe icon + "Travel Budget" text)
- Navigation links (desktop: horizontal; mobile: slide-down drawer)
- Currency selector dropdown (updates AppContext, all prices update immediately)
- Dark mode toggle button
- Favorites link with badge count
- "Plan Trip" CTA button
- Mobile hamburger menu

### Footer (`src/components/layout/Footer.jsx`)

Four-column layout:
- **Brand** — logo, description, social icons (Share2, AtSign, Rss)
- **Explore** — continent links
- **Tools** — feature links (Calculator, Compare, Hotels, etc.)
- **Contact** — email, location, newsletter subscribe form

### ScrollToTop (`src/components/layout/ScrollToTop.jsx`)

A behavior-only component (renders nothing). Uses `useEffect` + `useLocation` to scroll `window` to the top on every route change. Mounted once in App.jsx.

### BackToTop (`src/components/layout/BackToTop.jsx`)

A floating button (bottom-right) that appears after scrolling 400px. Clicking it smooth-scrolls to the top. Animated in/out with Framer Motion.

### SkeletonCard (`src/components/ui/SkeletonCard.jsx`)

A pulse-animated placeholder with the same dimensions as `CountryCard`. Used while images or data are loading. Import and render it in a grid in place of real cards.

### NotFound (`src/components/ui/NotFound.jsx`)

The 404 page. Shows a branded globe icon, "Destination Not Found" heading, and recovery links to Home, Explore, and Calculator. Triggered by the catch-all route `<Route path="*">` in App.jsx.

---

## 24. Path Aliases

One of the most important architectural decisions in this project. Path aliases let you use short, absolute import paths instead of fragile relative paths.

**Defined in `vite.config.js`:**

```js
alias: {
  '@'           : path.resolve(__dirname, './src'),
  '@features'   : path.resolve(__dirname, './src/features'),
  '@components' : path.resolve(__dirname, './src/components'),
  '@data'       : path.resolve(__dirname, './src/data'),
  '@hooks'      : path.resolve(__dirname, './src/hooks'),
  '@context'    : path.resolve(__dirname, './src/context'),
  '@utils'      : path.resolve(__dirname, './src/utils'),
  '@constants'  : path.resolve(__dirname, './src/constants'),
}
```

**Also defined in `jsconfig.json`** so VS Code's IntelliSense autocompletes `@` imports correctly.

**Why this matters:**

```js
// ❌ Before aliases — breaks if you move the file
import Footer from '../../../components/layout/Footer'

// ✅ After aliases — always works, regardless of file location
import Footer from '@components/layout/Footer'
```

Moving a feature file from one folder to another no longer requires updating any of its imports.

---

## 25. How to Add a New Country

Adding a new country requires changing exactly **one file**: `src/data/countries.js`.

### Step 1 — Add the country object to the array

Copy an existing country and update all fields. The `id` must be unique and URL-safe (lowercase, no spaces):

```js
{
  id: 'newzealand',        // ← must be unique
  name: 'New Zealand',
  continent: 'Oceania',
  flag: '🇳🇿',
  image: 'https://images.unsplash.com/photo-{PHOTO_ID}?w=800&auto=format&fit=crop&q=80',
  capital: 'Wellington',
  language: 'English, Māori',
  timezone: 'NZST (UTC+12)',
  population: '5M',
  currency: { code: 'NZD', symbol: 'NZ$', rateToUSD: 0.61 },
  safety: 'high',
  description: '...',
  highlights: ['...', '...'],
  tags: ['nature', 'adventure', 'beaches'],
  budget: {
    backpacker: { perDay: 75, hotel: 30, food: 22, transport: 18, activities: 5 },
    standard:   { perDay: 160, hotel: 90, food: 45, transport: 20, activities: 5 },
    luxury:     { perDay: 450, hotel: 300, food: 100, transport: 40, activities: 10 },
  },
  hotels: [ /* 3 hotels */ ],
  restaurants: [ /* 3 restaurants */ ],
  attractions: [ /* 4 attractions */ ],
  transport: { publicTransport: '...', carRental: '...', taxi: '...', airport: '...' },
  visa: { type: '...', duration: '...', cost: '...', notes: '...' },
  internet: { simCard: '...', avgSpeed: '...' },
  bestSeasons: ['Summer (Dec–Feb)', 'Fall (Mar–May)'],
  weather: [
    { month: 'Jan', temp: 20 }, { month: 'Feb', temp: 20 }, /* ... all 12 months */
  ],
},
```

### Step 2 — Add coordinates for the World Map

Open `src/features/maps/pages/WorldMap.jsx` and add the country's latitude/longitude to the `COORDS` object:

```js
const COORDS = {
  // ... existing countries ...
  newzealand: [-40.90, 174.89],
}
```

### Step 3 — Done

The country now automatically appears in:
- The Explore grid
- The Country Detail page (via `/country/newzealand`)
- The Budget Calculator dropdown
- The Compare tool
- The World Map
- The Hotels and Restaurants pages
- The AI Chat responses

---

## 26. How to Add a New Feature

Follow this pattern for every new feature.

### Step 1 — Create the feature directory

```
src/features/your-feature/
├── components/     (if the feature has sub-components)
├── hooks/          (if the feature has its own state logic)
├── pages/
│   └── YourPage.jsx
└── README.md
```

### Step 2 — Write the page component

Begin the file with the component tag:

```jsx
// FEATURE: YOUR FEATURE NAME
// PURPOSE: One sentence describing what this page does
// DEPENDENCIES: @data/countries, @context/AppContext, etc.

import { ... } from '@data/countries'
import { useApp } from '@context/AppContext'
import Footer from '@components/layout/Footer'

export default function YourPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* page content */}
      <Footer />
    </div>
  )
}
```

### Step 3 — Register the route in App.jsx

```jsx
// Add import at the top
import YourPage from '@features/your-feature/pages/YourPage'

// Add route inside <Routes>
<Route path="/your-path" element={<YourPage />} />
```

### Step 4 — Add to Navbar (if it's a main navigation link)

```jsx
// In src/components/layout/Navbar.jsx
import { YourIcon } from 'lucide-react'

const navLinks = [
  // ... existing links ...
  { to: '/your-path', label: 'Your Page', icon: YourIcon },
]
```

### Step 5 — Create the README

```markdown
# Feature: Your Feature

**Route:** `/your-path`

**Purpose:** What this feature does.

## Components
...

## Dependencies
...

## Future Plans
...
```

### Step 6 — Update CLAUDE.md

Add the new route to the routing table in `CLAUDE.md` so future AI sessions know it exists.

---

## 27. PWA — Making It Installable

TravelBudget is configured as a **Progressive Web App (PWA)**. This means users can install it on their phone or desktop like a native app.

**Configuration file:** `public/manifest.json`

```json
{
  "name": "TravelBudget — Plan Your Perfect Trip",
  "short_name": "TravelBudget",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#7c3aed",
  "shortcuts": [
    { "name": "Explore Countries", "url": "/explore" },
    { "name": "Budget Calculator", "url": "/calculator" },
    { "name": "World Map", "url": "/map" },
    { "name": "My Dashboard", "url": "/dashboard" }
  ]
}
```

**The manifest is linked in `index.html`:**
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#7c3aed" />
```

When users visit the site in Chrome or Safari, they will see an "Add to Home Screen" prompt. The app then opens in standalone mode (no browser chrome) and shows the shortcuts in the right-click / long-press menu.

---

## 28. Dark Mode System

Dark mode is class-based. Adding the `dark` class to `<html>` activates all `dark:` Tailwind variants across every component.

### How It Activates

`ThemeContext.jsx` calls:
```js
document.documentElement.classList.toggle('dark', isDark)
```

Every component can use:
```jsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
```

### How to Support Dark Mode in New Components

Rule: **Every element that has a light background must have a `dark:` background**. Every light text color must have a `dark:` text color.

```jsx
// ✅ Correct
<div className="bg-white dark:bg-slate-800">
  <p className="text-slate-700 dark:text-slate-300">Hello</p>
</div>

// ❌ Wrong — will look broken in dark mode
<div className="bg-white">
  <p className="text-slate-700">Hello</p>
</div>
```

### Detecting Dark Mode in JavaScript

```jsx
import { useTheme } from '@context/ThemeContext'

const { dark } = useTheme()

// Use for conditional logic (e.g. map tile URLs, chart colors)
const chartColor = dark ? '#a78bfa' : '#7c3aed'
```

---

## 29. Multi-Currency System

All prices in the data are stored in **USD**. The currency conversion happens at display time, not in the data.

### The Flow

1. User selects a currency from the Navbar dropdown
2. `setCurrency('EUR')` is called → saved to localStorage
3. `convertCurrency(usdAmount)` multiplies by the EUR rate (0.92) → returns the string "92.00"
4. `currencySymbol` returns "€"
5. Every component that displays a price re-renders automatically

### Using Currency Conversion

```jsx
import { useApp } from '@context/AppContext'

function HotelCard({ hotel }) {
  const { convertCurrency, currencySymbol } = useApp()

  return (
    <div>
      <p>{currencySymbol}{convertCurrency(hotel.pricePerNight)}/night</p>
    </div>
  )
}
```

### Exchange Rates

The rates are hardcoded in AppContext. They represent approximate values. For production use, you would replace these with a live API call (e.g., ExchangeRate-API's free tier):

```js
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149,
  AUD: 1.53,
  CAD: 1.36,
  AED: 3.67,
  INR: 83,
}
```

---

## 30. Future Roadmap

These are planned enhancements, in rough priority order.

### High Priority

| Feature                   | Description                                                    |
|---------------------------|----------------------------------------------------------------|
| **Real AI Integration**   | Connect AIChatAssistant to Claude API for natural language     |
| **Live Exchange Rates**   | Replace hardcoded rates with ExchangeRate-API (free tier)      |
| **More Countries**        | Expand from 26 to 50+ destinations                             |
| **TypeScript Migration**  | Convert .jsx files to .tsx for better type safety              |
| **Code Splitting**        | Add `React.lazy()` + `Suspense` to reduce initial bundle size  |

### Medium Priority

| Feature                   | Description                                                    |
|---------------------------|----------------------------------------------------------------|
| **User Authentication**   | Firebase Auth — save data to cloud instead of localStorage     |
| **Flight Price Widget**   | Amadeus or Skyscanner API for real flight cost estimates        |
| **Weather API**           | OpenWeather API for live current weather instead of averages   |
| **Voice Search**          | Web Speech API on the search inputs                            |
| **Offline Mode**          | Service worker for offline access to country data              |
| **Share Comparison**      | Generate a shareable URL for country comparison results        |
| **User Reviews**          | Let travelers submit their actual daily spend for validation   |

### Low Priority / Future

| Feature                   | Description                                                    |
|---------------------------|----------------------------------------------------------------|
| **Admin Panel**           | CMS-style interface for updating country data                  |
| **Multi-language**        | i18n support for Spanish, French, Arabic, etc.                 |
| **Storybook**             | Component library for isolated UI development                  |
| **CI/CD Pipeline**        | GitHub Actions for automated testing and Vercel deploy         |
| **Analytics**             | Vercel Analytics or Plausible for usage insights               |
| **Error Monitoring**      | Sentry for catching runtime errors in production               |
| **Backend API**           | Node.js + Express + MongoDB for dynamic data + user accounts   |

---

## Summary

TravelBudget is built to be:

- **Fast** — Vite + React + zero server requests
- **Beautiful** — Tailwind CSS, Framer Motion, glassmorphism design
- **Useful** — real data, real tools, instant calculations
- **Maintainable** — feature-based architecture, `@` aliases, documentation at every level
- **Extensible** — adding a country takes one file; adding a feature follows a clear pattern

Every decision in this project — from the folder structure to the path aliases to the CLAUDE.md file — was made to ensure the project stays clean and comprehensible as it grows.

---

*Last updated: May 2026 — TravelBudget v1.0*
