import { Link } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection.jsx'
import StatisticsSection from '../components/home/StatisticsSection.jsx'
import FeaturedInternships from '../components/home/FeaturedInternships.jsx'
import PartnerCompanies from '../components/home/PartnerCompanies.jsx'
import TestimonialsSection from '../components/home/TestimonialsSection.jsx'
import CallToAction from '../components/home/CallToAction.jsx'

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <StatisticsSection />
      <FeaturedInternships />
      <PartnerCompanies />
      <TestimonialsSection />
      <CallToAction />
    </div>
  )
}

export default HomePage