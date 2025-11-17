"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Channel } from "@/config"
import { useChannels } from "@/lib/channels-context"

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

function getChannelLogo(name: string): string {
  // Generate a simple logo from the channel name
  const words = name.split(/[-_\s]+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

interface ProcessedProgram {
  time: string
  title: string
  status: "live" | "ended" | "not-started"
  startTime: number
  endTime: number
  programId: string
}

function processPrograms(apiPrograms: any[], selectedDate: string): ProcessedProgram[] {
  if (!apiPrograms || apiPrograms.length === 0) {
    console.log("⚠️ No programs to process")
    return []
  }

  const currentTime = new Date()
  const currentTimestamp = Math.floor(currentTime.getTime() / 1000)
  
  // Parse selected date in local timezone
  const selectedDateObj = new Date(selectedDate + "T00:00:00")
  const selectedDateStart = Math.floor(selectedDateObj.getTime() / 1000)
  const selectedDateEnd = selectedDateStart + 24 * 60 * 60 - 1

  console.log("🔍 Processing programs:", {
    programCount: apiPrograms.length,
    selectedDate,
    selectedDateStart,
    selectedDateEnd,
    selectedDateStartISO: new Date(selectedDateStart * 1000).toISOString(),
    selectedDateEndISO: new Date(selectedDateEnd * 1000).toISOString(),
    currentTimestamp,
    currentTimeISO: new Date(currentTimestamp * 1000).toISOString(),
    firstProgramStartTime: apiPrograms[0]?.PlaybackConf?.StartTime,
    firstProgramDate: apiPrograms[0]?.PlaybackConf?.StartTime 
      ? new Date(apiPrograms[0].PlaybackConf.StartTime * 1000).toISOString()
      : 'N/A'
  })

  // Sort by start time
  const sortedPrograms = [...apiPrograms].sort((a, b) => 
    (a.PlaybackConf?.StartTime || 0) - (b.PlaybackConf?.StartTime || 0)
  )

  // Filter programs that fall within the selected date
  const filteredPrograms = sortedPrograms.filter((program) => {
    const startTime = program.PlaybackConf?.StartTime || 0
    const duration = program.PlaybackConf?.Duration || 0
    const endTime = startTime + duration
    
    // Program starts within selected date OR program spans across the selected date
    const matchesDate = (
      (startTime >= selectedDateStart && startTime <= selectedDateEnd) ||
      (startTime < selectedDateStart && endTime > selectedDateStart)
    )
    
    return matchesDate
  })

  console.log(`✅ Filtered ${filteredPrograms.length} programs out of ${sortedPrograms.length} for date ${selectedDate}`)

  // Convert to ProcessedProgram format
  return filteredPrograms.map((program) => {
    const programId = program.Id || ""
    const programName = program.Name || ""
    const startTime = program.PlaybackConf?.StartTime || 0
    const duration = program.PlaybackConf?.Duration || 0
    const endTime = startTime + duration

    let status: "live" | "ended" | "not-started" = "not-started"
    if (currentTimestamp >= endTime) {
      status = "ended"
    } else if (currentTimestamp >= startTime && currentTimestamp < endTime) {
      status = "live"
    }

    return {
      time: formatTime(startTime),
      title: programName || "",
      status,
      startTime,
      endTime,
      programId,
    }
  })
}

interface ScheduleGridProps {
  selectedDate: string
  selectedChannel: string // channelId or channelName
  onChannelSelect: (channel: string) => void
}

export function ScheduleGrid({ selectedDate, selectedChannel, onChannelSelect }: ScheduleGridProps) {
  const { channels, loading } = useChannels()
  const [programs, setPrograms] = useState<ProcessedProgram[]>([])
  const [selectedChannelId, setSelectedChannelId] = useState<string>("")

  // Initialize selectedChannelId from context channels
  useEffect(() => {
    if (channels.length > 0) {
      if (!selectedChannel) {
        const firstChannel = channels[0]
        onChannelSelect(firstChannel.channelId)
        setSelectedChannelId(firstChannel.channelId)
      } else {
        // Find the selected channel by Id or Name
        const channel = channels.find(
          (ch) => ch.channelId === selectedChannel || ch.channelName === selectedChannel
        )
        if (channel) {
          setSelectedChannelId(channel.channelId)
        }
      }
    }
  }, [channels, selectedChannel, onChannelSelect])

  // Update selectedChannelId when selectedChannel changes
  useEffect(() => {
    const channel = channels.find(
      (ch) => ch.channelId === selectedChannel || ch.channelName === selectedChannel
    )
    if (channel) {
      setSelectedChannelId(channel.channelId)
    }
  }, [selectedChannel, channels])

  // Use programs from selected channel's schedules, filtered by date
  useEffect(() => {
    if (!selectedChannelId || channels.length === 0) {
      setPrograms([])
      return
    }

    const selectedChannelData = channels.find(ch => ch.channelId === selectedChannelId)
    if (!selectedChannelData) {
      setPrograms([])
      return
    }

    // Filter programs for the selected date
    const selectedDateObj = new Date(selectedDate + "T00:00:00")
    const selectedDateStart = Math.floor(selectedDateObj.getTime() / 1000)
    const selectedDateEnd = selectedDateStart + 24 * 60 * 60 - 1

    const filteredPrograms = selectedChannelData.schedules
      .filter((program) => {
        const startTime = program.startTime
        const endTime = program.endTime
        
        return (
          (startTime >= selectedDateStart && startTime <= selectedDateEnd) ||
          (startTime < selectedDateStart && endTime > selectedDateStart)
        )
      })
      .map((program) => {
        const currentTimestamp = Math.floor(Date.now() / 1000)
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
          startTime: program.startTime,
          endTime: program.endTime,
          programId: program.programId,
        }
      })
      .sort((a, b) => a.startTime - b.startTime)

    setPrograms(filteredPrograms)
  }, [selectedChannelId, selectedDate, channels])

  const getCurrentShow = (channel: Channel) => {
    if (!channel || !channel.playingProgram) return "Loading..."
    return channel.playingProgram.programName || "No live program"
  }

  const getChannelTimeRange = (channel: Channel) => {
    if (!channel || !channel.playingProgram) return "--:--"
    const startTime = channel.playingProgram.startTime
    const endTime = channel.playingProgram.endTime
    return `${formatTime(startTime)}-${formatTime(endTime)}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-semibold mb-4">频道列表</h2>
        {loading && channels.length === 0 ? (
          <div className="text-center text-muted-foreground">Loading channels...</div>
        ) : channels.length === 0 ? (
          <div className="text-center text-muted-foreground">暂无频道数据</div>
        ) : (
          channels.map((channel) => {
            const isSelected = selectedChannel === channel.channelId || selectedChannel === channel.channelName
            return (
              <Card
                key={channel.channelId}
                onClick={() => onChannelSelect(channel.channelId)}
                className={cn(
                  "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
                  isSelected && "ring-2 ring-primary bg-secondary/30"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  {channel.image ? (
                    <img 
                      src={channel.image} 
                      alt={channel.channelName}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-destructive flex items-center justify-center font-bold text-sm">
                      {getChannelLogo(channel.channelName)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{channel.channelName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getChannelTimeRange(channel)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{channel?.channelDescription}</p>
              </Card>
            )
          })
        )}
      </div>

      <div className="lg:col-span-3">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {channels.find(ch => ch.channelId === selectedChannelId)?.channelName || selectedChannel}
          </h2>
          <p className="text-sm text-muted-foreground">{selectedDate}</p>
        </div>
        {programs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No programs scheduled for this date</div>
        ) : (
        <div className="flex flex-col gap-3">
            {programs.map((item, index) => {
            const isClickable = item.status === "live"
            const content = (
              <Card
                key={index}
                className={cn(
                  "p-4 transition-colors",
                  isClickable && "hover:bg-secondary/50 cursor-pointer",
                  !isClickable && "opacity-50 cursor-not-allowed",
                    item.status === "live" && "ring-2 ring-primary bg-primary/5"
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
                    {item.status === "not-started" && (
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
                href={`/watch?channel=${encodeURIComponent(selectedChannelId)}&date=${selectedDate}&time=${item.time}&title=${encodeURIComponent(item.title)}`}
                className="block"
              >
                {content}
              </Link>
            ) : (
              <div key={index}>{content}</div>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )
}
