"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Channel, Program } from "@/config"
import { channelsMap, programsMap } from "@/config"

interface ChannelsContextType {
  channels: Channel[]
  setChannels: (channels: Channel[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

const ChannelsContext = createContext<ChannelsContextType | undefined>(undefined)

export function ChannelsProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch if channels are empty
    if (channels.length > 0) {
      setLoading(false)
      return
    }

    const fetchChannels = async () => {
      try {
        setLoading(true)
        // Step 1: Fetch all channels
        const channelsRes = await fetch('/api/test/channels', { method: 'GET' })
        const channelsJson = await channelsRes.json()
        if (!channelsJson.ok) {
          console.error('Failed to fetch channels:', channelsJson.error)
          setLoading(false)
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
            let playbackURL = apiChannel.Outputs?.[0]?.PlaybackURL || ""
            
            // Special handling for ad_test2 channel (ID: 69122A121297E61CF092)
            // Playback endpoint prefix: http://1376254607.ap-singapore.streampackage.srclivepull.myqcloud.com/v1/ssai/master/019a6ef818a315fc60e9993680afb/
            // Need to concatenate prefix with the tail of PlaybackURL (e.g., 69122A121297E61CF092/ad2.m3u8)
            if (channelId === "69122A121297E61CF092") {
              const playbackEndpointPrefix = "https://1376254607.ap-singapore.streampackage.srclivepull.myqcloud.com/v1/ssai/master/019a6ef818a315fc60e9993680afb/"
              
              // Extract the tail from PlaybackURL
              // The tail should be in format: "69122A121297E61CF092/ad2.m3u8"
              let tail = playbackURL
              
              // If PlaybackURL is a full URL, extract the part after the last domain/path
              // Look for the channel ID in the URL to find where the tail starts
              const channelIdIndex = playbackURL.indexOf(channelId)
              if (channelIdIndex !== -1) {
                // Extract everything from channelId onwards
                tail = playbackURL.substring(channelIdIndex)
              } else {
                // If channelId is not found, try to extract the last path segment
                // Check if it already starts with channelId
                if (!playbackURL.startsWith(channelId)) {
                  // Extract the last part after the last '/'
                  const lastSlashIndex = playbackURL.lastIndexOf('/')
                  if (lastSlashIndex !== -1) {
                    tail = channelId + '/' + playbackURL.substring(lastSlashIndex + 1)
                  } else {
                    tail = channelId + '/' + playbackURL
                  }
                }
              }
              
              playbackURL = playbackEndpointPrefix + tail
            }
            
            // Fetch program schedules for this channel
            let programs: Program[] = []
            try {
              const params = new URLSearchParams({
                channelId,
                timeWindow: String(604800), // 7 days in seconds
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
      } catch (error) {
        console.error('Error fetching channels:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchChannels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return (
    <ChannelsContext.Provider value={{ channels, setChannels, loading, setLoading }}>
      {children}
    </ChannelsContext.Provider>
  )
}

export function useChannels() {
  const context = useContext(ChannelsContext)
  if (context === undefined) {
    throw new Error("useChannels must be used within a ChannelsProvider")
  }
  return context
}

