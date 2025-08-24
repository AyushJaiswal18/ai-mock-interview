import { dbConnect } from './db'

/**
 * Wrapper function to execute database operations with proper connection handling
 */
export async function withDB<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    await dbConnect()
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    throw error
  }
}

/**
 * Check if MongoDB is connected
 */
export function isConnected(): boolean {
  const mongoose = require('mongoose')
  return mongoose.connection.readyState === 1
}

/**
 * Get database connection status
 */
export function getConnectionStatus(): string {
  const mongoose = require('mongoose')
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown'
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<{ status: string; connected: boolean; error?: string }> {
  try {
    await dbConnect()
    return {
      status: 'healthy',
      connected: true
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
