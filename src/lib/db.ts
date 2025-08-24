import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hirenext'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB')
      return mongoose
    }) as any
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ MongoDB connection error:', e)
    throw e
  }

  return cached.conn
}

async function dbDisconnect() {
  if (cached.conn) {
    await (cached.conn as any).disconnect()
    cached.conn = null
    cached.promise = null
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB')
})

// Handle process termination
process.on('SIGINT', async () => {
  await dbDisconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await dbDisconnect()
  process.exit(0)
})

export { dbConnect, dbDisconnect }
