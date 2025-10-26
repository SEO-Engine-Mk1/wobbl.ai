import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const articleId = params.articleId
    const { enabled } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Update auto-refresh setting
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        autoRefreshEnabled: enabled
      }
    })

    return NextResponse.json({
      success: true,
      autoRefreshEnabled: updatedArticle.autoRefreshEnabled,
      message: `Auto-refresh ${enabled ? 'enabled' : 'disabled'} for article`
    })

  } catch (error: any) {
    console.error('Auto-refresh toggle error:', error)
    return NextResponse.json({ 
      error: 'Failed to toggle auto-refresh',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const articleId = params.articleId

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article with performance data
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        performanceMetrics: {
          orderBy: { date: 'desc' },
          take: 30
        },
        refreshBriefs: {
          where: { status: 'pending' },
          orderBy: { generatedAt: 'desc' }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Analyze current performance for auto-refresh eligibility
    const analysis = await analyzeAutoRefreshEligibility(article)

    return NextResponse.json({
      success: true,
      autoRefreshEnabled: article.autoRefreshEnabled,
      analysis
    })

  } catch (error: any) {
    console.error('Auto-refresh analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze auto-refresh',
      details: error.message 
    }, { status: 500 })
  }
}

async function analyzeAutoRefreshEligibility(article: any) {
  const performance = article.performanceMetrics
  const pendingBriefs = article.refreshBriefs

  // Analyze performance trends
  const recentPerformance = performance.slice(0, 7) // Last 7 days
  const olderPerformance = performance.slice(7, 14) // Previous 7 days

  let decayDetected = false
  let opportunityDetected = false
  let recommendations: string[] = []

  // Check for decay (25%+ drop in impressions)
  if (recentPerformance.length >= 3 && olderPerformance.length >= 3) {
    const recentAvg = recentPerformance.reduce((sum: number, p: any) => sum + p.impressions, 0) / recentPerformance.length
    const olderAvg = olderPerformance.reduce((sum: number, p: any) => sum + p.impressions, 0) / olderPerformance.length
    
    if (recentAvg < olderAvg * 0.75) {
      decayDetected = true
      recommendations.push('Content decay detected - consider refresh')
    }
  }

  // Check for opportunities (position 6-15 with good impressions)
  const opportunityArticles = recentPerformance.filter((p: any) => 
    p.position >= 6 && p.position <= 15 && p.impressions > 100
  )
  
  if (opportunityArticles.length > 0) {
    opportunityDetected = true
    recommendations.push('Ranking opportunity detected - could break into top 5')
  }

  // Check pending refresh briefs
  if (pendingBriefs.length > 0) {
    recommendations.push(`${pendingBriefs.length} pending refresh briefs`)
  }

  return {
    eligible: article.autoRefreshEnabled,
    decayDetected,
    opportunityDetected,
    pendingBriefs: pendingBriefs.length,
    recommendations,
    lastPerformance: recentPerformance[0] || null,
    performanceTrend: calculatePerformanceTrend(recentPerformance)
  }
}

function calculatePerformanceTrend(performance: any[]) {
  if (performance.length < 3) return 'insufficient_data'

  const recent = performance.slice(0, 3)
  const older = performance.slice(3, 6)

  const recentAvg = recent.reduce((sum, p) => sum + p.impressions, 0) / recent.length
  const olderAvg = older.reduce((sum, p) => sum + p.impressions, 0) / older.length

  if (recentAvg > olderAvg * 1.1) return 'improving'
  if (recentAvg < olderAvg * 0.9) return 'declining'
  return 'stable'
}