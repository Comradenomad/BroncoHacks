"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Recycle, Trophy, BarChart3, Users, ArrowRight } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function LandingPage() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    let isActive = true

    const loadEvents = async () => {
      try {
        const response = await fetch("/api/events")
        const data = await response.json()

        if (!isActive) return

        const nextEvents = Array.isArray(data) ? data : data?.events
        setEvents(Array.isArray(nextEvents) ? nextEvents : [])
      } catch {
        if (isActive) {
          setEvents([])
        }
      }
    }

    loadEvents()
    const interval = setInterval(loadEvents, 2000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [])

  const latestEvent = events.length > 0 ? events[0] : null

  const eventCounts = events.reduce(
    (acc, event) => {
      const itemType = event?.item_type
      if (itemType === "recycle" || itemType === "trash" || itemType === "compost") {
        acc[itemType] += 1
      }
      return acc
    },
    { recycle: 0, trash: 0, compost: 0 }
  )

  const eventChartData = {
    labels: ["Recycle", "Trash", "Compost"],
    datasets: [
      {
        label: "Detected items",
        data: [eventCounts.recycle, eventCounts.trash, eventCounts.compost],
        backgroundColor: [
          "rgba(34, 197, 94, 0.75)",
          "rgba(239, 68, 68, 0.75)",
          "rgba(245, 158, 11, 0.75)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(239, 68, 68)",
          "rgb(245, 158, 11)",
        ],
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  }

  const eventChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Recycle className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">EcoRewards</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="flex-1 flex items-center py-20 lg:py-32 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/eco-hero/1920/1080')" }}
      >
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              Join the sustainability movement
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 text-balance">
              Turn Your Recycling Into Rewards
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto text-pretty">
              Track your recycling habits, earn points for every item you recycle, and compete with others to make a bigger environmental impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Start Earning Points
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy to track your recycling and get rewarded for your eco-friendly habits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Recycle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Log Your Recycling</CardTitle>
                <CardDescription>
                  Record the materials you recycle - plastic, glass, paper, metal, or electronics.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Your Impact</CardTitle>
                <CardDescription>
                  View detailed charts and statistics showing your environmental contribution over time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Earn Rewards</CardTitle>
                <CardDescription>
                  Accumulate points based on what you recycle and climb the leaderboard.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Live Smart Bin Feed</h2>
            <p className="text-muted-foreground">Latest scan streaming in from MongoDB</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            <Card className="w-full rounded-2xl shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>Most Recent Scan</CardTitle>
                <CardDescription>Auto-refreshes every 2 seconds</CardDescription>
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

            <Card className="w-full rounded-2xl shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>Live Detection Breakdown</CardTitle>
                <CardDescription>All MongoDB events grouped by item type</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="space-y-6">
                    <div className="h-72">
                      <Bar data={eventChartData} options={eventChartOptions} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl border border-border p-4">
                        <p className="text-2xl font-bold text-green-600">{eventCounts.recycle}</p>
                        <p className="text-sm text-muted-foreground">Recycle</p>
                      </div>
                      <div className="rounded-xl border border-border p-4">
                        <p className="text-2xl font-bold text-red-500">{eventCounts.trash}</p>
                        <p className="text-sm text-muted-foreground">Trash</p>
                      </div>
                      <div className="rounded-xl border border-border p-4">
                        <p className="text-2xl font-bold text-amber-500">{eventCounts.compost}</p>
                        <p className="text-sm text-muted-foreground">Compost</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Waiting for chart data...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/eco-cta/1920/800')" }}
      >
        <div className="absolute inset-0 bg-primary/85" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-6 w-6 text-primary-foreground" />
            <span className="text-primary-foreground/80">Join thousands of eco-conscious recyclers</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-6">
            Ready to Make a Difference?
          </h2>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">EcoRewards</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Making recycling rewarding, one item at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
