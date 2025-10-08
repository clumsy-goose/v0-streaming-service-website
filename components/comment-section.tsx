import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function CommentSection() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Comments (142)</h2>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea placeholder="Add a comment..." className="min-h-[80px] resize-none" />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button size="sm">Comment</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
