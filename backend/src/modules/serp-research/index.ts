/**
 * SERP Research Module
 * Handles search engine results page analysis and outline generation
 */

export interface SERPResult {
  id: string;
  title: string;
  url: string;
  description: string;
  position: number;
  domain: string;
  wordCount: number;
  publishedAt?: Date;
  author?: string;
  structuredData?: Record<string, any>;
  keywords: string[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  contentPreview: string;
  backlinks?: number;
  pageAuthority?: number;
  domainAuthority?: number;
}

export interface KeywordAnalysis {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  difficulty: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  relatedKeywords: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
  }>;
  questions: Array<{
    question: string;
    volume: number;
    difficulty: number;
  }>;
}

export interface ContentOutline {
  id: string;
  keyword: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    heading: string;
    level: number;
    wordCount: number;
    keywords: string[];
    questions: string[];
    examples: string[];
    statistics?: string[];
    subSections?: Array<{
      id: string;
      heading: string;
      level: number;
      wordCount: number;
      keywords: string[];
    }>;
  }>;
  totalWordCount: number;
  estimatedReadTime: number;
  targetAudience: string;
  tone: 'formal' | 'casual' | 'professional' | 'friendly';
  contentType: 'blog-post' | 'article' | 'guide' | 'tutorial' | 'review';
  seoScore: number;
  competitivenessScore: number;
  gapAnalysis: {
    missingTopics: string[];
    overcoveredTopics: string[];
    uniqueAngles: string[];
  };
}

export interface SERPAnalysisJob {
  id: string;
  keyword: string;
  location?: string;
  language?: string;
  device?: 'desktop' | 'mobile';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: SERPResult[];
  analysis: KeywordAnalysis;
  outline: ContentOutline;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
}

export class SERPResearchService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.serpresearch.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Analyze SERP for a given keyword
   */
  async analyzeSERP(keyword: string, options: {
    location?: string;
    language?: string;
    device?: 'desktop' | 'mobile';
    maxResults?: number;
  } = {}): Promise<SERPResult[]> {
    const params = new URLSearchParams({
      keyword,
      api_key: this.apiKey,
      location: options.location || 'United States',
      language: options.language || 'en',
      device: options.device || 'desktop',
      num: (options.maxResults || 10).toString(),
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`);
    if (!response.ok) {
      throw new Error(`SERP API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformSERPResults(data.organic_results || []);
  }

  /**
   * Get keyword analysis data
   */
  async analyzeKeyword(keyword: string, options: {
    location?: string;
    language?: string;
  } = {}): Promise<KeywordAnalysis> {
    const params = new URLSearchParams({
      keyword,
      api_key: this.apiKey,
      location: options.location || 'United States',
      language: options.language || 'en',
    });

    const response = await fetch(`${this.baseUrl}/keyword-analysis?${params}`);
    if (!response.ok) {
      throw new Error(`Keyword analysis API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Generate content outline based on SERP analysis
   */
  async generateOutline(
    keyword: string,
    serpResults: SERPResult[],
    keywordAnalysis: KeywordAnalysis,
    options: {
      contentType?: ContentOutline['contentType'];
      tone?: ContentOutline['tone'];
      targetAudience?: string;
      wordCount?: number;
    } = {}
  ): Promise<ContentOutline> {
    // Analyze common patterns in SERP results
    const commonHeadings = this.extractCommonHeadings(serpResults);
    const contentGaps = this.identifyContentGaps(serpResults, keywordAnalysis);
    const uniqueAngles = this.identifyUniqueAngles(serpResults, keywordAnalysis);

    // Generate outline structure
    const outline: ContentOutline = {
      id: this.generateId(),
      keyword,
      title: this.generateTitle(keyword, serpResults, keywordAnalysis),
      description: this.generateDescription(keyword, keywordAnalysis),
      sections: this.generateSections(commonHeadings, contentGaps, options),
      totalWordCount: options.wordCount || this.calculateOptimalWordCount(serpResults),
      estimatedReadTime: 0, // Will be calculated
      targetAudience: options.targetAudience || this.determineTargetAudience(keywordAnalysis),
      tone: options.tone || this.determineTone(keywordAnalysis),
      contentType: options.contentType || this.determineContentType(keywordAnalysis),
      seoScore: 0, // Will be calculated
      competitivenessScore: this.calculateCompetitivenessScore(serpResults),
      gapAnalysis: {
        missingTopics: contentGaps.missing,
        overcoveredTopics: contentGaps.overcovered,
        uniqueAngles,
      },
    };

    // Calculate estimated read time (assuming 200 words per minute)
    outline.estimatedReadTime = Math.ceil(outline.totalWordCount / 200);

    // Calculate SEO score
    outline.seoScore = this.calculateSEOScore(outline, serpResults, keywordAnalysis);

    return outline;
  }

  /**
   * Create a comprehensive SERP research job
   */
  async createResearchJob(keyword: string, options: {
    location?: string;
    language?: string;
    device?: 'desktop' | 'mobile';
    contentType?: ContentOutline['contentType'];
    tone?: ContentOutline['tone'];
    targetAudience?: string;
    wordCount?: number;
  } = {}): Promise<SERPAnalysisJob> {
    const job: SERPAnalysisJob = {
      id: this.generateId(),
      keyword,
      location: options.location,
      language: options.language,
      device: options.device,
      status: 'pending',
      progress: 0,
      results: [],
      analysis: {} as KeywordAnalysis,
      outline: {} as ContentOutline,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Update status to running
      job.status = 'running';
      job.progress = 10;
      job.updatedAt = new Date();

      // Step 1: Analyze SERP
      job.results = await this.analyzeSERP(keyword, options);
      job.progress = 40;
      job.updatedAt = new Date();

      // Step 2: Analyze keyword
      job.analysis = await this.analyzeKeyword(keyword, options);
      job.progress = 60;
      job.updatedAt = new Date();

      // Step 3: Generate outline
      job.outline = await this.generateOutline(keyword, job.results, job.analysis, options);
      job.progress = 90;
      job.updatedAt = new Date();

      // Complete job
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      job.updatedAt = new Date();

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date();
    }

    return job;
  }

  /**
   * Transform raw SERP results to our format
   */
  private transformSERPResults(results: any[]): SERPResult[] {
    return results.map((result, index) => ({
      id: this.generateId(),
      title: result.title || '',
      url: result.link || '',
      description: result.snippet || '',
      position: index + 1,
      domain: this.extractDomain(result.link),
      wordCount: result.word_count || 0,
      publishedAt: result.date ? new Date(result.date) : undefined,
      author: result.author,
      structuredData: result.structured_data,
      keywords: this.extractKeywords(result),
      headings: this.extractHeadings(result),
      contentPreview: result.snippet || '',
      backlinks: result.backlinks,
      pageAuthority: result.page_authority,
      domainAuthority: result.domain_authority,
    }));
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  /**
   * Extract keywords from SERP result
   */
  private extractKeywords(result: any): string[] {
    const text = `${result.title || ''} ${result.snippet || ''}`;
    // Simple keyword extraction - in production, use NLP library
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  /**
   * Extract headings from SERP result
   */
  private extractHeadings(result: any): { h1: string[]; h2: string[]; h3: string[] } {
    return {
      h1: result.headings?.h1 || [],
      h2: result.headings?.h2 || [],
      h3: result.headings?.h3 || [],
    };
  }

  /**
   * Extract common headings from SERP results
   */
  private extractCommonHeadings(serpResults: SERPResult[]): Record<string, number> {
    const headingCounts: Record<string, number> = {};
    
    serpResults.forEach(result => {
      [...result.headings.h1, ...result.headings.h2, ...result.headings.h3].forEach(heading => {
        const normalized = heading.toLowerCase().trim();
        headingCounts[normalized] = (headingCounts[normalized] || 0) + 1;
      });
    });

    // Return headings that appear in at least 30% of results
    const threshold = Math.ceil(serpResults.length * 0.3);
    const commonHeadings: Record<string, number> = {};
    
    Object.entries(headingCounts).forEach(([heading, count]) => {
      if (count >= threshold) {
        commonHeadings[heading] = count;
      }
    });

    return commonHeadings;
  }

  /**
   * Identify content gaps in SERP results
   */
  private identifyContentGaps(serpResults: SERPResult[], keywordAnalysis: KeywordAnalysis): {
    missing: string[];
    overcovered: string[];
  } {
    const allTopics = new Set<string>();
    const coveredTopics = new Map<string, number>();

    // Collect all topics from related keywords and questions
    keywordAnalysis.relatedKeywords.forEach(kw => allTopics.add(kw.keyword));
    keywordAnalysis.questions.forEach(q => allTopics.add(q.question));

    // Count coverage in SERP results
    serpResults.forEach(result => {
      result.keywords.forEach(keyword => {
        if (allTopics.has(keyword)) {
          coveredTopics.set(keyword, (coveredTopics.get(keyword) || 0) + 1);
        }
      });
    });

    // Identify missing and overcovered topics
    const missing: string[] = [];
    const overcovered: string[] = [];

    allTopics.forEach(topic => {
      const coverage = coveredTopics.get(topic) || 0;
      if (coverage === 0) {
        missing.push(topic);
      } else if (coverage > serpResults.length * 0.7) {
        overcovered.push(topic);
      }
    });

    return { missing, overcovered };
  }

  /**
   * Identify unique angles for content
   */
  private identifyUniqueAngles(serpResults: SERPResult[], keywordAnalysis: KeywordAnalysis): string[] {
    const angles: string[] = [];

    // Analyze search intent
    if (keywordAnalysis.intent === 'informational') {
      angles.push('Comprehensive guide with step-by-step instructions');
      angles.push('Expert insights and industry statistics');
    } else if (keywordAnalysis.intent === 'commercial') {
      angles.push('Comparison of top solutions with pros and cons');
      angles.push('Cost analysis and ROI calculations');
    } else if (keywordAnalysis.intent === 'transactional') {
      angles.push('Actionable tutorial with immediate results');
      angles.push('Tool recommendations and implementation guide');
    }

    // Check for content gaps
    const hasVideoContent = serpResults.some(result => result.url.includes('youtube') || result.url.includes('vimeo'));
    if (!hasVideoContent) {
      angles.push('Video tutorial or demonstration');
    }

    const hasDataVisualization = serpResults.some(result => 
      result.description.toLowerCase().includes('chart') || 
      result.description.toLowerCase().includes('graph')
    );
    if (!hasDataVisualization) {
      angles.push('Data visualization and infographics');
    }

    return angles;
  }

  /**
   * Generate optimized title
   */
  private generateTitle(keyword: string, serpResults: SERPResult[], keywordAnalysis: KeywordAnalysis): string {
    const currentYear = new Date().getFullYear();
    
    // Analyze top performing titles
    const topTitles = serpResults.slice(0, 3).map(r => r.title);
    
    // Common title patterns
    const patterns = [
      `${keyword}: The Complete Guide (${currentYear})`,
      `How to ${keyword} - Step by Step Tutorial`,
      `${keyword} for Beginners: Everything You Need to Know`,
      `The Ultimate ${keyword} Guide (${currentYear} Update)`,
      `${keyword}: Best Practices and Expert Tips`,
    ];

    // Select best pattern based on search intent
    if (keywordAnalysis.intent === 'informational') {
      return patterns[0];
    } else if (keywordAnalysis.intent === 'commercial') {
      return patterns[3];
    } else {
      return patterns[1];
    }
  }

  /**
   * Generate meta description
   */
  private generateDescription(keyword: string, keywordAnalysis: KeywordAnalysis): string {
    const descriptions = [
      `Discover the best ${keyword} strategies and techniques. Learn from experts and boost your results with our comprehensive guide.`,
      `Everything you need to know about ${keyword}. Get expert tips, step-by-step instructions, and real-world examples.`,
      `Master ${keyword} with our complete guide. Learn proven strategies, avoid common mistakes, and achieve better results.`,
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  /**
   * Generate content sections
   */
  private generateSections(
    commonHeadings: Record<string, number>,
    contentGaps: { missing: string[]; overcovered: string[] },
    options: any
  ): ContentOutline['sections'] {
    const sections: ContentOutline['sections'] = [];

    // Introduction section
    sections.push({
      id: this.generateId(),
      heading: 'Introduction',
      level: 1,
      wordCount: 150,
      keywords: [],
      questions: [],
      examples: [],
    });

    // Add common headings from SERP
    Object.entries(commonHeadings).forEach(([heading, count]) => {
      sections.push({
        id: this.generateId(),
        heading: this.capitalizeFirst(heading),
        level: this.getHeadingLevel(heading),
        wordCount: Math.floor(300 * (count / 10)), // Scale word count by frequency
        keywords: [],
        questions: [],
        examples: [],
      });
    });

    // Add missing topics
    contentGaps.missing.slice(0, 3).forEach(topic => {
      sections.push({
        id: this.generateId(),
        heading: this.capitalizeFirst(topic),
        level: 2,
        wordCount: 250,
        keywords: [topic],
        questions: [],
        examples: [],
      });
    });

    // Conclusion section
    sections.push({
      id: this.generateId(),
      heading: 'Conclusion',
      level: 1,
      wordCount: 100,
      keywords: [],
      questions: [],
      examples: [],
    });

    return sections;
  }

  /**
   * Calculate optimal word count based on SERP analysis
   */
  private calculateOptimalWordCount(serpResults: SERPResult[]): number {
    const wordCounts = serpResults
      .filter(r => r.wordCount > 0)
      .map(r => r.wordCount);

    if (wordCounts.length === 0) return 2000;

    const average = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
    const max = Math.max(...wordCounts);
    
    // Target 10% more than average but not exceeding max
    return Math.min(Math.ceil(average * 1.1), max);
  }

  /**
   * Determine target audience based on keyword analysis
   */
  private determineTargetAudience(keywordAnalysis: KeywordAnalysis): string {
    const audiences = {
      informational: 'Beginners and learners looking for comprehensive information',
      commercial: 'Business professionals and decision makers',
      transactional: 'Practitioners and implementers',
      navigational: 'Users looking for specific resources or tools',
    };

    return audiences[keywordAnalysis.intent];
  }

  /**
   * Determine appropriate tone
   */
  private determineTone(keywordAnalysis: KeywordAnalysis): ContentOutline['tone'] {
    if (keywordAnalysis.intent === 'informational') {
      return 'professional';
    } else if (keywordAnalysis.intent === 'commercial') {
      return 'formal';
    } else {
      return 'friendly';
    }
  }

  /**
   * Determine content type
   */
  private determineContentType(keywordAnalysis: KeywordAnalysis): ContentOutline['contentType'] {
    if (keywordAnalysis.intent === 'informational') {
      return 'guide';
    } else if (keywordAnalysis.intent === 'transactional') {
      return 'tutorial';
    } else {
      return 'article';
    }
  }

  /**
   * Calculate competitiveness score
   */
  private calculateCompetitivenessScore(serpResults: SERPResult[]): number {
    const domainAuthorities = serpResults
      .filter(r => r.domainAuthority)
      .map(r => r.domainAuthority!);

    if (domainAuthorities.length === 0) return 50;

    const averageDA = domainAuthorities.reduce((sum, da) => sum + da, 0) / domainAuthorities.length;
    
    // Convert to 0-100 scale (higher DA = more competitive)
    return Math.min(100, Math.ceil(averageDA));
  }

  /**
   * Calculate SEO score
   */
  private calculateSEOScore(
    outline: ContentOutline,
    serpResults: SERPResult[],
    keywordAnalysis: KeywordAnalysis
  ): number {
    let score = 0;

    // Title optimization (20 points)
    if (outline.title.toLowerCase().includes(outline.keyword.toLowerCase())) {
      score += 20;
    }

    // Description optimization (15 points)
    if (outline.description.toLowerCase().includes(outline.keyword.toLowerCase())) {
      score += 15;
    }

    // Content structure (25 points)
    const hasH1 = outline.sections.some(s => s.level === 1);
    const hasH2 = outline.sections.some(s => s.level === 2);
    if (hasH1 && hasH2) score += 25;

    // Content gaps (20 points)
    if (outline.gapAnalysis.missingTopics.length > 0) {
      score += 20;
    }

    // Word count appropriateness (20 points)
    const avgWordCount = serpResults.reduce((sum, r) => sum + r.wordCount, 0) / serpResults.length;
    if (outline.totalWordCount >= avgWordCount * 0.8 && outline.totalWordCount <= avgWordCount * 1.2) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Utility functions
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getHeadingLevel(heading: string): number {
    // Simple heuristic - in production, use more sophisticated analysis
    if (heading.length < 30) return 1;
    if (heading.length < 50) return 2;
    return 3;
  }
}

export default SERPResearchService;