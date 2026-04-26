import Pusher from "pusher"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

async function testPusher() {
  console.log("Testing Pusher connection...\n")

  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env

  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    console.error("[FAIL] Missing Pusher credentials in .env.local")
    process.exit(1)
  }

  const pusher = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  })

  try {
    await pusher.trigger("test-channel", "test-event", {
      message: "Pusher connection test from BinTelligence",
      timestamp: new Date().toISOString(),
    })

    console.log("[PASS] Pusher event fired successfully")
    console.log("       Check Pusher dashboard > Debug Console to confirm it arrived")
  } catch (error) {
    console.error("[FAIL] Pusher test failed:", error)
    process.exit(1)
  }
}

testPusher()
