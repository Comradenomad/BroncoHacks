import { MongoClient } from "mongodb"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const uri = process.env.MONGODB_URI

async function testMongoDB() {
  console.log("Testing MongoDB connection...\n")

  if (!uri) {
    console.error("[FAIL] MONGODB_URI not found in .env.local")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("[PASS] Connected to MongoDB Atlas")

    const db = client.db("smart_bin")

    const testDocument = { _test: true, label: "connection-test", createdAt: new Date() }
    const insertResult = await db.collection("_test").insertOne(testDocument)
    console.log("[PASS] Insert document — id:", insertResult.insertedId.toString())

    const found = await db.collection("_test").findOne({ _id: insertResult.insertedId })
    if (!found) throw new Error("Could not read back inserted document")
    console.log("[PASS] Read document back — label:", found.label)

    await db.collection("_test").deleteOne({ _id: insertResult.insertedId })
    console.log("[PASS] Deleted test document")

    console.log("\nMongoDB: all tests passed")
  } catch (error) {
    console.error("[FAIL] MongoDB test failed:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

testMongoDB()
