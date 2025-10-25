import axios from 'axios';
import { prisma } from '../../lib/db';

export interface WordPressConfig {
  url: string;
  username: string;
  password: string;
}

export interface WordPressPost {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'publish' | 'private' | 'pending';
  categories?: number[];
  tags?: number[];
  featuredMedia?: number;
  metaDescription?: string;
  focusKeyword?: string;
}

export interface WordPressResponse {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  link: string;
  date: string;
  modified: string;
  categories: any[];
  tags: any[];
  featuredMedia: number;
}

export class WordPressService {
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.url}/wp-json/wp/v2/users/me`, {
        auth: {
          username: this.config.username,
          password: this.config.password
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      return false;
    }
  }

  async publishPost(post: WordPressPost): Promise<WordPressResponse> {
    try {
      const wpPost = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        categories: post.categories || [],
        tags: post.tags || [],
        featured_media: post.featuredMedia || 0,
        meta: {
          description: post.metaDescription,
          focus_keyword: post.focusKeyword
        }
      };

      const response = await axios.post(
        `${this.config.url}/wp-json/wp/v2/posts`,
        wpPost,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const wpResponse: WordPressResponse = response.data;
      
      // Update article in database with WordPress info
      await this.updateArticleWithWordPressInfo(wpResponse);

      return wpResponse;

    } catch (error) {
      console.error('WordPress publishing failed:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`WordPress API Error: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to publish to WordPress');
    }
  }

  async updatePost(postId: number, post: Partial<WordPressPost>): Promise<WordPressResponse> {
    try {
      const wpPost = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        categories: post.categories,
        tags: post.tags,
        featured_media: post.featuredMedia,
        meta: {
          description: post.metaDescription,
          focus_keyword: post.focusKeyword
        }
      };

      const response = await axios.put(
        `${this.config.url}/wp-json/wp/v2/posts/${postId}`,
        wpPost,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('WordPress update failed:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`WordPress API Error: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to update WordPress post');
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.config.url}/wp-json/wp/v2/categories`,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  async getTags(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.config.url}/wp-json/wp/v2/tags`,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  }

  async uploadMedia(imageBuffer: Buffer, filename: string, mimeType: string): Promise<number> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer.buffer], { type: mimeType }), filename);

      const response = await axios.post(
        `${this.config.url}/wp-json/wp/v2/media`,
        formData,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          },
          headers: {
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        }
      );

      return response.data.id;

    } catch (error) {
      console.error('Media upload failed:', error);
      throw new Error('Failed to upload media to WordPress');
    }
  }

  async deletePost(postId: number): Promise<void> {
    try {
      await axios.delete(
        `${this.config.url}/wp-json/wp/v2/posts/${postId}`,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          }
        }
      );
    } catch (error) {
      console.error('WordPress deletion failed:', error);
      throw new Error('Failed to delete WordPress post');
    }
  }

  async getPostStatus(postId: number): Promise<string> {
    try {
      const response = await axios.get(
        `${this.config.url}/wp-json/wp/v2/posts/${postId}`,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          }
        }
      );
      return response.data.status;
    } catch (error) {
      console.error('Failed to get post status:', error);
      return 'unknown';
    }
  }

  async schedulePost(post: WordPressPost, publishDate: Date): Promise<WordPressResponse> {
    try {
      const wpPost = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: 'future',
        date: publishDate.toISOString(),
        categories: post.categories || [],
        tags: post.tags || [],
        featured_media: post.featuredMedia || 0,
        meta: {
          description: post.metaDescription,
          focus_keyword: post.focusKeyword
        }
      };

      const response = await axios.post(
        `${this.config.url}/wp-json/wp/v2/posts`,
        wpPost,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('WordPress scheduling failed:', error);
      throw new Error('Failed to schedule WordPress post');
    }
  }

  async bulkPublish(posts: WordPressPost[]): Promise<WordPressResponse[]> {
    const results: WordPressResponse[] = [];
    
    for (const post of posts) {
      try {
        const result = await this.publishPost(post);
        results.push(result);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to publish post "${post.title}":`, error);
        // Continue with other posts even if one fails
      }
    }
    
    return results;
  }

  private async updateArticleWithWordPressInfo(wpResponse: WordPressResponse): Promise<void> {
    // Find article by title (assuming WordPress title matches article title)
    const article = await prisma.article.findFirst({
      where: { title: wpResponse.title }
    });

    if (article) {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          wordpressPostId: wpResponse.id,
          wordpressUrl: wpResponse.link,
          wordpressStatus: wpResponse.status,
          publishedAt: wpResponse.status === 'publish' ? new Date(wpResponse.date) : null,
          updatedAt: new Date(),
        }
      });
    }
  }

  async getSiteInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.config.url}/wp-json/wp/v2`);
      return response.data;
    } catch (error) {
      console.error('Failed to get site info:', error);
      return null;
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.config.url}/wp-json/wp/v2/users/me`,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }
}