import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, bio, credentials, topics } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 })
    }

    // Check if author already exists
    const existingAuthor = await prisma.author.findUnique({
      where: { name }
    })

    if (existingAuthor) {
      return NextResponse.json({ 
        error: 'Author already exists',
        author: existingAuthor 
      }, { status: 409 })
    }

    // Create new author
    const author = await prisma.author.create({
      data: {
        name,
        bio,
        credentials,
        topics: topics ? JSON.stringify(topics) : null
      }
    })

    return NextResponse.json({
      success: true,
      author,
      message: 'Author profile created successfully'
    })

  } catch (error: any) {
    console.error('Author creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create author',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get('id')
    const authorName = searchParams.get('name')

    if (authorId) {
      // Get specific author by ID
      const author = await prisma.author.findUnique({
        where: { id: authorId },
        include: {
          articles: {
            select: {
              id: true,
              title: true,
              status: true,
              publishedAt: true,
              originalityScore: true,
              performanceMetrics: {
                select: {
                  clicks: true,
                  position: true,
                  date: true
                },
                orderBy: { date: 'desc' },
                take: 30
              }
            },
            orderBy: { publishedAt: 'desc' }
          }
        }
      })

      if (!author) {
        return NextResponse.json({ error: 'Author not found' }, { status: 404 })
      }

      // Calculate author metrics
      const metrics = await calculateAuthorMetrics(author)

      return NextResponse.json({
        success: true,
        author: {
          ...author,
          topics: author.topics ? JSON.parse(author.topics) : [],
          metrics
        }
      })
    }

    if (authorName) {
      // Get author by name
      const author = await prisma.author.findUnique({
        where: { name: authorName }
      })

      if (!author) {
        return NextResponse.json({ error: 'Author not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        author: {
          ...author,
          topics: author.topics ? JSON.parse(author.topics) : []
        }
      })
    }

    // Get all authors
    const authors = await prisma.author.findMany({
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: { totalArticles: 'desc' }
    })

    return NextResponse.json({
      success: true,
      authors: authors.map((author: any) => ({
        ...author,
        topics: author.topics ? JSON.parse(author.topics) : [],
        articleCount: author._count.articles
      }))
    })

  } catch (error: any) {
    console.error('Author retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve authors',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, bio, credentials, topics, isActive } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 })
    }

    // Update author
    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(credentials !== undefined && { credentials }),
        ...(topics !== undefined && { topics: JSON.stringify(topics) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({
      success: true,
      author: {
        ...author,
        topics: author.topics ? JSON.parse(author.topics) : []
      },
      message: 'Author updated successfully'
    })

  } catch (error: any) {
    console.error('Author update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update author',
      details: error.message 
    }, { status: 500 })
  }
}

async function calculateAuthorMetrics(author: any) {
  const articles = author.articles || []
  
  // Published articles only
  const publishedArticles = articles.filter((article: any) => article.status === 'published')
  
  // Calculate average originality score
  const originalityScores = publishedArticles
    .map((article: any) => article.originalityScore)
    .filter((score: any) => score !== null)
  
  const avgOriginality = originalityScores.length > 0
    ? originalityScores.reduce((sum: number, score: number) => sum + score, 0) / originalityScores.length
    : 0

  // Calculate performance metrics
  let totalClicks = 0
  let totalPosition = 0
  let positionCount = 0
  
  publishedArticles.forEach((article: any) => {
    if (article.performanceMetrics) {
      article.performanceMetrics.forEach((metric: any) => {
        totalClicks += metric.clicks || 0
        if (metric.position && metric.position > 0) {
          totalPosition += metric.position
          positionCount++
        }
      })
    }
  })

  const avgPosition = positionCount > 0 ? totalPosition / positionCount : 0
  
  // Calculate CPC value (assuming $3.50 per click)
  const totalCPCValue = totalClicks * 3.50
  
  // Update author with calculated metrics
  await prisma.author.update({
    where: { id: author.id },
    data: {
      totalArticles: publishedArticles.length,
      avgOriginality,
      avgPosition,
      totalClicks,
      avgCpcValue: totalCPCValue
    }
  })

  return {
    totalArticles: publishedArticles.length,
    avgOriginality,
    avgPosition,
    totalClicks,
    avgCpcValue: totalCPCValue,
    recentPerformance: getRecentPerformance(publishedArticles)
  }
}

function getRecentPerformance(articles: any[]) {
  const recentMetrics: any[] = []
  
  articles.forEach((article: any) => {
    if (article.performanceMetrics) {
      article.performanceMetrics.forEach((metric: any) => {
        recentMetrics.push({
          date: metric.date,
          clicks: metric.clicks,
          position: metric.position,
          articleTitle: article.title
        })
      })
    }
  })

  // Sort by date and get last 10 entries
  return recentMetrics
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
}