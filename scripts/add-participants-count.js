/**
 * Migration script to add participantsCount field to Settings collection
 * Run with: node scripts/add-participants-count.js
 * 
 * Make sure to set your MONGODB_URI as an environment variable first:
 * Windows PowerShell: $env:MONGODB_URI="your-mongodb-uri"; node scripts/add-participants-count.js
 */

const mongoose = require("mongoose")

// Get MongoDB URI from environment or command line argument
const MONGODB_URI = process.env.MONGODB_URI || process.argv[2]

if (!MONGODB_URI || MONGODB_URI === "your-mongodb-uri-here") {
  console.error("❌ MONGODB_URI not provided")
  console.log("\nUsage:")
  console.log('  node scripts/add-participants-count.js "mongodb://your-uri-here"')
  console.log("  OR")
  console.log('  $env:MONGODB_URI="mongodb://your-uri-here"; node scripts/add-participants-count.js')
  process.exit(1)
}

const SettingsSchema = new mongoose.Schema(
  {
    registrationEnabled: { type: Boolean, default: true },
    siteName: { type: String, default: "BBB Event" },
    siteDescription: { type: String, default: "Event Registration System" },
    useRealStats: { type: Boolean, default: true },
    dummyStats: {
      totalRegistrations: { type: Number, default: 0 },
      approvedRegistrations: { type: Number, default: 0 },
      totalVisitors: { type: Number, default: 0 },
    },
    participantsCount: { type: Number, default: 82 },
  },
  {
    timestamps: true,
  }
)

const Settings = mongoose.model("Settings", SettingsSchema)

async function addParticipantsCount() {
  try {
    console.log("🔌 Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    console.log("🔍 Finding Settings document...")
    const settings = await Settings.findOne({})

    if (!settings) {
      console.log("📝 No Settings document found, creating one...")
      await Settings.create({
        registrationEnabled: true,
        siteName: "BBB Event",
        siteDescription: "Event Registration System",
        useRealStats: true,
        dummyStats: {
          totalRegistrations: 0,
          approvedRegistrations: 0,
          totalVisitors: 0,
        },
        participantsCount: 82,
      })
      console.log("✅ Settings document created with participantsCount: 82")
    } else {
      console.log("📊 Current settings:", {
        registrationEnabled: settings.registrationEnabled,
        useRealStats: settings.useRealStats,
        participantsCount: settings.participantsCount,
      })

      if (settings.participantsCount === undefined || settings.participantsCount === null) {
        console.log("➕ Adding participantsCount field...")
        settings.participantsCount = 82
        await settings.save()
        console.log("✅ participantsCount field added successfully!")
      } else {
        console.log(`ℹ️ participantsCount already exists: ${settings.participantsCount}`)
      }
    }

    console.log("\n📋 Final Settings:")
    const finalSettings = await Settings.findOne({})
    console.log(JSON.stringify(finalSettings, null, 2))

    console.log("\n✅ Migration completed successfully!")
  } catch (error) {
    console.error("❌ Error during migration:", error)
  } finally {
    await mongoose.disconnect()
    console.log("👋 Disconnected from MongoDB")
  }
}

addParticipantsCount()
