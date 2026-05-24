# Feature: Dashboard

**Route:** `/dashboard`

**Purpose:** Personal travel hub — expense tracking, saved trips, favorites overview.

## Tabs

| Tab              | Content                                         |
|------------------|-------------------------------------------------|
| Expense Tracker  | Add/delete expenses, PieChart, 7-day AreaChart  |
| Saved Trips      | Trips saved from calculator (AppContext)         |
| Favorites        | Quick view of hearted countries (AppContext)     |

## Hooks
- `useExpenses.js` — CRUD for expenses, localStorage persistence, category aggregation, 7-day timeline

## Expense Categories
accommodation, food, transport, activities, shopping, health, other

## Dependencies
- `@context/AppContext`
- `@data/countries` — getCountryById for favorites tab
- Recharts — PieChart, AreaChart

## Future Plans
- Budget vs Actual comparison (set a budget limit per trip)
- Export expenses as CSV
- Multi-trip expense grouping
