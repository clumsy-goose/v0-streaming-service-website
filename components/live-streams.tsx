"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Maximize, Settings, Volume2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const channelContent: Record<string, { title: string; description: string; image: string }> = {
  "News 1": {
    title: "Morning Headlines - Live Coverage",
    description: "Breaking news and current events from around the world",
    image: "/live-news-broadcast-studio.jpg",
  },
  "News 2": {
    title: "World Report - International News",
    description: "Global perspectives on today's most important stories",
    image: "/world-news-studio.jpg",
  },
  Finance: {
    title: "Market Watch - Financial News",
    description: "Real-time market analysis and business updates",
    image: "/financial-news-studio.jpg",
  },
  Sports: {
    title: "Game Highlights - Sports Coverage",
    description: "Live sports action and expert commentary",
    image: "/sports-broadcast-studio.jpg",
  },
  Entertainment: {
    title: "Celebrity Talk - Entertainment News",
    description: "The latest in movies, music, and pop culture",
    image: "/entertainment-talk-show.jpg",
  },
  Movies: {
    title: "Classic Cinema - Movie Channel",
    description: "Timeless films and cinematic masterpieces",
    image: "/movie-theater-screen.jpg",
  },
}

const channels = ["News 1", "News 2", "Finance", "Sports", "Entertainment", "Movies"]

interface LiveStreamsProps {
  selectedChannel: string
  onChannelChange?: (channel: string) => void
}

export function LiveStreams({ selectedChannel, onChannelChange }: LiveStreamsProps) {
  const content = channelContent[selectedChannel] || channelContent["News 1"]

  const currentIndex = channels.indexOf(selectedChannel)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < channels.length - 1

  const handlePrev = () => {
    if (canGoPrev && onChannelChange) {
      onChannelChange(channels[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (canGoNext && onChannelChange) {
      onChannelChange(channels[currentIndex + 1])
    }
  }

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
          <h2 className="text-xl font-bold">{selectedChannel}</h2>
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

      <Card className="overflow-hidden bg-card border-border">
        <div className="relative aspect-[16/9] bg-secondary">
          <img src={content.image || "/placeholder.svg"} alt="Live stream" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge variant="destructive" className="gap-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <Play className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <Volume2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <Maximize className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-base mb-0.5">{content.title}</h3>
          <p className="text-xs text-muted-foreground">{content.description}</p>
        </div>
      </Card>
    </div>
  )
}
