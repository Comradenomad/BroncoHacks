"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Recycle, Leaf, Trophy, TrendingUp } from "lucide-react"
import { MaterialChart } from "@/components/charts/material-chart"
import { WeeklyChart } from "@/components/charts/weekly-chart"
import { RecentEntries } from "@/components/recent-entries"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: stats, isLoading } = useSWR("/api/stats", fetcher)
  const { data: entries } = useSWR("/api/recycling", fetcher)
  const [mounted, setMounted] = useState(false)
  const [latestEvent, setLatestEvent] = useState<any | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let isActive = true

    const loadLatestEvent = async () => {
      try {
        const response = await fetch("/api/events")
        const data = await response.json()

        if (!isActive) return

        const events = Array.isArray(data) ? data : data?.events
        const mostRecentEvent = Array.isArray(events) && events.length > 0 ? events[0] : null
        setLatestEvent(mostRecentEvent)
      } catch {
        if (isActive) {
          setLatestEvent(null)
        }
      }
    }

    loadLatestEvent()
    const interval = setInterval(loadLatestEvent, 2000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your recycling impact</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalStats = stats?.totalStats || { totalWeight: 0, totalPoints: 0, totalEntries: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {stats?.user?.name || "Recycler"}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.user?.points?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalWeight?.toFixed(1) || 0} kg</div>
            <p className="text-xs text-muted-foreground">Materials recycled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalEntries || 0}</div>
            <p className="text-xs text-muted-foreground">Recycling submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CO2 Saved</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalStats.totalWeight || 0) * 2.5).toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">Estimated emissions saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Materials Breakdown</CardTitle>
            <CardDescription>Distribution of recycled materials</CardDescription>
          </CardHeader>
          <CardContent>
            <MaterialChart data={stats?.materialStats || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Recycling over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={stats?.weeklyData || []} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>Your latest recycling submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentEntries entries={entries || []} />
        </CardContent>
      </Card>

      <section className="flex justify-center">
        <Card className="w-full max-w-2xl rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Live Smart Bin Feed</CardTitle>
            <CardDescription>Most recent scan from the smart bin</CardDescription>
          </CardHeader>
          <CardContent>
            {latestEvent ? (
              <div className="space-y-4 text-center">
                {latestEvent.image ? (
                  <img
                    src={`data:image/jpeg;base64,${latestEvent.image}`}
                    alt={latestEvent.item_type || "Smart bin scan"}
                    className="mx-auto max-h-80 w-full rounded-xl object-cover"
                  />
                ) : null}
                <div className="space-y-2">
                  <p className="text-lg font-semibold capitalize">
                    {latestEvent.item_type || "Unknown item"}
                  </p>
                  <p className="text-muted-foreground">
                    Confidence: {Math.round((latestEvent.confidence || 0) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {latestEvent.timestamp
                      ? new Date(latestEvent.timestamp).toLocaleString()
                      : "Timestamp unavailable"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Waiting for first scan...</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
