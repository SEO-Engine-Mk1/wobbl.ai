/**
 * Originality Check Module
 * Handles content originality verification using embeddings and similarity analysis
 */

export interface OriginalityReport {
  id: string;
  articleId: string;
  content: string;
  overallScore: number; // 0-100
  similarityScore: number; // 0-100 (lower is better)
  uniquenessScore: number; // 0-100 (higher is better)
  plagiarismDetected: boolean;
  suspiciousPassages: SuspiciousPassage[];
  sources: ContentSource[];
  embedding: EmbeddingVector;
  createdAt: Date;
  processingTime: number;
  recommendations: string[];
}

export interface SuspiciousPassage {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  similarityScore: number;
  matchedSources: string[];
  suggestion: string;
}

export interface ContentSource {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: Date;
  similarityScore: number;
  matchingPassages: number;
  credibilityScore: number;
}

export interface EmbeddingVector {
  id: string;
  vector: number[];
  model: string;
  dimensions: number;
  createdAt: Date;
}

export interface SimilarityResult {
  sourceId: string;
  similarity: number;
  passages: Array<{
    startIndex: number;
    endIndex: number;
    text: string;
    similarity: number;
  }>;
}

export interface OriginalityCheckOptions {
  sensitivity: 'low' | 'medium' | 'high';
  checkWebSources: boolean;
  checkInternalDatabase: boolean;
  includeAcademicSources: boolean;
  maxSourcesToCheck: number;
  passageThreshold: number; // Minimum similarity for passage detection
  overallThreshold: number; // Maximum allowed overall similarity
}

export class OriginalityCheckService {
  private openaiApiKey: string;
  private embeddingModel: string = 'text-embedding-3-large';
  private similarityThreshold: number = 0.8;
  private maxPassageLength: number = 100;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  /**
   * Perform comprehensive originality check
   */
  async checkOriginality(
    articleId: string,
    content: string,
    options: OriginalityCheckOptions
  ): Promise<OriginalityReport> {
    const startTime = Date.now();
    
    const report: OriginalityReport = {
      id: this.generateId(),
      articleId,
      content,
      overallScore: 0,
      similarityScore: 0,
      uniquenessScore: 0,
      plagiarismDetected: false,
      suspiciousPassages: [],
      sources: [],
      embedding: {} as EmbeddingVector,
      createdAt: new Date(),
      processingTime: 0,
      recommendations: [],
    };

    try {
      // Step 1: Generate embedding for the content
      report.embedding = await this.generateEmbedding(content);
      
      // Step 2: Check against web sources
      if (options.checkWebSources) {
        const webSources = await this.checkWebSources(content, options);
        report.sources.push(...webSources);
      }
      
      // Step 3: Check against internal database
      if (options.checkInternalDatabase) {
        const internalSources = await this.checkInternalDatabase(content, options);
        report.sources.push(...internalSources);
      }
      
      // Step 4: Check academic sources
      if (options.includeAcademicSources) {
        const academicSources = await this.checkAcademicSources(content, options);
        report.sources.push(...academicSources);
      }
      
      // Step 5: Analyze suspicious passages
      report.suspiciousPassages = await this.analyzeSuspiciousPassages(content, report.sources, options);
      
      // Step 6: Calculate scores
      report.similarityScore = this.calculateSimilarityScore(report.sources, report.suspiciousPassages);
      report.uniquenessScore = this.calculateUniquenessScore(report.similarityScore);
      report.overallScore = this.calculateOverallScore(report);
      report.plagiarismDetected = report.similarityScore > options.overallThreshold;
      
      // Step 7: Generate recommendations
      report.recommendations = this.generateRecommendations(report, options);
      
      report.processingTime = Date.now() - startTime;
      
    } catch (error) {
      console.error('Originality check failed:', error);
      throw error;
    }

    return report;
  }

  /**
   * Generate embedding for content
   */
  private async generateEmbedding(content: string): Promise<EmbeddingVector> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id: this.generateId(),
      vector: data.data[0].embedding,
      model: this.embeddingModel,
      dimensions: data.data[0].embedding.length,
      createdAt: new Date(),
    };
  }

  /**
   * Check against web sources
   */
  private async checkWebSources(content: string, options: OriginalityCheckOptions): Promise<ContentSource[]> {
    // Extract key phrases from content
    const keyPhrases = this.extractKeyPhrases(content);
    
    // Search for each phrase
    const sources: ContentSource[] = [];
    
    for (const phrase of keyPhrases.slice(0, 10)) { // Limit to 10 phrases
      try {
        const searchResults = await this.searchWeb(phrase);
        
        for (const result of searchResults.slice(0, 3)) { // Top 3 results per phrase
          const similarity = await this.calculateContentSimilarity(content, result.content);
          
          if (similarity > 0.3) { // Only include relevant sources
            sources.push({
              id: this.generateId(),
              url: result.url,
              title: result.title,
              author: result.author,
              publishDate: result.publishDate,
              similarityScore: similarity,
              matchingPassages: 0, // Will be calculated later
              credibilityScore: this.calculateCredibilityScore(result),
            });
          }
        }
      } catch (error) {
        console.error(`Failed to search for phrase "${phrase}":`, error);
      }
    }

    // Sort by similarity and limit
    return sources
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, options.maxSourcesToCheck);
  }

  /**
   * Check against internal database
   */
  private async checkInternalDatabase(content: string, options: OriginalityCheckOptions): Promise<ContentSource[]> {
    // In production, this would query your internal database
    // For now, return empty array
    return [];
  }

  /**
   * Check against academic sources
   */
  private async checkAcademicSources(content: string, options: OriginalityCheckOptions): Promise<ContentSource[]> {
    // In production, this would integrate with academic databases
    // like Google Scholar, PubMed, arXiv, etc.
    return [];
  }

  /**
   * Analyze suspicious passages
   */
  private async analyzeSuspiciousPassages(
    content: string,
    sources: ContentSource[],
    options: OriginalityCheckOptions
  ): Promise<SuspiciousPassage[]> {
    const passages: SuspiciousPassage[] = [];
    
    // Split content into passages
    const contentPassages = this.splitIntoPassages(content);
    
    for (const passage of contentPassages) {
      const suspiciousSources: string[] = [];
      let maxSimilarity = 0;
      
      // Check against each source
      for (const source of sources) {
        const similarity = await this.calculatePassageSimilarity(passage.text, source.url);
        
        if (similarity > options.passageThreshold) {
          suspiciousSources.push(source.url);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
      
      // If suspicious sources found, add to report
      if (suspiciousSources.length > 0) {
        passages.push({
          id: this.generateId(),
          startIndex: passage.startIndex,
          endIndex: passage.endIndex,
          text: passage.text,
          similarityScore: maxSimilarity,
          matchedSources: suspiciousSources,
          suggestion: this.generatePassageSuggestion(passage.text, maxSimilarity),
        });
      }
    }
    
    return passages;
  }

  /**
   * Calculate similarity score
   */
  private calculateSimilarityScore(sources: ContentSource[], passages: SuspiciousPassage[]): number {
    if (sources.length === 0) return 0;
    
    // Weight sources by similarity and credibility
    const weightedScore = sources.reduce((sum, source) => {
      return sum + (source.similarityScore * source.credibilityScore);
    }, 0) / sources.length;
    
    // Consider passage-level similarities
    const passageScore = passages.length > 0 
      ? passages.reduce((sum, passage) => sum + passage.similarityScore, 0) / passages.length
      : 0;
    
    // Combine scores (70% source similarity, 30% passage similarity)
    return Math.round((weightedScore * 0.7) + (passageScore * 0.3));
  }

  /**
   * Calculate uniqueness score
   */
  private calculateUniquenessScore(similarityScore: number): number {
    return Math.max(0, 100 - similarityScore);
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(report: OriginalityReport): number {
    // Consider multiple factors
    const similarityWeight = 0.4;
    const uniquenessWeight = 0.3;
    const passageWeight = 0.2;
    const sourceWeight = 0.1;
    
    const passageScore = report.suspiciousPassages.length > 0
      ? 100 - (report.suspiciousPassages.length * 10)
      : 100;
    
    const sourceScore = report.sources.length > 0
      ? 100 - (report.sources.length * 5)
      : 100;
    
    const overallScore = 
      (report.similarityScore * similarityWeight) +
      (report.uniquenessScore * uniquenessWeight) +
      (passageScore * passageWeight) +
      (sourceScore * sourceWeight);
    
    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(report: OriginalityReport, options: OriginalityCheckOptions): string[] {
    const recommendations: string[] = [];
    
    if (report.similarityScore > 80) {
      recommendations.push('High similarity detected. Consider significant rewriting or rephrasing.');
    } else if (report.similarityScore > 60) {
      recommendations.push('Moderate similarity detected. Review and revise similar passages.');
    }
    
    if (report.suspiciousPassages.length > 5) {
      recommendations.push('Multiple suspicious passages found. Consider restructuring content.');
    }
    
    if (report.sources.length > 10) {
      recommendations.push('Many similar sources found. Ensure proper attribution and citation.');
    }
    
    // Check for common issues
    const hasLongPassages = report.suspiciousPassages.some(p => p.text.length > 200);
    if (hasLongPassages) {
      recommendations.push('Break up long similar passages into smaller, original segments.');
    }
    
    const hasHighSimilarityPassages = report.suspiciousPassages.some(p => p.similarityScore > 0.9);
    if (hasHighSimilarityPassages) {
      recommendations.push('Some passages are very similar to existing content. Rewrite these sections completely.');
    }
    
    // Add positive recommendations
    if (report.overallScore > 80) {
      recommendations.push('Good originality score! Content appears to be sufficiently unique.');
    }
    
    if (report.suspiciousPassages.length === 0) {
      recommendations.push('No suspicious passages detected. Content appears original.');
    }
    
    return recommendations;
  }

  /**
   * Extract key phrases from content
   */
  private extractKeyPhrases(content: string): string[] {
    // Remove common words and extract meaningful phrases
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);
    
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => !stopWords.has(word) && word.length > 3);
    
    // Generate n-grams (phrases of 2-3 words)
    const phrases: string[] = [];
    
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(words[i] + ' ' + words[i + 1]);
    }
    
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }
    
    // Count frequency and return top phrases
    const phraseFrequency: Record<string, number> = {};
    phrases.forEach(phrase => {
      phraseFrequency[phrase] = (phraseFrequency[phrase] || 0) + 1;
    });
    
    return Object.entries(phraseFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([phrase]) => phrase);
  }

  /**
   * Search web for content
   */
  private async searchWeb(query: string): Promise<Array<{
    url: string;
    title: string;
    content: string;
    author?: string;
    publishDate?: Date;
  }>> {
    // In production, use a search API like Google Custom Search, Bing, or Serper
    // For now, return mock results
    
    const mockResults = [
      {
        url: `https://example.com/article-${this.generateId()}`,
        title: `Related article about ${query}`,
        content: `This is a mock content about ${query} for testing purposes.`,
        author: 'Mock Author',
        publishDate: new Date(),
      },
    ];
    
    return mockResults;
  }

  /**
   * Calculate content similarity using embeddings
   */
  private async calculateContentSimilarity(content1: string, content2: string): Promise<number> {
    try {
      // Generate embeddings for both contents
      const embedding1 = await this.generateEmbedding(content1);
      const embedding2 = await this.generateEmbedding(content2);
      
      // Calculate cosine similarity
      return this.cosineSimilarity(embedding1.vector, embedding2.vector);
    } catch (error) {
      console.error('Failed to calculate content similarity:', error);
      return 0;
    }
  }

  /**
   * Calculate passage similarity
   */
  private async calculatePassageSimilarity(passage: string, sourceUrl: string): Promise<number> {
    // In production, fetch the source content and compare
    // For now, return a mock similarity
    return Math.random() * 0.5; // Mock similarity
  }

  /**
   * Calculate credibility score for a source
   */
  private calculateCredibilityScore(source: any): number {
    let score = 50; // Base score
    
    // Boost for reputable domains
    const reputableDomains = [
      'edu', 'gov', 'org', 'harvard', 'mit', 'stanford', 'yale',
      'nih', 'cdc', 'who', 'nature', 'science', 'reuters'
    ];
    
    if (reputableDomains.some(domain => source.url.includes(domain))) {
      score += 30;
    }
    
    // Boost for recent content
    if (source.publishDate) {
      const daysSincePublish = (Date.now() - source.publishDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublish < 365) {
        score += 10;
      }
    }
    
    // Boost for author presence
    if (source.author) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  /**
   * Split content into passages
   */
  private splitIntoPassages(content: string): Array<{
    startIndex: number;
    endIndex: number;
    text: string;
  }> {
    const passages: Array<{
      startIndex: number;
      endIndex: number;
      text: string;
    }> = [];
    
    // Split by sentences first
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    let currentIndex = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      let passageText = sentences[i];
      let endIndex = currentIndex + passageText.length;
      
      // Combine short sentences with next ones
      while (passageText.length < 50 && i < sentences.length - 1) {
        i++;
        passageText += sentences[i];
        endIndex = currentIndex + passageText.length;
      }
      
      // Limit passage length
      if (passageText.length > this.maxPassageLength) {
        passageText = passageText.substring(0, this.maxPassageLength);
        endIndex = currentIndex + passageText.length;
      }
      
      passages.push({
        startIndex: currentIndex,
        endIndex,
        text: passageText.trim(),
      });
      
      currentIndex = endIndex;
    }
    
    return passages;
  }

  /**
   * Generate suggestion for suspicious passage
   */
  private generatePassageSuggestion(passage: string, similarity: number): string {
    if (similarity > 0.9) {
      return 'Complete rewrite recommended. This passage is very similar to existing content.';
    } else if (similarity > 0.8) {
      return 'Significant rephrasing needed. Consider restructuring sentences and using different vocabulary.';
    } else if (similarity > 0.7) {
      return 'Moderate rephrasing suggested. Change sentence structure and word choice.';
    } else {
      return 'Minor rephrasing may help improve originality.';
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must be of same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  /**
   * Batch check multiple articles
   */
  async batchCheckOriginality(
    articles: Array<{
      id: string;
      content: string;
    }>,
    options: OriginalityCheckOptions
  ): Promise<OriginalityReport[]> {
    const reports: OriginalityReport[] = [];
    
    // Process articles in parallel with concurrency limit
    const concurrencyLimit = 3;
    const batches = [];
    
    for (let i = 0; i < articles.length; i += concurrencyLimit) {
      batches.push(articles.slice(i, i + concurrencyLimit));
    }
    
    for (const batch of batches) {
      const batchPromises = batch.map(article => 
        this.checkOriginality(article.id, article.content, options)
      );
      
      const batchReports = await Promise.all(batchPromises);
      reports.push(...batchReports);
    }
    
    return reports;
  }

  /**
   * Compare two articles for similarity
   */
  async compareArticles(
    article1: { id: string; content: string },
    article2: { id: string; content: string }
  ): Promise<{
    similarity: number;
    commonPhrases: string[];
    differences: string[];
  }> {
    const similarity = await this.calculateContentSimilarity(article1.content, article2.content);
    
    const phrases1 = this.extractKeyPhrases(article1.content);
    const phrases2 = this.extractKeyPhrases(article2.content);
    
    const commonPhrases = phrases1.filter(phrase => phrases2.includes(phrase));
    const differences = [
      ...phrases1.filter(phrase => !phrases2.includes(phrase)),
      ...phrases2.filter(phrase => !phrases1.includes(phrase))
    ];
    
    return {
      similarity,
      commonPhrases,
      differences,
    };
  }

  /**
   * Generate originality certificate
   */
  generateCertificate(report: OriginalityReport): string {
    const certificate = `
ORIGINALITY CERTIFICATE

Article ID: ${report.articleId}
Check Date: ${report.createdAt.toLocaleDateString()}
Overall Score: ${report.overallScore}/100
Similarity Score: ${report.similarityScore}%
Uniqueness Score: ${report.uniquenessScore}%

Sources Checked: ${report.sources.length}
Suspicious Passages: ${report.suspiciousPassages.length}
Processing Time: ${report.processingTime}ms

Status: ${report.plagiarismDetected ? 'PLAGIARISM DETECTED' : 'ORIGINAL'}

Key Findings:
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
This certificate was generated automatically by the SEO Engine Originality Check System.
For questions about this report, please contact support@seo-engine.com.
    `.trim();
    
    return certificate;
  }

  /**
   * Utility method to generate ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export default OriginalityCheckService;