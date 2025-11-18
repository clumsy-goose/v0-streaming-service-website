"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DateCarousel } from "@/components/date-carousel"
import { LiveStreams } from "@/components/live-streams"
import { ChannelCarousel } from "@/components/channel-carousel"
import { TrendingList } from "@/components/trending-list"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useChannels } from "@/lib/channels-context"
import type { Program } from "@/config"
import { programsMap } from "@/config"

function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}` // Returns YYYY-MM-DD in local timezone
}

export default function HomePage() {
  const { channels, loading } = useChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<string>("")
  const [programs, setPrograms] = useState<Program[]>([])
  const [programsLoading, setProgramsLoading] = useState(false)
  const router = useRouter()
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isUserInteractingRef = useRef(false)
  const isHoveringLiveStreamsRef = useRef(false)

  // Set default selected channel when channels are loaded
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].channelId)
    }
  }, [channels, selectedChannelId])

  // 整合数据：获取所有节目的观看量并生成 Program[] 数组
  useEffect(() => {
    const fetchAllPrograms = async () => {
      if (channels.length === 0) return

      try {
        setProgramsLoading(true)

        // 1. 获取所有观看量数据
        const viewsRes = await fetch('/program-views/get')
        // console.log("🚀 ~ fetchAllPrograms ~ viewsRes:", viewsRes);
        const viewsJson = await viewsRes.json()
        // console.log("🚀 ~ fetchAllPrograms ~ viewsJson:", viewsJson);
        const viewsData = viewsJson.ok ? viewsJson.data || {} : {}
        console.log("🚀 ~ fetchAllPrograms ~ viewsData:", viewsData);

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
          // 如果已存在相同的 programId，保留开始时间更早的（或可以根据需要保留最新的）
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

  useEffect(() => {
    console.log("programs", programs)
  }, [programs])

  // 自动轮播：每5秒切换到下一个频道
  useEffect(() => {
    if (channels.length <= 1 || !selectedChannelId) return

    // 清除之前的定时器
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)
    }

    // 设置新的定时器
    autoPlayIntervalRef.current = setInterval(() => {
      // 如果用户正在交互或鼠标悬停在 LiveStreams 上，跳过本次自动切换
      if (isUserInteractingRef.current) {
        isUserInteractingRef.current = false
        return
      }
      if (isHoveringLiveStreamsRef.current) {
        return
      }

      const currentIndex = channels.findIndex(c => c.channelId === selectedChannelId)
      if (currentIndex !== -1) {
        // 切换到下一个频道，如果到达末尾则循环回到第一个
        const nextIndex = (currentIndex + 1) % channels.length
        setSelectedChannelId(channels[nextIndex].channelId)
      }
    }, 3000) // 3秒

    // 清理函数
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [channels, selectedChannelId])

  const handleDateSelect = (date: string) => {
    router.push(`/schedule?date=${encodeURIComponent(date)}`)
  }

  const handleChannelClick = (channelId: string) => {
    const todayDate = getTodayDateString()
    console.log('[home] todayDate', todayDate);
    router.push(`/schedule?channel=${encodeURIComponent(channelId)}&date=${encodeURIComponent(todayDate)}`)
  }

  const handleChannelSelect = (channelId: string) => {
    // 标记用户正在交互，暂停自动轮播一次
    isUserInteractingRef.current = true
    setSelectedChannelId(channelId)
  }
  
  const selectedChannel = channels.find(c => c.channelId === selectedChannelId)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <DateCarousel onDateSelect={handleDateSelect} onViewSchedule={() => router.push("/schedule")} />
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : channels.length === 0 ? (
          <div className="text-center py-8">暂无频道数据</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div 
                className="lg:col-span-3"
                onMouseEnter={() => {
                  isHoveringLiveStreamsRef.current = true
                }}
                onMouseLeave={() => {
                  isHoveringLiveStreamsRef.current = false
                }}
              >
                {selectedChannel && (
                  <LiveStreams 
                    channel={selectedChannel} 
                    channels={channels}
                    onChannelChange={(channelId) => setSelectedChannelId(channelId)} 
                  />
                )}
              </div>
              <div className="lg:col-span-1 flex min-w-0">
                <TrendingList programs={programs} programsLoading={programsLoading} />
              </div>
            </div>
            <div className="mt-8">
              <ChannelCarousel
                channels={channels}
                selectedChannelId={selectedChannelId}
                onChannelSelect={handleChannelSelect}
                onChannelClick={handleChannelClick}
              />
            </div>
          </>
        )}
        {/* Test section */}
        {/* <div className="mt-8 p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">测试：获取全部频道</h3>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
            onClick={async () => {
              try {
                const res = await fetch('/api/test/channels', { method: 'GET' })
                const json = await res.json()
                if (!json.ok) {
                  alert(`请求失败: ${json.error || 'unknown error'}`)
                  return
                }
                const total = json?.data?.Response?.TotalNum ?? json?.data?.Response?.TotalCount ?? (json?.data?.Channels?.length ?? 0)
                alert(`请求成功，返回频道数：${total}`)
                // Console for dev inspection
                console.log('DescribeStreamPackageLinearAssemblyChannels result:', json.data)
              } catch (e: any) {
                alert(`异常: ${e?.message || e}`)
              }
            }}
          >
            获取全部频道（测试）
          </button>
          <div className="h-4" />
          <h3 className="text-lg font-semibold mb-2">测试：获取频道节目单</h3>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
            onClick={async () => {
              try {
                const channelId = window.prompt('请输入 ChannelId：') || ''
                if (!channelId) return
                const params = new URLSearchParams({ channelId, timeWindow: String(7243600), pageNum: '1', pageSize: '10' })
                const res = await fetch(`/api/test/program-schedules?${params.toString()}`, { method: 'GET' })
                const json = await res.json()
                if (!json.ok) {
                  alert(`请求失败: ${json.error || 'unknown error'}`)
                  return
                }
                const total = json?.data?.Response?.TotalNum ?? json?.data?.Response?.TotalCount ?? (json?.data?.ProgramSchedules?.length ?? 0)
                alert(`请求成功，节目单条目数：${total}`)
                console.log('DescribeStreamPackageLinearAssemblyProgramSchedules result:', json.data)
              } catch (e: any) {
                alert(`异常: ${e?.message || e}`)
              }
            }}
          >
            获取频道节目单（测试）
          </button>
          <div className="h-4" />
          <h3 className="text-lg font-semibold mb-2">测试：获取频道节目</h3>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
            onClick={async () => {
              try {
                const channelId = window.prompt('请输入 ChannelId：') || ''
                if (!channelId) return
                const params = new URLSearchParams({ channelId, pageNum: '1', pageSize: '10' })
                const res = await fetch(`/api/test/programs?${params.toString()}`, { method: 'GET' })
                const json = await res.json()
                if (!json.ok) {
                  alert(`请求失败: ${json.error || 'unknown error'}`)
                  return
                }
                const total = json?.data?.Response?.TotalNum ?? json?.data?.Response?.TotalCount ?? (json?.data?.Programs?.length ?? 0)
                alert(`请求成功，节目数：${total}`)
                console.log('DescribeStreamPackageLinearAssemblyPrograms result:', json.data)
              } catch (e: any) {
                alert(`异常: ${e?.message || e}`)
              }
            }}
          >
            获取频道节目（测试）
          </button>
        </div> */}
      </div>
    </div>
  )
}
