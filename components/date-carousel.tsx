"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const dates = [
  { date: "Oct 19", day: "Saturday", status: "past" },
  { date: "Oct 20", day: "Sunday", status: "active" },
  { date: "Oct 21", day: "Monday", status: "upcoming" },
  { date: "Oct 22", day: "Tuesday", status: "upcoming" },
  { date: "Oct 23", day: "Wednesday", status: "upcoming" },
  { date: "Oct 24", day: "Thursday", status: "upcoming" },
  { date: "Oct 25", day: "Friday", status: "upcoming" },
]

export function DateCarousel() {
  return (
    <div className="border-y border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {dates.map((item, index) => (
              <button
                key={index}
                className={cn(
                  "flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-colors shrink-0",
                  item.status === "active" ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                )}
              >
                <span className="text-sm font-medium">{item.date}</span>
                <span className="text-xs text-muted-foreground">{item.day}</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
