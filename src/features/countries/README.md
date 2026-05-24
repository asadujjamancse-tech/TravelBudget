# Feature: Countries

**Routes:** `/explore`, `/country/:id`

**Purpose:** The core feature — browse all 26 destinations and view full country detail pages.

## Components

| Component        | Purpose                                        |
|------------------|------------------------------------------------|
| CountryCard.jsx  | Grid card — image, flag, budget tiers, safety, heart |
| BudgetChart.jsx  | Recharts BarChart for budget breakdown         |
| HotelCard.jsx    | Hotel listing card with stars + type           |
| RestaurantCard.jsx | Restaurant card with cuisine + price range   |
| AttractionCard.jsx | Attraction card with fee + rating            |

## Pages

| Page              | Purpose                                       |
|-------------------|-----------------------------------------------|
| Explore.jsx       | Filter grid — continent, budget, tags, search |
| CountryDetail.jsx | Full page — budget, hotels, restaurants, attractions, weather, visa, transport, internet |

## Dependencies
- `@data/countries` — countries, continents, allTags, getCountryById
- `@context/AppContext` — isFavorite, toggleFavorite, addToCompare, compareList, convertCurrency

## Future Plans
- Add AI "similar countries" recommendations
- Add user-submitted cost updates
- Add photo gallery section
