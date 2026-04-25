import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

const POINTS_PER_KG: Record<string, number> = {
  plastic: 10,
  glass: 8,
  paper: 5,
  metal: 15,
  electronics: 25,
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const entries = await db
      .collection("recycling_entries")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching recycling entries:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { material, weight } = await request.json()

    if (!material || !weight) {
      return NextResponse.json(
        { error: "Material and weight are required" },
        { status: 400 }
      )
    }

    if (!POINTS_PER_KG[material]) {
      return NextResponse.json({ error: "Invalid material type" }, { status: 400 })
    }

    if (weight <= 0 || weight > 1000) {
      return NextResponse.json(
        { error: "Weight must be between 0 and 1000 kg" },
        { status: 400 }
      )
    }

    const points = Math.round(weight * POINTS_PER_KG[material])

    const db = await getDatabase()

    const entry = {
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      material,
      weight,
      points,
      date: new Date(),
      createdAt: new Date(),
    }

    await db.collection("recycling_entries").insertOne(entry)

    await db.collection("users").updateOne(
      { email: session.user.email },
      { $inc: { points } }
    )

    return NextResponse.json(
      { message: "Entry logged successfully", entry, pointsEarned: points },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error logging recycling entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
