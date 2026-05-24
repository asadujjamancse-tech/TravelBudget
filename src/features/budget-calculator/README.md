# Feature: Budget Calculator

**Route:** `/calculator`

**Purpose:** Interactive trip budget planner — select country + duration + style → instant cost breakdown.

## Key Features
- Country selector with search
- Duration slider (1–60 days)
- Traveler count stepper
- Flight cost range slider
- Travel style: backpacker / standard / luxury
- PieChart showing spending distribution
- Per-person and grand total calculation
- Save trip to dashboard

## Dependencies
- `@data/countries`
- `@context/AppContext` — addTrip, convertCurrency, currencySymbol

## Future Plans
- Export PDF itinerary
- Add visa cost to calculation
- Add seasonal price multipliers
