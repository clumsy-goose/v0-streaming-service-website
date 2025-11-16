"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Channel } from "@/config"

interface LiveStreamsProps {
  channel: Channel
  channels: Channel[]
  onChannelChange?: (channelId: string) => void
}

export function LiveStreams({ channel, channels, onChannelChange }: LiveStreamsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const router = useRouter()

  const currentIndex = channels.findIndex(c => c.channelId === channel.channelId)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < channels.length - 1

  const handlePrev = () => {
    if (canGoPrev && onChannelChange) {
      setIsPlaying(false)
      onChannelChange(channels[currentIndex - 1].channelId)
    }
  }

  const handleNext = () => {
    if (canGoNext && onChannelChange) {
      setIsPlaying(false)
      onChannelChange(channels[currentIndex + 1].channelId)
    }
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPlaying(true)
  }

  const handleCardClick = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const timeStr = `${hours}:${minutes}`
    const programName = channel.playingProgram?.programName || ""

    router.push(
      `/watch?channel=${encodeURIComponent(channel.channelId)}&date=${encodeURIComponent(
        now.toISOString().split("T")[0],
      )}&time=${encodeURIComponent(timeStr)}&title=${encodeURIComponent(programName)}`,
    )
  }

  useEffect(() => {
    if (isPlaying && videoRef.current && channel.playbackURL) {
      const video = videoRef.current
      const hlsUrl = channel.playbackURL

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl
        video.play().catch((error) => {
          console.error("[v0] Error playing video:", error)
        })
      } else {
        import("hls.js").then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const hls = new Hls()
            hlsRef.current = hls
            hls.loadSource(hlsUrl)
            hls.attachMedia(video)
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch((error) => {
                console.error("[v0] Error playing video:", error)
              })
            })
          }
        })
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [isPlaying, channel.playbackURL, channel.channelId])

  useEffect(() => {
    setIsPlaying(false)
  }, [channel.channelId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="h-8 w-8 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">{channel.channelName}</h2>
          <Button
            size="icon"
            variant="outline"
            onClick={handleNext}
            disabled={!canGoNext}
            className="h-8 w-8 bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {channel.playingProgram?.status === "live" && (
          <Badge variant="destructive" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </Badge>
        )}
      </div>

      <Card
        className="overflow-hidden bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={handleCardClick}
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square bg-secondary">
            {isPlaying ? (
              <video ref={videoRef} className="block w-full h-full object-cover" controls playsInline />
            ) : (
              <>
                <img
                  src={channel.image || "/placeholder.svg"}
                  alt="Live stream preview"
                  className="block w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {channel.playingProgram?.status === "live" && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="destructive" className="gap-1 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="icon"
                    onClick={handlePlayClick}
                    className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg"
                  >
                    <Play className="h-8 w-8 ml-1" fill="currentColor" />
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="p-6 flex flex-col justify-center space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{channel.channelName}</h3>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Now Playing</p>
              <p className="text-lg font-semibold">{channel.playingProgram?.programName || "暂无节目"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{channel.channelDescription}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
