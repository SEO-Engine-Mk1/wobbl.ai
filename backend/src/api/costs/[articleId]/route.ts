import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const articleId = params.articleId

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article with cost and performance data
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        cost: true,
        performanceMetrics: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Calculate or get cost data
    let costData = article.cost
    if (!costData) {
      const calculatedCosts = await calculateArticleCosts(article)
      // Create cost record if it doesn't exist
      costData = await prisma.articleCost.create({
        data: {
          articleId,
          ...calculatedCosts
        }
      })
    }

    // Calculate ROI metrics
    const roiMetrics = await calculateROIMetrics(article, costData)

    return NextResponse.json({
      success: true,
      costs: costData,
      roi: roiMetrics,
      message: 'Cost and ROI data retrieved successfully'
    })

  } catch (error: any) {
    console.error('Cost analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze costs',
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

    if (action === 'recalculate') {
      // Recalculate costs
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          cost: true,
          performanceMetrics: {
            orderBy: { date: 'desc' },
            take: 30
          }
        }
      })

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }

      // Calculate new costs
      const newCostData = await calculateArticleCosts(article)

      // Update or create cost record
      const costRecord = await prisma.articleCost.upsert({
        where: { articleId },
        update: newCostData,
        create: {
          articleId,
          ...newCostData
        }
      })

      // Calculate ROI
      const roiMetrics = await calculateROIMetrics(article, costRecord)

      return NextResponse.json({
        success: true,
        costs: costRecord,
        roi: roiMetrics,
        message: 'Costs recalculated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Cost action error:', error)
    return NextResponse.json({ 
      error: 'Failed to process cost action',
      details: error.message 
    }, { status: 500 })
  }
}

async function calculateArticleCosts(article: any) {
  // AI Costs (based on token usage and API calls)
  const aiCost = calculateAICosts(article)
  
  // Plagiarism Check Costs
  const plagiarismCost = calculatePlagiarismCosts(article)
  
  // SMTP Costs (based on email campaigns)
  const smtpCost = await calculateSMTPCosts(article)
  
  const totalCost = aiCost + plagiarismCost + smtpCost

  return {
    aiCost,
    plagiarismCost,
    smtpCost,
    totalCost,
    clicksGained: 0,
    cpcValue: 0,
    roi: null
  }
}

function calculateAICosts(article: any) {
  // Estimated costs based on content generation and analysis
  const baseAICost = 0.50 // Base cost for article generation
  const wordCountCost = (article.actualWordCount || 2500) / 1000 * 0.10 // $0.10 per 1000 words
  const analysisCost = 0.30 // SERP analysis, entity extraction, etc.
  
  return baseAICost + wordCountCost + analysisCost
}

function calculatePlagiarismCosts(article: any) {
  // Estimated plagiarism check costs
  if (article.plagiarismChecked) {
    return 0.25 // Average cost per plagiarism check
  }
  return 0
}

async function calculateSMTPCosts(article: any) {
  try {
    // For now, return a default SMTP cost estimate
    // In a real implementation, you would query email campaigns separately
    const estimatedEmails = 100 // Estimated number of emails sent for this article
    const smtpCost = estimatedEmails * 0.001 // $0.001 per email
    
    return smtpCost
  } catch (error) {
    console.error('Error calculating SMTP costs:', error)
    return 0
  }
}

async function calculateROIMetrics(article: any, costData: any) {
  const performance = article.performanceMetrics || []
  
  // Calculate clicks gained
  let clicksGained = 0
  let cpcValue = 0
  
  if (performance.length >= 2) {
    // Compare recent performance to initial performance
    const recentPerformance = performance.slice(0, 7) // Last 7 days
    const initialPerformance = performance.slice(-7) // First 7 days
    
    const recentClicks = recentPerformance.reduce((sum: number, p: any) => sum + p.clicks, 0)
    const initialClicks = initialPerformance.reduce((sum: number, p: any) => sum + p.clicks, 0)
    
    clicksGained = Math.max(0, recentClicks - initialClicks)
    
    // Estimate CPC value (industry average $2-5 per click)
    cpcValue = clicksGained * 3.50 // Using $3.50 average CPC
  }
  
  // Calculate ROI
  let roi: number | null = null
  if (costData.totalCost > 0 && cpcValue > 0) {
    roi = ((cpcValue - costData.totalCost) / costData.totalCost) * 100
  }
  
  // Calculate cost per click
  const costPerClick = clicksGained > 0 ? costData.totalCost / clicksGained : 0
  
  // Calculate cost per article (already have this)
  const costPerArticle = costData.totalCost
  
  return {
    clicksGained,
    cpcValue,
    roi,
    costPerClick,
    costPerArticle,
    breakEvenClicks: costData.totalCost / 3.50, // Clicks needed to break even
    paybackPeriod: calculatePaybackPeriod(article.performanceMetrics || [], costData.totalCost)
  }
}

function calculatePaybackPeriod(performance: any[], totalCost: any) {
  if (performance.length < 7) {
    return 'insufficient_data'
  }
  
  // Calculate daily average CPC value
  const recentPerformance = performance.slice(0, 7)
  const dailyClicks = recentPerformance.reduce((sum, p) => sum + p.clicks, 0) / 7
  const dailyCPCValue = dailyClicks * 3.50
  
  if (dailyCPCValue <= 0) {
    return 'no_clicks'
  }
  
  const daysToBreakEven = Math.ceil(totalCost / dailyCPCValue)
  
  return {
    days: daysToBreakEven,
    category: daysToBreakEven <= 30 ? 'within_month' : 
              daysToBreakEven <= 90 ? 'within_quarter' : 'long_term'
  }
}