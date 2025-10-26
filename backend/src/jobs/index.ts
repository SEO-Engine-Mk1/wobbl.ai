import { Queue, Worker, Job } from 'bullmq';
import { ArticleGenerationService } from '../services/article-generation';
import { WordPressService } from '../services/wordpress';
import { SocialMediaService } from '../services/social';
import { EmailService } from '../services/email';

// Redis connection
const redisConnection = {
  host: process.env.REDIS_URL?.replace('redis://', '').split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[1] || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// Queue definitions
export const articleGenerationQueue = new Queue('article-generation', {
  connection: redisConnection,
});

export const wordpressPublishQueue = new Queue('wordpress-publish', {
  connection: redisConnection,
});

export const socialMediaQueue = new Queue('social-media', {
  connection: redisConnection,
});

export const emailCampaignQueue = new Queue('email-campaign', {
  connection: redisConnection,
});

export const analyticsQueue = new Queue('analytics', {
  connection: redisConnection,
});

// Job types
export interface ArticleGenerationJob {
  type: 'generate' | 'enhance';
  data: any;
  userId: string;
}

export interface WordPressPublishJob {
  articleId: string;
  config: any;
  status: 'draft' | 'pending' | 'publish' | 'private';
  scheduledAt?: Date;
}

export interface SocialMediaJob {
  articleId: string;
  platforms: string[];
  content: any;
  scheduledAt?: Date;
}

export interface EmailCampaignJob {
  campaignId: string;
  scheduleType: 'immediate' | 'scheduled';
  emailConfig: any;
}

export interface AnalyticsJob {
  type: 'gsc' | 'social' | 'email' | 'cost';
  data: any;
}

// Article Generation Worker
const articleGenerationWorker = new Worker(
  'article-generation',
  async (job: Job<ArticleGenerationJob>) => {
    const { type, data, userId } = job.data;
    const articleService = new ArticleGenerationService();

    try {
      switch (type) {
        case 'generate':
          const result = await articleService.generateArticle(data);
          await job.updateProgress(100);
          return result;

        case 'enhance':
          const enhanced = await articleService.enhanceArticle(data.articleId, data.enhancementType);
          await job.updateProgress(100);
          return enhanced;

        default:
          throw new Error(`Unknown job type: ${type}`);
      }
    } catch (error) {
      console.error(`Article generation job failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Limit concurrent AI API calls
  }
);

// WordPress Publishing Worker
const wordpressPublishWorker = new Worker(
  'wordpress-publish',
  async (job: Job<WordPressPublishJob>) => {
    const { articleId, config, status, scheduledAt } = job.data;
    const wpService = new WordPressService(config);

    try {
      await job.updateProgress(25);

      // Get article from database
      const article = await getArticleFromDatabase(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      await job.updateProgress(50);

      const wpPost = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        status: status,
        metaDescription: article.metaDescription,
        focusKeyword: article.keywords[0] || '',
      };

      let result;
      if (status === 'scheduled' && scheduledAt) {
        result = await wpService.schedulePost(wpPost, scheduledAt);
      } else {
        result = await wpService.publishPost(wpPost);
      }

      await job.updateProgress(100);
      return result;

    } catch (error) {
      console.error(`WordPress publish job failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

// Social Media Worker
const socialMediaWorker = new Worker(
  'social-media',
  async (job: Job<SocialMediaJob>) => {
    const { articleId, platforms, content, scheduledAt } = job.data;
    const socialService = new SocialMediaService(content.socialConfig);

    try {
      await job.updateProgress(20);

      if (scheduledAt) {
        // Schedule for later
        const result = await socialService.schedulePost(content, scheduledAt);
        await job.updateProgress(100);
        return result;
      } else {
        // Publish immediately
        const result = await socialService.publishToSocialMedia(content);
        await job.updateProgress(100);
        return result;
      }

    } catch (error) {
      console.error(`Social media job failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

// Email Campaign Worker
const emailCampaignWorker = new Worker(
  'email-campaign',
  async (job: Job<EmailCampaignJob>) => {
    const { campaignId, scheduleType } = job.data;
    const emailService = new EmailService(job.data.emailConfig);

    try {
      await job.updateProgress(25);

      if (scheduleType === 'scheduled') {
        // Process scheduled campaigns
        const result = await emailService.processScheduledCampaigns();
        await job.updateProgress(100);
        return result;
      } else {
        // Send immediately
        const result = await emailService.sendCampaign(campaignId);
        await job.updateProgress(100);
        return result;
      }

    } catch (error) {
      console.error(`Email campaign job failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Limit concurrent email sending
  }
);

// Analytics Worker
const analyticsWorker = new Worker(
  'analytics',
  async (job: Job<AnalyticsJob>) => {
    const { type, data } = job.data;

    try {
      await job.updateProgress(25);

      switch (type) {
        case 'gsc':
          await processGSCData(data);
          break;
        case 'social':
          await processSocialAnalytics(data);
          break;
        case 'email':
          await processEmailAnalytics(data);
          break;
        case 'cost':
          await processCostAnalytics(data);
          break;
        default:
          throw new Error(`Unknown analytics type: ${type}`);
      }

      await job.updateProgress(100);

    } catch (error) {
      console.error(`Analytics job failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

// Helper functions
async function getArticleFromDatabase(articleId: string) {
  // This would typically use your ORM/service to get the article
  return {
    id: articleId,
    title: 'Sample Article',
    content: 'Sample content...',
    excerpt: 'Sample excerpt...',
    metaDescription: 'Sample meta description...',
    keywords: ['sample', 'article'],
  };
}

async function processGSCData(data: any) {
  // Process Google Search Console data
  console.log('Processing GSC data:', data);
}

async function processSocialAnalytics(data: any) {
  // Process social media analytics
  console.log('Processing social analytics:', data);
}

async function processEmailAnalytics(data: any) {
  // Process email campaign analytics
  console.log('Processing email analytics:', data);
}

async function processCostAnalytics(data: any) {
  // Process cost analytics
  console.log('Processing cost analytics:', data);
}

// Error handling
articleGenerationWorker.on('failed', (job, err) => {
  console.error(`Article generation job ${job?.id} failed:`, err);
});

wordpressPublishWorker.on('failed', (job, err) => {
  console.error(`WordPress publish job ${job?.id} failed:`, err);
});

socialMediaWorker.on('failed', (job, err) => {
  console.error(`Social media job ${job?.id} failed:`, err);
});

emailCampaignWorker.on('failed', (job, err) => {
  console.error(`Email campaign job ${job?.id} failed:`, err);
});

analyticsWorker.on('failed', (job, err) => {
  console.error(`Analytics job ${job?.id} failed:`, err);
});

// Success logging
articleGenerationWorker.on('completed', (job, result) => {
  console.log(`Article generation job ${job.id} completed:`, result);
});

wordpressPublishWorker.on('completed', (job, result) => {
  console.log(`WordPress publish job ${job.id} completed:`, result);
});

socialMediaWorker.on('completed', (job, result) => {
  console.log(`Social media job ${job.id} completed:`, result);
});

emailCampaignWorker.on('completed', (job, result) => {
  console.log(`Email campaign job ${job.id} completed:`, result);
});

analyticsWorker.on('completed', (job, result) => {
  console.log(`Analytics job ${job.id} completed:`, result);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down workers...');
  
  await articleGenerationWorker.close();
  await wordpressPublishWorker.close();
  await socialMediaWorker.close();
  await emailCampaignWorker.close();
  await analyticsWorker.close();
  
  process.exit(0);
});

export {
  articleGenerationWorker,
  wordpressPublishWorker,
  socialMediaWorker,
  emailCampaignWorker,
  analyticsWorker,
};