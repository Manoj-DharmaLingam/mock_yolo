import HeroSection from '../components/HeroSection/HeroSection'
import BestSellerSection from '../components/BestSellerSection/BestSellerSection'
import BuyOneGetOne from '../components/BuyOneGetOne/BuyOneGetOne'
import ComboOffersSection from '../components/ComboOffersSection/ComboOffersSection'
import TrustFeatures from '../components/TrustFeatures/TrustFeatures'

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustFeatures />
      <BestSellerSection />
      <BuyOneGetOne />
      <ComboOffersSection />
    </>
  )
}
