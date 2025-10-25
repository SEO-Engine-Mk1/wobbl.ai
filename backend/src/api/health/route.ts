import { NextResponse } from "next/server";
import { prisma as db } from '../../../lib/db';

export async function GET() {
  try {
    // Test database connection
    await db.user.count();
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'SMTP_HOST',
      'SMTP_USERNAME',
      'SMTP_PASSWORD'
    ];
    
    const envStatus = requiredEnvVars.reduce((acc, envVar) => {
      acc[envVar] = !!process.env[envVar];
      return acc;
    }, {} as Record<string, boolean>);
    
    const allEnvConfigured = Object.values(envStatus).every(Boolean);
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: allEnvConfigured ? "configured" : "missing_vars",
      envVars: envStatus,
      version: "1.0.0"
    });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}