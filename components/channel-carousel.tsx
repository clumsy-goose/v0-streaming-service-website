"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Channel } from "@/config"

interface ChannelCarouselProps {
  channels: Channel[]
  selectedChannelId: string
  onChannelSelect: (channelId: string) => void
  onChannelClick?: (channelId: string) => void
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

function formatTimeRange(startTime: number, endTime: number): string {
  return `${formatTime(startTime)}-${formatTime(endTime)}`
}

export function ChannelCarousel({ channels, selectedChannelId, onChannelSelect, onChannelClick }: ChannelCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6

  const totalPages = Math.ceil(channels.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const visibleChannels = channels.slice(startIndex, startIndex + itemsPerPage)

  // 当 selectedChannelId 变化时，自动调整页面以确保选中的频道可见
  useEffect(() => {
    if (!selectedChannelId || channels.length === 0) return

    const selectedIndex = channels.findIndex(c => c.channelId === selectedChannelId)
    if (selectedIndex === -1) return

    // 计算选中的频道应该在哪一页
    const targetPage = Math.floor(selectedIndex / itemsPerPage)
    
    // 使用函数式更新，只在需要时切换页面
    setCurrentPage((prevPage) => {
      if (targetPage !== prevPage) {
        return targetPage
      }
      return prevPage
    })
  }, [selectedChannelId, channels, itemsPerPage])

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleChannelClick = (channelId: string) => {
    onChannelSelect(channelId)
    if (onChannelClick) {
      onChannelClick(channelId)
    }
  }

  const handleChannelHover = (channelId: string) => {
    // 鼠标悬浮时，更新选中的频道
    onChannelSelect(channelId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">频道列表</h2>
        {/* <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentPage === 0}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentPage === totalPages - 1}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div> */}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 transition-all duration-300">
        {visibleChannels.map((channel, index) => {
          const playingProgram = channel.playingProgram
          const timeRange = playingProgram ? formatTimeRange(playingProgram.startTime, playingProgram.endTime) : ""
          const isLive = playingProgram?.status === "live"
          
          return (
            <Card
              key={channel.channelId}
              onClick={() => handleChannelClick(channel.channelId)}
              onMouseEnter={() => handleChannelHover(channel.channelId)}
              className={cn(
                "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
                selectedChannelId === channel.channelId && "ring-2 ring-primary bg-secondary/30",
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {channel.image ? (
                    <img 
                      src={channel.image} 
                      alt={channel.channelName}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-destructive flex items-center justify-center text-sm font-bold">
                      {channel.channelName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">{channel.channelName}</h3>
                    {timeRange && (
                      <p className="text-xs text-muted-foreground">{timeRange}</p>
                    )}
                  </div>
                </div>
                {isLive && (
                  <Badge variant="destructive" className="text-xs">
                    LIVE
                  </Badge>
                )}
              </div>
              {playingProgram && (
                <p className="text-sm text-muted-foreground">{playingProgram.programName}</p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
