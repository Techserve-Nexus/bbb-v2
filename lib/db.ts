import mongoose, { Connection } from "mongoose"

declare global {
    var _mongooseConn: Connection | null | undefined
    var _mongoosePromise: Promise<Connection> | null | undefined
}

const MONGODB_URI = process.env.DATABASE_URL

if (!MONGODB_URI) {
    throw new Error("DATABASE_URL environment variable is not set")
}

const isProduction = process.env.NODE_ENV === "production"

export async function connectDB(): Promise<Connection> {
    // Return existing connection (fast path)
    if (global._mongooseConn?.readyState === 1) {
        return global._mongooseConn
    }

    // Reuse existing connection promise if still connecting
    if (!global._mongoosePromise) {
        const opts = {
            maxPoolSize: 100,      // Increased for 200+ concurrent users
            minPoolSize: 10,       // Keep connections warm
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxIdleTimeMS: 30000,  // Close idle connections after 30s
            retryWrites: true,
            retryReads: true,
            compressors: ['zlib' as const], // Compress network traffic
        }

        global._mongoosePromise = mongoose
            .connect(MONGODB_URI as string, opts)
            .then((mongoose) => {
                if (!isProduction) {
                    console.log('✅ MongoDB connected with pool size:', opts.maxPoolSize)
                }
                return mongoose.connection
            })
            .catch((err) => {
                console.error('❌ MongoDB connection error:', err)
                global._mongoosePromise = null
                throw err
            })
    }

    try {
        global._mongooseConn = await global._mongoosePromise
    } catch (e) {
        global._mongoosePromise = null
        throw e
    }

    return global._mongooseConn
}

export default connectDB
