import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Program, Channel } from "@/config"
import { useMemo } from "react"
import { useChannels } from "@/lib/channels-context"

interface TrendingListProps {
  programs?: Program[]
  programsLoading?: boolean
}

function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

export function TrendingList({ programs = [], programsLoading = false }: TrendingListProps) {
  const router = useRouter()
  const { channels } = useChannels()

  // 根据 viewers 排序，取前5条
  const trending = useMemo(() => {
    if (!programs || programs.length === 0) return []

    return programs
      .slice()
      .sort((a, b) => b.viewers - a.viewers)
      .slice(0, 5)
      .map((program, index) => {
        // 找到节目对应的频道
        const channel = channels.find(ch => 
          ch.playingProgram?.programId === program.programId || 
          ch.schedules.some(p => p.programId === program.programId)
        )

        return {
          rank: index + 1,
          programId: program.programId,
          title: program.programName,
          views: program.viewers,
          program: program,
          channel: channel || null,
        }
      })
  }, [programs, channels])

  const handleViewAll = () => {
    router.push("/rank")
  }

  const handleProgramClick = (program: Program, channel: Channel | null) => {
    if (!channel) return

    const today = getTodayDateString()
    const time = formatTime(program.startTime)
    router.push(
      `/watch?channel=${encodeURIComponent(channel.channelId)}&date=${today}&time=${time}&title=${encodeURIComponent(program.programName)}`
    )
  }

  return (
    <Card className="p-6 h-full w-full min-w-0 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-bold">热榜</h2>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto min-h-[200px]">
        {programsLoading ? (
          // Loading 状态：使用骨架屏保持宽度
          Array.from({ length: 5 }).map((_, index) => (
            <div key={`loading-${index}`} className="flex gap-4 p-3">
              <div className="h-8 w-8 rounded bg-muted animate-pulse shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : trending.length === 0 ? (
          // 无数据状态：保持宽度不变
          <div className="text-center py-8 text-sm text-muted-foreground min-h-[200px] flex items-center justify-center">
            暂无数据
          </div>
        ) : (
          trending.map((item) => {
            const isTopThree = item.rank <= 3
            const isClickable = !!item.channel
            return (
              <div
                key={item.programId}
                onClick={() => isClickable && handleProgramClick(item.program, item.channel)}
                className={cn(
                  "flex gap-4 p-3 rounded-lg transition-colors",
                  isClickable 
                    ? "hover:bg-secondary/50 cursor-pointer" 
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded font-bold shrink-0",
                    isTopThree
                      ? "bg-destructive text-white"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.views} 观看</p>
                </div>
              </div>
            )
          })
        )}
      </div>
      <button 
        onClick={handleViewAll}
        className="w-full mt-4 text-sm text-primary hover:underline shrink-0 cursor-pointer"
      >
        查看总榜 →
      </button>
    </Card>
  )
}
