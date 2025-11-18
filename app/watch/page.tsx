"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useMemo, useEffect, useState } from "react"
import { VideoPlayer } from "@/components/video-player"
import { DayPlaylist } from "@/components/day-playlist"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useChannels } from "@/lib/channels-context"

function WatchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const getTodayDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}` // Returns YYYY-MM-DD in local timezone
  }

  const channelId = searchParams.get("channel") || ""
  const date = searchParams.get("date") || getTodayDateString()
  const time = searchParams.get("time") || "12:00"
  const title = searchParams.get("title") || "Program"
  
  const { channels, loading } = useChannels()
  const [views, setViews] = useState<number | null>(null)

  // Find channel from context
  const channel = useMemo(() => {
    return channels.find(ch => ch.channelId === channelId) || null
  }, [channels, channelId])

  // Find current program based on time and title
  const currentProgram = useMemo(() => {
    if (!channel) return null
    
    // First, try to use playingProgram if it matches
    let program = channel.playingProgram
    if (program && program.programId) {
      // Check if playingProgram matches the title or time
      const matchesTitle = program.programName === title || 
                          program.programName.includes(title) || 
                          title.includes(program.programName)
      
      if (matchesTitle) {
        return program
      }
      
      // Check if playingProgram is playing at the target time
      if (time) {
        const [hours, minutes] = time.split(':').map(Number)
        const targetTime = new Date(date + `T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)
        const targetTimestamp = Math.floor(targetTime.getTime() / 1000)
        
        if (targetTimestamp >= program.startTime && targetTimestamp < program.endTime) {
          return program
        }
      }
    }
    
    // Try to find program by title in schedules
    const foundByTitle = channel.schedules.find(p => 
      p.programName === title || p.programName.includes(title) || title.includes(p.programName)
    )
    if (foundByTitle) {
      program = foundByTitle
    }
    
    // If not found, try to find by time
    if (!program && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const targetTime = new Date(date + `T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)
      const targetTimestamp = Math.floor(targetTime.getTime() / 1000)
      
      // Find program that is playing at the target time
      const foundByTime = channel.schedules.find(p => {
        return targetTimestamp >= p.startTime && targetTimestamp < p.endTime
      })
      
      if (foundByTime) {
        program = foundByTime
      } else {
        // If still not found, find the closest program by start time
        const closestProgram = channel.schedules
          .filter(p => Math.abs(p.startTime - targetTimestamp) < 3600) // Within 1 hour
          .sort((a, b) => Math.abs(a.startTime - targetTimestamp) - Math.abs(b.startTime - targetTimestamp))[0]
        if (closestProgram) {
          program = closestProgram
        }
      }
    }
    
    // Fallback to playing program
    if (!program || !program.programId) {
      program = channel.playingProgram
    }
    
    return program
  }, [channel, time, title, date])

  // 记录观看量
  useEffect(() => {
    if (!currentProgram?.programId) return

    // 防抖：使用 sessionStorage 避免同一会话中重复记录
    const recordedKey = `viewed:${currentProgram.programId}`
    if (sessionStorage.getItem(recordedKey)) {
      // 已记录过，从 programs 数据中获取观看量（如果已加载）
      // 或者可以从 /functions/program-views/get 获取所有数据
      // 这里暂时不查询，因为首页已经获取了所有数据
      return
    }

    // 记录观看量
    fetch('/program-views/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId: currentProgram.programId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.views) {
          setViews(data.views.total || 0)
          // 标记已记录，避免重复统计
          sessionStorage.setItem(recordedKey, '1')
        }
      })
      .catch(err => {
        console.error('Failed to record view:', err)
        // 静默失败，不影响用户体验
      })
  }, [currentProgram?.programId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">加载中...</div>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">频道不存在或数据未加载</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player - 3/4 width */}
          <div className="lg:col-span-3 space-y-4">
            <VideoPlayer channel={channel} programTime={time} />

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {currentProgram?.programName || title}
                  </h1>
                  {currentProgram?.programDescription ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {currentProgram.programDescription}
                    </p>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {channel.channelDescription || "Stream TV 是一项免费的在线流媒体服务"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                {currentProgram?.status === "live" && (
                  <Badge variant="outline" className="gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    LIVE
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{time}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium text-foreground">{channel.channelName}</span>
                {views !== null && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{views} 次观看</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Playlist - 1/4 width */}
          <div className="lg:col-span-1">
            <DayPlaylist channelId={channelId} date={date} currentTime={time} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WatchPageContent />
    </Suspense>
  )
}
