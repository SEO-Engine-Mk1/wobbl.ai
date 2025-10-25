/**
 * SendGrid Integration Configuration
 * Handles SendGrid email sending and template management
 */

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  sandboxMode?: boolean;
}

export interface SendGridEmail {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  content: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    type?: string;
    disposition?: string;
    contentId?: string;
  }>;
  categories?: string[];
  sendAt?: number;
  ipPoolName?: string;
  batchId?: string;
  asm?: {
    groupId: number;
    groupsToDisplay?: number[];
  };
  trackingSettings?: {
    clickTracking?: { enable: boolean; enableText?: boolean };
    openTracking?: { enable: boolean };
    subscriptionTracking?: {
      enable: boolean;
      text?: string;
      html?: string;
      substitution?: string;
    };
    ganalytics?: {
      enable: boolean;
      utmSource?: string;
      utmMedium?: string;
      utmTerm?: string;
      utmContent?: string;
      utmCampaign?: string;
    };
  };
}

export interface SendGridTemplate {
  id: string;
  name: string;
  generation: string;
  versions: Array<{
    id: string;
    template_id: string;
    active: number;
    name: string;
    html_content?: string;
    plain_content?: string;
    subject?: string;
    editor: string;
    thumbnail_url?: string;
    test_data?: string;
  }>;
  updated_at: string;
  created_at: string;
}

export interface SendGridContact {
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, any>;
}

export interface SendGridList {
  id: string;
  name: string;
  recipient_count: number;
}

export interface SendGridCampaign {
  id: string;
  title: string;
  subject: string;
  sender_id: number;
  list_ids: string[];
  categories: string[];
  suppression_group_id: number;
  custom_unsubscribe_url?: string;
  ip_pool?: string;
  html_content?: string;
  plain_content?: string;
  status: 'draft' | 'scheduled' | 'in progress' | 'completed' | 'canceled' | 'paused';
}

class SendGridIntegration {
  private config: SendGridConfig;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: SendGridConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`SendGrid API error: ${response.status} - ${error.errors?.[0]?.message || error.message || response.statusText}`);
    }

    return response.json();
  }

  // Email sending
  async sendEmail(email: SendGridEmail): Promise<{ messageId: string }> {
    const payload = {
      personalizations: [
        {
          to: Array.isArray(email.to) ? email.to.map(email => ({ email })) : [{ email: email.to }],
          cc: email.cc ? (Array.isArray(email.cc) ? email.cc.map(email => ({ email })) : [{ email: email.cc }]) : undefined,
          bcc: email.bcc ? (Array.isArray(email.bcc) ? email.bcc.map(email => ({ email })) : [{ email: email.bcc }]) : undefined,
          subject: email.subject,
          templateId: email.templateId,
          dynamicTemplateData: email.templateData,
          sendAt: email.sendAt,
        },
      ],
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName || this.config.fromEmail,
      },
      content: [
        {
          type: 'text/plain',
          value: email.content,
        },
        ...(email.html ? [{ type: 'text/html', value: email.html }] : []),
      ],
      attachments: email.attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : Buffer.from(att.content).toString('base64'),
        type: att.type,
        disposition: att.disposition || 'attachment',
        contentId: att.contentId,
      })),
      categories: email.categories,
      ipPoolName: email.ipPoolName,
      batchId: email.batchId,
      asm: email.asm,
      trackingSettings: email.trackingSettings,
      mail_settings: {
        sandbox_mode: {
          enable: this.config.sandboxMode || false,
        },
      },
    };

    const response = await fetch(`${this.baseUrl}/mail/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`SendGrid API error: ${response.status} - ${error.errors?.[0]?.message || error.message || response.statusText}`);
    }

    const messageId = response.headers.get('X-Message-Id');
    return { messageId: messageId || '' };
  }

  async sendTemplateEmail(
    templateId: string,
    to: string | string[],
    templateData: Record<string, any>,
    options: {
      subject?: string;
      fromEmail?: string;
      fromName?: string;
      categories?: string[];
      sendAt?: number;
    } = {}
  ): Promise<{ messageId: string }> {
    return this.sendEmail({
      to,
      templateId,
      templateData,
      subject: options.subject || '',
      content: '', // Required but not used with templates
      categories: options.categories,
      sendAt: options.sendAt,
    });
  }

  async sendBulkEmails(emails: SendGridEmail[]): Promise<{ messageId: string }[]> {
    const promises = emails.map(email => this.sendEmail(email));
    return Promise.all(promises);
  }

  // Template management
  async createTemplate(template: {
    name: string;
    generation: string;
  }): Promise<SendGridTemplate> {
    return this.makeRequest<SendGridTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async getTemplate(templateId: string): Promise<SendGridTemplate> {
    return this.makeRequest<SendGridTemplate>(`/templates/${templateId}`);
  }

  async listTemplates(options: {
    generations?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<SendGridTemplate[]> {
    const params = new URLSearchParams();
    if (options.generations) params.append('generations', options.generations);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const query = params.toString();
    return this.makeRequest<{ templates: SendGridTemplate[] }>(`/templates${query ? `?${query}` : ''}`)
      .then(response => response.templates);
  }

  async updateTemplate(
    templateId: string,
    updates: {
      name?: string;
    }
  ): Promise<SendGridTemplate> {
    return this.makeRequest<SendGridTemplate>(`/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await this.makeRequest(`/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // Template versions
  async createTemplateVersion(templateId: string, version: {
    name: string;
    subject?: string;
    htmlContent?: string;
    plainContent?: string;
    active?: number;
    editor?: string;
    testData?: string;
  }): Promise<any> {
    return this.makeRequest(`/templates/${templateId}/versions`, {
      method: 'POST',
      body: JSON.stringify({
        name: version.name,
        subject: version.subject,
        html_content: version.htmlContent,
        plain_content: version.plainContent,
        active: version.active || 1,
        editor: version.editor || 'code',
        test_data: version.testData,
      }),
    });
  }

  async updateTemplateVersion(
    templateId: string,
    versionId: string,
    updates: {
      name?: string;
      subject?: string;
      htmlContent?: string;
      plainContent?: string;
      active?: number;
      testData?: string;
    }
  ): Promise<any> {
    return this.makeRequest(`/templates/${templateId}/versions/${versionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: updates.name,
        subject: updates.subject,
        html_content: updates.htmlContent,
        plain_content: updates.plainContent,
        active: updates.active,
        test_data: updates.testData,
      }),
    });
  }

  async deleteTemplateVersion(templateId: string, versionId: string): Promise<void> {
    await this.makeRequest(`/templates/${templateId}/versions/${versionId}`, {
      method: 'DELETE',
    });
  }

  // Contact management
  async addContacts(contacts: SendGridContact[]): Promise<{ jobId: string }> {
    return this.makeRequest('/marketing/contacts', {
      method: 'PUT',
      body: JSON.stringify({
        contacts: contacts.map(contact => ({
          email: contact.email,
          first_name: contact.firstName,
          last_name: contact.lastName,
          ...contact.customFields,
        })),
      }),
    });
  }

  async getContacts(options: {
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{
    contact_count: number;
    result: Array<{
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      created_at: string;
      updated_at: string;
      custom_fields?: Record<string, any>;
    }>;
  }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.search) params.append('search', options.search);

    const query = params.toString();
    return this.makeRequest(`/marketing/contacts${query ? `?${query}` : ''}`);
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.makeRequest(`/marketing/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // List management
  async createList(name: string): Promise<SendGridList> {
    return this.makeRequest<SendGridList>('/marketing/lists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getList(listId: string): Promise<SendGridList> {
    return this.makeRequest<SendGridList>(`/marketing/lists/${listId}`);
  }

  async listLists(): Promise<SendGridList[]> {
    return this.makeRequest<{ result: SendGridList[] }>('/marketing/lists')
      .then(response => response.result);
  }

  async updateList(listId: string, name: string): Promise<SendGridList> {
    return this.makeRequest<SendGridList>(`/marketing/lists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async deleteList(listId: string): Promise<void> {
    await this.makeRequest(`/marketing/lists/${listId}`, {
      method: 'DELETE',
    });
  }

  async addContactsToList(listId: string, contactIds: string[]): Promise<{ jobId: string }> {
    return this.makeRequest(`/marketing/lists/${listId}/contacts`, {
      method: 'POST',
      body: JSON.stringify({ contact_ids: contactIds }),
    });
  }

  async removeContactsFromList(listId: string, contactIds: string[]): Promise<void> {
    await this.makeRequest(`/marketing/lists/${listId}/contacts`, {
      method: 'DELETE',
      body: JSON.stringify({ contact_ids: contactIds }),
    });
  }

  // Campaign management
  async createCampaign(campaign: {
    title: string;
    subject: string;
    senderId: number;
    listIds: string[];
    categories?: string[];
    suppressionGroupId?: number;
    customUnsubscribeUrl?: string;
    ipPool?: string;
    htmlContent?: string;
    plainContent?: string;
  }): Promise<SendGridCampaign> {
    return this.makeRequest<SendGridCampaign>('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        title: campaign.title,
        subject: campaign.subject,
        sender_id: campaign.senderId,
        list_ids: campaign.listIds,
        categories: campaign.categories || [],
        suppression_group_id: campaign.suppressionGroupId,
        custom_unsubscribe_url: campaign.customUnsubscribeUrl,
        ip_pool: campaign.ipPool,
        html_content: campaign.htmlContent,
        plain_content: campaign.plainContent,
      }),
    });
  }

  async getCampaign(campaignId: string): Promise<SendGridCampaign> {
    return this.makeRequest<SendGridCampaign>(`/marketing/campaigns/${campaignId}`);
  }

  async listCampaigns(): Promise<SendGridCampaign[]> {
    return this.makeRequest<{ result: SendGridCampaign[] }>('/marketing/campaigns')
      .then(response => response.result);
  }

  async updateCampaign(
    campaignId: string,
    updates: {
      title?: string;
      subject?: string;
      categories?: string[];
      htmlContent?: string;
      plainContent?: string;
    }
  ): Promise<SendGridCampaign> {
    return this.makeRequest<SendGridCampaign>(`/marketing/campaigns/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: updates.title,
        subject: updates.subject,
        categories: updates.categories,
        html_content: updates.htmlContent,
        plain_content: updates.plainContent,
      }),
    });
  }

  async sendCampaign(campaignId: string): Promise<void> {
    await this.makeRequest(`/marketing/campaigns/${campaignId}/schedules`, {
      method: 'POST',
      body: JSON.stringify({ send_at: 'now' }),
    });
  }

  async scheduleCampaign(campaignId: string, sendAt: number): Promise<void> {
    await this.makeRequest(`/marketing/campaigns/${campaignId}/schedules`, {
      method: 'POST',
      body: JSON.stringify({ send_at: sendAt }),
    });
  }

  async cancelScheduledCampaign(campaignId: string): Promise<void> {
    await this.makeRequest(`/marketing/campaigns/${campaignId}/schedules`, {
      method: 'DELETE',
    });
  }

  // Analytics and reporting
  async getEmailStats(options: {
    startDate: string;
    endDate: string;
    aggregatedBy?: 'day' | 'week' | 'month';
  }): Promise<Array<{
    date: string;
    requests: number;
    delivered: number;
    opens: number;
    clicks: number;
    bounces: number;
    spam_reports: number;
    unsubscribes: number;
  }>> {
    const params = new URLSearchParams();
    params.append('start_date', options.startDate);
    params.append('end_date', options.endDate);
    if (options.aggregatedBy) params.append('aggregated_by', options.aggregatedBy);

    return this.makeRequest(`/stats?${params.toString()}`);
  }

  // Sender verification
  async verifySender(sender: {
    email: string;
    nickname: string;
    fromName: string;
    replyTo: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }): Promise<{ id: number }> {
    return this.makeRequest('/verified_senders', {
      method: 'POST',
      body: JSON.stringify({
        nickname: sender.nickname,
        from_email: sender.email,
        from_name: sender.fromName,
        reply_to: sender.replyTo,
        address: sender.address,
        address2: sender.address2,
        city: sender.city,
        state: sender.state,
        zip: sender.zip,
        country: sender.country,
      }),
    });
  }

  async getVerifiedSenders(): Promise<Array<{
    id: number;
    email: string;
    nickname: string;
    from_name: string;
    reply_to: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
  }>> {
    return this.makeRequest('/verified_senders');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.getVerifiedSenders();
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }
}

export default SendGridIntegration;

// Utility functions
export function createSendGridClient(config: SendGridConfig): SendGridIntegration {
  return new SendGridIntegration(config);
}

export function validateSendGridConfig(config: SendGridConfig): boolean {
  return !!(config.apiKey && config.fromEmail);
}

export function getSendGridConfigFromEnv(): SendGridConfig | null {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME;
  const sandboxMode = process.env.SENDGRID_SANDBOX_MODE === 'true';

  if (!apiKey || !fromEmail) {
    return null;
  }

  return {
    apiKey,
    fromEmail,
    fromName,
    sandboxMode,
  };
}

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome-email',
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
  INVOICE: 'invoice',
  NEWSLETTER: 'newsletter',
  CAMPAIGN_UPDATE: 'campaign-update',
  SUBSCRIPTION_RENEWAL: 'subscription-renewal',
  PAYMENT_SUCCESS: 'payment-success',
  PAYMENT_FAILED: 'payment-failed',
} as const;