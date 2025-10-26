import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
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

    // Get article with SERP analysis
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        serpAnalysis: true,
        competitorGaps: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if gaps already analyzed
    if (article.competitorGaps.length > 0) {
      return NextResponse.json({
        success: true,
        gaps: article.competitorGaps,
        alreadyAnalyzed: true
      })
    }

    // Generate new gap analysis
    const gaps = await analyzeCompetitorGaps(article)

    return NextResponse.json({
      success: true,
      gaps,
      alreadyAnalyzed: false
    })

  } catch (error: any) {
    console.error('Competitor gap analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze competitor gaps',
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
    const { action } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    if (action === 'reanalyze') {
      // Reanalyze gaps
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { serpAnalysis: true }
      })

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }

      // Delete existing gaps
      await prisma.competitorGap.deleteMany({
        where: { articleId }
      })

      // Generate new analysis
      const gaps = await analyzeCompetitorGaps(article)

      return NextResponse.json({
        success: true,
        gaps,
        message: 'Competitor gap analysis regenerated'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Competitor gaps action error:', error)
    return NextResponse.json({ 
      error: 'Failed to process competitor gaps action',
      details: error.message 
    }, { status: 500 })
  }
}

async function analyzeCompetitorGaps(article: any) {
  try {
    // Initialize ZAI SDK
    const zai = await ZAI.create()

    if (!article.serpAnalysis) {
      return []
    }

    // Step 1: Extract competitor content analysis
    const competitorAnalysis = await extractCompetitorContent(article.serpAnalysis, zai)

    // Step 2: Analyze our article content
    const ourArticleAnalysis = await analyzeOurArticle(article, zai)

    // Step 3: Identify gaps
    const gaps = await identifyContentGaps(competitorAnalysis, ourArticleAnalysis, zai)

    // Step 4: Store gaps in database
    const storedGaps = await Promise.all(
      gaps.map((gap: any) =>
        prisma.competitorGap.create({
          data: {
            articleId: article.id,
            entity: gap.entity,
            sourceUrl: gap.sourceUrl,
            gapType: gap.gapType,
            priority: gap.priority
          }
        })
      )
    )

    return storedGaps

  } catch (error) {
    console.error('Error analyzing competitor gaps:', error)
    return []
  }
}

async function extractCompetitorContent(serpAnalysis: any, zai: any) {
  const topResults = serpAnalysis.topResults.slice(0, 5) // Top 5 competitors
  const competitorContent: any[] = []

  for (const result of topResults) {
    const prompt = `Analyze this competitor content for entities, topics, and subtopics:

Title: ${result.title}
Snippet: ${result.snippet}
URL: ${result.url}

Extract:
1. Main entities mentioned (people, organizations, concepts)
2. Key topics covered
3. Subtopics or specific angles
4. Unique insights or data points
5. Content structure/format

Respond in JSON format:
{
  "entities": ["entity1", "entity2", "entity3"],
  "topics": ["topic1", "topic2", "topic3"],
  "subtopics": ["subtopic1", "subtopic2"],
  "uniqueInsights": ["insight1", "insight2"],
  "contentStructure": "listicle/tutorial/guide/review",
  "dataPoints": ["statistic1", "statistic2"]
}`

    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })

    try {
      const analysis = JSON.parse(response.choices[0].message.content)
      competitorContent.push({
        url: result.url,
        title: result.title,
        ...analysis
      })
    } catch (error) {
      console.error('Error parsing competitor analysis:', error)
    }
  }

  return competitorContent
}

async function analyzeOurArticle(article: any, zai: any) {
  const prompt = `Analyze our article for entities, topics, and subtopics:

Title: ${article.title}
Content: ${article.content.substring(0, 2000)}...

Extract:
1. Main entities covered
2. Key topics addressed
3. Subtopics included
4. Data points and statistics used
5. Content structure and format

Respond in JSON format:
{
  "entities": ["entity1", "entity2", "entity3"],
  "topics": ["topic1", "topic2", "topic3"],
  "subtopics": ["subtopic1", "subtopic2"],
  "dataPoints": ["statistic1", "statistic2"],
  "contentStructure": "listicle/tutorial/guide/review",
  "uniqueAngles": ["angle1", "angle2"]
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('Error parsing our article analysis:', error)
    return {
      entities: [],
      topics: [],
      subtopics: [],
      dataPoints: [],
      contentStructure: 'article',
      uniqueAngles: []
    }
  }
}

async function identifyContentGaps(competitorAnalysis: any[], ourArticle: any, zai: any) {
  const gaps: any[] = []

  // Compile all competitor entities and topics
  const allCompetitorEntities = new Set()
  const allCompetitorTopics = new Set()
  const allCompetitorSubtopics = new Set()
  const allCompetitorData = new Set()

  competitorAnalysis.forEach(competitor => {
    competitor.entities.forEach((entity: string) => allCompetitorEntities.add(entity))
    competitor.topics.forEach((topic: string) => allCompetitorTopics.add(topic))
    competitor.subtopics.forEach((subtopic: string) => allCompetitorSubtopics.add(subtopic))
    competitor.dataPoints.forEach((data: string) => allCompetitorData.add(data))
  })

  // Find missing entities
  const missingEntities = Array.from(allCompetitorEntities).filter(
    (entity: any) => !ourArticle.entities.includes(entity)
  )

  // Find missing topics
  const missingTopics = Array.from(allCompetitorTopics).filter(
    (topic: any) => !ourArticle.topics.includes(topic)
  )

  // Find missing subtopics
  const missingSubtopics = Array.from(allCompetitorSubtopics).filter(
    (subtopic: any) => !ourArticle.subtopics.includes(subtopic)
  )

  // Find missing data points
  const missingData = Array.from(allCompetitorData).filter(
    (data: any) => !ourArticle.dataPoints.includes(data)
  )

  // Prioritize gaps using AI
  const prompt = `Prioritize these content gaps based on importance and user value:

Missing Entities: ${missingEntities.join(', ')}
Missing Topics: ${missingTopics.join(', ')}
Missing Subtopics: ${missingSubtopics.join(', ')}
Missing Data Points: ${missingData.join(', ')}

Our Article Focus: ${ourArticle.topics.join(', ')}

For each gap, assign:
1. Priority (high/medium/low)
2. Gap type (missing_entity, missing_subtopic, weak_coverage, missing_data)
3. Reason for priority

Respond in JSON array format:
[
  {
    "entity": "gap name",
    "gapType": "missing_entity",
    "priority": "high",
    "sourceUrl": "https://example-competitor.com",
    "reason": "Critical entity covered by 4/5 competitors"
  }
]

Include only the top 10 most important gaps.`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    const prioritizedGaps = JSON.parse(response.choices[0].message.content)
    
    // Find source URLs for each gap
    return prioritizedGaps.map((gap: any) => {
      const sourceCompetitor = competitorAnalysis.find(competitor => 
        competitor.entities.includes(gap.entity) ||
        competitor.topics.includes(gap.entity) ||
        competitor.subtopics.includes(gap.entity)
      )
      
      return {
        ...gap,
        sourceUrl: sourceCompetitor?.url || null
      }
    })

  } catch (error) {
    console.error('Error prioritizing gaps:', error)
    
    // Fallback: create basic gaps
    const fallbackGaps = [
      ...missingEntities.slice(0, 3).map(entity => ({
        entity,
        gapType: 'missing_entity',
        priority: 'medium',
        sourceUrl: competitorAnalysis[0]?.url || null
      })),
      ...missingSubtopics.slice(0, 2).map(subtopic => ({
        entity: subtopic,
        gapType: 'missing_subtopic',
        priority: 'medium',
        sourceUrl: competitorAnalysis[0]?.url || null
      }))
    ]

    return fallbackGaps
  }
}