"use client"

import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Play, Eye } from "lucide-react"
import { useChannels } from "@/lib/channels-context"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Program } from "@/config"
import { cn } from "@/lib/utils"

function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}` // Returns YYYY-MM-DD in local timezone
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

export default function RankPage() {
  const { channels, loading } = useChannels()
  const router = useRouter()

  // Get all programs from all channels and sort by viewers or status
  const trendingPrograms = useMemo(() => {
    if (!channels || channels.length === 0) return []

    const allPrograms: Array<Program & { channelId: string; channelName: string; channelImage: string }> = []

    channels.forEach((channel) => {
      // Include playing program
      if (channel.playingProgram && channel.playingProgram.programId) {
        allPrograms.push({
          ...channel.playingProgram,
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelImage: channel.image,
        })
      }
      
      // Include all scheduled programs
      channel.schedules.forEach((program) => {
        // Avoid duplicates (playingProgram might be in schedules)
        if (!allPrograms.find(p => p.programId === program.programId && p.channelId === channel.channelId)) {
          allPrograms.push({
            ...program,
            channelId: channel.channelId,
            channelName: channel.channelName,
            channelImage: channel.image,
          })
        }
      })
    })

    // Sort by: live programs first, then by viewers, then by startTime (most recent)
    return allPrograms
      .sort((a, b) => {
        // Live programs first
        const aIsLive = a.status === "live"
        const bIsLive = b.status === "live"
        if (aIsLive && !bIsLive) return -1
        if (!aIsLive && bIsLive) return 1

        // Then by viewers (descending)
        if (a.viewers !== b.viewers) {
          return b.viewers - a.viewers
        }

        // Then by startTime (most recent first)
        return b.startTime - a.startTime
      })
      .slice(0, 50) // Top 50
  }, [channels])

  const handleProgramClick = (program: Program & { channelId: string; channelName: string }) => {
    if (program.status !== "live") return

    const today = getTodayDateString()
    const time = formatTime(program.startTime)
    router.push(
      `/watch?channel=${encodeURIComponent(program.channelId)}&date=${today}&time=${time}&title=${encodeURIComponent(program.programName)}`
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-destructive" />
            <h1 className="text-4xl font-bold">热榜</h1>
          </div>
          <p className="text-muted-foreground">最受欢迎的直播节目排行</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trendingPrograms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">暂无热门节目</div>
          ) : (
            trendingPrograms.map((program, index) => {
              const rank = index + 1
              const isTopThree = rank <= 3
              const isClickable = program.status === "live"

              return (
                <Card
                  key={`${program.channelId}-${program.programId}`}
                  className={cn(
                    "p-6 transition-all hover:shadow-lg",
                    isClickable && "cursor-pointer hover:border-primary",
                    !isClickable && "opacity-75"
                  )}
                  onClick={() => isClickable && handleProgramClick(program)}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        "flex items-center justify-center h-12 w-12 rounded-lg font-bold text-lg shrink-0",
                        isTopThree
                          ? "bg-destructive text-white"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {rank}
                    </div>

                    {/* Program Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2 flex-1">{program.programName}</h3>
                        {program.status === "live" && (
                          <Badge variant="destructive" className="shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>

                      {program.programDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {program.programDescription}
                        </p>
                      )}

                      {/* Channel Info */}
                      <div className="flex items-center gap-3 mb-3">
                        {program.channelImage ? (
                          <img
                            src={program.channelImage}
                            alt={program.channelName}
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded bg-destructive flex items-center justify-center text-xs font-bold">
                            {program.channelName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium">{program.channelName}</span>
                      </div>

                      {/* Time and Views */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          <span>{formatTime(program.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{program.viewers || 0} 观看</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

