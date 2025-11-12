"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Channel {
  Id: string
  Name: string
  PlaybackURL?: string
}

interface ProgramSchedule {
  Id: string
  Name: string
  PlaybackConf: {
    StartTime: number
    Duration: number
  }
}

interface Program {
  time: string
  title: string
  status: string
  startTime: number
  endTime: number
}

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

function processPrograms(programs: ProgramSchedule[], selectedDate: string): Program[] {
  if (!programs || programs.length === 0) {
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
    programCount: programs.length,
    selectedDate,
    selectedDateStart,
    selectedDateEnd,
    selectedDateStartISO: new Date(selectedDateStart * 1000).toISOString(),
    selectedDateEndISO: new Date(selectedDateEnd * 1000).toISOString(),
    currentTimestamp,
    currentTimeISO: new Date(currentTimestamp * 1000).toISOString(),
    firstProgramStartTime: programs[0]?.PlaybackConf?.StartTime,
    firstProgramDate: programs[0]?.PlaybackConf?.StartTime 
      ? new Date(programs[0].PlaybackConf.StartTime * 1000).toISOString()
      : 'N/A'
  })

  // Sort by start time
  const sortedPrograms = [...programs].sort((a, b) => a.PlaybackConf.StartTime - b.PlaybackConf.StartTime)

  // Filter programs that fall within the selected date
  const filteredPrograms = sortedPrograms.filter((program) => {
    const startTime = program.PlaybackConf.StartTime
    const endTime = startTime + program.PlaybackConf.Duration
    
    // Program starts within selected date OR program spans across the selected date
    const matchesDate = (
      (startTime >= selectedDateStart && startTime <= selectedDateEnd) ||
      (startTime < selectedDateStart && endTime > selectedDateStart)
    )
    
    return matchesDate
  })

  console.log(`✅ Filtered ${filteredPrograms.length} programs out of ${sortedPrograms.length} for date ${selectedDate}`)

  // Convert to Program format
  return filteredPrograms.map((program) => {
    const startTime = program.PlaybackConf.StartTime
    const endTime = startTime + program.PlaybackConf.Duration

    let status = "notStarted"
    if (currentTimestamp >= endTime) {
      status = "ended"
    } else if (currentTimestamp >= startTime && currentTimestamp < endTime) {
        status = "live"
    }

    return {
      time: formatTime(startTime),
      title: program.Name,
      status,
      startTime,
      endTime,
    }
  })
}

interface ScheduleGridProps {
  selectedDate: string
  selectedChannel: string
  onChannelSelect: (channel: string) => void
}

export function ScheduleGrid({ selectedDate, selectedChannel, onChannelSelect }: ScheduleGridProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChannelId, setSelectedChannelId] = useState<string>("")

  // Fetch channels on mount
  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch("/api/test/channels")
        const result = await response.json()
        if (result.ok && result.data?.Response?.Infos) {
          const channelList = result.data.Response.Infos
          setChannels(channelList)
          
          // Set the first channel as default if no channel is selected
          if (channelList.length > 0) {
            const firstChannel = channelList[0]
            if (!selectedChannel) {
              onChannelSelect(firstChannel.Name)
              setSelectedChannelId(firstChannel.Id)
            } else {
              // Find the selected channel ID
              const channel = channelList.find((ch: Channel) => ch.Name === selectedChannel)
              if (channel) {
                setSelectedChannelId(channel.Id)
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchChannels()
  }, [])

  // Update selectedChannelId when selectedChannel changes
  useEffect(() => {
    const channel = channels.find((ch) => ch.Name === selectedChannel)
    if (channel) {
      setSelectedChannelId(channel.Id)
    }
  }, [selectedChannel, channels])

  useEffect(() => {
    console.log("🚀 ~ ScheduleGrid ~ channels:", channels);
  }, [channels])

  useEffect(()=>{
    console.log("🚀 ~ ScheduleGrid ~ programs:", programs)
  },[programs])

  // Fetch programs when channel or date changes
  useEffect(() => {
    async function fetchPrograms() {
      if (!selectedChannelId) return

      try {
        setLoading(true)
        // Request 7 days worth of programs (7 * 24 * 60 * 60 = 604800 seconds)
        const timeWindow = 7 * 24 * 60 * 60
        const response = await fetch(
          `/api/test/program-schedules?channelId=${selectedChannelId}&timeWindow=${timeWindow}&pageNum=1&pageSize=1000`
        )
        const result = await response.json()
        console.log("📡 API Response:", result)
        if (result.ok && result.data?.Response?.Infos) {
          const programList = result.data.Response.Infos as ProgramSchedule[]
          console.log("📋 Raw program list:", programList)
          const processedPrograms = processPrograms(programList, selectedDate)
          setPrograms(processedPrograms)
        } else {
          console.error("❌ API returned error or no data:", result)
          setPrograms([])
        }
      } catch (error) {
        console.error("Failed to fetch programs:", error)
        setPrograms([])
      } finally {
        setLoading(false)
      }
    }
    fetchPrograms()
  }, [selectedChannelId, selectedDate])

  const getCurrentShow = (channelName: string) => {
    console.log("🚀 ~ getCurrentShow ~ programs:", programs)
    if (programs.length === 0) return "Loading..."
    const liveProgram = programs.find((p) => p.status === "live")
    return liveProgram ? liveProgram.title : "No live program"
  }

  const getChannelTimeRange = () => {
    console.log("🚀 ~ getChannelTimeRange ~ programs:", programs)
    if (programs.length === 0) return "--:--"
    const firstProgram = programs[0]
    const lastProgram = programs[programs.length - 1]
    return `${firstProgram?.time || "--:--"}-${formatTime(lastProgram?.endTime || 0)}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Channels</h2>
        {loading && channels.length === 0 ? (
          <div className="text-center text-muted-foreground">Loading channels...</div>
        ) : (
          channels.map((channel) => (
          <Card
              key={channel.Id}
              onClick={() => onChannelSelect(channel.Name)}
            className={cn(
              "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
                selectedChannel === channel.Name && "ring-2 ring-primary bg-secondary/30"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded bg-destructive flex items-center justify-center font-bold text-sm">
                  {getChannelLogo(channel.Name)}
              </div>
              <div className="flex-1">
                  <h3 className="font-semibold">{channel.Name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChannel === channel.Name ? getChannelTimeRange() : ""}
                  </p>
                </div>
              </div>
              {selectedChannel === channel.Name && (
                <p className="text-sm text-muted-foreground line-clamp-1">{getCurrentShow(channel.Name)}</p>
              )}
          </Card>
          ))
        )}
      </div>

      <div className="lg:col-span-3">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Schedule for {selectedChannel}</h2>
          <p className="text-sm text-muted-foreground">{selectedDate}</p>
        </div>
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading schedule...</div>
        ) : programs.length === 0 ? (
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
        )}
      </div>
    </div>
  )
}
