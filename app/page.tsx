"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DateCarousel } from "@/components/date-carousel"
import { LiveStreams } from "@/components/live-streams"
import { ChannelCarousel } from "@/components/channel-carousel"
import { TrendingList } from "@/components/trending-list"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Channel, Program } from "@/config"
import { channelsMap, programsMap } from "@/config"

function getTodayDateString() {
  const today = new Date()
  return today.toISOString().split("T")[0] // Returns YYYY-MM-DD
}

export default function HomePage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannelId, setSelectedChannelId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        // Step 1: Fetch all channels
        const channelsRes = await fetch('/api/test/channels', { method: 'GET' })
        const channelsJson = await channelsRes.json()
        if (!channelsJson.ok) {
          console.error('Failed to fetch channels:', channelsJson.error)
          return
        }
        
        // Get channels from Response.Infos
        const apiChannels = channelsJson?.data?.Response?.Infos || []
        
        // Step 2: For each channel, fetch program schedules
        const transformedChannels: Channel[] = await Promise.all(
          apiChannels.map(async (apiChannel: any) => {
            const channelId = apiChannel.Id || ""
            const channelName = apiChannel.Name || ""
            
            // Get channel info from config using Name field
            const configChannel = channelsMap[channelName] || null
            
            // Get playback URL from Outputs[0].PlaybackURL
            const playbackURL = apiChannel.Outputs?.[0]?.PlaybackURL || ""
            
            // Fetch program schedules for this channel
            let programs: Program[] = []
            try {
              const params = new URLSearchParams({
                channelId,
                timeWindow: String(7243600), // 7 days in seconds
                pageNum: '1',
                pageSize: '100'
              })
              const schedulesRes = await fetch(`/api/test/program-schedules?${params.toString()}`, { method: 'GET' })
              const schedulesJson = await schedulesRes.json()
              
              if (schedulesJson.ok) {
                // Get programs from Response.Infos
                const apiPrograms = schedulesJson?.data?.Response?.Infos || []
                
                programs = apiPrograms.map((program: any) => {
                  const programId = program.Id || ""
                  const programName = program.Name || ""
                  
                  // Get program info from config using Name field
                  const configProgram = programsMap[programName] || null
                  
                  const startTime = program.PlaybackConf?.StartTime || 0
                  const duration = program.PlaybackConf?.Duration || 0
                  const endTime = startTime + duration
                  const now = Math.floor(Date.now() / 1000)
                  
                  let status: "not-started" | "live" | "ended" = "not-started"
                  if (now >= startTime && now < endTime) {
                    status = "live"
                  } else if (now >= endTime) {
                    status = "ended"
                  }
                  
                  return {
                    programId,
                    programName: configProgram?.programName || programName || "",
                    programDescription: configProgram?.programDescription || "",
                    startTime,
                    duration,
                    endTime,
                    status,
                    viewers: 0,
                  }
                })
                
                // Sort programs by startTime
                programs.sort((a, b) => a.startTime - b.startTime)
              }
            } catch (error) {
              console.error(`Error fetching program schedules for channel ${channelId}:`, error)
            }
            
            // Find playing and next programs
            const liveProgram = programs.find((p: Program) => p.status === "live")
            const playingProgram = liveProgram || (programs.length > 0 ? programs.find((p: Program) => p.status === "not-started") : null) || {
              programId: "",
              programName: "",
              programDescription: "",
              startTime: 0,
              duration: 0,
              endTime: 0,
              status: "not-started" as const,
              viewers: 0,
            }
            
            // Find next program (the first not-started program after the playing program)
            const nextProgram = programs.find((p: Program) => 
              p.status === "not-started" && 
              p.startTime > (playingProgram?.startTime || 0)
            ) || {
              programId: "",
              programName: "",
              programDescription: "",
              startTime: 0,
              duration: 0,
              endTime: 0,
              status: "not-started" as const,
              viewers: 0,
            }
            
            return {
              channelId,
              channelName: configChannel?.channelName || channelName || "",
              channelDescription: configChannel?.channelDescription || "",
              image: configChannel?.image || "/placeholder.svg",
              playbackURL,
              playingProgram,
              nextProgram,
              schedules: programs,
            }
          })
        )
        
        setChannels(transformedChannels)
        if (transformedChannels.length > 0) {
          setSelectedChannelId(transformedChannels[0].channelId)
        }
      } catch (error) {
        console.error('Error fetching channels:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchChannels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDateSelect = (date: string) => {
    router.push(`/schedule?date=${encodeURIComponent(date)}`)
  }

  const handleChannelClick = (channelId: string) => {
    const todayDate = getTodayDateString()
    router.push(`/schedule?channel=${encodeURIComponent(channelId)}&date=${encodeURIComponent(todayDate)}`)
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
              <div className="lg:col-span-3">
                {selectedChannel && (
                  <LiveStreams 
                    channel={selectedChannel} 
                    channels={channels}
                    onChannelChange={(channelId) => setSelectedChannelId(channelId)} 
                  />
                )}
              </div>
              <div className="lg:col-span-1">
                <TrendingList />
              </div>
            </div>
            <div className="mt-8">
              <ChannelCarousel
                channels={channels}
                selectedChannelId={selectedChannelId}
                onChannelSelect={setSelectedChannelId}
                onChannelClick={handleChannelClick}
              />
            </div>
          </>
        )}
        {/* Test section */}
        <div className="mt-8 p-4 border rounded">
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
        </div>
      </div>
    </div>
  )
}
