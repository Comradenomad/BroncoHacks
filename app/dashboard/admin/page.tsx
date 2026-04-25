"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Recycle, TrendingUp, BarChart3 } from "lucide-react"
import { AdminActivityChart } from "@/components/charts/admin-activity-chart"
import { AdminMaterialChart } from "@/components/charts/admin-material-chart"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminPage() {
  const { data: stats, isLoading, error } = useSWR("/api/admin/stats", fetcher)

  if (error?.status === 403) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to access this page.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and analytics</p>
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

  const globalStats = stats?.globalStats || { totalWeight: 0, totalPoints: 0, totalEntries: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">System overview and analytics</p>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalWeight?.toFixed(1) || 0} kg</div>
            <p className="text-xs text-muted-foreground">All materials combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalPoints?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Points distributed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalEntries || 0}</div>
            <p className="text-xs text-muted-foreground">Recycling submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Material Distribution</CardTitle>
            <CardDescription>Global breakdown of recycled materials</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminMaterialChart data={stats?.materialBreakdown || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (30 Days)</CardTitle>
            <CardDescription>Recycling activity over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminActivityChart data={stats?.dailyActivity || []} />
          </CardContent>
        </Card>
      </div>

      {/* Top Recyclers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Recyclers</CardTitle>
          <CardDescription>Users with the highest points</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.topRecyclers || stats.topRecyclers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topRecyclers.map((user: {
                rank: number
                userId: string
                name: string
                email: string
                totalPoints: number
                totalWeight: number
              }) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">#{user.rank}</Badge>
                    <div>
                      <p className="font-medium">{user.name || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{user.totalPoints?.toLocaleString()} pts</p>
                    <p className="text-sm text-muted-foreground">{user.totalWeight?.toFixed(1)} kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest recycling entries across all users</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.recentEntries || stats.recentEntries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No entries yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentEntries.slice(0, 10).map((entry: {
                _id: string
                userName: string
                userEmail: string
                material: string
                weight: number
                points: number
                createdAt: string
              }) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        entry.material === "plastic" ? "bg-blue-100 text-blue-700" :
                        entry.material === "glass" ? "bg-teal-100 text-teal-700" :
                        entry.material === "paper" ? "bg-amber-100 text-amber-700" :
                        entry.material === "metal" ? "bg-slate-100 text-slate-700" :
                        "bg-orange-100 text-orange-700"
                      }
                    >
                      {entry.material}
                    </Badge>
                    <div>
                      <p className="font-medium">{entry.userName || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.weight} kg</p>
                    <p className="text-sm text-primary">+{entry.points} pts</p>
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
