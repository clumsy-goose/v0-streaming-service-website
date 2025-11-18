"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react"
import type { Program } from "@/config"
import { programsMap } from "@/config"
import { useChannels } from "./channels-context"

interface ProgramsContextType {
  programs: Program[]
  loading: boolean
  refreshPrograms: () => Promise<void>
}

const ProgramsContext = createContext<ProgramsContextType | undefined>(undefined)

export function ProgramsProvider({ children }: { children: ReactNode }) {
  const { channels } = useChannels()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(false)
  const fetchingRef = useRef(false) // 防止重复请求
  const hasFetchedRef = useRef(false) // 标记是否已获取过数据

  const fetchAllPrograms = useCallback(async () => {
    // 防止重复请求
    if (fetchingRef.current) {
      return
    }

    // 如果 channels 还没加载完成，等待
    if (channels.length === 0) {
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)

      // 1. 获取所有观看量数据
      const viewsRes = await fetch('/program-views/get')
      const viewsJson = await viewsRes.json()
      const viewsData = viewsJson.ok ? viewsJson.data || {} : {}

      // 2. 获取所有频道
      const channelsRes = await fetch('/api/test/channels')
      const channelsJson = await channelsRes.json()
      if (!channelsJson.ok) {
        console.error('Failed to fetch channels:', channelsJson.error)
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
      hasFetchedRef.current = true
    } catch (error) {
      console.error('Error fetching all programs:', error)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [channels])

  // 刷新数据的方法
  const refreshPrograms = useCallback(async () => {
    hasFetchedRef.current = false
    await fetchAllPrograms()
  }, [fetchAllPrograms])

  useEffect(() => {
    // 只在 channels 加载完成且未获取过数据时获取
    // 使用 hasFetchedRef 和 fetchingRef 防止重复请求和无限循环
    if (channels.length > 0 && !hasFetchedRef.current && !fetchingRef.current) {
      fetchAllPrograms()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels.length]) // 只依赖 channels.length，避免函数引用变化导致的重复执行

  return (
    <ProgramsContext.Provider value={{ programs, loading, refreshPrograms }}>
      {children}
    </ProgramsContext.Provider>
  )
}

export function usePrograms() {
  const context = useContext(ProgramsContext)
  if (context === undefined) {
    throw new Error("usePrograms must be used within a ProgramsProvider")
  }
  return context
}

