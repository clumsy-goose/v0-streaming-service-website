"use client"

import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Play, Eye } from "lucide-react"
import { useChannels } from "@/lib/channels-context"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Program } from "@/config"
import { cn } from "@/lib/utils"
import { programsMap } from "@/config"

function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}` // Returns YYYY-MM-DD in local timezone
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

export default function RankPage() {
  const { channels, loading } = useChannels()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [programsLoading, setProgramsLoading] = useState(false)

  // 获取所有 programs 数据（与首页相同的逻辑）
  useEffect(() => {
    const fetchAllPrograms = async () => {
      if (channels.length === 0) return

      try {
        setProgramsLoading(true)

        // 1. 获取所有观看量数据
        const viewsRes = await fetch('/program-views/get')
        const viewsJson = await viewsRes.json()
        const viewsData = viewsJson.ok ? viewsJson.data || {} : {}

        // 2. 获取所有频道
        const channelsRes = await fetch('/api/test/channels')
        const channelsJson = await channelsRes.json()
        if (!channelsJson.ok) {
          console.error('Failed to fetch channels:', channelsJson.error)
          setProgramsLoading(false)
          return
        }

        const apiChannels = channelsJson?.data?.Response?.Infos || []
        const allPrograms: Program[] = []

        // 3. 对于每个频道，获取 program-schedules 和 programs
        for (const apiChannel of apiChannels) {
          const channelId = apiChannel.Id || ""

          // 获取 program-schedules
          try {
            const schedulesParams = new URLSearchParams({
              channelId,
              timeWindow: String(604800), // 7 days
              pageNum: '1',
              pageSize: '100'
            })
            const schedulesRes = await fetch(`/api/test/program-schedules?${schedulesParams.toString()}`)
            const schedulesJson = await schedulesRes.json()

            if (schedulesJson.ok) {
              const apiPrograms = schedulesJson?.data?.Response?.Infos || []

              // 获取 programs（可选，用于获取更详细的信息）
              let programsData: any[] = []
              try {
                const programsParams = new URLSearchParams({
                  channelId,
                  pageNum: '1',
                  pageSize: '100'
                })
                const programsRes = await fetch(`/api/test/programs?${programsParams.toString()}`)
                const programsJson = await programsRes.json()
                if (programsJson.ok) {
                  programsData = programsJson?.data?.Response?.Infos || []
                }
              } catch (error) {
                console.error(`Error fetching programs for channel ${channelId}:`, error)
              }

              // 整合数据
              for (const scheduleProgram of apiPrograms) {
                const programId = scheduleProgram.Id || ""
                const programName = scheduleProgram.Name || ""
                const startTime = scheduleProgram.PlaybackConf?.StartTime || 0
                const duration = scheduleProgram.PlaybackConf?.Duration || 0
                const endTime = startTime + duration
                const now = Math.floor(Date.now() / 1000)

                // 从 programs 数据中获取更详细的信息
                const programDetail = programsData.find((p: any) => p.Id === programId)

                // 从 config.ts 的 programsMap 获取 programName 和 programDescription
                // 使用 programName 作为映射的 key
                const configProgram = programsMap[programName] || null

                let status: "not-started" | "live" | "ended" = "not-started"
                if (now >= startTime && now < endTime) {
                  status = "live"
                } else if (now >= endTime) {
                  status = "ended"
                }

                // 获取观看量
                const viewData = viewsData[programId] || { total: 0, daily: {} }

                const program: Program = {
                  programId,
                  programName: configProgram?.programName || programDetail?.Name || programName || "",
                  programDescription: configProgram?.programDescription || programDetail?.Description || "",
                  startTime,
                  duration,
                  endTime,
                  status,
                  viewers: viewData.total || 0,
                }

                allPrograms.push(program)
              }
            }
          } catch (error) {
            console.error(`Error fetching data for channel ${channelId}:`, error)
          }
        }

        // 按开始时间排序
        allPrograms.sort((a, b) => a.startTime - b.startTime)

        // 对 programs 去重（根据 programId）
        const uniqueProgramsMap = new Map<string, Program>()
        for (const program of allPrograms) {
          // 如果已存在相同的 programId，保留开始时间更早的
          const existing = uniqueProgramsMap.get(program.programId)
          if (!existing || program.startTime < existing.startTime) {
            uniqueProgramsMap.set(program.programId, program)
          }
        }
        
        // 转换为数组并按开始时间排序
        const uniquePrograms = Array.from(uniqueProgramsMap.values())
        uniquePrograms.sort((a, b) => a.startTime - b.startTime)

        setPrograms(uniquePrograms)
      } catch (error) {
        console.error('Error fetching all programs:', error)
      } finally {
        setProgramsLoading(false)
      }
    }

    fetchAllPrograms()
  }, [channels])

  // 根据 viewers 排序
  const trendingPrograms = useMemo(() => {
    if (!programs || programs.length === 0) return []

    // 需要找到每个 program 对应的频道信息
    const programsWithChannel: Array<Program & { channelId: string; channelName: string; channelImage: string }> = []

    programs.forEach((program) => {
      // 从 channels 中找到包含该 program 的频道
      const channel = channels.find(ch => 
        ch.playingProgram?.programId === program.programId || 
        ch.schedules.some(p => p.programId === program.programId)
      )

      if (channel) {
        programsWithChannel.push({
          ...program,
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelImage: channel.image,
        })
      }
    })

    // 按 viewers 降序排序
    return programsWithChannel
      .sort((a, b) => b.viewers - a.viewers)
  }, [programs, channels])

  const handleProgramClick = (program: Program & { channelId: string; channelName: string }) => {
    if (program.status !== "live") return

    const today = getTodayDateString()
    const time = formatTime(program.startTime)
    router.push(
      `/watch?channel=${encodeURIComponent(program.channelId)}&date=${today}&time=${time}&title=${encodeURIComponent(program.programName)}`
    )
  }

  if (loading || programsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-destructive" />
            <h1 className="text-4xl font-bold">热榜</h1>
          </div>
          <p className="text-muted-foreground">最受欢迎的直播节目排行</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trendingPrograms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">暂无热门节目</div>
          ) : (
            trendingPrograms.map((program, index) => {
              const rank = index + 1
              const isTopThree = rank <= 3
              const isClickable = program.status === "live"

              return (
                <Card
                  key={`${program.channelId}-${program.programId}`}
                  className={cn(
                    "p-6 transition-all hover:shadow-lg",
                    isClickable && "cursor-pointer hover:border-primary",
                    !isClickable && "opacity-75"
                  )}
                  onClick={() => isClickable && handleProgramClick(program)}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        "flex items-center justify-center h-12 w-12 rounded-lg font-bold text-lg shrink-0",
                        isTopThree
                          ? "bg-destructive text-white"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {rank}
                    </div>

                    {/* Program Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2 flex-1">{program.programName}</h3>
                        {program.status === "live" && (
                          <Badge variant="destructive" className="shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>

                      {program.programDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {program.programDescription}
                        </p>
                      )}

                      {/* Channel Info */}
                      <div className="flex items-center gap-3 mb-3">
                        {program.channelImage ? (
                          <img
                            src={program.channelImage}
                            alt={program.channelName}
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded bg-destructive flex items-center justify-center text-xs font-bold">
                            {program.channelName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium">{program.channelName}</span>
                      </div>

                      {/* Time and Views */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          <span>{formatTime(program.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{program.viewers || 0} 观看</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

