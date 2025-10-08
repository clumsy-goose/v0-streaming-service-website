"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Volume2, Maximize, Settings, Share2, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function VideoPlayer() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1759918128-Zjwa9tISQaEaKHIlPeNsrjxmAsB9pc.png"
          alt="Video player"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge variant="destructive" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-destructive rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-9 w-9">
                <Play className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-9 w-9">
                <Volume2 className="h-5 w-5" />
              </Button>
              <span className="text-sm text-white">12:35 / 45:20</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-9 w-9">
                <Settings className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-9 w-9">
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Bookmark className="h-4 w-4" />
          Save
        </Button>
      </div>
    </Card>
  )
}
