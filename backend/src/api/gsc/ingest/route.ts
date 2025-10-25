import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Get property details
    const property = await prisma.searchConsoleProperty.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!property.isActive) {
      return NextResponse.json({ error: 'Property is not active' }, { status: 400 })
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Set credentials
    oauth2Client.setCredentials({
      access_token: decryptToken(property.accessToken),
      refresh_token: decryptToken(property.refreshToken)
    })

    // Refresh token if needed
    const { credentials } = await oauth2Client.refreshAccessToken()
    if (credentials.access_token) {
      await prisma.searchConsoleProperty.update({
        where: { id: propertyId },
        data: {
          accessToken: encryptToken(credentials.access_token)
        }
      })
    }

    // Perform data ingestion
    const result = await performDataIngestion(property, oauth2Client)

    // Detect decay and opportunities
    const analysis = await analyzePerformanceData(propertyId)

    return NextResponse.json({
      success: true,
      ingestion: result,
      analysis: analysis,
      message: `Successfully ingested ${result.recordsProcessed} GSC records`
    })

  } catch (error: any) {
    console.error('GSC ingestion error:', error)
    return NextResponse.json({ 
      error: 'Failed to ingest GSC data',
      details: error.message 
    }, { status: 500 })
  }
}

async function performDataIngestion(property: any, oauth2Client: any) {
  const searchconsole = google.searchconsole('v1')
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 35) // Last 35 days

  let totalRecords = 0
  let processedPages = new Set()

  try {
    // Get page-level data
    const pageData = await searchconsole.searchanalytics.query({
      siteUrl: property.siteUrl as string,
      auth: oauth2Client,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['page', 'date'],
        rowLimit: 5000
      }
    })

    if (pageData.data?.rows) {
      for (const row of pageData.data.rows) {
        const page = row.keys?.[0] || ''
        const date = new Date(row.keys?.[1] || '')
        
        await upsertMetric({
          propertyId: property.id,
          page,
          query: null,
          date,
          impressions: row.impressions || 0,
          clicks: row.clicks || 0,
          ctr: row.ctr || 0,
          position: row.position || 0
        })

        processedPages.add(page)
        totalRecords++
      }
    }

    // Get query-level data for important pages
    const importantPages = Array.from(processedPages).slice(0, 10) // Limit to top 10 pages
    
    for (const page of importantPages) {
      try {
        const queryData = await searchconsole.searchanalytics.query({
          siteUrl: property.siteUrl as string,
          auth: oauth2Client,
          requestBody: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['page', 'query', 'date'],
            dimensionFilterGroups: [{
              filters: [{
                dimension: 'page',
                operator: 'equals',
                expression: page as string
              }]
            }],
            rowLimit: 100
          }
        })

        if (queryData.data?.rows) {
          for (const row of queryData.data.rows) {
            const pageUrl = row.keys?.[0] || ''
            const query = row.keys?.[1] || ''
            const date = new Date(row.keys?.[2] || '')
            
            await upsertMetric({
              propertyId: property.id,
              page: pageUrl,
              query,
              date,
              impressions: row.impressions || 0,
              clicks: row.clicks || 0,
              ctr: row.ctr || 0,
              position: row.position || 0
            })

            totalRecords++
          }
        }
      } catch (error) {
        console.error(`Failed to get query data for page ${page}:`, error)
      }
    }

    // Update property last sync time
    await prisma.searchConsoleProperty.update({
      where: { id: property.id },
      data: { lastSyncAt: new Date() }
    })

    return {
      recordsProcessed: totalRecords,
      pagesProcessed: processedPages.size,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    }

  } catch (error) {
    console.error('Data ingestion failed:', error)
    throw error
  }
}

async function upsertMetric(data: {
  propertyId: string
  page: string
  query: string | null
  date: Date
  impressions: number
  clicks: number
  ctr: number
  position: number
}) {
  // Check if metric already exists
  const existing = await prisma.gSCMetricSnapshot.findFirst({
    where: {
      propertyId: data.propertyId,
      page: data.page,
      query: data.query,
      date: data.date
    }
  })

  if (existing) {
    // Update existing metric
    await prisma.gSCMetricSnapshot.update({
      where: { id: existing.id },
      data: {
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.ctr,
        position: data.position
      }
    })
  } else {
    // Create new metric
    await prisma.gSCMetricSnapshot.create({ data })
  }

  // Update article performance if this matches an article
  const article = await findArticleByPage(data.page)
  if (article) {
    await updateArticlePerformance(article as string, data)
  }

  // Create or update GSC snapshot
  await prisma.gSCMetricSnapshot.create({
    data: {
      propertyId: data.propertyId,
      page: data.page,
      query: data.query,
      date: data.date,
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: data.ctr,
      position: data.position
    }
  })
}

async function findArticleByPage(page: string): Promise<string | null> {
  // Try to find article by WordPress URL or slug
  const article = await prisma.article.findFirst({
    where: {
      OR: [
        { wordpressUrl: page },
        { slug: extractSlugFromUrl(page) }
      ]
    }
  })

  return article?.id || null
}

function extractSlugFromUrl(url: string): string {
  const urlParts = url.split('/')
  return urlParts[urlParts.length - 1] || ''
}

async function updateArticlePerformance(articleId: string, gscData: any) {
  const date = gscData.date.toISOString().split('T')[0]
  
  // Calculate deltas from previous period
  const previousDate = new Date(gscData.date)
  previousDate.setDate(previousDate.getDate() - 7)
  
  const previousMetric = await prisma.articlePerformance.findFirst({
    where: {
      articleId,
      date: previousDate.toISOString().split('T')[0]
    }
  })

  const deltaImpressions = previousMetric 
    ? gscData.impressions - previousMetric.impressions 
    : null
  const deltaClicks = previousMetric 
    ? gscData.clicks - previousMetric.clicks 
    : null
  const deltaCtr = previousMetric 
    ? gscData.ctr - previousMetric.ctr 
    : null
  const deltaPosition = previousMetric 
    ? gscData.position - previousMetric.position 
    : null

  await prisma.articlePerformance.upsert({
    where: {
      articleId_date: {
        articleId,
        date: new Date(date)
      }
    },
    update: {
      impressions: gscData.impressions,
      clicks: gscData.clicks,
      ctr: gscData.ctr,
      position: gscData.position,
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition
    },
    create: {
      articleId,
      date: new Date(date),
      impressions: gscData.impressions,
      clicks: gscData.clicks,
      ctr: gscData.ctr,
      position: gscData.position,
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition
    }
  })
}

async function analyzePerformanceData(propertyId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentMetrics = await prisma.articlePerformance.findMany({
    where: {
      date: { gte: thirtyDaysAgo }
    },
    include: {
      article: true
    }
  })

  const decayDetection = detectDecay(recentMetrics)
  const opportunityDetection = detectOpportunities(recentMetrics)

  // Generate refresh briefs for detected issues
  const refreshBriefs = []
  
  for (const decay of decayDetection) {
    const brief = await generateRefreshBrief(decay.articleId, 'decay', decay)
    if (brief) refreshBriefs.push(brief)
  }

  for (const opportunity of opportunityDetection) {
    const brief = await generateRefreshBrief(opportunity.articleId, 'opportunity', opportunity)
    if (brief) refreshBriefs.push(brief)
  }

  return {
    decayDetection,
    opportunityDetection,
    refreshBriefsGenerated: refreshBriefs.length,
    articlesAnalyzed: recentMetrics.length
  }
}

function detectDecay(metrics: any[]) {
  const decayThresholds = {
    impressionDrop: 0.25, // 25% drop
    positionWorsening: 1.5, // 1.5 position drop
    ctrDrop: 0.20 // 20% drop
  }

  const decaySignals = []

  for (const metric of metrics) {
    if (metric.deltaImpressions && metric.deltaImpressions < -decayThresholds.impressionDrop * metric.impressions) {
      decaySignals.push({
        articleId: metric.articleId,
        type: 'impression_decay',
        severity: 'high',
        currentValue: metric.impressions,
        previousValue: metric.impressions - metric.deltaImpressions,
        dropPercentage: Math.abs(metric.deltaImpressions / metric.impressions * 100)
      })
    }

    if (metric.deltaPosition && metric.deltaPosition > decayThresholds.positionWorsening) {
      decaySignals.push({
        articleId: metric.articleId,
        type: 'position_decay',
        severity: 'medium',
        currentValue: metric.position,
        previousValue: metric.position - metric.deltaPosition,
        dropAmount: metric.deltaPosition
      })
    }

    if (metric.deltaCtr && metric.deltaCtr < -decayThresholds.ctrDrop * metric.ctr) {
      decaySignals.push({
        articleId: metric.articleId,
        type: 'ctr_decay',
        severity: 'medium',
        currentValue: metric.ctr,
        previousValue: metric.ctr - metric.deltaCtr,
        dropPercentage: Math.abs(metric.deltaCtr / metric.ctr * 100)
      })
    }
  }

  return decaySignals
}

function detectOpportunities(metrics: any[]) {
  const opportunities = []

  for (const metric of metrics) {
    // Articles ranking 6-15 with good impressions (opportunity to break into top 5)
    if (metric.position >= 6 && metric.position <= 15 && metric.impressions > 100) {
      opportunities.push({
        articleId: metric.articleId,
        type: 'ranking_opportunity',
        potential: 'high',
        currentPosition: metric.position,
        impressions: metric.impressions,
        targetPosition: 'top 5'
      })
    }

    // High impressions but low CTR (title/meta optimization opportunity)
    if (metric.impressions > 500 && metric.ctr < 0.02) {
      opportunities.push({
        articleId: metric.articleId,
        type: 'ctr_optimization',
        potential: 'medium',
        impressions: metric.impressions,
        currentCtr: metric.ctr,
        targetCtr: '3-5%'
      })
    }
  }

  return opportunities
}

async function generateRefreshBrief(articleId: string, briefType: string, data: any) {
  const tasks = []

  switch (briefType) {
    case 'decay':
      tasks.push({
        task: 'refresh_statistics',
        description: 'Update all statistics and data points with latest information',
        priority: 'high'
      })
      tasks.push({
        task: 'add_fresh_examples',
        description: 'Add new examples and case studies to improve relevance',
        priority: 'high'
      })
      tasks.push({
        task: 'update_timestamps',
        description: 'Add recent dates and time-sensitive references',
        priority: 'medium'
      })
      break

    case 'opportunity':
      if (data.type === 'ranking_opportunity') {
        tasks.push({
          task: 'enhance_depth',
          description: 'Add more comprehensive coverage to break into top 5',
          priority: 'high'
        })
        tasks.push({
          task: 'add_faq_section',
          description: 'Add FAQ section targeting related queries',
          priority: 'medium'
        })
      }
      if (data.type === 'ctr_optimization') {
        tasks.push({
          task: 'optimize_title_meta',
          description: 'Rewrite title and meta description for higher CTR',
          priority: 'high'
        })
        tasks.push({
          task: 'test_variants',
          description: 'Create A/B test variants for title and description',
          priority: 'medium'
        })
      }
      break
  }

  if (tasks.length === 0) return null

  return await prisma.refreshBrief.create({
    data: {
      articleId,
      briefType,
      priority: data.severity || 'medium',
      tasks: JSON.stringify(tasks),
      status: 'pending'
    }
  })
}

function encryptToken(token: string): string {
  // In production, use proper encryption
  return token
}

function decryptToken(encryptedToken: string): string {
  // In production, use proper decryption
  return encryptedToken
}