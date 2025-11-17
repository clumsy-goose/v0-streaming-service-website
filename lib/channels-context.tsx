"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { Channel } from "@/config"

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

