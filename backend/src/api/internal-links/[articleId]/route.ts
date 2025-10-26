import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const articleId = params.articleId

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article details
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        internalLinks: true,
        serpAnalysis: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if suggestions already exist
    if (article.internalLinks.length > 0) {
      return NextResponse.json({
        success: true,
        suggestions: article.internalLinks,
        alreadyGenerated: true
      })
    }

    // Generate new suggestions
    const suggestions = await generateInternalLinkSuggestions(article)

    return NextResponse.json({
      success: true,
      suggestions,
      alreadyGenerated: false
    })

  } catch (error: any) {
    console.error('Internal links generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate internal link suggestions',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const articleId = params.articleId
    const { action, suggestionId } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    if (action === 'accept' && suggestionId) {
      // Accept a specific suggestion
      await prisma.internalLinkSuggestion.update({
        where: { id: suggestionId },
        data: { accepted: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Internal link suggestion accepted'
      })
    }

    if (action === 'regenerate') {
      // Regenerate all suggestions
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { serpAnalysis: true }
      })

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }

      // Delete existing suggestions
      await prisma.internalLinkSuggestion.deleteMany({
        where: { articleId }
      })

      // Generate new suggestions
      const suggestions = await generateInternalLinkSuggestions(article)

      return NextResponse.json({
        success: true,
        suggestions,
        message: 'Internal link suggestions regenerated'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Internal links action error:', error)
    return NextResponse.json({ 
      error: 'Failed to process internal links action',
      details: error.message 
    }, { status: 500 })
  }
}

async function generateInternalLinkSuggestions(article: any) {
  try {
    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Step 1: Get existing site content from published articles
    const existingContent = await getExistingSiteContent(article)

    if (existingContent.length === 0) {
      return []
    }

    // Step 2: Extract key topics and entities from current article
    const articleTopics = await extractArticleTopics(article, zai)

    // Step 3: Find semantically similar content
    const similarContent = await findSimilarContent(articleTopics, existingContent, zai)

    // Step 4: Generate internal link suggestions
    const suggestions = await generateLinkSuggestions(article, similarContent, zai)

    // Step 5: Store suggestions in database
    const storedSuggestions = await Promise.all(
      suggestions.map((suggestion: any) =>
        prisma.internalLinkSuggestion.create({
          data: {
            articleId: article.id,
            anchor: suggestion.anchor,
            targetUrl: suggestion.targetUrl,
            confidence: suggestion.confidence
          }
        })
      )
    )

    return storedSuggestions

  } catch (error) {
    console.error('Error generating internal link suggestions:', error)
    return []
  }
}

async function getExistingSiteContent(article: any) {
  try {
    // Get published articles from the same site
    const publishedArticles = await prisma.article.findMany({
      where: {
        id: { not: article.id },
        status: 'published',
        wordpressUrl: { not: null }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        wordpressUrl: true,
        focusKeyword: true
      },
      take: 50 // Limit to 50 most relevant articles
    })

    return publishedArticles.map(article => ({
      id: article.id,
      title: article.title,
      url: article.wordpressUrl,
      content: article.content.substring(0, 2000), // First 2000 chars
      keywords: article.focusKeyword ? [article.focusKeyword] : []
    }))

  } catch (error) {
    console.error('Error fetching existing content:', error)
    return []
  }
}

async function extractArticleTopics(article: any, zai: any) {
  const prompt = `Extract the main topics, entities, and key phrases from this article:

Title: ${article.title}
Content: ${article.content.substring(0, 1500)}...

Please provide:
1. Main topics (3-5)
2. Key entities (people, organizations, concepts)
3. Important phrases that could be used as anchor text

Respond in JSON format:
{
  "mainTopics": ["topic1", "topic2", "topic3"],
  "entities": ["entity1", "entity2", "entity3"],
  "anchorPhrases": ["phrase1", "phrase2", "phrase3"]
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
      anchorPhrases: []
    }
  }
}

async function findSimilarContent(articleTopics: any, existingContent: any[], zai: any) {
  const similarContent = []

  for (const content of existingContent) {
    // Calculate semantic similarity
    const similarity = await calculateSimilarity(articleTopics, content, zai)
    
    if (similarity > 0.3) { // Threshold for similarity
      similarContent.push({
        ...content,
        similarity
      } as any)
    }
  }

  // Sort by similarity and return top 10
  return similarContent
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, 10)
}

async function calculateSimilarity(articleTopics: any, content: any, zai: any) {
  const prompt = `Calculate semantic similarity between these two pieces of content:

Article A Topics:
${JSON.stringify(articleTopics, null, 2)}

Article B:
Title: ${content.title}
Content: ${content.content.substring(0, 1000)}...

Rate the similarity on a scale of 0 to 1, where:
0 = completely unrelated
0.5 = somewhat related
1 = very similar/topically related

Consider:
- Topic overlap
- Entity overlap
- Conceptual similarity
- User intent similarity

Respond with only a number between 0 and 1.`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1
  })

  try {
    const score = parseFloat(response.choices[0].message.content.trim())
    return isNaN(score) ? 0 : Math.max(0, Math.min(1, score))
  } catch {
    return 0
  }
}

async function generateLinkSuggestions(article: any, similarContent: any[], zai: any) {
  const suggestions = []

  for (const content of similarContent.slice(0, 5)) { // Top 5 most similar
    const prompt = `Generate 2-3 internal link suggestions connecting these articles:

Current Article:
Title: ${article.title}
Focus: ${article.focusKeyword || 'General topic'}

Target Article:
Title: ${content.title}
URL: ${content.url}
Similarity Score: ${content.similarity}

For each suggestion, provide:
1. Anchor text (natural, keyword-rich)
2. Context in current article where it would fit
3. Confidence score (0-1)

Guidelines:
- Anchor text should be natural and relevant
- Avoid generic anchors like "click here"
- Consider user intent and topical relevance
- Higher confidence for more specific, relevant connections

Respond in JSON format:
{
  "suggestions": [
    {
      "anchor": "best anchor text",
      "targetUrl": "${content.url}",
      "confidence": 0.85,
      "context": "Where this would fit in the article"
    }
  ]
}`

    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
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
    .slice(0, 8) // Max 8 suggestions per article
}