# Feature: Maps

**Route:** `/map`

**Purpose:** Interactive world map showing all 26 destinations with budget heatmap.

## Key Features
- React Leaflet + free CartoDB tiles (no API key)
- Dark/light tile switching (tracks ThemeContext)
- Custom branded map pins color-coded by budget tier
- Slide-in country sidebar on pin click
- Budget + continent filter bar

## Pin Colors
- Green (#10b981) — backpacker < $55/day
- Orange (#f97316) — $55–$100/day
- Purple (#8b5cf6) — > $100/day

## Dependencies
- `react-leaflet`, `leaflet` (installed)
- `@data/countries`
- `@context/ThemeContext`

## Future Plans
- Add visa-free country highlighting
- Add weather overlay
- Add cluster markers for dense regions
