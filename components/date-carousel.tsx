"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"

function generateDateRange() {
  const dates = []
  const today = new Date()

  // Start from today and show next 6 days (total 7 days)
  for (let i = 0; i <= 6; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const monthNames = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12月"]
    const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]

    const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`
    const dayStr = dayNames[date.getDay()]

    let status = "upcoming"
    if (i === 0) status = "active"

    // Get date string in local timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const fullDate = `${year}-${month}-${day}` // YYYY-MM-DD format for comparison
    
    dates.push({
      date: dateStr,
      day: dayStr,
      status,
      fullDate,
    })
  }

  return dates
}

interface DateCarouselProps {
  onDateSelect?: (date: string) => void
  onViewSchedule?: () => void
  selectedDate?: string
}

export function DateCarousel({ onDateSelect, onViewSchedule, selectedDate }: DateCarouselProps) {
  const dates = useMemo(() => generateDateRange(), [])

  const [selectedIndex, setSelectedIndex] = useState(selectedDate ? dates.findIndex((d) => d.fullDate === selectedDate) : 0)

  const handlePrev = () => {
    setSelectedIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => Math.min(dates.length - 1, prev + 1))
  }

  const handleDateClick = (index: number) => {
    setSelectedIndex(index)
    if (onDateSelect) {
      onDateSelect(dates[index].fullDate)
    }
  }

  return (
    <div className="border-y border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={handlePrev} disabled={selectedIndex === 0}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {dates.map((item, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(index)}
                className={cn(
                  "flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-colors shrink-0 cursor-pointer",
                  index === selectedIndex ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                )}
              >
                <span className="text-sm font-medium">{item.date}</span>
                <span
                  className={cn(
                    "text-xs",
                    index === selectedIndex ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {item.day}
                </span>
              </button>
            ))}
          </div>
          {onViewSchedule && (
            <Button variant="outline" onClick={onViewSchedule} className="shrink-0 bg-transparent">
              查看节目单
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleNext}
            disabled={selectedIndex === dates.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
