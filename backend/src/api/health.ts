import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    let databaseStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'disconnected';
      console.error('Database connection failed:', error);
    }
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'OPENAI_API_KEY',
      'ZAI_API_KEY',
      'NEXTAUTH_SECRET'
    ];
    
    const envStatus = requiredEnvVars.reduce((acc, envVar) => {
      acc[envVar] = !!process.env[envVar];
      return acc;
    }, {} as Record<string, boolean>);
    
    const allEnvConfigured = Object.values(envStatus).every(Boolean);
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      environment: allEnvConfigured ? "configured" : "missing_vars",
      envVars: envStatus,
      version: "1.0.0",
      platform: "vercel"
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      platform: "vercel"
    });
  }
}