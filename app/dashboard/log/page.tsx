"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, Recycle } from "lucide-react"
import { cn } from "@/lib/utils"

const MATERIALS = [
  { id: "plastic", name: "Plastic", points: 10, color: "bg-blue-100 border-blue-300 text-blue-700", icon: "🥤" },
  { id: "glass", name: "Glass", points: 8, color: "bg-teal-100 border-teal-300 text-teal-700", icon: "🫙" },
  { id: "paper", name: "Paper", points: 5, color: "bg-amber-100 border-amber-300 text-amber-700", icon: "📄" },
  { id: "metal", name: "Metal", points: 15, color: "bg-slate-100 border-slate-300 text-slate-700", icon: "🥫" },
  { id: "electronics", name: "Electronics", points: 25, color: "bg-orange-100 border-orange-300 text-orange-700", icon: "📱" },
]

export default function LogEntryPage() {
  const router = useRouter()
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [weight, setWeight] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<{ points: number } | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMaterial || !weight) {
      setError("Please select a material and enter weight")
      return
    }

    const weightNum = parseFloat(weight)
    if (isNaN(weightNum) || weightNum <= 0) {
      setError("Please enter a valid weight")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/recycling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material: selectedMaterial,
          weight: weightNum,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to log entry")
        return
      }

      setSuccess({ points: data.pointsEarned })
      
      // Invalidate SWR cache
      mutate("/api/stats")
      mutate("/api/recycling")

      // Reset form after delay
      setTimeout(() => {
        setSuccess(null)
        setSelectedMaterial(null)
        setWeight("")
      }, 3000)
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Entry Logged!</h2>
              <p className="text-muted-foreground mb-4">
                Great job helping the environment!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                +{success.points} points earned
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Log Recycling</h1>
        <p className="text-muted-foreground">
          Record your recycling to earn points
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            New Entry
          </CardTitle>
          <CardDescription>
            Select the material type and enter the weight in kilograms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Label>Material Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {MATERIALS.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => setSelectedMaterial(material.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-center",
                      selectedMaterial === material.id
                        ? `${material.color} border-current ring-2 ring-current ring-offset-2`
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <span className="text-2xl block mb-1">{material.icon}</span>
                    <span className="text-sm font-medium block">{material.name}</span>
                    <span className="text-xs text-muted-foreground">{material.points} pts/kg</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                placeholder="Enter weight in kilograms"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={isLoading}
              />
              {selectedMaterial && weight && parseFloat(weight) > 0 && (
                <p className="text-sm text-muted-foreground">
                  You will earn{" "}
                  <span className="font-semibold text-primary">
                    {Math.round(parseFloat(weight) * (MATERIALS.find(m => m.id === selectedMaterial)?.points || 0))} points
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !selectedMaterial || !weight} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  "Log Entry"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
