import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '../../../lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const articleId = params.articleId
    const { features } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article
    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        serpAnalysis: true,
        authorProfile: true,
        internalLinks: true,
        competitorGaps: true,
        entityCoverage: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const results: Array<{
      feature: string
      status: string
      message: string
      count?: number
      score?: number
    }> = []

    // Run requested enhancement features
    if (!features || features.includes('internal-links')) {
      if (article.internalLinks.length === 0) {
        results.push({
          feature: 'internal-links',
          status: 'ready',
          message: 'Ready to generate internal link suggestions'
        })
      } else {
        results.push({
          feature: 'internal-links',
          status: 'completed',
          count: article.internalLinks.length,
          message: `${article.internalLinks.length} suggestions already exist`
        })
      }
    }

    if (!features || features.includes('schema')) {
      results.push({
        feature: 'schema',
        status: 'ready',
        message: 'Ready to enhance schema markup'
      })
    }

    if (!features || features.includes('competitor-gaps')) {
      if (article.competitorGaps.length === 0) {
        results.push({
          feature: 'competitor-gaps',
          status: 'ready',
          message: 'Ready to analyze competitor gaps'
        })
      } else {
        results.push({
          feature: 'competitor-gaps',
          status: 'completed',
          count: article.competitorGaps.length,
          message: `${article.competitorGaps.length} gaps already identified`
        })
      }
    }

    if (!features || features.includes('entity-coverage')) {
      if (article.entityCoverage.length === 0) {
        results.push({
          feature: 'entity-coverage',
          status: 'ready',
          message: 'Ready to analyze entity coverage'
        })
      } else {
        results.push({
          feature: 'entity-coverage',
          status: 'completed',
          score: article.entityCoverage.reduce((sum, entity) => sum + (entity.coverageScore || 0), 0) / article.entityCoverage.length,
          count: article.entityCoverage.length,
          message: `Entity coverage analyzed (${(article.entityCoverage.reduce((sum, entity) => sum + (entity.coverageScore || 0), 0) / article.entityCoverage.length)?.toFixed(1)}%)`
        })
      }
    }

    if (!features || features.includes('author-reputation')) {
      results.push({
        feature: 'author-reputation',
        status: 'ready',
        message: 'Ready to enhance author reputation'
      })
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Enhancement status retrieved successfully'
    })

  } catch (error: any) {
    console.error('Enhancement status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get enhancement status',
      details: error.message 
    }, { status: 500 })
  }
}