/**
 * Article Generation Module
 * Handles AI-powered content creation with E-E-A-T validation
 */

import { ContentOutline, SERPResult } from '../serp-research';

export interface GeneratedArticle {
  id: string;
  outlineId: string;
  title: string;
  content: string;
  metaDescription: string;
  slug: string;
  wordCount: number;
  readTime: number;
  sections: ArticleSection[];
  eeatScore: EEATScore;
  qualityScore: number;
  originalityScore: number;
  seoScore: number;
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  author?: string;
  tags: string[];
  categories: string[];
  featuredImage?: string;
  internalLinks: InternalLink[];
  externalLinks: ExternalLink[];
  schema: StructuredData;
}

export interface ArticleSection {
  id: string;
  heading: string;
  level: number;
  content: string;
  wordCount: number;
  keywords: string[];
  eeatScore: EEATScore;
  qualityMetrics: QualityMetrics;
  suggestions: string[];
}

export interface EEATScore {
  experience: number; // 0-100
  expertise: number; // 0-100
  authoritativeness: number; // 0-100
  trustworthiness: number; // 0-100
  overall: number; // 0-100
  details: {
    experience: {
      hasPersonalExperience: boolean;
      hasRealWorldExamples: boolean;
      hasPracticalTips: boolean;
      hasCaseStudies: boolean;
    };
    expertise: {
      hasExpertQuotes: boolean;
      hasScientificBacking: boolean;
      hasTechnicalAccuracy: boolean;
      hasIndustryKnowledge: boolean;
    };
    authoritativeness: {
      hasCitations: boolean;
      hasReferences: boolean;
      hasAuthorCredentials: boolean;
      hasReputableSources: boolean;
    };
    trustworthiness: {
      hasFactChecking: boolean;
      hasTransparency: boolean;
      hasContactInfo: boolean;
      hasUpdatedContent: boolean;
    };
  };
}

export interface QualityMetrics {
  readabilityScore: number; // 0-100
  grammarScore: number; // 0-100
  coherenceScore: number; // 0-100
  depthScore: number; // 0-100
  uniquenessScore: number; // 0-100
  engagementScore: number; // 0-100
  structureScore: number; // 0-100
}

export interface InternalLink {
  url: string;
  anchorText: string;
  relevanceScore: number;
  position: number;
}

export interface ExternalLink {
  url: string;
  anchorText: string;
  domainAuthority: number;
  relevanceScore: number;
  isNofollow: boolean;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  author: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage?: {
    '@type': string;
    '@id': string;
  };
  image?: {
    '@type': string;
    url: string;
    height: number;
    width: number;
  };
  articleBody?: string;
  wordCount?: number;
  keywords?: string[];
}

export interface GenerationOptions {
  tone: 'professional' | 'casual' | 'formal' | 'friendly';
  targetAudience: string;
  wordCount: number;
  includeImages: boolean;
  includeVideos: boolean;
  includeInfographics: boolean;
  maxSections?: number;
  language: string;
  region: string;
  includeInternalLinks: boolean;
  includeExternalLinks: boolean;
  eeatThreshold: number; // Minimum E-E-A-T score required
  qualityThreshold: number; // Minimum quality score required
}

export class ArticleGenerationService {
  private openaiApiKey: string;
  private maxRetries: number = 3;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  /**
   * Generate complete article from outline
   */
  async generateArticle(
    outline: ContentOutline,
    serpResults: SERPResult[],
    options: GenerationOptions
  ): Promise<GeneratedArticle> {
    const article: GeneratedArticle = {
      id: this.generateId(),
      outlineId: outline.id,
      title: outline.title,
      content: '',
      metaDescription: outline.description,
      slug: this.generateSlug(outline.title),
      wordCount: 0,
      readTime: 0,
      sections: [],
      eeatScore: {} as EEATScore,
      qualityScore: 0,
      originalityScore: 0,
      seoScore: 0,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: this.extractTags(outline),
      categories: this.extractCategories(outline),
      internalLinks: [],
      externalLinks: [],
      schema: {} as StructuredData,
    };

    try {
      // Generate sections
      article.sections = await this.generateSections(outline, serpResults, options);
      
      // Combine content
      article.content = this.combineSectionContent(article.sections);
      article.wordCount = this.countWords(article.content);
      article.readTime = Math.ceil(article.wordCount / 200); // 200 words per minute

      // Generate E-E-A-T score
      article.eeatScore = await this.calculateEEATScore(article, outline);

      // Generate quality metrics
      const qualityMetrics = await this.calculateQualityMetrics(article);
      article.qualityScore = this.calculateOverallQualityScore(qualityMetrics);

      // Generate originality score
      article.originalityScore = await this.calculateOriginalityScore(article, serpResults);

      // Generate SEO score
      article.seoScore = await this.calculateSEOScore(article, outline, serpResults);

      // Generate internal links
      if (options.includeInternalLinks) {
        article.internalLinks = await this.generateInternalLinks(article, outline);
      }

      // Generate external links
      if (options.includeExternalLinks) {
        article.externalLinks = await this.generateExternalLinks(article, serpResults);
      }

      // Generate structured data
      article.schema = this.generateStructuredData(article);

      // Validate thresholds
      if (article.eeatScore.overall < options.eeatThreshold) {
        throw new Error(`E-E-A-T score ${article.eeatScore.overall} below threshold ${options.eeatThreshold}`);
      }

      if (article.qualityScore < options.qualityThreshold) {
        throw new Error(`Quality score ${article.qualityScore} below threshold ${options.qualityThreshold}`);
      }

      article.status = 'review';
      article.updatedAt = new Date();

    } catch (error) {
      article.status = 'draft';
      article.updatedAt = new Date();
      throw error;
    }

    return article;
  }

  /**
   * Generate individual sections
   */
  private async generateSections(
    outline: ContentOutline,
    serpResults: SERPResult[],
    options: GenerationOptions
  ): Promise<ArticleSection[]> {
    const sections: ArticleSection[] = [];
    const maxSections = options.maxSections || outline.sections.length;

    for (let i = 0; i < Math.min(maxSections, outline.sections.length); i++) {
      const outlineSection = outline.sections[i];
      
      try {
        const section = await this.generateSection(
          outlineSection,
          outline,
          serpResults,
          options,
          i
        );
        sections.push(section);
      } catch (error) {
        console.error(`Failed to generate section ${outlineSection.heading}:`, error);
        // Continue with other sections
      }
    }

    return sections;
  }

  /**
   * Generate individual section content
   */
  private async generateSection(
    outlineSection: any,
    outline: ContentOutline,
    serpResults: SERPResult[],
    options: GenerationOptions,
    index: number
  ): Promise<ArticleSection> {
    const prompt = this.buildSectionPrompt(outlineSection, outline, serpResults, options, index);
    
    const content = await this.callOpenAI(prompt, {
      maxTokens: Math.min(2000, outlineSection.wordCount * 2),
      temperature: 0.7,
    });

    const section: ArticleSection = {
      id: this.generateId(),
      heading: outlineSection.heading,
      level: outlineSection.level,
      content: content.trim(),
      wordCount: this.countWords(content),
      keywords: this.extractKeywords(content, outlineSection.keywords),
      eeatScore: await this.calculateSectionEEATScore(content, outlineSection),
      qualityMetrics: await this.calculateSectionQualityMetrics(content),
      suggestions: await this.generateSectionSuggestions(content, outlineSection),
    };

    return section;
  }

  /**
   * Build prompt for section generation
   */
  private buildSectionPrompt(
    outlineSection: any,
    outline: ContentOutline,
    serpResults: SERPResult[],
    options: GenerationOptions,
    index: number
  ): string {
    const context = this.buildContext(outline, serpResults, options);
    const sectionContext = this.buildSectionContext(outlineSection, index, outline.sections);
    
    return `
You are an expert content writer specializing in ${outline.keyword} topics. Write a comprehensive section for an article.

${context}

SECTION DETAILS:
- Heading: ${outlineSection.heading}
- Level: ${outlineSection.level}
- Target Word Count: ${outlineSection.wordCount}
- Keywords to include: ${outlineSection.keywords.join(', ')}
- Questions to answer: ${outlineSection.questions.join(', ')}
- Examples to include: ${outlineSection.examples.join(', ')}

${sectionContext}

REQUIREMENTS:
1. Write approximately ${outlineSection.wordCount} words
2. Include all specified keywords naturally
3. Answer all questions thoroughly
4. Include relevant examples
5. Maintain ${options.tone} tone
6. Target audience: ${options.targetAudience}
7. Ensure E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)
8. Include practical advice and real-world examples
9. Cite relevant statistics or studies when applicable
10. Make it engaging and informative

Write the section content:
`;
  }

  /**
   * Build overall context for the article
   */
  private buildContext(outline: ContentOutline, serpResults: SERPResult[], options: GenerationOptions): string {
    const topCompetitors = serpResults.slice(0, 3).map(r => r.title).join(', ');
    
    return `
ARTICLE CONTEXT:
- Main Keyword: ${outline.keyword}
- Title: ${outline.title}
- Total Target Word Count: ${outline.totalWordCount}
- Content Type: ${outline.contentType}
- Tone: ${options.tone}
- Target Audience: ${options.targetAudience}
- Language: ${options.language}
- Region: ${options.region}

TOP COMPETITORS: ${topCompetitors}

CONTENT GAPS TO ADDRESS:
${outline.gapAnalysis.missingTopics.map(topic => `- ${topic}`).join('\n')}

UNIQUE ANGLES TO EXPLORE:
${outline.gapAnalysis.uniqueAngles.map(angle => `- ${angle}`).join('\n')}
`;
  }

  /**
   * Build section-specific context
   */
  private buildSectionContext(outlineSection: any, index: number, allSections: any[]): string {
    const previousSection = index > 0 ? allSections[index - 1] : null;
    const nextSection = index < allSections.length - 1 ? allSections[index + 1] : null;
    
    let context = '';
    
    if (previousSection) {
      context += `PREVIOUS SECTION: ${previousSection.heading}\n`;
    }
    
    if (nextSection) {
      context += `NEXT SECTION: ${nextSection.heading}\n`;
    }
    
    if (outlineSection.subSections && outlineSection.subSections.length > 0) {
      context += `SUB-SECTIONS TO COVER:\n`;
      outlineSection.subSections.forEach((sub: any) => {
        context += `- ${sub.heading} (${sub.wordCount} words)\n`;
      });
    }
    
    return context;
  }

  /**
   * Calculate E-E-A-T score for article
   */
  private async calculateEEATScore(article: GeneratedArticle, outline: ContentOutline): Promise<EEATScore> {
    const details = {
      experience: {
        hasPersonalExperience: this.checkPersonalExperience(article.content),
        hasRealWorldExamples: this.checkRealWorldExamples(article.content),
        hasPracticalTips: this.checkPracticalTips(article.content),
        hasCaseStudies: this.checkCaseStudies(article.content),
      },
      expertise: {
        hasExpertQuotes: this.checkExpertQuotes(article.content),
        hasScientificBacking: this.checkScientificBacking(article.content),
        hasTechnicalAccuracy: this.checkTechnicalAccuracy(article.content, outline.keyword),
        hasIndustryKnowledge: this.checkIndustryKnowledge(article.content),
      },
      authoritativeness: {
        hasCitations: this.checkCitations(article.content),
        hasReferences: this.checkReferences(article.content),
        hasAuthorCredentials: this.checkAuthorCredentials(article.content),
        hasReputableSources: this.checkReputableSources(article.content),
      },
      trustworthiness: {
        hasFactChecking: this.checkFactChecking(article.content),
        hasTransparency: this.checkTransparency(article.content),
        hasContactInfo: this.checkContactInfo(article.content),
        hasUpdatedContent: this.checkUpdatedContent(article.content),
      },
    };

    const experience = this.calculateExperienceScore(details.experience);
    const expertise = this.calculateExpertiseScore(details.expertise);
    const authoritativeness = this.calculateAuthoritativenessScore(details.authoritativeness);
    const trustworthiness = this.calculateTrustworthinessScore(details.trustworthiness);
    const overall = Math.round((experience + expertise + authoritativeness + trustworthiness) / 4);

    return {
      experience,
      expertise,
      authoritativeness,
      trustworthiness,
      overall,
      details,
    };
  }

  /**
   * Calculate E-E-A-T score for section
   */
  private async calculateSectionEEATScore(content: string, outlineSection: any): Promise<EEATScore> {
    // Simplified version for sections
    const experience = this.checkPersonalExperience(content) ? 80 : 60;
    const expertise = this.checkExpertQuotes(content) ? 85 : 70;
    const authoritativeness = this.checkCitations(content) ? 80 : 65;
    const trustworthiness = this.checkFactChecking(content) ? 85 : 70;
    const overall = Math.round((experience + expertise + authoritativeness + trustworthiness) / 4);

    return {
      experience,
      expertise,
      authoritativeness,
      trustworthiness,
      overall,
      details: {
        experience: {
          hasPersonalExperience: this.checkPersonalExperience(content),
          hasRealWorldExamples: this.checkRealWorldExamples(content),
          hasPracticalTips: this.checkPracticalTips(content),
          hasCaseStudies: this.checkCaseStudies(content),
        },
        expertise: {
          hasExpertQuotes: this.checkExpertQuotes(content),
          hasScientificBacking: this.checkScientificBacking(content),
          hasTechnicalAccuracy: this.checkTechnicalAccuracy(content, ''),
          hasIndustryKnowledge: this.checkIndustryKnowledge(content),
        },
        authoritativeness: {
          hasCitations: this.checkCitations(content),
          hasReferences: this.checkReferences(content),
          hasAuthorCredentials: this.checkAuthorCredentials(content),
          hasReputableSources: this.checkReputableSources(content),
        },
        trustworthiness: {
          hasFactChecking: this.checkFactChecking(content),
          hasTransparency: this.checkTransparency(content),
          hasContactInfo: this.checkContactInfo(content),
          hasUpdatedContent: this.checkUpdatedContent(content),
        },
      },
    };
  }

  /**
   * Calculate quality metrics
   */
  private async calculateQualityMetrics(article: GeneratedArticle): Promise<QualityMetrics> {
    const content = article.content;
    
    return {
      readabilityScore: this.calculateReadabilityScore(content),
      grammarScore: await this.calculateGrammarScore(content),
      coherenceScore: this.calculateCoherenceScore(content),
      depthScore: this.calculateDepthScore(content, article.sections),
      uniquenessScore: this.calculateUniquenessScore(content),
      engagementScore: this.calculateEngagementScore(content),
      structureScore: this.calculateStructureScore(article.sections),
    };
  }

  /**
   * Calculate quality metrics for section
   */
  private async calculateSectionQualityMetrics(content: string): Promise<QualityMetrics> {
    return {
      readabilityScore: this.calculateReadabilityScore(content),
      grammarScore: await this.calculateGrammarScore(content),
      coherenceScore: this.calculateCoherenceScore(content),
      depthScore: this.calculateDepthScore(content, []),
      uniquenessScore: this.calculateUniquenessScore(content),
      engagementScore: this.calculateEngagementScore(content),
      structureScore: 80, // Sections have simple structure
    };
  }

  /**
   * Generate section suggestions
   */
  private async generateSectionSuggestions(content: string, outlineSection: any): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Check word count
    const wordCount = this.countWords(content);
    if (wordCount < outlineSection.wordCount * 0.8) {
      suggestions.push(`Consider expanding this section to meet the target word count of ${outlineSection.wordCount} words`);
    } else if (wordCount > outlineSection.wordCount * 1.2) {
      suggestions.push(`Consider condensing this section to be closer to the target word count of ${outlineSection.wordCount} words`);
    }

    // Check keyword inclusion
    const missingKeywords = outlineSection.keywords.filter(keyword => 
      !content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (missingKeywords.length > 0) {
      suggestions.push(`Consider including these keywords: ${missingKeywords.join(', ')}`);
    }

    // Check for examples
    if (!this.checkRealWorldExamples(content)) {
      suggestions.push('Consider adding real-world examples to improve E-E-A-T score');
    }

    // Check for data/statistics
    if (!this.checkScientificBacking(content)) {
      suggestions.push('Consider adding statistics or research data to support your claims');
    }

    return suggestions;
  }

  /**
   * E-E-A-T checking methods
   */
  private checkPersonalExperience(content: string): boolean {
    const experienceIndicators = [
      'in my experience', 'i have found', 'personally', 'i\'ve seen',
      'from my experience', 'i can tell you', 'based on my experience',
      'i\'ve worked with', 'in my work', 'i\'ve discovered'
    ];
    
    return experienceIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkRealWorldExamples(content: string): boolean {
    const exampleIndicators = [
      'for example', 'for instance', 'such as', 'like', 'consider',
      'imagine', 'let\'s say', 'take the case of', 'here\'s an example'
    ];
    
    return exampleIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkPracticalTips(content: string): boolean {
    const tipIndicators = [
      'here are some tips', 'tips to', 'how to', 'step by step',
      'practical advice', 'useful tips', 'helpful tips', 'pro tip'
    ];
    
    return tipIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkCaseStudies(content: string): boolean {
    const caseStudyIndicators = [
      'case study', 'case studies', 'research shows', 'study found',
      'according to research', 'research indicates', 'studies have shown'
    ];
    
    return caseStudyIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkExpertQuotes(content: string): boolean {
    const quoteIndicators = [
      'according to', 'says', 'said', 'explains', 'notes', 'points out',
      'suggests', 'recommends', 'advises', 'believes'
    ];
    
    return quoteIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkScientificBacking(content: string): boolean {
    const scienceIndicators = [
      'research', 'study', 'data', 'statistics', 'analysis', 'evidence',
      'scientific', 'clinical trial', 'peer-reviewed', 'journal'
    ];
    
    return scienceIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkTechnicalAccuracy(content: string, keyword: string): boolean {
    // Simplified check - in production, use fact-checking API
    return content.length > 100; // Basic heuristic
  }

  private checkIndustryKnowledge(content: string): boolean {
    const industryIndicators = [
      'industry', 'market', 'sector', 'professional', 'business',
      'commercial', 'enterprise', 'organization', 'company'
    ];
    
    return industryIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkCitations(content: string): boolean {
    const citationPatterns = [
      /\[\d+\]/, // [1], [2], etc.
      /\([^)]*\d{4}[^)]*\)/, // (Smith, 2023)
      /https?:\/\/[^\s]+/ // URLs
    ];
    
    return citationPatterns.some(pattern => pattern.test(content));
  }

  private checkReferences(content: string): boolean {
    const referenceIndicators = [
      'source', 'reference', 'according to', 'based on', 'from',
      'reported by', 'mentioned in', 'found in', 'published in'
    ];
    
    return referenceIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkAuthorCredentials(content: string): boolean {
    const credentialIndicators = [
      'expert', 'specialist', 'professional', 'certified', 'licensed',
      'experienced', 'qualified', 'authority', 'phd', 'md', 'cpa'
    ];
    
    return credentialIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkReputableSources(content: string): boolean {
    const reputableDomains = [
      'harvard', 'mit', 'stanford', 'yale', 'oxford', 'cambridge',
      'nih', 'cdc', 'who', 'unicef', 'forbes', 'wsj', 'reuters'
    ];
    
    return reputableDomains.some(domain => 
      content.toLowerCase().includes(domain)
    );
  }

  private checkFactChecking(content: string): boolean {
    const factCheckIndicators = [
      'fact', 'verify', 'confirm', 'accurate', 'correct', 'validated',
      'proven', 'tested', 'evidence-based', 'research-backed'
    ];
    
    return factCheckIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkTransparency(content: string): boolean {
    const transparencyIndicators = [
      'disclosure', 'transparent', 'honest', 'open', 'clear',
      'admit', 'acknowledge', 'reveal', 'disclose', 'confess'
    ];
    
    return transparencyIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private checkContactInfo(content: string): boolean {
    const contactPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
      /contact/i
    ];
    
    return contactPatterns.some(pattern => pattern.test(content));
  }

  private checkUpdatedContent(content: string): boolean {
    const updateIndicators = [
      '2023', '2024', '2025', 'recently', 'latest', 'current',
      'updated', 'new', 'fresh', 'modern'
    ];
    
    return updateIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  /**
   * Score calculation methods
   */
  private calculateExperienceScore(details: EEATScore['details']['experience']): number {
    let score = 0;
    if (details.hasPersonalExperience) score += 25;
    if (details.hasRealWorldExamples) score += 25;
    if (details.hasPracticalTips) score += 25;
    if (details.hasCaseStudies) score += 25;
    return score;
  }

  private calculateExpertiseScore(details: EEATScore['details']['expertise']): number {
    let score = 0;
    if (details.hasExpertQuotes) score += 25;
    if (details.hasScientificBacking) score += 25;
    if (details.hasTechnicalAccuracy) score += 25;
    if (details.hasIndustryKnowledge) score += 25;
    return score;
  }

  private calculateAuthoritativenessScore(details: EEATScore['details']['authoritativeness']): number {
    let score = 0;
    if (details.hasCitations) score += 25;
    if (details.hasReferences) score += 25;
    if (details.hasAuthorCredentials) score += 25;
    if (details.hasReputableSources) score += 25;
    return score;
  }

  private calculateTrustworthinessScore(details: EEATScore['details']['trustworthiness']): number {
    let score = 0;
    if (details.hasFactChecking) score += 25;
    if (details.hasTransparency) score += 25;
    if (details.hasContactInfo) score += 25;
    if (details.hasUpdatedContent) score += 25;
    return score;
  }

  private calculateReadabilityScore(content: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = this.countWords(content);
    const syllables = this.countSyllables(content);
    
    if (sentences === 0 || words === 0) return 50;
    
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private async calculateGrammarScore(content: string): Promise<number> {
    // Simplified grammar check - in production, use grammar API
    const commonErrors = [
      /\b(a|an)\s+[aeiou]/i, // a/an errors
      /\b(its|it\'s)\s/g, // its/it's confusion
      /\b(there|their|they\'re)\s/g, // there/their/they're confusion
    ];
    
    let errorCount = 0;
    commonErrors.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) errorCount += matches.length;
    });
    
    const sentences = content.split(/[.!?]+/).length;
    const errorRate = errorCount / sentences;
    
    return Math.max(0, Math.min(100, Math.round(100 - (errorRate * 20))));
  }

  private calculateCoherenceScore(content: string): number {
    // Simplified coherence check
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 50;
    
    // Check for transition words
    const transitionWords = [
      'however', 'therefore', 'moreover', 'furthermore', 'consequently',
      'nevertheless', 'nonetheless', 'meanwhile', 'otherwise', 'likewise'
    ];
    
    const transitionCount = transitionWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    const transitionRate = transitionCount / sentences.length;
    return Math.min(100, Math.round(50 + (transitionRate * 100)));
  }

  private calculateDepthScore(content: string, sections: ArticleSection[]): number {
    const wordCount = this.countWords(content);
    const sectionCount = sections.length;
    
    // Base score from word count
    let score = Math.min(50, Math.round(wordCount / 20));
    
    // Bonus for multiple sections
    if (sectionCount > 3) score += 20;
    if (sectionCount > 5) score += 15;
    if (sectionCount > 8) score += 15;
    
    return Math.min(100, score);
  }

  private calculateUniquenessScore(content: string): number {
    // Simplified uniqueness check - in production, use plagiarism API
    const commonPhrases = [
      'in conclusion', 'in summary', 'to summarize', 'in other words',
      'for the most part', 'at the end of the day', 'when all is said and done'
    ];
    
    const clicheCount = commonPhrases.filter(phrase => 
      content.toLowerCase().includes(phrase)
    ).length;
    
    const penalty = clicheCount * 5;
    return Math.max(0, 100 - penalty);
  }

  private calculateEngagementScore(content: string): number {
    const engagementIndicators = [
      'you', 'your', 'imagine', 'picture this', 'think about',
      'consider', 'remember', 'don\'t forget', 'keep in mind'
    ];
    
    const indicatorCount = engagementIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;
    
    const wordCount = this.countWords(content);
    const engagementRate = indicatorCount / (wordCount / 100); // Per 100 words
    
    return Math.min(100, Math.round(50 + (engagementRate * 25)));
  }

  private calculateStructureScore(sections: ArticleSection[]): number {
    if (sections.length === 0) return 0;
    
    let score = 0;
    
    // Check for proper heading hierarchy
    const hasH1 = sections.some(s => s.level === 1);
    const hasH2 = sections.some(s => s.level === 2);
    if (hasH1) score += 30;
    if (hasH2) score += 20;
    
    // Check for logical flow
    let previousLevel = 0;
    let flowScore = 0;
    sections.forEach(section => {
      if (section.level <= previousLevel + 1) {
        flowScore += 10;
      }
      previousLevel = section.level;
    });
    score += Math.min(30, flowScore);
    
    // Bonus for variety in section lengths
    const lengths = sections.map(s => s.wordCount);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    if (variance > 1000) score += 20; // Good variety
    
    return Math.min(100, score);
  }

  private calculateOverallQualityScore(metrics: QualityMetrics): number {
    return Math.round(
      (metrics.readabilityScore * 0.15 +
       metrics.grammarScore * 0.15 +
       metrics.coherenceScore * 0.15 +
       metrics.depthScore * 0.20 +
       metrics.uniquenessScore * 0.15 +
       metrics.engagementScore * 0.10 +
       metrics.structureScore * 0.10)
    );
  }

  private async calculateOriginalityScore(article: GeneratedArticle, serpResults: SERPResult[]): Promise<number> {
    // Simplified originality check - in production, use embedding similarity
    const content = article.content;
    const competitorContent = serpResults.map(r => r.description + ' ' + r.title).join(' ');
    
    // Simple similarity check
    const contentWords = new Set(content.toLowerCase().split(/\s+/));
    const competitorWords = new Set(competitorContent.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...contentWords].filter(x => competitorWords.has(x)));
    const similarity = intersection.size / contentWords.size;
    
    return Math.max(0, Math.round(100 - (similarity * 100)));
  }

  private async calculateSEOScore(article: GeneratedArticle, outline: ContentOutline, serpResults: SERPResult[]): Promise<number> {
    let score = 0;
    
    // Title optimization (20 points)
    if (article.title.toLowerCase().includes(outline.keyword.toLowerCase())) {
      score += 20;
    }
    
    // Meta description (15 points)
    if (article.metaDescription.toLowerCase().includes(outline.keyword.toLowerCase())) {
      score += 15;
    }
    
    // Content length (15 points)
    const avgLength = serpResults.reduce((sum, r) => sum + r.wordCount, 0) / serpResults.length;
    if (article.wordCount >= avgLength * 0.8 && article.wordCount <= avgLength * 1.2) {
      score += 15;
    }
    
    // Keyword density (10 points)
    const keywordDensity = (article.content.toLowerCase().match(new RegExp(outline.keyword.toLowerCase(), 'g')) || []).length / article.wordCount * 100;
    if (keywordDensity >= 1 && keywordDensity <= 3) {
      score += 10;
    }
    
    // Internal links (10 points)
    if (article.internalLinks.length > 0) {
      score += 10;
    }
    
    // External links (10 points)
    if (article.externalLinks.length > 0) {
      score += 10;
    }
    
    // E-E-A-T score (20 points)
    score += Math.round(article.eeatScore.overall * 0.2);
    
    return Math.min(100, score);
  }

  /**
   * Link generation methods
   */
  private async generateInternalLinks(article: GeneratedArticle, outline: ContentOutline): Promise<InternalLink[]> {
    // Simplified internal link generation
    const links: InternalLink[] = [];
    
    // In production, this would query the database for relevant internal content
    const potentialLinks = [
      { url: '/blog/related-topic-1', anchorText: 'related topic', relevance: 0.8 },
      { url: '/blog/related-topic-2', anchorText: 'another guide', relevance: 0.7 },
    ];
    
    potentialLinks.forEach(link => {
      if (article.content.toLowerCase().includes(link.anchorText.toLowerCase())) {
        links.push({
          ...link,
          position: article.content.toLowerCase().indexOf(link.anchorText.toLowerCase()),
        });
      }
    });
    
    return links;
  }

  private async generateExternalLinks(article: GeneratedArticle, serpResults: SERPResult[]): Promise<ExternalLink[]> {
    // Simplified external link generation
    const links: ExternalLink[] = [];
    
    // Extract high-authority domains from SERP results
    const highAuthorityResults = serpResults.filter(r => r.domainAuthority && r.domainAuthority > 50);
    
    highAuthorityResults.slice(0, 3).forEach(result => {
      links.push({
        url: result.url,
        anchorText: result.title.split(' ').slice(0, 3).join(' '),
        domainAuthority: result.domainAuthority || 0,
        relevanceScore: 0.8,
        isNofollow: true,
      });
    });
    
    return links;
  }

  /**
   * Structured data generation
   */
  private generateStructuredData(article: GeneratedArticle): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.metaDescription,
      author: {
        '@type': 'Organization',
        name: 'SEO Engine',
        url: 'https://seo-engine.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'SEO Engine',
        logo: {
          '@type': 'ImageObject',
          url: 'https://seo-engine.com/logo.png',
        },
      },
      datePublished: article.createdAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://seo-engine.com/blog/${article.slug}`,
      },
      articleBody: article.content,
      wordCount: article.wordCount,
      keywords: article.tags,
    };
  }

  /**
   * Utility methods
   */
  private async callOpenAI(prompt: string, options: {
    maxTokens?: number;
    temperature?: number;
  } = {}): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private combineSectionContent(sections: ArticleSection[]): string {
    return sections.map(section => {
      const headingPrefix = '#'.repeat(section.level);
      return `${headingPrefix} ${section.heading}\n\n${section.content}\n\n`;
    }).join('');
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;
    
    words.forEach(word => {
      // Simple syllable counting heuristic
      const vowels = word.match(/[aeiouy]+/g);
      if (vowels) {
        syllableCount += vowels.length;
      }
    });
    
    return syllableCount;
  }

  private extractKeywords(content: string, targetKeywords: string[]): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const keywordFrequency: Record<string, number> = {};
    
    targetKeywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = content.toLowerCase().match(regex);
      if (matches) {
        keywordFrequency[keyword] = matches.length;
      }
    });
    
    return Object.entries(keywordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private extractTags(outline: ContentOutline): string[] {
    const tags = [outline.keyword];
    
    // Add related keywords
    outline.sections.forEach(section => {
      tags.push(...section.keywords);
    });
    
    // Remove duplicates and limit to 10
    return [...new Set(tags)].slice(0, 10);
  }

  private extractCategories(outline: ContentOutline): string[] {
    // Simple categorization based on content type and keyword
    const categories = [outline.contentType];
    
    if (outline.keyword.includes('tutorial') || outline.keyword.includes('how to')) {
      categories.push('tutorial');
    }
    
    if (outline.keyword.includes('guide') || outline.keyword.includes('complete')) {
      categories.push('guide');
    }
    
    return categories;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export default ArticleGenerationService;