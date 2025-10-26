import ZAI from 'z-ai-web-dev-sdk';
import { prisma } from '../../lib/db';

export interface ArticleGenerationRequest {
  topic: string;
  keywords: string[];
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative';
  wordCount: number;
  targetAudience: string;
  seoOptimized: boolean;
  includeImages: boolean;
}

export interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  keywords: string[];
  metaDescription: string;
  readingTime: number;
  seoScore: number;
  images?: string[];
  createdAt: Date;
}

export class ArticleGenerationService {
  private zai: ZAI;

  constructor() {
    this.zai = null as any;
  }

  private async initializeZAI() {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
  }

  async generateArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    await this.initializeZAI();

    try {
      // Generate main content
      const contentPrompt = this.buildContentPrompt(request);
      const contentResponse = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer and SEO specialist. Create high-quality, engaging content that ranks well on search engines.'
          },
          {
            role: 'user',
            content: contentPrompt
          }
        ],
        max_tokens: Math.min(request.wordCount * 2, 4000),
        temperature: 0.7,
      });

      const generatedContent = contentResponse.choices[0]?.message?.content;
      if (!generatedContent) {
        throw new Error('Failed to generate content');
      }

      // Generate SEO metadata
      const seoPrompt = this.buildSeoPrompt(request.topic, generatedContent);
      const seoResponse = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Generate optimized metadata for the given content.'
          },
          {
            role: 'user',
            content: seoPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const seoData = this.parseSeoResponse(seoResponse.choices[0]?.message?.content || '');

      // Generate title if not provided
      const titlePrompt = `Generate a compelling, SEO-optimized title for an article about: ${request.topic}. Target keywords: ${request.keywords.join(', ')}. Tone: ${request.tone}.`;
      const titleResponse = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Generate compelling, SEO-optimized titles that attract clicks.'
          },
          {
            role: 'user',
            content: titlePrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      const title = titleResponse.choices[0]?.message?.content?.trim() || request.topic;

      // Calculate reading time
      const wordsPerMinute = 200;
      const wordCount = generatedContent.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);

      // Calculate SEO score
      const seoScore = this.calculateSeoScore(generatedContent, seoData, request.keywords);

      const article: GeneratedArticle = {
        id: crypto.randomUUID(),
        title,
        content: generatedContent,
        excerpt: this.generateExcerpt(generatedContent),
        keywords: request.keywords,
        metaDescription: seoData.metaDescription,
        readingTime,
        seoScore,
        createdAt: new Date(),
      };

      // Save to database
      await this.saveArticleToDatabase(article, request);

      return article;

    } catch (error) {
      console.error('Article generation failed:', error);
      throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enhanceArticle(articleId: string, enhancementType: 'seo' | 'readability' | 'engagement'): Promise<GeneratedArticle> {
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new Error('Article not found');
    }

    await this.initializeZAI();

    const enhancementPrompt = this.buildEnhancementPrompt(article.content, enhancementType);
    
    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert content editor specializing in ${enhancementType} optimization.`
        },
        {
          role: 'user',
          content: enhancementPrompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.5,
    });

    const enhancedContent = response.choices[0]?.message?.content;
    if (!enhancedContent) {
      throw new Error('Failed to enhance article');
    }

    // Update article with enhanced content
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        content: enhancedContent,
        updatedAt: new Date(),
      }
    });

    return {
      id: updatedArticle.id,
      title: updatedArticle.title,
      content: updatedArticle.content,
      excerpt: updatedArticle.excerpt || '',
      keywords: JSON.parse(updatedArticle.keywords || '[]'),
      metaDescription: updatedArticle.metaDescription || '',
      readingTime: updatedArticle.readingTime || 0,
      seoScore: updatedArticle.seoScore || 0,
      createdAt: updatedArticle.createdAt,
    };
  }

  private buildContentPrompt(request: ArticleGenerationRequest): string {
    return `
Write a comprehensive article about "${request.topic}" with the following requirements:

- Target Audience: ${request.targetAudience}
- Tone: ${request.tone}
- Word Count: Approximately ${request.wordCount} words
- Keywords to include: ${request.keywords.join(', ')}
- SEO Optimization: ${request.seoOptimized ? 'Yes' : 'No'}

Structure the article with:
1. Compelling introduction
2. Main body with clear headings and subheadings
3. Practical examples and insights
4. Conclusion with call-to-action

Additional requirements:
- Use short paragraphs (2-3 sentences max)
- Include bullet points and numbered lists where appropriate
- Make it engaging and informative
- Ensure natural keyword integration
- Add internal linking opportunities
    `;
  }

  private buildSeoPrompt(topic: string, content: string): string {
    return `
Analyze the following content about "${topic}" and generate SEO metadata:

Content:
${content.substring(0, 2000)}...

Please provide:
1. Meta Description (150-160 characters)
2. Focus Keyword
3. Secondary Keywords (5-7)
4. Content Score (1-100)
5. Recommendations for improvement

Format your response as JSON:
{
  "metaDescription": "...",
  "focusKeyword": "...",
  "secondaryKeywords": ["...", "..."],
  "contentScore": 85,
  "recommendations": ["...", "..."]
}
    `;
  }

  private buildEnhancementPrompt(content: string, enhancementType: string): string {
    const prompts = {
      seo: 'Improve this article for better SEO optimization. Add relevant keywords naturally, improve heading structure, and enhance meta elements.',
      readability: 'Improve the readability of this article. Use simpler language, shorter sentences, and better paragraph structure.',
      engagement: 'Make this article more engaging. Add compelling hooks, interesting examples, and stronger calls-to-action.'
    };

    return `
${prompts[enhancementType as keyof typeof prompts]}

Original content:
${content}

Please return the enhanced version of the content while maintaining the original meaning and structure.
    `;
  }

  private parseSeoResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      return {
        metaDescription: response.substring(0, 160),
        focusKeyword: '',
        secondaryKeywords: [],
        contentScore: 75,
        recommendations: []
      };
    }
  }

  private generateExcerpt(content: string, maxLength: number = 160): string {
    const plainText = content.replace(/[#*`]/g, '').replace(/\n+/g, ' ').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength - 3) + '...'
      : plainText;
  }

  private calculateSeoScore(content: string, seoData: any, keywords: string[]): number {
    let score = 0;
    
    // Content length (30 points)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 300) score += 30;
    else if (wordCount >= 200) score += 20;
    else if (wordCount >= 100) score += 10;

    // Keyword usage (25 points)
    const contentLower = content.toLowerCase();
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword.toLowerCase())) {
        score += 5;
      }
    });

    // Structure (20 points)
    if (content.includes('##') || content.includes('###')) score += 10; // Headings
    if (content.includes('-') || content.includes('*')) score += 10; // Lists

    // Meta description (15 points)
    if (seoData.metaDescription && seoData.metaDescription.length >= 150) {
      score += 15;
    }

    // Readability (10 points)
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;
    if (avgWordsPerSentence <= 20) score += 10;
    else if (avgWordsPerSentence <= 25) score += 5;

    return Math.min(score, 100);
  }

  private async saveArticleToDatabase(article: GeneratedArticle, request: ArticleGenerationRequest): Promise<void> {
    await prisma.article.create({
      data: {
        id: article.id,
        title: article.title,
        slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        content: article.content,
        excerpt: article.excerpt,
        keywords: JSON.stringify(request.keywords),
        metaDescription: article.metaDescription,
        readingTime: article.readingTime,
        seoScore: article.seoScore,
        status: 'draft',
        createdAt: article.createdAt,
        updatedAt: article.createdAt,
      }
    });
  }

  async getArticleById(articleId: string): Promise<GeneratedArticle | null> {
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) return null;

    return {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      keywords: JSON.parse(article.keywords || '[]'),
      metaDescription: article.metaDescription || '',
      readingTime: article.readingTime || 0,
      seoScore: article.seoScore || 0,
      createdAt: article.createdAt,
    };
  }

  async getArticlesByStatus(status: 'draft' | 'published' | 'archived'): Promise<GeneratedArticle[]> {
    const articles = await prisma.article.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });

    return articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      keywords: JSON.parse(article.keywords || '[]'),
      metaDescription: article.metaDescription || '',
      readingTime: article.readingTime || 0,
      seoScore: article.seoScore || 0,
      createdAt: article.createdAt,
    }));
  }
}