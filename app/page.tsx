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
              <div className="lg:col-span-1 flex">
                <TrendingList />
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
        </div> */}
      </div>
    </div>
  )
}
