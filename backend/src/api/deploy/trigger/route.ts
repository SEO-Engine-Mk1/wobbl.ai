import { NextResponse } from "next/server";
import ZAI from 'z-ai-web-dev-sdk';

interface DeployPayload {
  trigger?: string;
  meta?: {
    source?: string;
    repository?: string;
    branch?: string;
    commit_message?: string;
    build_time?: string;
    actor?: string;
    notes?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: DeployPayload = await request.json();
    
    // Vercel Deploy Hook URL
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    
    if (!deployHookUrl) {
      return NextResponse.json(
        { error: "Vercel deploy hook URL not configured" },
        { status: 500 }
      );
    }

    // Enhanced payload with metadata
    const payload = {
      trigger: body.trigger || "z.ai-auto-deploy",
      meta: {
        source: body.meta?.source || "z.ai",
        repository: body.meta?.repository || "https://github.com/SEO-Engine-Mk1/wobbl.ai",
        branch: body.meta?.branch || "wobbl.ai",
        commit_message: body.meta?.commit_message || "Automated deploy from Z.ai",
        build_time: body.meta?.build_time || new Date().toISOString(),
        actor: body.meta?.actor || "z.ai-bot",
        notes: body.meta?.notes || "Deployed automatically via Z.ai CI pipeline"
      }
    };

    // Trigger Vercel deployment
    const deployResponse = await fetch(deployHookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!deployResponse.ok) {
      throw new Error(`Vercel deploy hook failed: ${deployResponse.statusText}`);
    }

    const deployResult = await deployResponse.json();

    // Log deployment trigger
    console.log('Deployment triggered:', {
      trigger: payload.trigger,
      source: payload.meta.source,
      timestamp: payload.meta.build_time,
      actor: payload.meta.actor
    });

    return NextResponse.json({
      success: true,
      message: "Deployment triggered successfully",
      deployment: {
        triggered: true,
        payload: payload,
        vercel_response: deployResult,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Deployment trigger failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Health check for the deploy endpoint
export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "/api/deploy/trigger",
    vercel_hook_configured: !!process.env.VERCEL_DEPLOY_HOOK_URL,
    timestamp: new Date().toISOString()
  });
}