// FEATURE: HOME
// PURPOSE: Landing page — hero, stats, popular destinations, features, trending, testimonials
// DEPENDENCIES: features/home/components/*, @components/layout/Footer

import Hero               from '../components/Hero'
import Stats              from '../components/Stats'
import PopularDestinations from '../components/PopularDestinations'
import TrendingSection    from '../components/TrendingSection'
import FeaturesSection    from '../components/FeaturesSection'
import Testimonials       from '../components/Testimonials'
import Footer             from '@components/layout/Footer'

export default function Home() {
  return (
    <div>
      <Hero />
      <Stats />
      <PopularDestinations />
      <FeaturesSection />
      <TrendingSection />
      <Testimonials />
      <Footer />
    </div>
  )
}
