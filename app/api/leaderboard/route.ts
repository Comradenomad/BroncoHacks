import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    const leaderboard = await db
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

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      userId: entry._id,
      name: entry.userName,
      email: entry.userEmail,
      totalPoints: entry.totalPoints,
      totalWeight: entry.totalWeight,
      rank: index + 1,
    }))

    return NextResponse.json(rankedLeaderboard)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
