import Hero from '../components/home/Hero'
import Stats from '../components/home/Stats'
import PopularDestinations from '../components/home/PopularDestinations'
import TrendingSection from '../components/home/TrendingSection'
import FeaturesSection from '../components/home/FeaturesSection'
import Testimonials from '../components/home/Testimonials'
import Footer from '../components/layout/Footer'

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
