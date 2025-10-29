"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DateCarousel } from "@/components/date-carousel"
import { LiveStreams } from "@/components/live-streams"
import { ChannelCarousel } from "@/components/channel-carousel"
import { TrendingList } from "@/components/trending-list"
import { useState } from "react"
import { useRouter } from "next/navigation"

function getTodayDateString() {
  const today = new Date()
  return today.toISOString().split("T")[0] // Returns YYYY-MM-DD
}

export default function HomePage() {
  const [selectedChannel, setSelectedChannel] = useState("News 1")
  const router = useRouter()

  const handleDateSelect = (date: string) => {
    router.push(`/schedule?date=${encodeURIComponent(date)}`)
  }

  const handleChannelClick = (channel: string) => {
    const todayDate = getTodayDateString()
    router.push(`/schedule?channel=${encodeURIComponent(channel)}&date=${encodeURIComponent(todayDate)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <DateCarousel onDateSelect={handleDateSelect} onViewSchedule={() => router.push("/schedule")} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <LiveStreams selectedChannel={selectedChannel} onChannelChange={setSelectedChannel} />
          </div>
          <div className="lg:col-span-1">
            <TrendingList />
          </div>
        </div>
        <div className="mt-8">
          <ChannelCarousel
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
            onChannelClick={handleChannelClick}
          />
        </div>
      </div>
    </div>
  )
}
