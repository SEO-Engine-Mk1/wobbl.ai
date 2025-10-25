import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/db'
import ZAI from 'z-ai-web-dev-sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Articles API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  try {
    const { page = '1', limit = '10', status, authorId } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    
    const where: any = {};
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          serpAnalysis: true,
          claims: true
        }
      }),
      prisma.article.count({ where })
    ]);
    
    return res.status(200).json({
      articles,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('GET articles error:', error);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    const { query, authorId, authorName, authorBio, authorExperience, experienceAnchor } = req.body;

    if (!query || !authorId) {
      return res.status(400).json({ error: 'Missing required fields: query, authorId' });
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // Step 1: Perform SERP research
    const searchResult = await zai.functions.invoke("web_search", {
      query: query,
      num: 10
    });

    if (!searchResult || !Array.isArray(searchResult)) {
      return res.status(500).json({ error: 'Failed to perform SERP research' });
    }

    // Step 2: Extract SERP insights
    const serpAnalysis = await analyzeSerpResults(searchResult, zai);

    // Step 3: Generate E-E-A-T compliant article
    const articleContent = await generateEEATArticle({
      query,
      serpAnalysis,
      authorName,
      authorBio,
      authorExperience,
      experienceAnchor,
      zai
    });

    // Step 4: Create article record
    const article = await prisma.article.create({
      data: {
        title: String(articleContent.title),
        slug: generateSlug(String(articleContent.title)),
        content: String(articleContent.content),
        excerpt: articleContent.excerpt ? String(articleContent.excerpt) : null,
        metaDescription: articleContent.metaDescription ? String(articleContent.metaDescription) : null,
        focusKeyword: String(query),
        keywords: JSON.stringify([String(query)]), // Convert to JSON string as required by schema
        targetWordCount: 2500,
        actualWordCount: Number(articleContent.wordCount) || 0,
        authorId: String(authorId),
        authorName: String(authorName),
        authorBio: authorBio ? String(authorBio) : null,
        authorExperience: authorExperience ? String(authorExperience) : null,
        experienceAnchor: experienceAnchor ? String(experienceAnchor) : null,
        sourceDiversity: Number(serpAnalysis.uniqueDomains) || 0,
        helpfulnessScore: Number(articleContent.helpfulnessScore) || null,
        freshnessScore: Number(articleContent.freshnessScore) || null,
        jsonLd: typeof articleContent.jsonLd === 'string' ? articleContent.jsonLd : JSON.stringify(articleContent.jsonLd),
        tableOfContents: typeof articleContent.tableOfContents === 'string' ? articleContent.tableOfContents : JSON.stringify(articleContent.tableOfContents),
        faqSection: typeof articleContent.faqSection === 'string' ? articleContent.faqSection : JSON.stringify(articleContent.faqSection),
        status: 'draft'
      }
    });

    // Step 5: Store SERP analysis
    await prisma.serpAnalysis.create({
      data: {
        articleId: article.id,
        query,
        topResults: searchResult as any,
        headings: serpAnalysis.headings,
        entities: serpAnalysis.entities,
        paas: serpAnalysis.paas,
        gaps: serpAnalysis.gaps
      }
    });

    // Step 6: Extract and store claims
    const claims = await extractClaims(articleContent.content, zai);
    if (claims.length > 0) {
      await prisma.claim.createMany({
        data: claims.map((claim: any) => ({
          articleId: article.id,
          claimText: claim.text,
          claimType: claim.type,
          sourceUrl: claim.sourceUrl,
          confidence: claim.confidence
        }))
      });
    }

    return res.status(201).json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        wordCount: article.actualWordCount,
        originalityScore: article.originalityScore,
        qaPassed: article.qaPassed
      },
      serpAnalysis: {
        totalResults: searchResult.length,
        uniqueDomains: serpAnalysis.uniqueDomains,
        commonHeadings: serpAnalysis.headings?.slice(0, 5),
        contentGaps: serpAnalysis.gaps?.slice(0, 3)
      }
    });

  } catch (error: any) {
    console.error('Article generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate article',
      details: error.message 
    });
  }
}

async function analyzeSerpResults(searchResults: any[], zai: any) {
  const uniqueDomains = new Set(searchResults.map(r => new URL(r.url).hostname)).size;
  
  const prompt = `Analyze these SERP results and extract insights for content creation:

Results:
${searchResults.map((r, i) => `${i + 1}. ${r.title} - ${r.snippet} (${r.url})`).join('\n')}

Please provide:
1. Common heading patterns (H1, H2, H3)
2. Key entities mentioned
3. People Also Ask questions
4. Content gaps or opportunities
5. Search intent analysis

Respond in JSON format.`;

  const analysis = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  try {
    const result = JSON.parse(analysis.choices[0].message.content);
    return {
      ...result,
      uniqueDomains
    };
  } catch {
    return {
      headings: [],
      entities: [],
      paas: [],
      gaps: [],
      intent: 'informational',
      uniqueDomains
    };
  }
}

async function generateEEATArticle({
  query,
  serpAnalysis,
  authorName,
  authorBio,
  authorExperience,
  experienceAnchor,
  zai
}: any) {
  const prompt = `Generate a comprehensive, E-E-A-T compliant article based on the following:

Topic: ${query}
Author: ${authorName}
Author Bio: ${authorBio}
Author Experience: ${authorExperience}
Experience Anchor: ${experienceAnchor}

SERP Analysis:
${JSON.stringify(serpAnalysis, null, 2)}

Requirements:
- Minimum 2500 words
- H1 title + structured H2/H3 headings
- Table of Contents
- FAQ section
- Meta description
- Excerpt
- Include author expertise and experience naturally
- Reference diverse sources (minimum 3 different domains)
- Use statistics and claims with proper attribution
- Include helpful, accurate, and comprehensive information
- Add JSON-LD structured data (Article + FAQ schema)

Generate the complete article in JSON format with these fields:
- title
- content (HTML format)
- excerpt
- metaDescription
- wordCount
- helpfulnessScore (1-100)
- freshnessScore (1-100)
- tableOfContents
- faqSection
- jsonLd`;

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000
  });

  try {
    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch {
    throw new Error('Failed to generate article content');
  }
}

async function extractClaims(content: string, zai: any) {
  const prompt = `Extract all claims, statistics, facts, and named entities from this content that need verification:

Content:
${content.substring(0, 2000)}...

For each claim, provide:
- claim text
- type (statistic, fact, entity, quote)
- confidence level (1-100)
- potential source URL if mentioned

Respond in JSON array format.`;

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return [];
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}