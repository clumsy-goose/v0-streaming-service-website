import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

const trending = [
  { rank: 1, title: "2023-2024赛季 NBA 总决赛第五场", views: "2021" },
  { rank: 2, title: "2023-2024赛季 NBA 总决赛第一场", views: "1981" },
  { rank: 3, title: "2025世界斯诺克锦标赛决赛(第四阶段)", views: "1861" },
  { rank: 4, title: "2025世界斯诺克锦标赛第一轮(第一阶段)", views: "1741" },
  { rank: 5, title: "第 1 期上:王勉欢乐开场,李宇春脱口秀首秀", views: "1621" },
  // { rank: 6, title: "Weather: Storm Warning Issued", views: "850K" },
]

export function TrendingList() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-bold">热榜</h2>
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
      <button className="w-full mt-4 text-sm text-primary hover:underline">查看总榜 →</button>
    </Card>
  )
}
