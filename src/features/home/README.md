# Feature: Home

**Route:** `/`

**Purpose:** Premium landing page — the first impression of TravelBudget.

## Components

| Component           | Purpose                                          |
|---------------------|--------------------------------------------------|
| Hero.jsx            | Full-screen hero with search, floating country cards, quick links |
| Stats.jsx           | Animated counters (25+ countries, 50K travelers, etc.) |
| PopularDestinations | Horizontal slider of top destinations           |
| TrendingSection     | "Trending Now" grid with Framer Motion          |
| FeaturesSection     | App feature highlights grid                     |
| Testimonials        | Traveler reviews carousel                       |

## Dependencies
- `@data/countries` — popularDestinations, trendingCountries exports
- `@context/AppContext` — currency, toggleFavorite

## Future Plans
- Add animated background video option
- Add personalized recommendations based on favorites
- Add seasonal destination suggestions
