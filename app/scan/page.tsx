"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { Recycle, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ClaimState = "idle" | "loading" | "success" | "no_scan" | "error"

export default function ScanPage() {
  const router = useRouter()
  const { status } = useSession()
  const [claimState, setClaimState] = useState<ClaimState>("idle")
  const [claimedItem, setClaimedItem] = useState<{ item_type: string; gramsSaved: number } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/scan" })
      return
    }

    if (status !== "authenticated") return

    setClaimState("loading")

    async function claimScan() {
      try {
        const response = await fetch("/api/scan/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        const data = await response.json()

        if (response.ok) {
          setClaimedItem({ item_type: data.item_type, gramsSaved: data.gramsSaved })
          setClaimState("success")
          setTimeout(() => router.push("/dashboard"), 2500)
          return
        }

        if (response.status === 404) {
          setClaimState("no_scan")
        } else {
          setClaimState("error")
        }
      } catch {
        setClaimState("error")
      }
    }

    claimScan()
  }, [status, router])

  return (
    <PageShell>
      {(claimState === "idle" || claimState === "loading") && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <CardTitle className="text-center mt-4">Linking your scan...</CardTitle>
        </>
      )}
      {claimState === "success" && claimedItem && (
        <>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <CardTitle className="text-center mt-4">Scan registered!</CardTitle>
          <CardDescription className="text-center mt-2">
            {claimedItem.item_type.charAt(0).toUpperCase() + claimedItem.item_type.slice(1)} —{" "}
            {claimedItem.gramsSaved > 0 ? `+${claimedItem.gramsSaved}g diverted from landfill` : "No impact tracked for this item"}
          </CardDescription>
          <CardDescription className="text-center">Redirecting to your dashboard...</CardDescription>
        </>
      )}
      {claimState === "no_scan" && (
        <>
          <XCircle className="h-12 w-12 text-yellow-500 mx-auto" />
          <CardTitle className="text-center mt-4">No recent scan found</CardTitle>
          <CardDescription className="text-center mt-2">
            Make sure you tap the bin before scanning the NFC tag. Scans expire after 2 minutes.
          </CardDescription>
          <Button className="mt-6 w-full" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </>
      )}
      {claimState === "error" && (
        <>
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <CardTitle className="text-center mt-4">Something went wrong</CardTitle>
          <CardDescription className="text-center mt-2">Please try again.</CardDescription>
          <Button className="mt-6 w-full" variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
        </>
      )}
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center">
          <Recycle className="h-8 w-8 text-primary" />
        </CardHeader>
        <CardContent className="pb-8">{children}</CardContent>
      </Card>
    </div>
  )
}
