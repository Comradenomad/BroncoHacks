import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get all users count
    const totalUsers = await db.collection("users").countDocuments()

    // Get total recycling stats
    const globalStats = await db
      .collection("recycling_entries")
      .aggregate([
        {
          $group: {
            _id: null,
            totalWeight: { $sum: "$weight" },
            totalPoints: { $sum: "$points" },
            totalEntries: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Get material breakdown globally
    const materialBreakdown = await db
      .collection("recycling_entries")
      .aggregate([
        {
          $group: {
            _id: "$material",
            totalWeight: { $sum: "$weight" },
            totalPoints: { $sum: "$points" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Get daily activity for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyActivity = await db
      .collection("recycling_entries")
      .aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalWeight: { $sum: "$weight" },
            totalPoints: { $sum: "$points" },
            entriesCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Get top recyclers
    const topRecyclers = await db
      .collection("recycling_entries")
      .aggregate([
        {
          $group: {
            _id: "$userId",
            userName: { $first: "$userName" },
            userEmail: { $first: "$userEmail" },
            totalPoints: { $sum: "$points" },
            totalWeight: { $sum: "$weight" },
          },
        },
        { $sort: { totalPoints: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // Get recent entries
    const recentEntries = await db
      .collection("recycling_entries")
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({
      totalUsers,
      globalStats: globalStats[0] || {
        totalWeight: 0,
        totalPoints: 0,
        totalEntries: 0,
      },
      materialBreakdown: materialBreakdown.map((stat) => ({
        material: stat._id,
        totalWeight: stat.totalWeight,
        totalPoints: stat.totalPoints,
        count: stat.count,
      })),
      dailyActivity,
      topRecyclers: topRecyclers.map((r, i) => ({
        rank: i + 1,
        userId: r._id,
        name: r.userName,
        email: r.userEmail,
        totalPoints: r.totalPoints,
        totalWeight: r.totalWeight,
      })),
      recentEntries,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
