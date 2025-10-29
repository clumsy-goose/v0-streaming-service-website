"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface DayPlaylistProps {
  channel: string
  date: string
  currentTime: string
}

function generateScheduleForDate(channel: string, date: string) {
  const dateObj = new Date(date + "T00:00:00") // Add time to ensure proper parsing
  const dayOfWeek = dateObj.getDay()
  const dateNum = dateObj.getDate()

  const programTemplates: Record<string, Array<{ timeBase: string; titleTemplate: string }>> = {
    "News 1": [
      { timeBase: "08:00", titleTemplate: "Morning News Bulletin" },
      { timeBase: "10:30", titleTemplate: "Breaking News Update" },
      { timeBase: "12:35", titleTemplate: "Midday Report" },
      { timeBase: "14:52", titleTemplate: "Afternoon News Hour" },
      { timeBase: "17:00", titleTemplate: "Evening Headlines" },
      { timeBase: "19:30", titleTemplate: "Prime Time News" },
      { timeBase: "22:00", titleTemplate: "Late Night Roundup" },
    ],
    "News 2": [
      { timeBase: "09:00", titleTemplate: "Morning Briefing" },
      { timeBase: "11:30", titleTemplate: "Global News Watch" },
      { timeBase: "13:30", titleTemplate: "Midday Update" },
      { timeBase: "15:45", titleTemplate: "World Report Live" },
      { timeBase: "18:00", titleTemplate: "International News" },
      { timeBase: "20:30", titleTemplate: "Evening Analysis" },
    ],
    Finance: [
      { timeBase: "08:30", titleTemplate: "Market Opening Bell" },
      { timeBase: "10:00", titleTemplate: "Trading Floor Update" },
      { timeBase: "12:00", titleTemplate: "Market Mid-Session" },
      { timeBase: "14:30", titleTemplate: "Live Market Watch" },
      { timeBase: "16:00", titleTemplate: "Stock Analysis" },
      { timeBase: "17:30", titleTemplate: "Closing Bell Report" },
      { timeBase: "19:00", titleTemplate: "After Hours Trading" },
    ],
    Sports: [
      { timeBase: "07:00", titleTemplate: "Morning Sports Recap" },
      { timeBase: "10:00", titleTemplate: "Game Highlights Show" },
      { timeBase: "13:00", titleTemplate: "Sports Center Live" },
      { timeBase: "15:30", titleTemplate: "Player Interviews" },
      { timeBase: "18:00", titleTemplate: "Pre-Game Analysis" },
      { timeBase: "20:00", titleTemplate: "Live Game Coverage" },
      { timeBase: "23:00", titleTemplate: "Post-Game Wrap-Up" },
    ],
    Entertainment: [
      { timeBase: "09:00", titleTemplate: "Celebrity Morning" },
      { timeBase: "11:00", titleTemplate: "Entertainment News" },
      { timeBase: "13:30", titleTemplate: "Talk Show Special" },
      { timeBase: "15:00", titleTemplate: "Behind the Scenes" },
      { timeBase: "17:30", titleTemplate: "Red Carpet Special" },
      { timeBase: "20:00", titleTemplate: "Prime Time Variety Show" },
      { timeBase: "22:30", titleTemplate: "Late Night Entertainment" },
    ],
    Movies: [
      { timeBase: "08:00", titleTemplate: "Morning Classic" },
      { timeBase: "10:30", titleTemplate: "Action Movie Marathon" },
      { timeBase: "13:00", titleTemplate: "Afternoon Feature Film" },
      { timeBase: "15:30", titleTemplate: "Drama Showcase" },
      { timeBase: "18:00", titleTemplate: "Prime Time Blockbuster" },
      { timeBase: "20:30", titleTemplate: "Evening Thriller" },
      { timeBase: "23:00", titleTemplate: "Late Night Cinema" },
    ],
  }

  const templates = programTemplates[channel] || programTemplates["News 1"]

  const currentTime = new Date()
  const currentDateStr = currentTime.toISOString().split("T")[0]
  const isToday = date === currentDateStr
  const isPast = date < currentDateStr
  const isFuture = date > currentDateStr

  return templates.map((template, index) => {
    const [hour, minute] = template.timeBase.split(":").map(Number)

    // Get the next program's start time to determine when this program ends
    const nextTemplate = templates[index + 1]
    let programEndHour: number
    let programEndMinute: number

    if (nextTemplate) {
      const [nextHour, nextMinute] = nextTemplate.timeBase.split(":").map(Number)
      programEndHour = nextHour
      programEndMinute = nextMinute
    } else {
      // Last program of the day, assume it ends at 23:59
      programEndHour = 23
      programEndMinute = 59
    }

    const episodeNum = ((dateNum * 10 + index + dayOfWeek) % 500) + 1
    const variation = dayOfWeek % 3

    let title = template.titleTemplate
    if (variation === 0) {
      title = `${template.titleTemplate} - Episode ${episodeNum}`
    } else if (variation === 1) {
      title = `${template.titleTemplate} Special`
    } else {
      title = `${template.titleTemplate} - ${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    }

    // Create a Date object for this program's start time
    const programStartTime = new Date(dateObj)
    programStartTime.setHours(hour, minute, 0, 0)

    // Get the next program's start time to determine when this program ends
    const programEndTime = new Date(programStartTime)
    if (nextTemplate) {
      const [nextHour, nextMinute] = nextTemplate.timeBase.split(":").map(Number)
      programEndTime.setHours(nextHour, nextMinute, 0, 0)
    } else {
      // Last program of the day, assume it ends at midnight
      programEndTime.setHours(23, 59, 59, 999)
    }

    let status = "not-started"

    if (isPast) {
      // All programs on past dates are ended
      status = "ended"
    } else if (isFuture) {
      // All programs on future dates haven't started
      status = "not-started"
    } else if (isToday) {
      // For today, check the current time
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()
      const currentTotalMinutes = currentHour * 60 + currentMinute
      const programStartMinutes = hour * 60 + minute
      const programEndMinutes = programEndHour * 60 + programEndMinute

      if (currentTotalMinutes >= programEndMinutes) {
        status = "ended"
      } else if (currentTotalMinutes >= programStartMinutes && currentTotalMinutes < programEndMinutes) {
        status = "live"
      } else {
        status = "not-started"
      }
    }

    return {
      time: template.timeBase,
      title,
      status,
    }
  })
}

export function DayPlaylist({ channel, date, currentTime }: DayPlaylistProps) {
  const programs = generateScheduleForDate(channel, date)

  return (
    <Card className="h-[calc(100vh-8rem)]">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Today's Schedule</h2>
        <p className="text-sm text-muted-foreground">{channel}</p>
      </div>
      <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="p-4 space-y-2">
          {programs.map((program, index) => {
            const isClickable = program.status === "live"
            const isCurrentProgram = program.time === currentTime

            const content = (
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-semibold">{program.time}</span>
                {program.status === "live" && (
                  <Badge variant="destructive" className="text-xs">
                    Live
                  </Badge>
                )}
                {program.status === "ended" && (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    Ended
                  </Badge>
                )}
                {program.status === "not-started" && (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    Not Started
                  </Badge>
                )}
              </div>
            )

            if (isClickable) {
              return (
                <Link
                  key={index}
                  href={`/watch?channel=${encodeURIComponent(channel)}&date=${date}&time=${program.time}&title=${encodeURIComponent(program.title)}`}
                  className={cn(
                    "block p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer",
                    isCurrentProgram && "bg-secondary ring-2 ring-primary",
                  )}
                >
                  {content}
                  <p className="text-sm line-clamp-2">{program.title}</p>
                </Link>
              )
            }

            return (
              <div
                key={index}
                className={cn(
                  "block p-3 rounded-lg opacity-50 cursor-not-allowed",
                  isCurrentProgram && "bg-secondary/30",
                )}
              >
                {content}
                <p className="text-sm line-clamp-2 text-muted-foreground">{program.title}</p>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}
