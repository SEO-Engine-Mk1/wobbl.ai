import nodemailer from 'nodemailer';
import { prisma } from '../../lib/db';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  replyTo?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'welcome' | 'newsletter' | 'promotion' | 'notification' | 'custom';
}

export interface EmailCampaign {
  id: string;
  userId: string;
  name: string;
  description: string;
  templateId: string | null;
  listIds: string[];
  scheduleType: 'immediate' | 'scheduled' | 'recurring';
  scheduledAt?: Date;
  recurringConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailList {
  id: string;
  name: string;
  description: string;
  subscribers: EmailSubscriber[];
  createdAt: Date;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, any>;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

export interface EmailSendResult {
  messageId: string;
  email: string;
  status: 'sent' | 'failed' | 'bounced';
  error?: string;
  timestamp: Date;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const newTemplate = await prisma.emailTemplate.create({
      data: {
        ...template,
        variables: JSON.stringify(template.variables),
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return {
      id: newTemplate.id,
      name: newTemplate.name,
      subject: newTemplate.subject,
      htmlContent: newTemplate.htmlContent,
      textContent: newTemplate.textContent,
      variables: JSON.parse(newTemplate.variables || '[]'),
      category: newTemplate.category as any,
    };
  }

  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    const where = category ? { category } : {};
    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: JSON.parse(template.variables || '[]'),
      category: template.category as any,
    }));
  }

  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCampaign> {
    const newCampaign = await prisma.emailCampaign.create({
      data: {
        ...campaign,
        listIds: Array.isArray(campaign.listIds) ? JSON.stringify(campaign.listIds) : campaign.listIds,
        // TODO: Fix recurringConfig type - convert object to JSON string for database
        recurringConfig: campaign.recurringConfig ? JSON.stringify(campaign.recurringConfig) : null,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return {
      id: newCampaign.id,
      name: newCampaign.name,
      description: newCampaign.description,
      templateId: newCampaign.templateId,
      listIds: JSON.parse(newCampaign.listIds),
      scheduleType: newCampaign.scheduleType as any,
      scheduledAt: newCampaign.scheduledAt || undefined,
      recurringConfig: newCampaign.recurringConfig ? JSON.parse(newCampaign.recurringConfig) : undefined,
      status: newCampaign.status as any,
      createdAt: newCampaign.createdAt,
      updatedAt: newCampaign.updatedAt,
      userId: newCampaign.userId,
    };
  }

  async sendCampaign(campaignId: string): Promise<EmailSendResult[]> {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true
      }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get all subscribers from the campaign's lists
    const listIds = Array.isArray(campaign.listIds) ? campaign.listIds : JSON.parse(campaign.listIds || '[]');
    const subscribers = await this.getCampaignSubscribers(listIds);
    
    const results: EmailSendResult[] = [];

    for (const subscriber of subscribers) {
      try {
        const result = await this.sendEmail(
          subscriber.email,
          campaign.template?.subject || '',
          campaign.template?.htmlContent || '',
          campaign.template?.textContent || '',
          this.subscriberToVariables(subscriber)
        );

        results.push({
          messageId: result.messageId,
          email: subscriber.email,
          status: 'sent',
          timestamp: new Date()
        });

        // Save send result
        await this.saveEmailResult(result.messageId, campaignId, subscriber.email, 'sent');

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        results.push({
          messageId: '',
          email: subscriber.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });

        // Save failed result
        await this.saveEmailResult('', campaignId, subscriber.email, 'failed', 
          error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { 
        status: 'completed',
        updatedAt: new Date()
      }
    });

    return results;
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    variables: Record<string, any> = {}
  ): Promise<{ messageId: string }> {
    // Replace variables in content
    const processedSubject = this.replaceVariables(subject, variables);
    const processedHtml = this.replaceVariables(htmlContent, variables);
    const processedText = textContent ? this.replaceVariables(textContent, variables) : undefined;

    const mailOptions = {
      from: this.config.from,
      replyTo: this.config.replyTo || this.config.from,
      to,
      subject: processedSubject,
      html: processedHtml,
      text: processedText,
    };

    const result = await this.transporter.sendMail(mailOptions);
    return { messageId: result.messageId };
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let processed = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  private subscriberToVariables(subscriber: EmailSubscriber): Record<string, any> {
    return {
      firstName: subscriber.firstName || '',
      lastName: subscriber.lastName || '',
      email: subscriber.email,
      fullName: `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim(),
      ...subscriber.customFields
    };
  }

  async createList(list: Omit<EmailList, 'id' | 'subscribers' | 'createdAt'>): Promise<EmailList> {
    const newList = await prisma.emailList.create({
      data: {
        ...list,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }
    });

    return {
      id: newList.id,
      name: newList.name,
      description: newList.description,
      subscribers: [],
      createdAt: newList.createdAt,
    };
  }

  async addSubscriber(listId: string, subscriber: Omit<EmailSubscriber, 'id' | 'subscribedAt'>): Promise<EmailSubscriber> {
    // Check if subscriber already exists
    const existingSubscriber = await prisma.emailSubscriber.findFirst({
      where: { email: subscriber.email }
    });

    let subscriberId: string;
    
    if (existingSubscriber) {
      subscriberId = existingSubscriber.id;
      // Update existing subscriber
      await prisma.emailSubscriber.update({
        where: { id: existingSubscriber.id },
        data: {
          firstName: subscriber.firstName,
          lastName: subscriber.lastName,
          customFields: subscriber.customFields,
          status: 'active',
          subscribedAt: new Date(),
        }
      });
    } else {
      // Create new subscriber
      const newSubscriber = await prisma.emailSubscriber.create({
        data: {
          ...subscriber,
          id: crypto.randomUUID(),
          status: 'active',
          subscribedAt: new Date(),
          customFields: JSON.stringify(subscriber.customFields || {}),
        }
      });
      subscriberId = newSubscriber.id;
    }

    // Add to list
    await prisma.emailListSubscriber.create({
      data: {
        listId,
        subscriberId,
        addedAt: new Date(),
      }
    });

    const subscriberData = await prisma.emailSubscriber.findUnique({
      where: { id: subscriberId }
    });

    return {
      id: subscriberData!.id,
      email: subscriberData!.email,
      firstName: subscriberData!.firstName || undefined,
      lastName: subscriberData!.lastName || undefined,
      customFields: JSON.parse(subscriberData!.customFields || '{}'),
      status: subscriberData!.status as any,
      subscribedAt: subscriberData!.subscribedAt,
      unsubscribedAt: subscriberData!.unsubscribedAt || undefined,
    };
  }

  async getCampaignSubscribers(listIds: string[]): Promise<EmailSubscriber[]> {
    const subscribers = await prisma.emailSubscriber.findMany({
      where: {
        status: 'active',
        lists: {
          some: {
            listId: {
              in: listIds
            }
          }
        }
      }
    });

    return subscribers.map(subscriber => ({
      id: subscriber.id,
      email: subscriber.email,
      firstName: subscriber.firstName || undefined,
      lastName: subscriber.lastName || undefined,
      customFields: (subscriber.customFields && typeof subscriber.customFields === 'object') ? subscriber.customFields as Record<string, any> : undefined,
      status: subscriber.status as any,
      subscribedAt: subscriber.subscribedAt,
      unsubscribedAt: subscriber.unsubscribedAt || undefined,
    }));
  }

  async unsubscribeSubscriber(email: string): Promise<void> {
    await prisma.emailSubscriber.updateMany({
      where: { email },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      }
    });
  }

  async getCampaignStats(campaignId: string): Promise<any> {
    const stats = await prisma.emailSendResult.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: { status: true }
    });

    const total = stats.reduce((sum, stat) => sum + stat._count.status, 0);
    const sent = stats.find(s => s.status === 'sent')?._count.status || 0;
    const failed = stats.find(s => s.status === 'failed')?._count.status || 0;
    const bounced = stats.find(s => s.status === 'bounced')?._count.status || 0;

    return {
      total,
      sent,
      failed,
      bounced,
      deliveryRate: total > 0 ? (sent / total) * 100 : 0,
      failureRate: total > 0 ? ((failed + bounced) / total) * 100 : 0
    };
  }

  async scheduleCampaign(campaignId: string, scheduledAt: Date): Promise<void> {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        scheduledAt,
        status: 'scheduled',
        updatedAt: new Date()
      }
    });
  }

  async getScheduledCampaigns(): Promise<EmailCampaign[]> {
    const campaigns = await prisma.emailCampaign.findMany({
      where: { 
        status: 'scheduled',
        scheduledAt: {
          lte: new Date()
        }
      }
    });

    return campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      templateId: campaign.templateId,
      listIds: JSON.parse(campaign.listIds || '[]'),
      scheduleType: campaign.scheduleType as any,
      scheduledAt: campaign.scheduledAt || undefined,
      recurringConfig: campaign.recurringConfig as any,
      status: campaign.status as any,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      userId: campaign.userId,
    }));
  }

  async processScheduledCampaigns(): Promise<void> {
    const scheduledCampaigns = await this.getScheduledCampaigns();

    for (const campaign of scheduledCampaigns) {
      try {
        await this.sendCampaign(campaign.id);
      } catch (error) {
        console.error(`Failed to process scheduled campaign ${campaign.id}:`, error);
        
        // Update campaign status to failed
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'failed',
            updatedAt: new Date()
          }
        });
      }
    }
  }

  private async saveEmailResult(
    messageId: string,
    campaignId: string,
    email: string,
    status: string,
    error?: string
  ): Promise<void> {
    await prisma.emailSendResult.create({
      data: {
        id: crypto.randomUUID(),
        messageId,
        campaignId,
        email,
        status,
        error,
        timestamp: new Date(),
      }
    });
  }

  async getLists(): Promise<EmailList[]> {
    const lists = await prisma.emailList.findMany({
      include: {
        subscribers: {
          include: {
            subscriber: true
          }
        }
      }
    });

    return lists.map(list => ({
      id: list.id,
      name: list.name,
      description: list.description,
      subscribers: list.subscribers.map(ls => ({
        id: ls.subscriber.id,
        email: ls.subscriber.email,
        firstName: ls.subscriber.firstName || undefined,
        lastName: ls.subscriber.lastName || undefined,
        customFields: JSON.parse(ls.subscriber.customFields || '{}'),
        status: ls.subscriber.status as any,
        subscribedAt: ls.subscriber.subscribedAt,
        unsubscribedAt: ls.subscriber.unsubscribedAt || undefined,
      })),
      createdAt: list.createdAt,
    }));
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      templateId: campaign.templateId,
      listIds: JSON.parse(campaign.listIds || '[]'),
      scheduleType: campaign.scheduleType as any,
      scheduledAt: campaign.scheduledAt || undefined,
      recurringConfig: campaign.recurringConfig as any,
      status: campaign.status as any,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      userId: campaign.userId,
    }));
  }
}