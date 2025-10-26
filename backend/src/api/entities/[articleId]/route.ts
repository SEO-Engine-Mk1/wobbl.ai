import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(
  _request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const articleId = params.articleId

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article with SERP analysis and entity coverage
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        serpAnalysis: true,
        entityCoverage: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if entity coverage already analyzed
    if (article.entityCoverage.length > 0) {
      // Calculate overall coverage score
      const totalCoverage = article.entityCoverage.reduce(
        (sum, entity) => sum + entity.coverageScore, 0
      )
      const averageCoverage = article.entityCoverage.length > 0 
        ? totalCoverage / article.entityCoverage.length 
        : 0

      return NextResponse.json({
        success: true,
        entities: article.entityCoverage,
        overallScore: averageCoverage,
        alreadyAnalyzed: true
      })
    }

    // Generate new entity analysis
    const entityAnalysis = await analyzeEntityCoverage(article)

    return NextResponse.json({
      success: true,
      entities: entityAnalysis.entities,
      overallScore: entityAnalysis.overallScore,
      alreadyAnalyzed: false
    })

  } catch (error: any) {
    console.error('Entity coverage analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze entity coverage',
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
      // Reanalyze entity coverage
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { serpAnalysis: true }
      })

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }

      // Delete existing entity coverage
      await prisma.entityCoverage.deleteMany({
        where: { articleId }
      })

      // Generate new analysis
      const entityAnalysis = await analyzeEntityCoverage(article)

      return NextResponse.json({
        success: true,
        entities: entityAnalysis.entities,
        overallScore: entityAnalysis.overallScore,
        message: 'Entity coverage analysis regenerated'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Entity coverage action error:', error)
    return NextResponse.json({ 
      error: 'Failed to process entity coverage action',
      details: error.message 
    }, { status: 500 })
  }
}

async function analyzeEntityCoverage(article: any) {
  try {
    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Step 1: Extract entities from our article
    const ourEntities = await extractEntitiesFromArticle(article, zai)

    // Step 2: Extract entities from SERP results
    const serpEntities = await extractEntitiesFromSERP(article.serpAnalysis, zai)

    // Step 3: Calculate coverage scores
    const entityCoverage = await calculateEntityCoverage(ourEntities, serpEntities, zai)

    // Step 4: Store entity coverage in database
    const storedEntities = await Promise.all(
      entityCoverage.map(entity =>
        prisma.entityCoverage.create({
          data: {
            articleId: article.id,
            entity: entity.entity,
            entityType: entity.entityType,
            covered: entity.covered,
            coverageScore: entity.coverageScore,
            frequency: entity.frequency,
            prominence: entity.prominence
          }
        })
      )
    )

    // Step 5: Calculate overall coverage score
    const totalCoverage = storedEntities.reduce(
      (sum, entity) => sum + entity.coverageScore, 0
    )
    const overallScore = storedEntities.length > 0 
      ? totalCoverage / storedEntities.length 
      : 0

    // Step 6: Update article with entity coverage score
    await prisma.article.update({
      where: { id: article.id },
      data: {
        entityCoverageScore: overallScore,
        qaPassed: article.qaPassed && overallScore >= 0.7 // 70% threshold for entity coverage
      }
    })

    return {
      entities: storedEntities,
      overallScore
    }

  } catch (error) {
    console.error('Error analyzing entity coverage:', error)
    return {
      entities: [],
      overallScore: 0
    }
  }
}

async function extractEntitiesFromArticle(article: any, zai: any) {
  const prompt = `Extract named entities from this article and analyze their importance:

Title: ${article.title}
Content: ${article.content.substring(0, 2500)}...

For each entity, provide:
1. Entity name
2. Entity type (person, organization, location, concept, product)
3. Frequency (how many times mentioned)
4. Prominence (1-10, based on position in text, headings, emphasis)
5. Context relevance (1-10, how relevant to main topic)

Respond in JSON format:
{
  "entities": [
    {
      "entity": "Entity Name",
      "entityType": "organization",
      "frequency": 5,
      "prominence": 8,
      "contextRelevance": 9
    }
  ]
}

Include all important entities, even if mentioned only once if they're highly relevant.`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  })

  try {
    const result = JSON.parse(response.choices[0].message.content)
    return result.entities || []
  } catch (error) {
    console.error('Error extracting entities from article:', error)
    return []
  }
}

async function extractEntitiesFromSERP(serpAnalysis: any, zai: any) {
  if (!serpAnalysis || !serpAnalysis.topResults) {
    return []
  }

  const allSerpEntities: any[] = []

  // Extract entities from top 5 SERP results
  for (const result of serpAnalysis.topResults.slice(0, 5)) {
    const prompt = `Extract key entities from this search result:

Title: ${result.title}
Snippet: ${result.snippet}

Focus on:
1. Main topics and concepts
2. Organizations, people, products mentioned
3. Important locations
4. Key terminology

Respond in JSON format:
{
  "entities": [
    {
      "entity": "Entity Name",
      "entityType": "concept",
      "relevance": 8
    }
  ]
}

Only include the most important entities (max 10 per result).`

    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })

    try {
      const result = JSON.parse(response.choices[0].message.content)
      if (result.entities) {
        allSerpEntities.push(...result.entities)
      }
    } catch (error) {
      console.error('Error extracting entities from SERP result:', error)
    }
  }

  // Deduplicate and score entities by frequency across SERP
  const entityFrequency: Record<string, {
    entity: string;
    entityType: string;
    frequency: number;
    totalRelevance: number;
  }> = {}
  allSerpEntities.forEach((entity: any) => {
    if (!entityFrequency[entity.entity]) {
      entityFrequency[entity.entity] = {
        entity: entity.entity,
        entityType: entity.entityType,
        frequency: 0,
        totalRelevance: 0
      }
    }
    entityFrequency[entity.entity].frequency++
    entityFrequency[entity.entity].totalRelevance += entity.relevance || 5
  })

  // Calculate average relevance and return sorted entities
  return Object.values(entityFrequency)
    .map((entity: any) => ({
      ...entity,
      avgRelevance: entity.totalRelevance / entity.frequency
    }))
    .sort((a: any, b: any) => b.avgRelevance - a.avgRelevance)
    .slice(0, 20) // Top 20 entities from SERP
}

async function calculateEntityCoverage(ourEntities: any[], serpEntities: any[], _zai: any) {
  const coverage: any[] = []

  // Create a map of SERP entities for quick lookup
  const serpEntityMap = new Map()
  serpEntities.forEach((entity: any) => {
    serpEntityMap.set(entity.entity.toLowerCase(), entity)
  })

  // Analyze each of our entities
  for (const ourEntity of ourEntities) {
    const serpEntity = serpEntityMap.get(ourEntity.entity.toLowerCase())
    
    let coverageScore = 0
    let covered = false

    if (serpEntity) {
      // Entity exists in SERP - calculate coverage based on multiple factors
      const frequencyScore = Math.min(ourEntity.frequency / 3, 1) * 25 // Max 25 points
      const prominenceScore = (ourEntity.prominence / 10) * 25 // Max 25 points
      const relevanceScore = (ourEntity.contextRelevance / 10) * 25 // Max 25 points
      const serpAlignmentScore = (serpEntity.avgRelevance / 10) * 25 // Max 25 points
      
      coverageScore = (frequencyScore + prominenceScore + relevanceScore + serpAlignmentScore) / 100
      covered = true
    } else {
      // Entity not found in SERP - still score based on our content quality
      const frequencyScore = Math.min(ourEntity.frequency / 3, 1) * 30 // Max 30 points
      const prominenceScore = (ourEntity.prominence / 10) * 35 // Max 35 points
      const relevanceScore = (ourEntity.contextRelevance / 10) * 35 // Max 35 points
      
      coverageScore = (frequencyScore + prominenceScore + relevanceScore) / 100
      covered = false
    }

    coverage.push({
      entity: ourEntity.entity,
      entityType: ourEntity.entityType,
      covered,
      coverageScore: Math.round(coverageScore * 100) / 100,
      frequency: ourEntity.frequency,
      prominence: ourEntity.prominence
    })
  }

  // Add important SERP entities that we're missing
  const ourEntityNames = new Set(ourEntities.map(e => e.entity.toLowerCase()))
  const missingEntities = serpEntities
    .filter((serpEntity: any) => !ourEntityNames.has(serpEntity.entity.toLowerCase()))
    .slice(0, 5) // Top 5 missing entities
    .map((missingEntity: any) => ({
      entity: missingEntity.entity,
      entityType: missingEntity.entityType,
      covered: false,
      coverageScore: 0,
      frequency: 0,
      prominence: 0
    }))

  return [...coverage, ...missingEntities]
    .sort((a, b) => b.coverageScore - a.coverageScore)
}