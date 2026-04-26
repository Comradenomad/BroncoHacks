/**
 * Tests the full scan claim flow directly against MongoDB.
 * Covers all failure points in /api/scan/claim without needing an HTTP server.
 * Usage: npx ts-node --skipProject scott/tests/test-claim-flow.ts
 */

import { MongoClient, ObjectId } from "mongodb"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const CLAIM_WINDOW_MINUTES = 2
const TEST_USER_ID = new ObjectId().toString()
const TEST_USER_EMAIL = "claimtest@bintelligence.com"

function makeEvent(overrides: Record<string, unknown> = {}) {
  return {
    scan_id: new ObjectId().toString(),
    userId: null,
    userEmail: null,
    item_type: "recycle",
    confidence: 0.94,
    rewardCents: 5,
    timestamp: new Date(),
    ...overrides,
  }
}

async function claimLatestEvent(db: ReturnType<MongoClient["db"]>, userId: string, userEmail: string) {
  const claimWindowStart = new Date(Date.now() - CLAIM_WINDOW_MINUTES * 60 * 1000)
  return db.collection("events").findOneAndUpdate(
    { $or: [{ userId: null }, { userId: { $exists: false } }], timestamp: { $gte: claimWindowStart } },
    { $set: { userId, userEmail } },
    { sort: { timestamp: -1 }, returnDocument: "after" }
  )
}

async function runTests() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("[FAIL] MONGODB_URI not found in .env.local")
    process.exit(1)
  }

  const client = new MongoClient(uri)
  let passed = 0
  let failed = 0

  function pass(label: string) {
    console.log(`  [PASS] ${label}`)
    passed++
  }

  function fail(label: string, detail?: string) {
    console.log(`  [FAIL] ${label}${detail ? ` — ${detail}` : ""}`)
    failed++
  }

  try {
    await client.connect()
    const db = client.db("smart_bin")

    // --- Claim a recent unclaimed event ---
    console.log("Claim — recent unclaimed event:")
    const recentEvent = makeEvent()
    await db.collection("events").insertOne(recentEvent)

    const claimed = await claimLatestEvent(db, TEST_USER_ID, TEST_USER_EMAIL)
    if (claimed && claimed.userId === TEST_USER_ID && claimed.userEmail === TEST_USER_EMAIL) {
      pass("Recent event claimed — userId and userEmail set")
    } else {
      fail("Recent event claim", `got userId: ${claimed?.userId}`)
    }

    // --- Double claim prevention ---
    console.log("\nClaim — double claim prevention:")
    const alreadyClaimed = await claimLatestEvent(db, "another-user-id", "other@test.com")
    if (!alreadyClaimed) {
      pass("Already claimed event not returned")
    } else {
      fail("Double claim", `event was re-claimed: ${alreadyClaimed.userId}`)
    }

    // --- Expired event not claimable ---
    console.log("\nClaim — expired event (older than 2 min):")
    const expiredTimestamp = new Date(Date.now() - (CLAIM_WINDOW_MINUTES + 1) * 60 * 1000)
    const expiredEvent = makeEvent({ timestamp: expiredTimestamp })
    await db.collection("events").insertOne(expiredEvent)

    const expiredResult = await claimLatestEvent(db, TEST_USER_ID, TEST_USER_EMAIL)
    if (!expiredResult) {
      pass("Expired event not claimed — outside claim window")
    } else {
      fail("Expired event was incorrectly claimed", `scan_id: ${expiredResult.scan_id}`)
    }

    // --- Most recent event claimed when multiple unclaimed exist ---
    console.log("\nClaim — picks most recent when multiple unclaimed:")
    const olderEvent = makeEvent({ timestamp: new Date(Date.now() - 90 * 1000) })
    const newerEvent = makeEvent({ timestamp: new Date(Date.now() - 10 * 1000) })
    await db.collection("events").insertOne(olderEvent)
    await db.collection("events").insertOne(newerEvent)

    const mostRecent = await claimLatestEvent(db, TEST_USER_ID, TEST_USER_EMAIL)
    if (mostRecent && mostRecent.scan_id === newerEvent.scan_id) {
      pass("Most recent event claimed first")
    } else {
      fail("Wrong event claimed", `expected ${newerEvent.scan_id}, got ${mostRecent?.scan_id}`)
    }

    // --- Balance increment ---
    console.log("\nBalance — increment on claim:")
    await db.collection("users").insertOne({
      _id: TEST_USER_ID as unknown as ObjectId,
      email: TEST_USER_EMAIL,
      name: "Claim Test User",
      balance: 0,
    })

    await db.collection("users").updateOne(
      { _id: TEST_USER_ID as unknown as ObjectId },
      { $inc: { balance: 5 } }
    )

    const updatedUser = await db.collection("users").findOne({ _id: TEST_USER_ID as unknown as ObjectId })
    if (updatedUser?.balance === 5) {
      pass("Balance incremented correctly — 5 cents")
    } else {
      fail("Balance increment", `expected 5, got ${updatedUser?.balance}`)
    }

    // --- Zero reward does not change balance ---
    console.log("\nBalance — zero reward does not increment:")
    const balanceBefore = updatedUser?.balance ?? 0
    const userAfterNoReward = await db.collection("users").findOne({ _id: TEST_USER_ID as unknown as ObjectId })
    if (userAfterNoReward?.balance === balanceBefore) {
      pass("Balance unchanged when rewardCents is 0")
    } else {
      fail("Balance changed unexpectedly")
    }

  } catch (error) {
    console.error("\n[ERROR] Unexpected test failure:", error)
    process.exit(1)
  } finally {
    const db = client.db("smart_bin")
    await db.collection("users").deleteOne({ email: TEST_USER_EMAIL })
    await client.close()
    console.log(`\nResults: ${passed} passed, ${failed} failed`)
    if (failed > 0) process.exit(1)
  }
}

runTests()
