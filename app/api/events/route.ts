import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

type RawEvent = {
  _id?: { toString(): string } | string
  item_type?: string
  itemType?: string
  classification?: string
  label?: string
  confidence?: number | string
  score?: number | string
  timestamp?: string | Date
  createdAt?: string | Date
  scannedAt?: string | Date
  image?: string
  imageBase64?: string
  encodedImage?: string
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("smart_bin")

    const rawEvents = await db
      .collection<RawEvent>("events")
      .find({})
      .sort({ timestamp: -1, createdAt: -1, scannedAt: -1, _id: -1 })
      .limit(200)
      .toArray()

    const events = rawEvents.map((event, index) => ({
      id: typeof event._id === "string" ? event._id : event._id?.toString(),
      item_type:
        event.item_type ||
        event.itemType ||
        event.classification ||
        event.label ||
        "unknown",
      confidence: normalizeConfidence(event.confidence ?? event.score),
      timestamp: normalizeTimestamp(
        event.timestamp ?? event.createdAt ?? event.scannedAt
      ),
      image: index < 5 ? (event.image || event.imageBase64 || event.encodedImage || "") : "",
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching smart bin events:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch smart bin events",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    )
  }
}

function normalizeConfidence(value: number | string | undefined) {
  if (typeof value === "number") {
    return value > 1 ? value / 100 : value
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (!Number.isNaN(parsed)) {
      return parsed > 1 ? parsed / 100 : parsed
    }
  }

  return 0
}

function normalizeTimestamp(value: string | Date | undefined) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "string") {
    return value
  }

  return null
}
