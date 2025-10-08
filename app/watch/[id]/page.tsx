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
              <h1 className="text-2xl font-bold mb-2">Breaking News: Special Coverage</h1>
              <p className="text-muted-foreground">
                Live coverage of today's most important stories from around the world
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
