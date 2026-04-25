import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Recycle, Trophy, BarChart3, Users, ArrowRight } from "lucide-react"

export default function LandingPage() {
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

      {/* Points System Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Points Per Kilogram</h2>
            <p className="text-muted-foreground">Earn points based on the material type and weight</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { material: "Plastic", points: 10, color: "bg-blue-100 text-blue-700" },
              { material: "Glass", points: 8, color: "bg-teal-100 text-teal-700" },
              { material: "Paper", points: 5, color: "bg-amber-100 text-amber-700" },
              { material: "Metal", points: 15, color: "bg-slate-100 text-slate-700" },
              { material: "Electronics", points: 25, color: "bg-orange-100 text-orange-700" },
            ].map((item) => (
              <Card key={item.material} className="text-center border-border">
                <CardContent className="pt-6">
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${item.color} mb-3`}>
                    <span className="text-lg font-bold">{item.points}</span>
                  </div>
                  <p className="font-medium text-foreground">{item.material}</p>
                  <p className="text-sm text-muted-foreground">pts/kg</p>
                </CardContent>
              </Card>
            ))}
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
