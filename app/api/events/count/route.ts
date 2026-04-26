import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("smart_bin")

    const rawEvents = await db
      .collection("events")
      .find({}, { projection: { item_type: 1, itemType: 1, classification: 1, label: 1 } })
      .toArray()

    const counts = rawEvents.reduce(
      (acc: Record<string, number>, event: any) => {
        const itemType = event.item_type || event.itemType || event.classification || event.label || "unknown"
        acc[itemType] = (acc[itemType] || 0) + 1
        return acc
      },
      { recycle: 0, trash: 0, compost: 0 }
    )

    return NextResponse.json({ counts, total: rawEvents.length })
  } catch (error) {
    console.error("Error fetching event counts:", error)
    return NextResponse.json({ error: "Failed to fetch event counts" }, { status: 500 })
  }
}
