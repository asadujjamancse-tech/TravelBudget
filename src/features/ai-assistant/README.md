# Feature: AI Assistant

**Type:** Floating overlay (rendered globally in App.jsx)

**Purpose:** Smart travel chatbot powered by the countries dataset — no API key required.

## Supported Queries
| Query Type        | Example                              | Response                        |
|-------------------|--------------------------------------|---------------------------------|
| Trip cost calc    | "7 days in Japan"                   | Style breakdown + total         |
| Country info      | "Tell me about Thailand"            | Budget tiers, capital, visa     |
| Cheapest          | "Cheapest countries in Europe"      | Sorted list                     |
| Safe destinations | "Safest places to travel"           | Filtered by safety: high        |
| Beach/island      | "Best beach destinations"           | Tag-filtered results            |
| Backpacker        | "Best for backpackers"              | Sorted by backpacker cost       |
| Budget filter     | "Under $50 a day"                   | Countries matching budget       |
| Continent         | "Asia destinations"                 | All countries in continent      |
| Visa-free         | "Visa-free countries"               | Filtered by visa data           |

## Architecture
All logic in `buildResponse(input)` — pure function, no side effects.
Pattern matching with regex → data lookup → formatted markdown-style response.

## Future Plans
- Integrate real AI API (Claude / GPT) for natural language understanding
- Add follow-up conversation context (multi-turn)
- Add voice input (Web Speech API)
