"use client"

import { Header } from "@/components/header"
import { DateCarousel } from "@/components/date-carousel"
import { ScheduleGrid } from "@/components/schedule-grid"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"

function getTodayDateString() {
  const today = new Date()
  return today.toISOString().split("T")[0] // Returns YYYY-MM-DD
}

function ScheduleContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedDate = searchParams.get("date") || getTodayDateString()
  const selectedChannel = searchParams.get("channel") || ""

  const handleDateSelect = (date: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("date", date)
    router.push(`/schedule?${params.toString()}`)
  }

  const handleChannelSelect = (channel: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("channel", channel)
    router.push(`/schedule?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DateCarousel selectedDate={selectedDate} onDateSelect={handleDateSelect} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">TV Schedule</h1>
        <ScheduleGrid
          selectedDate={selectedDate}
          selectedChannel={selectedChannel}
          onChannelSelect={handleChannelSelect}
        />
      </div>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScheduleContent />
    </Suspense>
  )
}
