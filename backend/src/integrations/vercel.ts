/**
 * Vercel Integration Configuration
 * Handles Vercel API integration for deployment and project management
 */

export interface VercelConfig {
  accessToken: string;
  teamId?: string;
  projectId?: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  installCommand: string;
  devCommand: string;
  gitRepository?: {
    repo: string;
    type: string;
  };
  env: Array<{
    key: string;
    value: string;
    type: 'system' | 'secret' | 'plain';
    target: Array<'production' | 'preview' | 'development'>;
  }>;
}

export interface VercelDeployment {
  id: string;
  url: string;
  state: 'READY' | 'ERROR' | 'BUILDING' | 'INITIALIZING';
  createdAt: number;
  readyAt?: number;
  build?: {
    status: 'succeeded' | 'failed' | 'building';
      duration?: number;
  };
  meta?: {
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitAuthorLogin?: string;
  };
}

export interface VercelEnvironmentVariable {
  key: string;
  value: string;
  type: 'system' | 'secret' | 'plain';
  target: Array<'production' | 'preview' | 'development'>;
  id?: string;
  configurationId?: string;
  createdAt?: number;
  updatedAt?: number;
}

class VercelIntegration {
  private config: VercelConfig;
  private baseUrl = 'https://api.vercel.com/v1';

  constructor(config: VercelConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Vercel API error: ${response.status} - ${error.message || response.statusText}`);
    }

    return response.json();
  }

  // Project Management
  async createProject(project: Partial<VercelProject>): Promise<VercelProject> {
    return this.makeRequest<VercelProject>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        ...project,
        teamId: this.config.teamId,
      }),
    });
  }

  async getProject(projectId: string): Promise<VercelProject> {
    return this.makeRequest<VercelProject>(`/projects/${projectId}`);
  }

  async listProjects(): Promise<VercelProject[]> {
    const response = await this.makeRequest<{ projects: VercelProject[] }>('/projects');
    return response.projects;
  }

  async updateProject(projectId: string, updates: Partial<VercelProject>): Promise<VercelProject> {
    return this.makeRequest<VercelProject>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.makeRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Deployment Management
  async createDeployment(projectId: string, deployment: {
    name?: string;
    files: Array<{ file: string; data: string }>;
    projectSettings?: Partial<VercelProject>;
    target?: 'production' | 'preview';
  }): Promise<VercelDeployment> {
    return this.makeRequest<VercelDeployment>(`/v13/deployments`, {
      method: 'POST',
      body: JSON.stringify({
        ...deployment,
        project: projectId,
        teamId: this.config.teamId,
      }),
    });
  }

  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    return this.makeRequest<VercelDeployment>(`/v13/deployments/${deploymentId}`);
  }

  async listDeployments(projectId: string): Promise<VercelDeployment[]> {
    const response = await this.makeRequest<{ deployments: VercelDeployment[] }>(
      `/v6/deployments?projectId=${projectId}`
    );
    return response.deployments;
  }

  async cancelDeployment(deploymentId: string): Promise<void> {
    await this.makeRequest(`/v13/deployments/${deploymentId}/cancel`, {
      method: 'POST',
    });
  }

  async redeployDeployment(deploymentId: string): Promise<VercelDeployment> {
    return this.makeRequest<VercelDeployment>(`/v13/deployments/${deploymentId}/redeploy`, {
      method: 'POST',
    });
  }

  // Environment Variables
  async createEnvironmentVariable(
    projectId: string,
    envVar: Omit<VercelEnvironmentVariable, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<VercelEnvironmentVariable> {
    return this.makeRequest<VercelEnvironmentVariable>(`/v9/projects/${projectId}/env`, {
      method: 'POST',
      body: JSON.stringify(envVar),
    });
  }

  async listEnvironmentVariables(projectId: string): Promise<VercelEnvironmentVariable[]> {
    const response = await this.makeRequest<{ envs: VercelEnvironmentVariable[] }>(
      `/v9/projects/${projectId}/env`
    );
    return response.envs;
  }

  async updateEnvironmentVariable(
    projectId: string,
    envId: string,
    updates: Partial<VercelEnvironmentVariable>
  ): Promise<VercelEnvironmentVariable> {
    return this.makeRequest<VercelEnvironmentVariable>(
      `/v9/projects/${projectId}/env/${envId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteEnvironmentVariable(projectId: string, envId: string): Promise<void> {
    await this.makeRequest(`/v9/projects/${projectId}/env/${envId}`, {
      method: 'DELETE',
    });
  }

  // Domain Management
  async addDomain(projectId: string, domain: string): Promise<void> {
    await this.makeRequest(`/v9/projects/${projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });
  }

  async listDomains(projectId: string): Promise<Array<{ name: string; verified: boolean }>> {
    return this.makeRequest(`/v8/projects/${projectId}/domains`);
  }

  async verifyDomain(projectId: string, domain: string): Promise<void> {
    await this.makeRequest(`/v9/projects/${projectId}/domains/${domain}/verify`, {
      method: 'POST',
    });
  }

  // Logs and Metrics
  async getDeploymentLogs(deploymentId: string): Promise<Array<{ message: string; timestamp: number }>> {
    return this.makeRequest(`/v2/deployments/${deploymentId}/logs`);
  }

  async getProjectMetrics(projectId: string): Promise<{
    invocations: number;
    bandwidth: number;
    duration: number;
    cost: number;
  }> {
    return this.makeRequest(`/v4/projects/${projectId}/metrics`);
  }

  // Webhooks
  async createWebhook(projectId: string, webhook: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<{ id: string; url: string; events: string[] }> {
    return this.makeRequest(`/v1/webhooks`, {
      method: 'POST',
      body: JSON.stringify({
        ...webhook,
        projectId,
        teamId: this.config.teamId,
      }),
    });
  }

  async listWebhooks(projectId: string): Promise<Array<{ id: string; url: string; events: string[] }>> {
    return this.makeRequest(`/v1/webhooks?projectId=${projectId}`);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.makeRequest(`/v1/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }
}

export default VercelIntegration;

// Utility functions
export function createVercelClient(config: VercelConfig): VercelIntegration {
  return new VercelIntegration(config);
}

export function validateVercelConfig(config: VercelConfig): boolean {
  return !!config.accessToken;
}

// Environment variable helpers
export function getVercelConfigFromEnv(): VercelConfig | null {
  const accessToken = process.env.VERCEL_ACCESS_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    teamId,
    projectId,
  };
}