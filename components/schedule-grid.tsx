import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const channels = [
  {
    id: 1,
    name: "News 1",
    logo: "N1",
    time: "00:37-01:22",
    currentShow: "Morning Headlines",
  },
  {
    id: 2,
    name: "News 2",
    logo: "N2",
    time: "01:00-02:00",
    currentShow: "World Report",
  },
  {
    id: 3,
    name: "Finance",
    logo: "FN",
    time: "01:00-02:00",
    currentShow: "Market Analysis",
  },
  {
    id: 4,
    name: "Sports",
    logo: "SP",
    time: "00:23-01:30",
    currentShow: "Game Highlights",
  },
  {
    id: 5,
    name: "Entertainment",
    logo: "EN",
    time: "01:00-04:00",
    currentShow: "Celebrity Talk",
  },
  {
    id: 6,
    name: "Movies",
    logo: "MV",
    time: "00:37-02:19",
    currentShow: "Classic Cinema",
  },
]

const schedule = [
  { time: "12:35", title: "Today's News - Episode 182", status: "replay" },
  { time: "13:11", title: "Documentary Series Ep 2", status: "replay" },
  { time: "13:59", title: "Documentary Series Ep 3", status: "replay" },
  { time: "14:52", title: "Documentary Series Ep 4", status: "live" },
  { time: "15:41", title: "Documentary Series Ep 5", status: "upcoming" },
  { time: "16:30", title: "Documentary Series Ep 6", status: "upcoming" },
]

export function ScheduleGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Channels</h2>
        {channels.map((channel) => (
          <Card key={channel.id} className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded bg-destructive flex items-center justify-center font-bold">
                {channel.logo}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{channel.name}</h3>
                <p className="text-xs text-muted-foreground">{channel.time}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{channel.currentShow}</p>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-3">
        <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          {schedule.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-muted-foreground">{item.time}</span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                </div>
                <div>
                  {item.status === "live" && <Badge variant="destructive">Live Now</Badge>}
                  {item.status === "replay" && (
                    <Button variant="outline" size="sm">
                      Replay
                    </Button>
                  )}
                  {item.status === "upcoming" && <Badge variant="secondary">Upcoming</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
