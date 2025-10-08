import { Header } from "@/components/header"
import { DateCarousel } from "@/components/date-carousel"
import { ScheduleGrid } from "@/components/schedule-grid"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DateCarousel />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">TV Schedule</h1>
        <ScheduleGrid />
      </div>
    </div>
  )
}
