"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[250px] w-full overflow-hidden bg-secondary">
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Stream TV: Watch Free Live TV</h1>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">
          Stream TV 是一项免费的在线流媒体服务,以带广告的直播流媒体形式提供频道内容，用户可以免费观看这些频道的内容
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Watch Live
            </Button>
            <Button size="lg" variant="outline">
              View Schedule
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
