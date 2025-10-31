"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DateCarousel } from "@/components/date-carousel"
import { LiveStreams } from "@/components/live-streams"
import { ChannelCarousel } from "@/components/channel-carousel"
import { TrendingList } from "@/components/trending-list"
import { useState } from "react"
import { useRouter } from "next/navigation"

function getTodayDateString() {
  const today = new Date()
  return today.toISOString().split("T")[0] // Returns YYYY-MM-DD
}

export default function HomePage() {
  const [selectedChannel, setSelectedChannel] = useState("News 1")
  const router = useRouter()

  const handleDateSelect = (date: string) => {
    router.push(`/schedule?date=${encodeURIComponent(date)}`)
  }

  const handleChannelClick = (channel: string) => {
    const todayDate = getTodayDateString()
    router.push(`/schedule?channel=${encodeURIComponent(channel)}&date=${encodeURIComponent(todayDate)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <DateCarousel onDateSelect={handleDateSelect} onViewSchedule={() => router.push("/schedule")} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <LiveStreams selectedChannel={selectedChannel} onChannelChange={setSelectedChannel} />
          </div>
          <div className="lg:col-span-1">
            <TrendingList />
          </div>
        </div>
        <div className="mt-8">
          <ChannelCarousel
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
            onChannelClick={handleChannelClick}
          />
        </div>
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
