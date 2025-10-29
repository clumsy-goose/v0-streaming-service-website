"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const channelContent: Record<string, { title: string; description: string; image: string; program: string }> = {
  "News 1": {
    title: "News 1",
    program: "Morning Headlines - Live Coverage",
    description:
      "Breaking news and current events from around the world. Stay informed with our comprehensive coverage of the latest developments in politics, economy, and society.",
    image: "/live-news-broadcast-studio.jpg",
  },
  "News 2": {
    title: "News 2",
    program: "World Report - International News",
    description:
      "Global perspectives on today's most important stories. Our correspondents bring you in-depth analysis and reporting from every corner of the world.",
    image: "/world-news-studio.jpg",
  },
  Finance: {
    title: "Finance",
    program: "Market Watch - Financial News",
    description:
      "Real-time market analysis and business updates. Track the latest trends in stocks, commodities, and global financial markets with expert commentary.",
    image: "/financial-news-studio.jpg",
  },
  Sports: {
    title: "Sports",
    program: "Game Highlights - Sports Coverage",
    description:
      "Live sports action and expert commentary. From football to basketball, tennis to motorsports, catch all the excitement and analysis you need.",
    image: "/sports-broadcast-studio.jpg",
  },
  Entertainment: {
    title: "Entertainment",
    program: "Celebrity Talk - Entertainment News",
    description:
      "The latest in movies, music, and pop culture. Exclusive interviews, red carpet coverage, and behind-the-scenes access to your favorite stars.",
    image: "/entertainment-talk-show.jpg",
  },
  Movies: {
    title: "Movies",
    program: "Classic Cinema - Movie Channel",
    description:
      "Timeless films and cinematic masterpieces. Experience the golden age of cinema with carefully curated classics and award-winning productions.",
    image: "/movie-theater-screen.jpg",
  },
}

const channels = ["News 1", "News 2", "Finance", "Sports", "Entertainment", "Movies"]

interface LiveStreamsProps {
  selectedChannel: string
  onChannelChange?: (channel: string) => void
}

export function LiveStreams({ selectedChannel, onChannelChange }: LiveStreamsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const router = useRouter()

  const content = channelContent[selectedChannel] || channelContent["News 1"]

  const currentIndex = channels.indexOf(selectedChannel)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < channels.length - 1

  const handlePrev = () => {
    if (canGoPrev && onChannelChange) {
      setIsPlaying(false)
      onChannelChange(channels[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (canGoNext && onChannelChange) {
      setIsPlaying(false)
      onChannelChange(channels[currentIndex + 1])
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

    router.push(
      `/watch?channel=${encodeURIComponent(selectedChannel)}&date=${encodeURIComponent(
        now.toISOString().split("T")[0],
      )}&time=${encodeURIComponent(timeStr)}&title=${encodeURIComponent(content.program)}`,
    )
  }

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      const video = videoRef.current
      const hlsUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"

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
  }, [isPlaying, selectedChannel])

  useEffect(() => {
    setIsPlaying(false)
  }, [selectedChannel])

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
          <h2 className="text-xl font-bold">{content.title}</h2>
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
        <Badge variant="destructive" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          LIVE
        </Badge>
      </div>

      <Card
        className="overflow-hidden bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={handleCardClick}
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-video md:aspect-auto bg-secondary">
            {isPlaying ? (
              <video ref={videoRef} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <>
                <img
                  src={content.image || "/placeholder.svg"}
                  alt="Live stream preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </Badge>
                </div>
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
              <h3 className="text-2xl font-bold">{content.title}</h3>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Now Playing</p>
              <p className="text-lg font-semibold">{content.program}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.description}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
