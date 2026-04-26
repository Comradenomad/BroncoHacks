import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get material breakdown
    const materialStats = await db
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

    // Get weekly data for charts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyData = await db
      .collection("recycling_entries")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalWeight: { $sum: "$weight" },
            totalPoints: { $sum: "$points" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Get monthly data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyData = await db
      .collection("recycling_entries")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalWeight: { $sum: "$weight" },
            totalPoints: { $sum: "$points" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Get total stats
    const totalStats = await db
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

    return NextResponse.json({
      user: {
        name: "Demo Viewer",
        email: "demo@ecorewards.local",
        points: totalStats[0]?.totalPoints || 0,
      },
      materialStats: materialStats.map((stat) => ({
        material: stat._id,
        totalWeight: stat.totalWeight,
        totalPoints: stat.totalPoints,
        count: stat.count,
      })),
      weeklyData,
      monthlyData,
      totalStats: totalStats[0] || {
        totalWeight: 0,
        totalPoints: 0,
        totalEntries: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
