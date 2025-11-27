import mongoose from 'mongoose'
import QRCode from 'qrcode'
import dotenv from 'dotenv'

// Load .env from project root if present
dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/bbb_layout_v1212'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shreeparashurama.com'

const FORCE = process.argv.includes('--force')
const LIMIT_ARG_INDEX = process.argv.indexOf('--limit')
const LIMIT = LIMIT_ARG_INDEX > -1 ? Number(process.argv[LIMIT_ARG_INDEX + 1] || 0) : 0

async function main() {
  console.log('Connecting to MongoDB:', DATABASE_URL)
  await mongoose.connect(DATABASE_URL, { dbName: undefined })

  // Use the existing registrations collection. We don't require a strict schema here.
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }), 'registrations')

  // Build query: successful payments only
  const baseQuery = { paymentStatus: 'success' }

  // If not forcing, only update docs that are missing qrCode or contain an ngrok URL
  let query
  if (FORCE) {
    query = baseQuery
    console.log('Running in --force mode: regenerating QR for all successful registrations')
  } else {
    query = {
      ...baseQuery,
      $or: [
        { qrCode: { $exists: false } },
        { qrCode: null },
        { qrCode: '' },
        { qrCode: { $regex: 'ngrok', $options: 'i' } },
      ],
    }
    console.log('Default mode: regenerating QR only where missing or referencing ngrok')
  }

  const cursor = Registration.find(query).cursor()
  let count = 0
  let updated = 0

  for await (const doc of cursor) {
    if (LIMIT && updated >= LIMIT) break

    count++
    const regId = doc.registrationId || doc.registration_id || doc._id?.toString()
    if (!regId) {
      console.warn('Skipping doc without registrationId or _id:', doc._id?.toString())
      continue
    }

    try {
      const verificationUrl = `${BASE_URL.replace(/\/$/, '')}/ticket/${regId}`
      const dataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
      })

      await Registration.updateOne({ _id: doc._id }, { $set: { qrCode: dataUrl } })
      updated++
      console.log(`Updated ${regId} (${updated})`)
    } catch (err) {
      console.error('Failed to update', regId, err)
    }
  }

  console.log(`Scanned ${count} documents. Updated: ${updated}`)
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
