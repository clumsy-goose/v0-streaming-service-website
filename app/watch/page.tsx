"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { VideoPlayer } from "@/components/video-player"
import { DayPlaylist } from "@/components/day-playlist"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function WatchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const channel = searchParams.get("channel") || "News 1"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const time = searchParams.get("time") || "12:00"
  const title = searchParams.get("title") || "Program"

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
                    Experience comprehensive coverage and in-depth analysis of today's most important stories. Our
                    expert team brings you breaking news, exclusive interviews, and detailed reports from around the
                    world.
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
                <span className="font-medium text-foreground">{channel}</span>
              </div>
            </div>
          </div>

          {/* Playlist - 1/4 width */}
          <div className="lg:col-span-1">
            <DayPlaylist channel={channel} date={date} currentTime={time} />
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
