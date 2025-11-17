"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { programsMap } from "@/config"
import { useChannels } from "@/lib/channels-context"

interface DayPlaylistProps {
  channelId: string
  date: string
  currentTime: string
}

interface PlaylistProgram {
  time: string
  title: string
  status: "live" | "ended" | "not-started"
  programId: string
  startTime: number
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

export function DayPlaylist({ channelId, date, currentTime }: DayPlaylistProps) {
  const { channels } = useChannels()
  
  // Get programs from channel's schedules
  const programs = useMemo(() => {
    if (!channelId || channels.length === 0) {
      return []
    }

    const channel = channels.find(ch => ch.channelId === channelId)
    if (!channel) {
      return []
    }

    // Parse selected date in local timezone
    const selectedDateObj = new Date(date + "T00:00:00")
    const selectedDateStart = Math.floor(selectedDateObj.getTime() / 1000)
    const selectedDateEnd = selectedDateStart + 24 * 60 * 60 - 1
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Filter programs for the selected date
    const filteredPrograms = channel.schedules
      .filter((program) => {
        const startTime = program.startTime
        const endTime = program.endTime
        
        return (
          (startTime >= selectedDateStart && startTime <= selectedDateEnd) ||
          (startTime < selectedDateStart && endTime > selectedDateStart)
        )
      })
      .map((program) => {
        let status: "live" | "ended" | "not-started" = "not-started"
        if (currentTimestamp >= program.endTime) {
          status = "ended"
        } else if (currentTimestamp >= program.startTime && currentTimestamp < program.endTime) {
          status = "live"
        }

        return {
          time: formatTime(program.startTime),
          title: program.programName,
          status,
          programId: program.programId,
          startTime: program.startTime,
        }
      })
      .sort((a: PlaylistProgram, b: PlaylistProgram) => a.startTime - b.startTime)

    return filteredPrograms
  }, [channelId, date, channels])

  const loading = channels.length === 0

  return (
    <Card className="h-[calc(100vh-8rem)]">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Today's Schedule</h2>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="p-4 space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-4">加载中...</div>
          ) : programs.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">暂无节目</div>
          ) : (
            programs.map((program, index) => {
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
                    key={program.programId || index}
                    href={`/watch?channel=${encodeURIComponent(channelId)}&date=${date}&time=${program.time}&title=${encodeURIComponent(program.title)}`}
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
                  key={program.programId || index}
                className={cn(
                  "block p-3 rounded-lg opacity-50 cursor-not-allowed",
                  isCurrentProgram && "bg-secondary/30",
                )}
              >
                {content}
                <p className="text-sm line-clamp-2 text-muted-foreground">{program.title}</p>
              </div>
            )
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
