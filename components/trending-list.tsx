import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

const trending = [
  { rank: 1, title: "Breaking: Major Policy Announcement", views: "2.4M" },
  { rank: 2, title: "Sports: Championship Finals Tonight", views: "1.8M" },
  { rank: 3, title: "Tech: New Innovation Unveiled", views: "1.5M" },
  { rank: 4, title: "Entertainment: Award Show Highlights", views: "1.2M" },
  { rank: 5, title: "Finance: Market Analysis Update", views: "980K" },
  { rank: 6, title: "Weather: Storm Warning Issued", views: "850K" },
]

export function TrendingList() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-bold">Trending Now</h2>
      </div>
      <div className="space-y-4">
        {trending.map((item) => (
          <div
            key={item.rank}
            className="flex gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded bg-primary/10 text-primary font-bold shrink-0">
              {item.rank}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.views} views</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-sm text-primary hover:underline">View All Trending →</button>
    </Card>
  )
}
