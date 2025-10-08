import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-8 w-8 rounded bg-destructive" />
              <span className="text-xl font-bold">StreamTV</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="/schedule"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Schedule
            </Link>
            <Link
              href="/movies"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/shows"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Shows
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search shows..." className="w-64 pl-9 bg-secondary/50 border-border" />
          </div>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
