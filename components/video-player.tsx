"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react"
import type { Channel } from "@/config"

interface VideoPlayerProps {
  channel: Channel
  programTime?: string
}

export function VideoPlayer({ channel, programTime }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !channel.playbackURL) return

    const cleanup = () => {
      if (hlsRef.current) {
        console.log("[v0] Destroying previous HLS instance")
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }

    cleanup()

    const hlsUrl = channel.playbackURL

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl
      console.log("[v0] Loading HLS stream natively for", channel.channelName, programTime)
    } else if (typeof window !== "undefined") {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          })
          hlsRef.current = hls

          hls.loadSource(hlsUrl)
          hls.attachMedia(video)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("[v0] HLS manifest loaded for", channel.channelName, programTime)
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.log("[v0] Fatal HLS error:", data)
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError()
                  break
                default:
                  cleanup()
                  break
              }
            }
          })
        }
      })
    }

    return cleanup
  }, [channel.playbackURL, channel.channelId, programTime])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="w-full h-full" playsInline />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="flex items-center gap-2 bg-destructive/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white">LIVE</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
