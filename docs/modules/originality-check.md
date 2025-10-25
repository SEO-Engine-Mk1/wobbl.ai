# Originality Check Module

## Overview

The Originality Check module ensures content uniqueness and prevents plagiarism using advanced embedding-based similarity analysis. It provides comprehensive originality reports with detailed similarity detection and actionable improvement suggestions.

## Features

- **Embedding-Based Analysis**: Uses OpenAI text embeddings for semantic similarity
- **Multi-Source Checking**: Compares against web sources, internal database, and academic content
- **Passage-Level Detection**: Identifies specific similar passages within content
- **Similarity Scoring**: Provides detailed similarity metrics and scores
- **Source Attribution**: Identifies and credits original sources
- **Improvement Suggestions**: Offers actionable recommendations for content enhancement

## Data Model

### Core Types

```typescript
interface OriginalityReport {
  id: string;
  articleId: string;
  content: string;
  overallScore: number;        // 0-100
  similarityScore: number;     // 0-100 (lower is better)
  uniquenessScore: number;     // 0-100 (higher is better)
  plagiarismDetected: boolean;
  suspiciousPassages: SuspiciousPassage[];
  sources: ContentSource[];
  embedding: EmbeddingVector;
  createdAt: Date;
  processingTime: number;
  recommendations: string[];
}

interface SuspiciousPassage {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  similarityScore: number;
  matchedSources: string[];
  suggestion: string;
}

interface ContentSource {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: Date;
  similarityScore: number;
  matchingPassages: number;
  credibilityScore: number;
}

interface EmbeddingVector {
  id: string;
  vector: number[];
  model: string;
  dimensions: number;
  createdAt: Date;
}
```

## Key Endpoints

### `POST /api/plagiarism/check`
Performs comprehensive originality check on content.

**Request:**
```json
{
  "articleId": "article_123",
  "content": "Your article content here...",
  "options": {
    "sensitivity": "medium",
    "checkWebSources": true,
    "checkInternalDatabase": true,
    "includeAcademicSources": false,
    "maxSourcesToCheck": 20,
    "passageThreshold": 0.8,
    "overallThreshold": 70
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "report_456",
    "overallScore": 85,
    "similarityScore": 15,
    "uniquenessScore": 85,
    "plagiarismDetected": false,
    "suspiciousPassages": [],
    "sources": [...],
    "recommendations": [
      "Content appears to be sufficiently unique",
      "Consider adding more expert quotes to improve authority"
    ]
  }
}
```

### `GET /api/plagiarism/report/:id`
Retrieves a detailed originality report.

### `POST /api/plagiarism/batch-check`
Checks multiple articles in batch.

### `POST /api/plagiarism/compare`
Compares two articles for similarity.

## Similarity Analysis Algorithm

### Step 1: Content Preprocessing
```typescript
const preprocessContent = (content: string) => {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
};
```

### Step 2: Embedding Generation
```typescript
const embedding = await this.generateEmbedding(content);
```

### Step 3: Source Comparison
```typescript
const similarities = await Promise.all(
  sources.map(source => 
    this.calculateSimilarity(embedding, source.embedding)
  )
);
```

### Step 4: Passage Analysis
```typescript
const passages = this.splitIntoPassages(content);
const suspiciousPassages = await this.analyzePassages(passages, sources);
```

### Step 5: Score Calculation
```typescript
const overallScore = this.calculateOverallScore(similarities, passages);
```

## Embedding Technology

### Text Embeddings
- **Model**: OpenAI text-embedding-3-large
- **Dimensions**: 3072
- **Chunk Size**: 8191 tokens
- **Similarity Metric**: Cosine similarity

### Embedding Generation
```typescript
const generateEmbedding = async (text: string): Promise<EmbeddingVector> => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: text,
    }),
  });

  const data = await response.json();
  return {
    id: this.generateId(),
    vector: data.data[0].embedding,
    model: 'text-embedding-3-large',
    dimensions: data.data[0].embedding.length,
    createdAt: new Date(),
  };
};
```

### Similarity Calculation
```typescript
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};
```

## Source Checking

### Web Sources
- **Search Engines**: Google, Bing, DuckDuckGo
- **Content Platforms**: Medium, Substack, personal blogs
- **News Sites**: Major news publications
- **Academic Sources**: Research papers, journals

### Internal Database
- **Previous Articles**: Company's published content
- **Drafts**: Unpublished content
- **Templates**: Reusable content patterns
- **User Submissions**: Client-provided content

### Academic Sources
- **Google Scholar**: Academic papers and research
- **PubMed**: Medical and health content
- **arXiv**: Scientific preprints
- **JSTOR**: Academic journal articles

## Scoring System

### Overall Score (0-100)
- **Similarity Weight**: 40%
- **Uniqueness Weight**: 30%
- **Passage Weight**: 20%
- **Source Weight**: 10%

### Similarity Score (0-100)
- **0-20**: Very unique content
- **21-40**: Highly unique
- **41-60**: Moderately unique
- **61-80**: Some similarity
- **81-100**: High similarity

### Uniqueness Score (0-100)
- **90-100**: Exceptionally unique
- **80-89**: Very unique
- **70-79**: Unique
- **60-69**: Moderately unique
- **Below 60**: Needs improvement

## Passage Analysis

### Passage Detection
```typescript
const analyzeSuspiciousPassages = (
  content: string,
  sources: ContentSource[],
  options: OriginalityCheckOptions
): Promise<SuspiciousPassage[]> => {
  const passages = this.splitIntoPassages(content);
  const suspiciousPassages: SuspiciousPassage[] = [];
  
  for (const passage of passages) {
    const matchedSources = await this.findMatchingSources(passage, sources);
    
    if (matchedSources.length > 0) {
      suspiciousPassages.push({
        id: this.generateId(),
        startIndex: passage.startIndex,
        endIndex: passage.endIndex,
        text: passage.text,
        similarityScore: Math.max(...matchedSources.map(s => s.similarity)),
        matchedSources: matchedSources.map(s => s.url),
        suggestion: this.generatePassageSuggestion(passage.text, matchedSources),
      });
    }
  }
  
  return suspiciousPassages;
};
```

### Passage Suggestions
- **High Similarity (>90%)**: Complete rewrite required
- **Medium Similarity (70-90%)**: Significant rephrasing needed
- **Low Similarity (50-70%)**: Minor adjustments recommended
- **Very Low Similarity (<50%)**: Acceptable with minor tweaks

## Performance Metrics

### Processing Time
- Short content (500 words): 5-10 seconds
- Medium content (1000 words): 10-20 seconds
- Long content (2000+ words): 20-40 seconds
- Batch processing: 2-5 articles per minute

### Resource Usage
- Memory: 200-500MB per check
- CPU: High during embedding generation
- API calls: 1-2 OpenAI calls per article
- Network: Moderate for source checking

### Accuracy Metrics
- False Positive Rate: <5%
- False Negative Rate: <3%
- Processing Accuracy: >95%
- Source Identification: >90%

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Search Configuration
SEARCH_API_KEY=your_search_api_key
SEARCH_MAX_RESULTS=20
SEARCH_TIMEOUT=30000

# Processing Configuration
ORIGINALITY_CONCURRENCY=3
ORIGINALITY_MAX_SOURCES=50
ORIGINALITY_PASSAGE_LENGTH=100
ORIGINALITY_SIMILARITY_THRESHOLD=0.8
```

### Module Configuration

```typescript
interface OriginalityConfig {
  openai: {
    apiKey: string;
    embeddingModel: string;
  };
  search: {
    apiKey: string;
    maxResults: number;
    timeout: number;
  };
  processing: {
    concurrency: number;
    maxSources: number;
    passageLength: number;
    similarityThreshold: number;
  };
}
```

## Error Handling

### Common Errors

1. **API Rate Limits**: Implement exponential backoff
2. **Embedding Failures**: Retry with different chunk sizes
3. **Search Timeouts**: Increase timeout or reduce sources
4. **Memory Issues**: Process content in smaller chunks

### Error Recovery

```typescript
const checkOriginalityWithRetry = async (
  articleId: string,
  content: string,
  options: OriginalityCheckOptions,
  attempt = 1
): Promise<OriginalityReport> => {
  try {
    return await this.checkOriginality(articleId, content, options);
  } catch (error) {
    if (attempt < 3 && error.retryable) {
      await this.delay(Math.pow(2, attempt) * 1000);
      return checkOriginalityWithRetry(articleId, content, options, attempt + 1);
    }
    throw error;
  }
};
```

## Monitoring & Logging

### Key Metrics
- Check volume and success rates
- Average similarity scores
- Processing times and resource usage
- Source identification accuracy

### Quality Assurance
- Manual review of high-similarity content
- Regular calibration of similarity thresholds
- User feedback integration
- Performance benchmarking

## Testing

### Unit Tests
- Embedding generation and similarity calculation
- Passage analysis algorithms
- Score calculation methods
- Error handling scenarios

### Integration Tests
- OpenAI API integration
- Search service integration
- Database operations
- Endpoint functionality

### Quality Tests
- Accuracy of similarity detection
- False positive/negative rates
- Processing speed benchmarks
- Resource usage validation

## Usage Examples

### Basic Originality Check

```typescript
import { OriginalityCheckService } from '@/src/modules/originality-check';

const originalityService = new OriginalityCheckService(process.env.OPENAI_API_KEY);

const report = await originalityService.checkOriginality(
  'article_123',
  articleContent,
  {
    sensitivity: 'medium',
    checkWebSources: true,
    checkInternalDatabase: true,
    includeAcademicSources: false,
    maxSourcesToCheck: 20,
    passageThreshold: 0.8,
    overallThreshold: 70
  }
);

console.log('Overall Score:', report.overallScore);
console.log('Similarity Score:', report.similarityScore);
console.log('Plagiarism Detected:', report.plagiarismDetected);
```

### Batch Processing

```typescript
const articles = [
  { id: '1', content: 'Content 1...' },
  { id: '2', content: 'Content 2...' },
  { id: '3', content: 'Content 3...' }
];

const reports = await originalityService.batchCheckOriginality(articles, options);
```

### Article Comparison

```typescript
const comparison = await originalityService.compareArticles(
  { id: '1', content: 'Content 1...' },
  { id: '2', content: 'Content 2...' }
);

console.log('Similarity:', comparison.similarity);
console.log('Common Phrases:', comparison.commonPhrases);
```

## Best Practices

1. **Threshold Settings**: Adjust sensitivity based on content type and requirements
2. **Source Diversity**: Check multiple types of sources for comprehensive analysis
3. **Human Review**: Always review high-similarity content manually
4. **Regular Updates**: Keep source databases current and relevant
5. **Performance Optimization**: Use caching and batch processing for efficiency

## Troubleshooting

### Common Issues

1. **High False Positives**: Adjust similarity thresholds downward
2. **Slow Processing**: Reduce source count or optimize chunk sizes
3. **API Failures**: Implement proper retry mechanisms and fallbacks
4. **Memory Issues**: Process content in smaller segments

### Quality Improvement

```typescript
const improveOriginality = (report: OriginalityReport): string[] => {
  const suggestions = [];
  
  if (report.similarityScore > 70) {
    suggestions.push('Consider significant rewriting to reduce similarity');
  }
  
  if (report.suspiciousPassages.length > 5) {
    suggestions.push('Multiple similar passages found - restructure content');
  }
  
  report.suspiciousPassages.forEach(passage => {
    if (passage.similarityScore > 0.9) {
      suggestions.push(`Rewrite passage: "${passage.text.substring(0, 50)}..."`);
    }
  });
  
  return suggestions;
};
```

## Future Enhancements

1. **Advanced NLP**: Integrate more sophisticated language models
2. **Real-Time Checking**: Add live content monitoring
3. **Custom Sources**: Allow user-defined source databases
4. **Multilingual Support**: Expand to international content
5. **Visual Similarity**: Add image and multimedia content checking