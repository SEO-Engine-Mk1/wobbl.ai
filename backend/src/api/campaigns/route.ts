import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import nodemailer from 'nodemailer'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      companyProfileId, 
      name, 
      recipientList, 
      campaignSettings 
    } = await request.json()

    if (!userId || !companyProfileId || !name || !recipientList) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, companyProfileId, name, recipientList' 
      }, { status: 400 })
    }

    // Get company profile
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { id: companyProfileId },
      include: { attachments: true }
    })

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Step 1: Fetch recent news and insights
    const newsContent = await fetchRelevantNews(companyProfile, zai)

    // Step 2: Generate email campaign steps
    const emailSteps = await generateEmailSteps({
      companyProfile,
      newsContent,
      campaignSettings,
      zai
    })

    // Step 3: Create campaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        userId,
        companyProfileId,
        name,
        description: `Email campaign for ${companyProfile.companyName}`,
        listIds: JSON.stringify([]), // Empty list for now
        status: 'draft',
        dailyCap: campaignSettings?.dailyCap || 100,
        warmupDay: 1
      }
    })

    // Step 4: Create email steps
    await Promise.all(
      emailSteps.map((step: any, index: number) =>
        prisma.emailStep.create({
          data: {
            campaignId: campaign.id,
            stepNumber: index + 1,
            subject: step.subject,
            content: step.content,
            delayDays: step.delayDays,
            delayHours: step.delayHours,
            isActive: true
          }
        })
      )
    )

    // Step 5: Queue recipients for sending
    const queuedRecipients = await queueRecipients(campaign.id, recipientList)

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        dailyCap: campaign.dailyCap,
        emailStepsCount: emailSteps.length
      },
      recipientsQueued: queuedRecipients.length,
      emailSteps: emailSteps.map((step: any, index: number) => ({
        stepNumber: index + 1,
        subject: step.subject,
        delayDays: step.delayDays,
        delayHours: step.delayHours
      }))
    })

  } catch (error: any) {
    console.error('Campaign creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create email campaign',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where: { userId },
      include: {
        companyProfile: true,
        emailSteps: true,
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        dailyCap: campaign.dailyCap,
        warmupDay: campaign.warmupDay,
        totalSent: campaign.totalSent,
        totalOpened: campaign.totalOpened,
        totalClicked: campaign.totalClicked,
        totalReplied: campaign.totalReplied,
        totalUnsubscribed: campaign.totalUnsubscribed,
        emailStepsCount: campaign.emailSteps.length,
        eventsCount: campaign._count.events,
        companyName: campaign.companyProfile?.companyName,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      }))
    })

  } catch (error: any) {
    console.error('Campaign list error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch campaigns',
      details: error.message 
    }, { status: 500 })
  }
}

async function fetchRelevantNews(companyProfile: any, zai: any) {
  try {
    // Construct search queries based on company profile
    const searchQueries = [
      `${companyProfile.industry} news ${new Date().getFullYear()}`,
      `${companyProfile.companyName} updates`,
      `${companyProfile.industry} trends`,
      `${companyProfile.competitors} news`
    ].filter(Boolean)

    const allNews: Array<any> = []

    for (const query of searchQueries.slice(0, 2)) { // Limit to 2 queries to save tokens
      try {
        const results = await zai.functions.invoke("web_search", {
          query: `${query} site:.gov OR site:.edu OR site:reuters.com OR site:bloomberg.com`,
          num: 5
        })

        if (Array.isArray(results)) {
          allNews.push(...results)
        }
      } catch (error) {
        console.error(`Failed to fetch news for query: ${query}`, error)
      }
    }

    // Summarize news content
    if (allNews.length > 0) {
      const newsSummary = await summarizeNews(allNews, companyProfile, zai)
      return newsSummary
    }

    return { articles: [], summary: 'No recent news found.' }

  } catch (error) {
    console.error('News fetching error:', error)
    return { articles: [], summary: 'Failed to fetch news.' }
  }
}

async function summarizeNews(newsArticles: any[], companyProfile: any, zai: any) {
  const prompt = `Summarize these news articles for a ${companyProfile.industry} company called ${companyProfile.companyName}:

News Articles:
${newsArticles.map(article => `- ${article.title}: ${article.snippet}`).join('\n')}

Company Context:
- Industry: ${companyProfile.industry}
- Focus: ${companyProfile.cta || 'Business growth'}
- Competitors: ${companyProfile.competitors || 'N/A'}

Please provide:
1. A brief summary of key industry trends
2. 2-3 most relevant news items
3. Potential talking points for business emails

Respond in JSON format:
{
  "summary": "Industry overview...",
  "keyNews": [
    {
      "title": "News title",
      "summary": "Brief summary",
      "relevance": "Why it matters to the company"
    }
  ],
  "talkingPoints": ["Point 1", "Point 2"]
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch {
    return {
      summary: 'Industry developments continue to evolve.',
      keyNews: [],
      talkingPoints: []
    }
  }
}

async function generateEmailSteps({
  companyProfile,
  newsContent,
  campaignSettings,
  zai
}: any) {
  const prompt = `Generate a 3-step email campaign for ${companyProfile.companyName}.

Company Profile:
- Name: ${companyProfile.companyName}
- Industry: ${companyProfile.industry}
- Geography: ${companyProfile.geo || 'Global'}
- CTA: ${companyProfile.cta || 'Get in touch'}
- Signature: ${companyProfile.signature || ''}
- Competitors: ${companyProfile.competitors || 'N/A'}

Recent News Content:
${JSON.stringify(newsContent, null, 2)}

Campaign Requirements:
- 3 email steps
- Personalized and value-focused
- Include industry insights
- Build toward the CTA
- Professional but conversational tone
- Each email should be 150-200 words

Generate in JSON format:
[
  {
    "subject": "Email 1 subject",
    "content": "Email 1 content with personalization tokens like {{name}} and {{company}}",
    "delayDays": 0,
    "delayHours": 0
  },
  {
    "subject": "Email 2 subject", 
    "content": "Email 2 content",
    "delayDays": 2,
    "delayHours": 0
  },
  {
    "subject": "Email 3 subject",
    "content": "Email 3 content with stronger CTA",
    "delayDays": 4,
    "delayHours": 0
  }
]`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  })

  try {
    const steps = JSON.parse(response.choices[0].message.content)
    
    // Add company signature to all emails
    return steps.map((step: any) => ({
      ...step,
      content: `${step.content}\n\n${companyProfile.signature || `Best regards,\n${companyProfile.companyName}`}`
    }))
  } catch {
    // Fallback to basic template
    return [
      {
        subject: `Industry insights for {{name}} at {{company}}`,
        content: `Hi {{name}},\n\nI hope this email finds you well. I wanted to share some recent developments in the ${companyProfile.industry} space that I thought might be relevant to {{company}}.\n\n${companyProfile.cta || 'Would love to connect and discuss further.'}\n\n${companyProfile.signature || `Best regards,\n${companyProfile.companyName}`}`,
        delayDays: 0,
        delayHours: 0
      },
      {
        subject: `Following up - ${companyProfile.industry} trends`,
        content: `Hi {{name}},\n\nFollowing up on my previous email, I wanted to share a specific insight that could be valuable for {{company}}.\n\n${companyProfile.cta || 'Happy to schedule a brief call to discuss.'}\n\n${companyProfile.signature || `Best regards,\n${companyProfile.companyName}`}`,
        delayDays: 2,
        delayHours: 0
      },
      {
        subject: `Quick question about {{company}}'s ${companyProfile.industry} strategy`,
        content: `Hi {{name}},\n\nQuick question - are you currently exploring ways to optimize your ${companyProfile.industry} approach?\n\n${companyProfile.cta || 'Would be great to connect for 15 minutes to explore possibilities.'}\n\n${companyProfile.signature || `Best regards,\n${companyProfile.companyName}`}`,
        delayDays: 4,
        delayHours: 0
      }
    ]
  }
}

async function queueRecipients(campaignId: string, recipientList: any[]) {
  // Create email events for each recipient
  const events = recipientList.map(recipient => ({
    campaignId,
    recipientEmail: recipient.email,
    eventType: 'queued',
    eventData: JSON.stringify({
      name: recipient.name,
      company: recipient.company,
      variables: recipient.variables || {}
    })
  }))

  try {
    await prisma.emailEvent.createMany({ data: events })
    return events
  } catch (error) {
    console.error('Failed to queue recipients:', error)
    return []
  }
}

// SMTP configuration for Hostinger
function createSMTPTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Calculate daily sending limit based on warmup schedule
function calculateDailyLimit(warmupDay: number, maxDaily: number): number {
  const warmupSchedule = [
    50,   // Day 1
    100,  // Day 2
    150,  // Day 3
    200,  // Day 4
    250,  // Day 5
    300,  // Day 6
    350,  // Day 7
    maxDaily // Day 8+
  ]

  if (warmupDay <= warmupSchedule.length) {
    return warmupSchedule[warmupDay - 1]
  }
  return maxDaily
}