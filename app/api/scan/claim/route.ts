import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import pusher from "@/lib/pusher"

const CLAIM_WINDOW_MINUTES = 2

const GRAMS_SAVED: Record<string, number> = {
  recycle: 50,
  trash: 0,
  compost: 0,
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const claimWindowStart = new Date(Date.now() - CLAIM_WINDOW_MINUTES * 60 * 1000)

    const claimedEvent = await db.collection("events").findOneAndUpdate(
      {
        $or: [{ userId: null }, { userId: { $exists: false } }],
        timestamp: { $gte: claimWindowStart },
      },
      {
        $set: {
          userId: session.user.id,
          userEmail: session.user.email,
        },
      },
      {
        sort: { timestamp: -1 },
        returnDocument: "after",
      }
    )

    if (!claimedEvent) {
      return NextResponse.json(
        { error: "No recent unclaimed scan found. Please try again within 2 minutes of scanning." },
        { status: 404 }
      )
    }

    const gramsSaved = GRAMS_SAVED[claimedEvent.item_type] ?? 0

    if (gramsSaved > 0) {
      await db.collection("users").updateOne(
        { _id: session.user.id },
        { $inc: { gramsSaved } }
      )
    }

    await db.collection("events").updateOne(
      { _id: claimedEvent._id },
      { $set: { gramsSaved } }
    )

    try {
      await pusher.trigger(`user-${session.user.id}`, "new-scan", {
        item_type: claimedEvent.item_type,
        confidence: claimedEvent.confidence,
        gramsSaved,
        timestamp: claimedEvent.timestamp,
      })
    } catch (pusherError) {
      console.error("Pusher trigger failed (non-fatal):", pusherError)
    }

    return NextResponse.json({
      message: "Scan claimed successfully",
      item_type: claimedEvent.item_type,
      gramsSaved,
    })
  } catch (error) {
    console.error("Error in /api/scan/claim:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
