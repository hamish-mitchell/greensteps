/**
 * Health Check Endpoint
 * 
 * Provides a simple health check endpoint for monitoring and deployment purposes.
 * Returns the application status, version information, and basic system health.
 * 
 * This endpoint can be used by:
 * - Load balancers for health monitoring
 * - Deployment systems for readiness checks
 * - Monitoring tools for uptime tracking
 * - Development debugging
 */

import { defineEventHandler } from 'h3'
import pkg from '~/package.json'

export default defineEventHandler(async (_event) => {
  const startTime = Date.now()
  
  // Basic system information
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: pkg.version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nuxt: {
      version: '4.0.3', // Current Nuxt version
      ssr: true
    }
  }

  // Check if we're in a working state
  try {
    // Add any critical service checks here
    // For example, database connectivity, external API status, etc.
    
    const responseTime = Date.now() - startTime
    
    return {
      ...health,
      responseTime: `${responseTime}ms`,
      checks: {
        api: 'healthy',
        // Add more service checks as needed
        // database: await checkDatabaseHealth(),
        // supabase: await checkSupabaseHealth(),
      }
    }
  } catch (error) {
    // Set error status and return limited information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: pkg.version || '1.0.0',
      error: errorMessage,
      responseTime: `${Date.now() - startTime}ms`
    }
  }
})