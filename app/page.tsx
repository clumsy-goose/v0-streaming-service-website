import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DateCarousel } from "@/components/date-carousel"
import { LiveStreams } from "@/components/live-streams"
import { ChannelCarousel } from "@/components/channel-carousel"
import { TrendingList } from "@/components/trending-list"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <DateCarousel />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LiveStreams />
            <ChannelCarousel />
          </div>
          <div className="lg:col-span-1">
            <TrendingList />
          </div>
        </div>
      </div>
    </div>
  )
}
