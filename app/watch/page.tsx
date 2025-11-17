"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useMemo } from "react"
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
  const channelId = searchParams.get("channel") || ""
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const time = searchParams.get("time") || "12:00"
  const title = searchParams.get("title") || "Program"
  
  const { channels, loading } = useChannels()

  // Find channel from context
  const channel = useMemo(() => {
    return channels.find(ch => ch.channelId === channelId) || null
  }, [channels, channelId])

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
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player - 3/4 width */}
          <div className="lg:col-span-3 space-y-4">
            <VideoPlayer channel={channel} programTime={time} />

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
                  <p className="text-muted-foreground leading-relaxed">
                    {channel.channelDescription || "Stream TV 是一项免费的在线流媒体服务"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </Badge>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{time}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium text-foreground">{channel.channelName}</span>
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
