import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [categoryBreakdown, weeklyData, monthlyData, totalStats, user] = await Promise.all([
      db.collection("events").aggregate([
        { $match: { userId: session.user.id } },
        { $group: { _id: "$item_type", count: { $sum: 1 } } },
      ]).toArray(),

      db.collection("events").aggregate([
        { $match: { userId: session.user.id, timestamp: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),

      db.collection("events").aggregate([
        { $match: { userId: session.user.id, timestamp: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),

      db.collection("events").aggregate([
        { $match: { userId: session.user.id } },
        { $group: { _id: null, totalItems: { $sum: 1 } } },
      ]).toArray(),

      db.collection("users").findOne({ email: session.user.email }),
    ])

    const totals = totalStats[0] ?? { totalItems: 0 }

    return NextResponse.json({
      user: {
        name: user?.name,
        email: user?.email,
      },
      totalItems: totals.totalItems,
      categoryBreakdown: categoryBreakdown.reduce((accumulator: Record<string, { count: number }>, category: any) => {
        accumulator[category._id] = { count: category.count }
        return accumulator
      }, {}),
      weeklyData,
      monthlyData,
    })
  } catch (error) {
    console.error("Error in /api/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
