"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

const channels = [
  {
    name: "News 1",
    time: "00:37-01:22",
    program: "Morning Headlines",
    status: "live",
  },
  {
    name: "News 2",
    time: "01:00-02:00",
    program: "World Report",
    status: "upcoming",
  },
  {
    name: "Finance",
    time: "01:00-02:00",
    program: "Market Watch",
    status: "upcoming",
  },
  {
    name: "Sports",
    time: "00:23-01:30",
    program: "Game Highlights",
    status: "upcoming",
  },
  {
    name: "Entertainment",
    time: "01:00-04:00",
    program: "Celebrity Talk",
    status: "upcoming",
  },
  {
    name: "Movies",
    time: "00:37-02:19",
    program: "Classic Cinema",
    status: "upcoming",
  },
]

interface ChannelCarouselProps {
  selectedChannel: string
  onChannelSelect: (channel: string) => void
  onChannelClick?: (channel: string) => void
}

export function ChannelCarousel({ selectedChannel, onChannelSelect, onChannelClick }: ChannelCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6

  const totalPages = Math.ceil(channels.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const visibleChannels = channels.slice(startIndex, startIndex + itemsPerPage)

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleChannelClick = (channelName: string) => {
    onChannelSelect(channelName)
    if (onChannelClick) {
      onChannelClick(channelName)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Channels</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentPage === 0}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentPage === totalPages - 1}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-300">
        {visibleChannels.map((channel, index) => (
          <Card
            key={startIndex + index}
            onClick={() => handleChannelClick(channel.name)}
            className={cn(
              "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
              selectedChannel === channel.name && "ring-2 ring-primary bg-secondary/30",
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded bg-destructive flex items-center justify-center text-sm font-bold">
                  {channel.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{channel.name}</h3>
                  <p className="text-xs text-muted-foreground">{channel.time}</p>
                </div>
              </div>
              {channel.status === "live" && (
                <Badge variant="destructive" className="text-xs">
                  LIVE
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{channel.program}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
