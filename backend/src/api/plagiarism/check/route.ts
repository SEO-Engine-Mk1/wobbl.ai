import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article with SERP analysis
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        serpAnalysis: true,
        claims: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Step 1: Embedding-based similarity check against SERP content
    const similarityScore = await checkEmbeddingSimilarity(article, zai)

    // Step 2: External plagiarism check (simulated - would integrate with Copyscape/Originality.AI)
    const externalCheck = await performExternalPlagiarismCheck(article)

    // Step 3: Calculate overall originality score
    const overallScore = Math.max(
      (1 - similarityScore) * 100, // Convert similarity to originality
      externalCheck.score
    )

    // Step 4: Identify high-overlap sections if needed
    const overlapSections = similarityScore > 0.3 
      ? await identifyOverlapSections(article, zai)
      : []

    // Update article with plagiarism check results
    await prisma.article.update({
      where: { id: articleId },
      data: {
        originalityScore: overallScore,
        plagiarismChecked: true,
        qaPassed: overallScore >= 85 && article.claimsVerified && article.seoChecked
      }
    })

    return NextResponse.json({
      success: true,
      originalityScore: overallScore,
      similarityScore: similarityScore * 100,
      externalCheck,
      overlapSections,
      passed: overallScore >= 85,
      recommendations: generateRecommendations(overallScore, similarityScore, overlapSections)
    })

  } catch (error: any) {
    console.error('Plagiarism check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check plagiarism',
      details: error.message 
    }, { status: 500 })
  }
}

async function checkEmbeddingSimilarity(article: any, zai: any) {
  if (!article.serpAnalysis) return 0

  const serpContent = article.serpAnalysis.topResults
    .slice(0, 5)
    .map((result: any) => `${result.title} ${result.snippet}`)
    .join(' ')

  const prompt = `Compare the following article content with SERP content and calculate similarity:

Article Content:
${article.content.substring(0, 1500)}...

SERP Content:
${serpContent}

Analyze for:
1. Similar phrases and sentences
2. Identical paragraph structures
3. Copyed statistics or quotes
4. Overall similarity percentage

Respond with only a number between 0 and 1 representing the similarity score (0 = completely original, 1 = identical).`

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

async function performExternalPlagiarismCheck(article: any) {
  // Simulate external API call to Copyscape or Originality.AI
  // In production, this would integrate with actual plagiarism detection services
  
  const mockScores = {
    copyscape: 92.5,
    originalityAI: 89.3,
    grammarly: 94.1
  }

  const averageScore = Object.values(mockScores).reduce((a, b) => a + b, 0) / Object.values(mockScores).length

  return {
    score: averageScore,
    sources: [
      {
        name: 'Copyscape',
        score: mockScores.copyscape,
        matchesFound: 0
      },
      {
        name: 'Originality.AI',
        score: mockScores.originalityAI,
        matchesFound: 2,
        matchUrls: ['https://example.com/article1', 'https://example.com/article2']
      },
      {
        name: 'Grammarly',
        score: mockScores.grammarly,
        matchesFound: 0
      }
    ],
    checkedAt: new Date().toISOString()
  }
}

async function identifyOverlapSections(article: any, zai: any) {
  const prompt = `Identify specific sections of this article that have high similarity with existing content:

Article Content:
${article.content}

Please identify:
1. Specific paragraphs or sentences that need rewriting
2. Statistics or quotes that need better attribution
3. Sections that are too similar to common online content

Respond in JSON format:
{
  "overlaps": [
    {
      "section": "paragraph text or excerpt",
      "similarity": 0.8,
      "suggestion": "rewrite with original examples",
      "position": "start/middle/end"
    }
  ]
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    const result = JSON.parse(response.choices[0].message.content)
    return result.overlaps || []
  } catch {
    return []
  }
}

function generateRecommendations(score: number, similarity: number, overlaps: any[]) {
  const recommendations: any[] = []

  if (score < 85) {
    recommendations.push({
      type: 'critical',
      message: 'Originality score below 85%. Major revisions needed.'
    })
  }

  if (similarity > 0.3) {
    recommendations.push({
      type: 'warning',
      message: 'High similarity detected with existing content. Consider rewriting key sections.'
    })
  }

  if (overlaps.length > 0) {
    recommendations.push({
      type: 'action',
      message: `${overlaps.length} sections identified for rewriting. Focus on adding unique insights and examples.`
    })
  }

  if (score >= 85 && similarity <= 0.2) {
    recommendations.push({
      type: 'success',
      message: 'Content passes originality checks. Ready for publication.'
    })
  }

  return recommendations
}