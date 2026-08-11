import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Hero from '../components/landing/Hero.jsx'
import CategoriesSection from '../components/landing/CategoriesSection.jsx'
import HowItWorksSection from '../components/landing/HowItWorksSection.jsx'
import AISection from '../components/landing/AISection.jsx'
import LocalMarketplaceSection from '../components/landing/LocalMarketplaceSection.jsx'
import SellerCTASection from '../components/landing/SellerCTASection.jsx'
import FeaturesSection from '../components/landing/FeaturesSection.jsx'
import StatsSection from '../components/landing/StatsSection.jsx'
import TestimonialsSection from '../components/landing/TestimonialsSection.jsx'
import FinalCTASection from '../components/landing/FinalCTASection.jsx'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <CategoriesSection />
        <HowItWorksSection />
        <AISection />
        <LocalMarketplaceSection />
        <SellerCTASection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  )
}
