"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

const channels = [
  {
    id: 1,
    name: "News 1",
    logo: "N1",
    time: "00:37-01:22",
    currentShow: "Morning Headlines",
  },
  {
    id: 2,
    name: "News 2",
    logo: "N2",
    time: "01:00-02:00",
    currentShow: "World Report",
  },
  {
    id: 3,
    name: "Finance",
    logo: "FN",
    time: "01:00-02:00",
    currentShow: "Market Analysis",
  },
  {
    id: 4,
    name: "Sports",
    logo: "SP",
    time: "00:23-01:30",
    currentShow: "Game Highlights",
  },
  {
    id: 5,
    name: "Entertainment",
    logo: "EN",
    time: "01:00-04:00",
    currentShow: "Celebrity Talk",
  },
  {
    id: 6,
    name: "Movies",
    logo: "MV",
    time: "00:37-02:19",
    currentShow: "Classic Cinema",
  },
]

function generateScheduleForDate(channel: string, date: string) {
  const dateObj = new Date(date + "T00:00:00") // Add time to ensure proper parsing
  const dayOfWeek = dateObj.getDay()
  const dateNum = dateObj.getDate()

  const programTemplates: Record<string, Array<{ timeBase: string; titleTemplate: string }>> = {
    "News 1": [
      // { timeBase: "00:00", titleTemplate: "Midnight News Brief" },
      // { timeBase: "01:00", titleTemplate: "Late Night Update" },
      // { timeBase: "02:00", titleTemplate: "Early Morning Headlines" },
      // { timeBase: "03:00", titleTemplate: "Night Watch News" },
      // { timeBase: "04:00", titleTemplate: "Dawn Breaking News" },
      // { timeBase: "05:00", titleTemplate: "Early Bird Report" },
      // { timeBase: "06:00", titleTemplate: "Sunrise News" },
      // { timeBase: "07:00", titleTemplate: "Morning Wake-Up News" },
      // { timeBase: "08:00", titleTemplate: "Morning News Bulletin" },
      // { timeBase: "09:00", titleTemplate: "Mid-Morning Update" },
      // { timeBase: "10:30", titleTemplate: "Breaking News Update" },
      { timeBase: "12:00", titleTemplate: "Noon Report" },
      { timeBase: "12:35", titleTemplate: "Midday Report" },
      { timeBase: "14:00", titleTemplate: "Afternoon Brief" },
      { timeBase: "14:52", titleTemplate: "Afternoon News Hour" },
      { timeBase: "16:00", titleTemplate: "Late Afternoon Update" },
      { timeBase: "17:00", titleTemplate: "Evening Headlines" },
      { timeBase: "18:00", titleTemplate: "6 O'Clock News" },
      { timeBase: "19:30", titleTemplate: "Prime Time News" },
      { timeBase: "21:00", titleTemplate: "Night Edition" },
      { timeBase: "22:00", titleTemplate: "Late Night Roundup" },
      { timeBase: "23:00", titleTemplate: "Final Report" },
    ],
    "News 2": [
      { timeBase: "00:30", titleTemplate: "Midnight World Report" },
      { timeBase: "02:00", titleTemplate: "Overnight News" },
      { timeBase: "04:00", titleTemplate: "Early Morning Brief" },
      { timeBase: "06:00", titleTemplate: "Morning Global News" },
      { timeBase: "07:30", titleTemplate: "Breakfast News" },
      { timeBase: "09:00", titleTemplate: "Morning Briefing" },
      { timeBase: "10:30", titleTemplate: "Late Morning Report" },
      { timeBase: "11:30", titleTemplate: "Global News Watch" },
      { timeBase: "13:00", titleTemplate: "Afternoon Headlines" },
      { timeBase: "13:30", titleTemplate: "Midday Update" },
      { timeBase: "15:00", titleTemplate: "International Brief" },
      { timeBase: "15:45", titleTemplate: "World Report Live" },
      { timeBase: "17:00", titleTemplate: "Evening World News" },
      { timeBase: "18:00", titleTemplate: "International News" },
      { timeBase: "19:30", titleTemplate: "Prime Time World Report" },
      { timeBase: "20:30", titleTemplate: "Evening Analysis" },
      { timeBase: "22:00", titleTemplate: "Late Edition" },
      { timeBase: "23:30", titleTemplate: "Nightline" },
    ],
    Finance: [
      { timeBase: "00:00", titleTemplate: "Overnight Markets" },
      { timeBase: "02:00", titleTemplate: "Asian Markets Open" },
      { timeBase: "04:00", titleTemplate: "Early Trading Watch" },
      { timeBase: "06:00", titleTemplate: "Pre-Market Analysis" },
      { timeBase: "07:00", titleTemplate: "Market Prep" },
      { timeBase: "08:30", titleTemplate: "Market Opening Bell" },
      { timeBase: "10:00", titleTemplate: "Trading Floor Update" },
      { timeBase: "11:30", titleTemplate: "Mid-Morning Trading" },
      { timeBase: "12:00", titleTemplate: "Market Mid-Session" },
      { timeBase: "13:30", titleTemplate: "Afternoon Trading" },
      { timeBase: "14:30", titleTemplate: "Live Market Watch" },
      { timeBase: "16:00", titleTemplate: "Stock Analysis" },
      { timeBase: "17:00", titleTemplate: "Market Close Report" },
      { timeBase: "17:30", titleTemplate: "Closing Bell Report" },
      { timeBase: "19:00", titleTemplate: "After Hours Trading" },
      { timeBase: "20:30", titleTemplate: "Evening Market Wrap" },
      { timeBase: "22:00", titleTemplate: "Late Night Finance" },
      { timeBase: "23:00", titleTemplate: "Global Markets Preview" },
    ],
    Sports: [
      { timeBase: "00:00", titleTemplate: "Midnight Sports" },
      { timeBase: "01:30", titleTemplate: "Late Night Replays" },
      { timeBase: "03:00", titleTemplate: "Classic Games" },
      { timeBase: "05:00", titleTemplate: "Early Morning Sports" },
      { timeBase: "07:00", titleTemplate: "Morning Sports Recap" },
      { timeBase: "08:30", titleTemplate: "Sports Breakfast Show" },
      { timeBase: "10:00", titleTemplate: "Game Highlights Show" },
      { timeBase: "11:30", titleTemplate: "Sports Talk Live" },
      { timeBase: "13:00", titleTemplate: "Sports Center Live" },
      { timeBase: "14:30", titleTemplate: "Afternoon Sports Update" },
      { timeBase: "15:30", titleTemplate: "Player Interviews" },
      { timeBase: "17:00", titleTemplate: "Sports Evening Edition" },
      { timeBase: "18:00", titleTemplate: "Pre-Game Analysis" },
      { timeBase: "20:00", titleTemplate: "Live Game Coverage" },
      { timeBase: "22:30", titleTemplate: "Post-Game Wrap-Up" },
      { timeBase: "23:00", titleTemplate: "Sports Final" },
    ],
    Entertainment: [
      { timeBase: "00:00", titleTemplate: "Midnight Movies" },
      { timeBase: "02:00", titleTemplate: "Late Night Reruns" },
      { timeBase: "04:00", titleTemplate: "Early Morning Entertainment" },
      { timeBase: "06:00", titleTemplate: "Morning Show" },
      { timeBase: "08:00", titleTemplate: "Breakfast Entertainment" },
      { timeBase: "09:00", titleTemplate: "Celebrity Morning" },
      { timeBase: "11:00", titleTemplate: "Entertainment News" },
      { timeBase: "12:30", titleTemplate: "Midday Variety" },
      { timeBase: "13:30", titleTemplate: "Talk Show Special" },
      { timeBase: "15:00", titleTemplate: "Behind the Scenes" },
      { timeBase: "16:30", titleTemplate: "Celebrity Interviews" },
      { timeBase: "17:30", titleTemplate: "Red Carpet Special" },
      { timeBase: "19:00", titleTemplate: "Prime Time Entertainment" },
      { timeBase: "20:00", titleTemplate: "Prime Time Variety Show" },
      { timeBase: "21:30", titleTemplate: "Evening Talk Show" },
      { timeBase: "22:30", titleTemplate: "Late Night Entertainment" },
      { timeBase: "23:30", titleTemplate: "After Hours" },
    ],
    Movies: [
      { timeBase: "00:00", titleTemplate: "Midnight Movie" },
      { timeBase: "02:00", titleTemplate: "Late Night Feature" },
      { timeBase: "04:00", titleTemplate: "Early Morning Classic" },
      { timeBase: "06:00", titleTemplate: "Sunrise Cinema" },
      { timeBase: "08:00", titleTemplate: "Morning Classic" },
      { timeBase: "10:00", titleTemplate: "Mid-Morning Movie" },
      { timeBase: "10:30", titleTemplate: "Action Movie Marathon" },
      { timeBase: "13:00", titleTemplate: "Afternoon Feature Film" },
      { timeBase: "15:00", titleTemplate: "Matinee Special" },
      { timeBase: "15:30", titleTemplate: "Drama Showcase" },
      { timeBase: "17:30", titleTemplate: "Early Evening Movie" },
      { timeBase: "18:00", titleTemplate: "Prime Time Blockbuster" },
      { timeBase: "20:00", titleTemplate: "Featured Presentation" },
      { timeBase: "20:30", titleTemplate: "Evening Thriller" },
      { timeBase: "22:30", titleTemplate: "Late Show Movie" },
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

    // Calculate program end time (use next program's start time or add default duration)
    let programEndHour: number
    let programEndMinute: number

    if (index < templates.length - 1) {
      const [nextHour, nextMinute] = templates[index + 1].timeBase.split(":").map(Number)
      programEndHour = nextHour
      programEndMinute = nextMinute
    } else {
      // Last program of the day, assume it ends at 23:59
      programEndHour = 23
      programEndMinute = 59
    }

    // Add variation based on date
    const episodeNum = ((dateNum * 10 + index + dayOfWeek) % 500) + 1
    const variation = dayOfWeek % 3

    let title = template.titleTemplate

    // Add date-specific variations to titles
    if (variation === 0) {
      title = `${template.titleTemplate} - Episode ${episodeNum}`
    } else if (variation === 1) {
      title = `${template.titleTemplate} Special`
    } else {
      title = `${template.titleTemplate} - ${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    }

    let status = "notStarted"

    if (isPast) {
      // All programs on past dates are ended
      status = "ended"
    } else if (isFuture) {
      // All programs on future dates haven't started
      status = "notStarted"
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
        status = "notStarted"
      }
    }

    return {
      time: template.timeBase,
      title,
      status,
    }
  })
}

interface ScheduleGridProps {
  selectedDate: string
  selectedChannel: string
  onChannelSelect: (channel: string) => void
}

export function ScheduleGrid({ selectedDate, selectedChannel, onChannelSelect }: ScheduleGridProps) {
  const schedule = generateScheduleForDate(selectedChannel, selectedDate)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Channels</h2>
        {channels.map((channel) => (
          <Card
            key={channel.id}
            onClick={() => onChannelSelect(channel.name)}
            className={cn(
              "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
              selectedChannel === channel.name && "ring-2 ring-primary bg-secondary/30",
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded bg-destructive flex items-center justify-center font-bold">
                {channel.logo}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{channel.name}</h3>
                <p className="text-xs text-muted-foreground">{channel.time}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{channel.currentShow}</p>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-3">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Schedule for {selectedChannel}</h2>
          <p className="text-sm text-muted-foreground">{selectedDate}</p>
        </div>
        <div className="flex flex-col gap-3">
          {schedule.map((item, index) => {
            const isClickable = item.status === "live"
            const content = (
              <Card
                key={index}
                className={cn(
                  "p-4 transition-colors",
                  isClickable && "hover:bg-secondary/50 cursor-pointer",
                  !isClickable && "opacity-50 cursor-not-allowed",
                  item.status === "live" && "ring-2 ring-primary bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">{item.time}</span>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                  </div>
                  <div>
                    {item.status === "live" && (
                      <Badge variant="destructive" className="bg-red-600">
                        Live
                      </Badge>
                    )}
                    {item.status === "ended" && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Ended
                      </Badge>
                    )}
                    {item.status === "notStarted" && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Not Started
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            )

            return isClickable ? (
              <Link
                key={index}
                href={`/watch?channel=${encodeURIComponent(selectedChannel)}&date=${selectedDate}&time=${item.time}&title=${encodeURIComponent(item.title)}`}
                className="block"
              >
                {content}
              </Link>
            ) : (
              <div key={index}>{content}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
