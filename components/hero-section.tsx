"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1759917856-Yf1NxKylpDoEYvRQckcWI7oOkg7pXC.png)",
          backgroundPosition: "center 20%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Breaking News: Special Coverage</h1>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">
            Watch live coverage of today's most important stories from around the world
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
