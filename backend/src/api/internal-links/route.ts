import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article with existing suggestions
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        internalLinks: {
          orderBy: { confidence: 'desc' }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // If suggestions already exist, return them
    if (article.internalLinks.length > 0) {
      return NextResponse.json({
        success: true,
        suggestions: article.internalLinks,
        total: article.internalLinks.length
      })
    }

    // Generate new suggestions
    const suggestions = await generateInternalLinkSuggestions(article)

    return NextResponse.json({
      success: true,
      suggestions,
      total: suggestions.length,
      message: `Generated ${suggestions.length} internal link suggestions`
    })

  } catch (error: any) {
    console.error('Internal links error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate internal link suggestions',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { articleId, suggestions } = await request.json()

    if (!articleId || !Array.isArray(suggestions)) {
      return NextResponse.json({ error: 'Article ID and suggestions array are required' }, { status: 400 })
    }

    // Save suggestions to database
    const savedSuggestions = await Promise.all(
      suggestions.map(suggestion =>
        prisma.internalLinkSuggestion.create({
          data: {
            articleId,
            anchor: suggestion.anchor,
            targetUrl: suggestion.targetUrl,
            confidence: suggestion.confidence,
            accepted: suggestion.accepted || false
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      suggestions: savedSuggestions,
      total: savedSuggestions.length,
      message: `Saved ${savedSuggestions.length} internal link suggestions`
    })

  } catch (error: any) {
    console.error('Save internal links error:', error)
    return NextResponse.json({ 
      error: 'Failed to save internal link suggestions',
      details: error.message 
    }, { status: 500 })
  }
}

async function generateInternalLinkSuggestions(article: any) {
  try {
    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Step 1: Get existing articles from the same site
    const existingArticles = await getExistingArticles(article)

    if (existingArticles.length === 0) {
      return []
    }

    // Step 2: Extract key topics and entities from current article
    const articleTopics = await extractArticleTopics(article, zai)

    // Step 3: Find semantically similar articles
    const similarArticles = await findSimilarArticles(article, existingArticles, zai)

    // Step 4: Generate specific link suggestions
    const suggestions = await generateLinkSuggestions(article, similarArticles, articleTopics, zai)

    // Step 5: Save suggestions to database
    const savedSuggestions = await Promise.all(
      suggestions.map((suggestion: any) =>
        prisma.internalLinkSuggestion.create({
          data: {
            articleId: article.id,
            anchor: suggestion.anchor,
            targetUrl: suggestion.targetUrl,
            confidence: suggestion.confidence,
            accepted: false
          }
        })
      )
    )

    return savedSuggestions

  } catch (error) {
    console.error('Error generating internal link suggestions:', error)
    return []
  }
}

async function getExistingArticles(currentArticle: any) {
  // Get published articles from the same WordPress site or author
  const articles = await prisma.article.findMany({
    where: {
      id: { not: currentArticle.id },
      status: 'published',
      wordpressUrl: { not: null },
      OR: [
        { authorId: currentArticle.authorId },
        // Could add more criteria like same category, etc.
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      wordpressUrl: true,
      focusKeyword: true
    },
    take: 50 // Limit to prevent overwhelming the AI
  })

  return articles
}

async function extractArticleTopics(article: any, zai: any) {
  const prompt = `Extract the main topics, entities, and key phrases from this article:

Title: ${article.title}
Focus Keyword: ${article.focusKeyword || 'N/A'}
Content: ${article.content.substring(0, 2000)}...

Please identify:
1. Main topics (2-4 core themes)
2. Important entities (people, organizations, concepts)
3. Key phrases that would make good anchor text
4. Secondary topics that could be linked to

Respond in JSON format:
{
  "mainTopics": ["topic1", "topic2"],
  "entities": ["entity1", "entity2"],
  "keyPhrases": ["phrase1", "phrase2"],
  "secondaryTopics": ["topic1", "topic2"]
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch {
    return {
      mainTopics: [],
      entities: [],
      keyPhrases: [],
      secondaryTopics: []
    }
  }
}

async function findSimilarArticles(currentArticle: any, existingArticles: any[], zai: any) {
  const similarities = []

  for (const existingArticle of existingArticles) {
    const similarity = await calculateSimilarity(currentArticle, existingArticle, zai)
    if (similarity.score > 0.3) { // Only include reasonably similar articles
      similarities.push({
        ...existingArticle,
        similarity: similarity.score,
        reasons: similarity.reasons
      })
    }
  }

  // Sort by similarity and return top matches
  return similarities
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, 10) // Top 10 most similar articles
}

async function calculateSimilarity(article1: any, article2: any, zai: any) {
  const prompt = `Compare these two articles for semantic similarity and linking potential:

Article 1:
Title: ${article1.title}
Focus: ${article1.focusKeyword || 'N/A'}

Article 2:
Title: ${article2.title}
Focus: ${article2.focusKeyword || 'N/A'}

Analyze:
1. Topic overlap (0-1)
2. Entity overlap (0-1)
3. Complementary potential (0-1)
4. Linking relevance (0-1)

Provide:
- Overall similarity score (0-1)
- Reasons for similarity
- Potential linking relationship

Respond in JSON format:
{
  "score": 0.75,
  "reasons": ["Both discuss SEO strategies", "Share entity 'Google'"],
  "relationship": "complementary"
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch {
    return { score: 0, reasons: [], relationship: 'none' }
  }
}

async function generateLinkSuggestions(currentArticle: any, similarArticles: any[], topics: any, zai: any) {
  const suggestions = []

  for (const similarArticle of similarArticles) {
    const prompt = `Generate specific internal link suggestions between these articles:

Current Article:
Title: ${currentArticle.title}
Topics: ${topics.mainTopics.join(', ')}
Key Phrases: ${topics.keyPhrases.join(', ')}

Target Article:
Title: ${similarArticle.title}
URL: ${similarArticle.wordpressUrl}
Similarity: ${similarArticle.similarity}

Suggest 2-3 specific internal links with:
1. Exact anchor text to use in current article
2. Target URL (from target article)
3. Confidence score (0-1)
4. Brief justification

Only suggest links that would genuinely add value for readers.

Respond in JSON format:
{
  "suggestions": [
    {
      "anchor": "exact anchor text",
      "targetUrl": "full URL",
      "confidence": 0.85,
      "justification": "Why this link is valuable"
    }
  ]
}`

    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })

    try {
      const result = JSON.parse(response.choices[0].message.content)
      if (result.suggestions && Array.isArray(result.suggestions)) {
        suggestions.push(...result.suggestions)
      }
    } catch (error) {
      console.error('Error parsing link suggestions:', error)
    }
  }

  // Remove duplicates and sort by confidence
  const uniqueSuggestions = suggestions.filter((suggestion: any, index: number, self: any[]) =>
    index === self.findIndex((s) => s.anchor === suggestion.anchor && s.targetUrl === suggestion.targetUrl)
  )

  return uniqueSuggestions
    .sort((a: any, b: any) => b.confidence - a.confidence)
    .slice(0, 15) // Limit to top 15 suggestions
}

// PUT endpoint to accept/reject suggestions
export async function PUT(request: NextRequest) {
  try {
    const { suggestionId, accepted } = await request.json()

    if (!suggestionId || typeof accepted !== 'boolean') {
      return NextResponse.json({ error: 'Suggestion ID and accepted status are required' }, { status: 400 })
    }

    const updatedSuggestion = await prisma.internalLinkSuggestion.update({
      where: { id: suggestionId },
      data: { accepted }
    })

    return NextResponse.json({
      success: true,
      suggestion: updatedSuggestion,
      message: `Suggestion ${accepted ? 'accepted' : 'rejected'}`
    })

  } catch (error: any) {
    console.error('Update internal link suggestion error:', error)
    return NextResponse.json({ 
      error: 'Failed to update suggestion',
      details: error.message 
    }, { status: 500 })
  }
}