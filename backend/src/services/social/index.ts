import axios from 'axios';
import { prisma } from '../../lib/db';

export interface SocialMediaConfig {
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
  linkedin?: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
  };
  facebook?: {
    appId: string;
    appSecret: string;
    accessToken: string;
    pageId?: string;
  };
}

export interface SocialPost {
  content: string;
  imageUrl?: string;
  link?: string;
  hashtags?: string[];
  platforms: ('twitter' | 'linkedin' | 'facebook')[];
  scheduledAt?: Date;
}

export interface SocialMediaResponse {
  platform: string;
  postId: string;
  url: string;
  status: 'published' | 'scheduled' | 'failed';
  error?: string;
}

export class SocialMediaService {
  private config: SocialMediaConfig;

  constructor(config: SocialMediaConfig) {
    this.config = config;
  }

  async publishToSocialMedia(post: SocialPost): Promise<SocialMediaResponse[]> {
    const results: SocialMediaResponse[] = [];

    for (const platform of post.platforms) {
      try {
        const result = await this.publishToPlatform(platform, post);
        results.push(result);
        
        // Save to database
        await this.saveSocialPost(result, post);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to publish to ${platform}:`, error);
        results.push({
          platform,
          postId: '',
          url: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  private async publishToPlatform(platform: string, post: SocialPost): Promise<SocialMediaResponse> {
    switch (platform) {
      case 'twitter':
        return this.publishToTwitter(post);
      case 'linkedin':
        return this.publishToLinkedIn(post);
      case 'facebook':
        return this.publishToFacebook(post);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async publishToTwitter(post: SocialPost): Promise<SocialMediaResponse> {
    if (!this.config.twitter) {
      throw new Error('Twitter configuration not found');
    }

    try {
      // Adapt content for Twitter (280 character limit)
      const twitterContent = this.adaptContentForTwitter(post.content, post.hashtags);
      
      // Mock Twitter API call (replace with actual Twitter API v2 implementation)
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        {
          text: twitterContent,
          media: post.imageUrl ? { media_ids: [await this.uploadTwitterMedia(post.imageUrl)] } : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.twitter.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        platform: 'twitter',
        postId: response.data.data.id,
        url: `https://twitter.com/user/status/${response.data.data.id}`,
        status: 'published'
      };

    } catch (error) {
      console.error('Twitter publishing failed:', error);
      throw new Error('Failed to publish to Twitter');
    }
  }

  private async publishToLinkedIn(post: SocialPost): Promise<SocialMediaResponse> {
    if (!this.config.linkedin) {
      throw new Error('LinkedIn configuration not found');
    }

    try {
      const linkedinContent = this.adaptContentForLinkedIn(post.content, post.hashtags);
      
      // Mock LinkedIn API call
      const response = await axios.post(
        'https://api.linkedin.com/v2/shares',
        {
          content: {
            contentEntities: post.link ? [{ entityLocation: post.link }] : [],
            title: post.content.substring(0, 100),
            text: linkedinContent
          },
          distribution: {
            linkedInDistributionTarget: {}
          },
          owner: `urn:li:person:${this.config.linkedin.accessToken}`,
          subject: post.content.substring(0, 100)
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.linkedin.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        platform: 'linkedin',
        postId: response.data.id,
        url: `https://linkedin.com/feed/update/${response.data.id}`,
        status: 'published'
      };

    } catch (error) {
      console.error('LinkedIn publishing failed:', error);
      throw new Error('Failed to publish to LinkedIn');
    }
  }

  private async publishToFacebook(post: SocialPost): Promise<SocialMediaResponse> {
    if (!this.config.facebook) {
      throw new Error('Facebook configuration not found');
    }

    try {
      const facebookContent = this.adaptContentForFacebook(post.content, post.hashtags);
      const pageId = this.config.facebook.pageId || 'me';
      
      // Mock Facebook API call
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          message: facebookContent,
          link: post.link,
          picture: post.imageUrl,
          access_token: this.config.facebook.accessToken
        }
      );

      return {
        platform: 'facebook',
        postId: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
        status: 'published'
      };

    } catch (error) {
      console.error('Facebook publishing failed:', error);
      throw new Error('Failed to publish to Facebook');
    }
  }

  private adaptContentForTwitter(content: string, hashtags?: string[]): string {
    let adapted = content;
    
    // Add hashtags
    if (hashtags && hashtags.length > 0) {
      adapted += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }
    
    // Truncate to 280 characters
    if (adapted.length > 280) {
      adapted = adapted.substring(0, 277) + '...';
    }
    
    return adapted;
  }

  private adaptContentForLinkedIn(content: string, hashtags?: string[]): string {
    let adapted = content;
    
    // LinkedIn allows more content, so we can be more descriptive
    if (hashtags && hashtags.length > 0) {
      adapted += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }
    
    return adapted;
  }

  private adaptContentForFacebook(content: string, hashtags?: string[]): string {
    let adapted = content;
    
    // Facebook handles hashtags differently
    if (hashtags && hashtags.length > 0) {
      adapted += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }
    
    return adapted;
  }

  private async uploadTwitterMedia(imageUrl: string): Promise<string> {
    // Mock media upload - implement actual Twitter media upload
    return 'mock_media_id';
  }

  async schedulePost(post: SocialPost, scheduledAt: Date): Promise<SocialMediaResponse[]> {
    // Save scheduled post to database
    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        content: post.content,
        imageUrl: post.imageUrl,
        link: post.link,
        hashtags: post.hashtags || [],
        platforms: post.platforms,
        scheduledAt,
        status: 'scheduled',
        createdAt: new Date(),
      }
    });

    // Return mock responses for now
    return post.platforms.map(platform => ({
      platform,
      postId: scheduledPost.id,
      url: '',
      status: 'scheduled' as const
    }));
  }

  async getScheduledPosts(): Promise<any[]> {
    return await prisma.scheduledPost.findMany({
      where: { status: 'scheduled' },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  async publishScheduledPosts(): Promise<void> {
    const scheduledPosts = await this.getScheduledPosts();
    const now = new Date();

    for (const scheduledPost of scheduledPosts) {
      if (new Date(scheduledPost.scheduledAt) <= now) {
        try {
          const post: SocialPost = {
            content: scheduledPost.content,
            imageUrl: scheduledPost.imageUrl || undefined,
            link: scheduledPost.link || undefined,
            hashtags: scheduledPost.hashtags as string[],
            platforms: scheduledPost.platforms as ('twitter' | 'linkedin' | 'facebook')[]
          };

          await this.publishToSocialMedia(post);

          // Update status
          await prisma.scheduledPost.update({
            where: { id: scheduledPost.id },
            data: { status: 'published', publishedAt: new Date() }
          });

        } catch (error) {
          console.error(`Failed to publish scheduled post ${scheduledPost.id}:`, error);
          
          // Update status to failed
          await prisma.scheduledPost.update({
            where: { id: scheduledPost.id },
            data: { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          });
        }
      }
    }
  }

  async getPostAnalytics(postId: string, platform: string): Promise<any> {
    // Mock analytics - implement actual platform-specific analytics
    return {
      postId,
      platform,
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 25),
      reach: Math.floor(Math.random() * 1000),
      engagement: Math.floor(Math.random() * 100)
    };
  }

  async deletePost(postId: string, platform: string): Promise<void> {
    try {
      switch (platform) {
        case 'twitter':
          // Implement Twitter delete
          break;
        case 'linkedin':
          // Implement LinkedIn delete
          break;
        case 'facebook':
          // Implement Facebook delete
          break;
      }
    } catch (error) {
      console.error(`Failed to delete post from ${platform}:`, error);
      throw new Error(`Failed to delete post from ${platform}`);
    }
  }

  private async saveSocialPost(response: SocialMediaResponse, post: SocialPost): Promise<void> {
    await prisma.socialPost.create({
      data: {
        platform: response.platform,
        postId: response.postId,
        url: response.url,
        status: response.status,
        content: post.content,
        imageUrl: post.imageUrl,
        link: post.link,
        hashtags: post.hashtags || [],
        publishedAt: new Date(),
        createdAt: new Date(),
      }
    });
  }

  async getConnectedPlatforms(): Promise<string[]> {
    const platforms: string[] = [];
    
    if (this.config.twitter) platforms.push('twitter');
    if (this.config.linkedin) platforms.push('linkedin');
    if (this.config.facebook) platforms.push('facebook');
    
    return platforms;
  }

  async testConnection(platform: string): Promise<boolean> {
    try {
      switch (platform) {
        case 'twitter':
          return this.config.twitter ? true : false;
        case 'linkedin':
          return this.config.linkedin ? true : false;
        case 'facebook':
          return this.config.facebook ? true : false;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }
}