import { Header } from "@/components/header"
import { VideoPlayer } from "@/components/video-player"
import { RelatedVideos } from "@/components/related-videos"
import { CommentSection } from "@/components/comment-section"

export default function WatchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer />
            <div>
              <h1 className="text-2xl font-bold mb-2">Stream TV: Watch Free Live TV</h1>
              <p className="text-muted-foreground">
                Stream TV 是一项免费的在线流媒体服务,以带广告的直播流媒体形式提供频道内容，用户可以免费观看这些频道的内容
              </p>
            </div>
            <CommentSection />
          </div>
          <div className="lg:col-span-1">
            <RelatedVideos />
          </div>
        </div>
      </div>
    </div>
  )
}
