import ZAI from 'z-ai-web-dev-sdk';

interface DeploymentConfig {
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

interface DeploymentResult {
  success: boolean;
  deploymentId?: string;
  url?: string;
  error?: string;
  timestamp: string;
}

export class AutoDeployService {
  private vercelDeployHook: string;
  private zai: ZAI | null = null;

  constructor() {
    this.vercelDeployHook = process.env.VERCEL_DEPLOY_HOOK_URL || '';
    
    if (!this.vercelDeployHook) {
      console.warn('VERCEL_DEPLOY_HOOK_URL not configured');
    }
  }

  /**
   * Initialize Z.ai SDK for advanced deployment workflows
   */
  async initializeZAI(): Promise<void> {
    try {
      this.zai = await ZAI.create();
      console.log('Z.ai SDK initialized for deployment workflows');
    } catch (error) {
      console.error('Failed to initialize Z.ai SDK:', error);
      throw error;
    }
  }

  /**
   * Trigger deployment via Vercel webhook
   */
  async triggerDeployment(config: DeploymentConfig = {}): Promise<DeploymentResult> {
    try {
      if (!this.vercelDeployHook) {
        throw new Error('Vercel deploy hook URL not configured');
      }

      const payload = {
        trigger: config.trigger || "z.ai-auto-deploy",
        meta: {
          source: config.meta?.source || "z.ai",
          repository: config.meta?.repository || "https://github.com/SEO-Engine-Mk1/wobbl.ai",
          branch: config.meta?.branch || "wobbl.ai",
          commit_message: config.meta?.commit_message || "Automated deploy from Z.ai",
          build_time: config.meta?.build_time || new Date().toISOString(),
          actor: config.meta?.actor || "z.ai-bot",
          notes: config.meta?.notes || "Deployed automatically via Z.ai CI pipeline"
        }
      };

      const response = await fetch(this.vercelDeployHook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Vercel deploy hook failed: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('Deployment triggered successfully:', {
        trigger: payload.trigger,
        source: payload.meta.source,
        timestamp: payload.meta.build_time
      });

      return {
        success: true,
        deploymentId: result.deployment?.id,
        url: result.deployment?.url,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Deployment trigger failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * AI-powered deployment decision making
   */
  async shouldDeploy(changes: string[]): Promise<boolean> {
    try {
      if (!this.zai) {
        await this.initializeZAI();
      }

      const prompt = `
      Analyze these code changes and determine if they should trigger an automatic deployment to production:

      Changes:
      ${changes.join('\n')}

      Consider:
      1. Are there breaking changes?
      2. Are tests passing?
      3. Is this a critical bug fix?
      4. Are there any security concerns?
      
      Respond with only "true" or "false".
      `;

        if (!this.zai) {
        console.warn('Z.ai SDK not initialized, defaulting to safe deployment decision');
        return false;
      }

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a DevOps expert who makes deployment decisions based on code changes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });

      const decision = completion.choices[0]?.message?.content?.trim().toLowerCase();
      return decision === 'true';

    } catch (error) {
      console.error('AI deployment decision failed:', error);
      // Default to safe behavior - don't deploy if AI decision fails
      return false;
    }
  }

  /**
   * Generate deployment summary using AI
   */
  async generateDeploymentSummary(changes: string[]): Promise<string> {
    try {
      if (!this.zai) {
        await this.initializeZAI();
      }

      const prompt = `
      Generate a concise deployment summary for these changes:

      Changes:
      ${changes.join('\n')}

      Create a 1-2 sentence summary suitable for deployment logs and team notifications.
      Focus on the impact and value of these changes.
      `;

        if (!this.zai) {
        console.warn('Z.ai SDK not initialized, using default deployment summary');
        return "Automated deployment with latest changes";
      }

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a technical writer who creates clear, concise deployment summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      return completion.choices[0]?.message?.content?.trim() || "Automated deployment with latest changes";

    } catch (error) {
      console.error('Failed to generate deployment summary:', error);
      return "Automated deployment with latest changes";
    }
  }

  /**
   * Complete automated deployment workflow
   */
  async automatedDeployment(changes: string[], actor: string = 'z.ai-bot'): Promise<DeploymentResult> {
    try {
      // 1. AI decision: should we deploy?
      const shouldDeploy = await this.shouldDeploy(changes);
      if (!shouldDeploy) {
        return {
          success: false,
          error: "AI decided not to deploy based on changes analysis",
          timestamp: new Date().toISOString()
        };
      }

      // 2. Generate deployment summary
      const summary = await this.generateDeploymentSummary(changes);

      // 3. Trigger deployment
      const result = await this.triggerDeployment({
        trigger: "z.ai-automated-deployment",
        meta: {
          source: "z.ai",
          actor: actor,
          commit_message: summary,
          notes: `AI-analyzed deployment: ${changes.length} changes processed`
        }
      });

      return result;

    } catch (error) {
      console.error('Automated deployment workflow failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<any> {
    try {
      // This would typically integrate with Vercel API to check deployment status
      // For now, return a placeholder
      return {
        deploymentId,
        status: "unknown",
        message: "Status checking not implemented yet"
      };
    } catch (error) {
      console.error('Failed to get deployment status:', error);
      throw error;
    }
  }
}

export const autoDeployService = new AutoDeployService();