"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useSWR("/api/leaderboard", fetcher)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200"
      case 2:
        return "bg-gray-50 border-gray-200"
      case 3:
        return "bg-amber-50 border-amber-200"
      default:
        return "bg-card border-border"
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top recyclers in the community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Recyclers</CardTitle>
          <CardDescription>
            Rankings based on total points earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No recycling data yet. Be the first to log your recycling!
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry: {
                rank: number
                userId: string
                name: string
                email: string
                totalPoints: number
                totalWeight: number
              }) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                    getRankStyle(entry.rank)
                  )}
                >
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {entry.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.totalWeight?.toFixed(1)} kg recycled
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {entry.totalPoints?.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
