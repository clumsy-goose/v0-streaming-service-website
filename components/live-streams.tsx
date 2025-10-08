import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Maximize, Settings, Volume2, Play, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LiveStreams() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Now</h2>
        <Badge variant="destructive" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          LIVE
        </Badge>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="relative aspect-video bg-secondary">
          <img src="/live-news-broadcast-studio.jpg" alt="Live stream" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge variant="destructive" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              LIVE
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Play className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">Evening News - Special Report</h3>
          <p className="text-sm text-muted-foreground">Live coverage of breaking news and current events</p>
        </div>
      </Card>
    </div>
  )
}
