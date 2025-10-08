import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const videos = [
  {
    title: "Morning News Highlights",
    duration: "28:42",
    views: "1.2M",
    thumbnail: "news studio with anchors",
  },
  {
    title: "Sports Update: Championship Finals",
    duration: "15:30",
    views: "850K",
    thumbnail: "sports arena",
  },
  {
    title: "Weather Forecast: Week Ahead",
    duration: "8:15",
    views: "620K",
    thumbnail: "weather map",
  },
  {
    title: "Market Analysis: Tech Stocks",
    duration: "22:10",
    views: "540K",
    thumbnail: "stock market charts",
  },
]

export function RelatedVideos() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Up Next</h2>
      {videos.map((video, index) => (
        <Card key={index} className="overflow-hidden hover:bg-secondary/50 transition-colors cursor-pointer">
          <div className="flex gap-3 p-3">
            <div className="relative w-40 shrink-0 aspect-video bg-secondary rounded overflow-hidden">
              <img
                src={`/.jpg?height=90&width=160&query=${video.thumbnail}`}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1">
                <Badge variant="secondary" className="text-xs">
                  {video.duration}
                </Badge>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{video.title}</h3>
              <p className="text-xs text-muted-foreground">{video.views} views</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
