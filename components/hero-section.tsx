"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useChannels } from "@/lib/channels-context"

export function HeroSection() {
  const router = useRouter()
  const { channels } = useChannels()

  const getTodayDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}` // Returns YYYY-MM-DD in local timezone
  }

  const handleWatchLive = () => {
    if (channels.length === 0) return
    
    const defaultChannel = channels[0]
    const today = getTodayDateString()
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const time = `${hours}:${minutes}`
    const programName = defaultChannel.playingProgram?.programName || "直播"
    
    router.push(
      `/watch?channel=${encodeURIComponent(defaultChannel.channelId)}&date=${today}&time=${time}&title=${encodeURIComponent(programName)}`
    )
  }

  const handleViewSchedule = () => {
    const today = getTodayDateString()
    router.push(`/schedule?date=${today}`)
  }

  return (
    <section className="relative h-[250px] w-full overflow-hidden bg-secondary">
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Stream TV: 观看免费直播</h1>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">
          Stream TV 是一项免费的在线流媒体服务,以带广告的直播流媒体形式提供频道内容，用户可以免费观看这些频道的内容
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="gap-2" onClick={handleWatchLive}>
              <Play className="h-5 w-5" />
              观看直播
            </Button>
            <Button size="lg" variant="outline" onClick={handleViewSchedule}>
              查看节目表
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
