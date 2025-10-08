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
  const dateObj = new Date(date)
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
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  return templates.map((template, index) => {
    const [hour, minute] = template.timeBase.split(":").map(Number)
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

    const isToday = dateObj.toDateString() === new Date().toDateString()
    let status = "upcoming"

    if (isToday) {
      if (hour < currentHour || (hour === currentHour && minute < currentMinute)) {
        status = "replay"
      } else if (hour === currentHour || (hour === currentHour + 1 && minute < currentMinute)) {
        status = "live"
      }
    } else if (dateObj < new Date()) {
      status = "replay"
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
          {programs.map((program, index) => (
            <Link
              key={index}
              href={`/watch?channel=${encodeURIComponent(channel)}&date=${date}&time=${program.time}&title=${encodeURIComponent(program.title)}`}
              className={cn(
                "block p-3 rounded-lg hover:bg-secondary/50 transition-colors",
                program.time === currentTime && "bg-secondary ring-2 ring-primary",
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-semibold">{program.time}</span>
                {program.status === "live" && (
                  <Badge variant="destructive" className="text-xs">
                    Live
                  </Badge>
                )}
                {program.status === "replay" && (
                  <Badge variant="outline" className="text-xs">
                    Replay
                  </Badge>
                )}
              </div>
              <p className="text-sm line-clamp-2">{program.title}</p>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
