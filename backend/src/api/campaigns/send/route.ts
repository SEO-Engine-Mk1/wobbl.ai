import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Get campaign details
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: {
        companyProfile: true,
        emailSteps: {
          where: { isActive: true },
          orderBy: { stepNumber: 'asc' }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'active') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 })
    }

    // Calculate daily sending limit based on warmup
    const dailyLimit = calculateDailyLimit(campaign.warmupDay, campaign.dailyCap)

    // Get queued recipients for today's sending
    const queuedRecipients = await getQueuedRecipients(campaignId, dailyLimit)

    if (queuedRecipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recipients to send to today',
        sentCount: 0,
        dailyLimit
      })
    }

    // Create SMTP transporter
    const transporter = createSMTPTransporter()

    // Send emails
    const sendResults = await Promise.allSettled(
      queuedRecipients.map(recipient => 
        sendEmailToRecipient(recipient, campaign, transporter)
      )
    )

    // Process results
    const successful = sendResults.filter(result => result.status === 'fulfilled').length
    const failed = sendResults.filter(result => result.status === 'rejected').length

    // Update campaign stats
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        totalSent: { increment: successful },
        warmupDay: campaign.warmupDay < 8 ? campaign.warmupDay + 1 : campaign.warmupDay
      }
    })

    // Update warmup if we hit daily limits consistently
    if (successful >= dailyLimit * 0.9) {
      // Good sending performance, continue warmup
      console.log(`Campaign ${campaignId}: Sent ${successful}/${dailyLimit} emails successfully`)
    } else if (failed > successful * 0.1) {
      // High failure rate, pause warmup
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: 'paused' }
      })
      console.log(`Campaign ${campaignId}: High failure rate, pausing campaign`)
    }

    return NextResponse.json({
      success: true,
      sentCount: successful,
      failedCount: failed,
      dailyLimit,
      warmupDay: campaign.warmupDay,
      message: `Successfully sent ${successful} emails, ${failed} failed`
    })

  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json({ 
      error: 'Failed to send emails',
      details: error.message 
    }, { status: 500 })
  }
}

async function getQueuedRecipients(campaignId: string, limit: number) {
  // Get recipients that are ready for the next step
  const recipients = await prisma.emailEvent.findMany({
    where: {
      campaignId,
      eventType: 'queued'
    },
    include: {
      campaign: {
        include: {
          emailSteps: true
        }
      }
    },
    orderBy: { timestamp: 'asc' },
    take: limit
  })

  // Filter recipients based on timing and step logic
  const readyRecipients: Array<any> = []

  for (const recipient of recipients) {
    const nextStep = await determineNextStep(recipient)
    
    if (nextStep && shouldSendStep(recipient, nextStep)) {
      readyRecipients.push({
        ...recipient,
        nextStep
      })
    }
  }

  return readyRecipients
}

async function determineNextStep(recipient: any): Promise<any> {
  // Get all events for this recipient
  const events = await prisma.emailEvent.findMany({
    where: {
      campaignId: recipient.campaignId,
      recipientEmail: recipient.recipientEmail
    },
    include: {
      step: true
    },
    orderBy: { timestamp: 'desc' }
  })

  // Find the last sent step
  const lastSentEvent = events.find(e => e.eventType === 'sent')
  
  if (!lastSentEvent) {
    // First step
    const firstStep = await prisma.emailStep.findFirst({
      where: { 
        campaignId: recipient.campaignId,
        stepNumber: 1,
        isActive: true
      }
    })
    return firstStep
  }

  // Find next step
  const nextStepNumber = lastSentEvent.step ? lastSentEvent.step.stepNumber + 1 : 1
  const nextStep = await prisma.emailStep.findFirst({
    where: { 
      campaignId: recipient.campaignId,
      stepNumber: nextStepNumber,
      isActive: true
    }
  })

  return nextStep
}

function shouldSendStep(recipient: any, step: any): boolean {
  if (!step) return false

  // Check if enough time has passed since last email
  const lastSentEvent = recipient.events?.find((e: any) => e.eventType === 'sent')
  
  if (!lastSentEvent) {
    // First step can be sent immediately
    return true
  }

  const now = new Date()
  const lastSentTime = new Date(lastSentEvent.timestamp)
  const timeDiff = now.getTime() - lastSentTime.getTime()
  
  const requiredDelay = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000)
  
  return timeDiff >= requiredDelay
}

async function sendEmailToRecipient(recipient: any, campaign: any, transporter: any) {
  try {
    const { nextStep } = recipient
    const recipientData = recipient.eventData || {}

    // Personalize email content
    const personalizedSubject = personalizeContent(nextStep.subject, recipientData)
    const personalizedContent = personalizeContent(nextStep.content, recipientData)

    // Prepare email options
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || campaign.companyProfile?.companyName}" <${process.env.SMTP_FROM}>`,
      to: recipient.recipientEmail,
      subject: personalizedSubject,
      html: personalizedContent,
      text: stripHtml(personalizedContent),
      headers: {
        'X-Campaign-ID': campaign.id,
        'X-Step-ID': nextStep.id,
        'List-Unsubscribe': `<mailto:unsubscribe@${process.env.SMTP_FROM?.split('@')[1]}?subject=unsubscribe_${campaign.id}>`
      }
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    // Log successful send
    await prisma.emailEvent.create({
      data: {
        campaignId: campaign.id,
        stepId: nextStep.id,
        recipientEmail: recipient.recipientEmail,
        eventType: 'sent',
        eventData: JSON.stringify({
          messageId: info.messageId,
          subject: personalizedSubject,
          stepNumber: nextStep.stepNumber
        }),
        timestamp: new Date()
      }
    })

    // Update queued event to sent
    await prisma.emailEvent.update({
      where: { id: recipient.id },
      data: {
        eventType: 'sent',
        eventData: {
          ...recipient.eventData,
          sentAt: new Date(),
          messageId: info.messageId
        }
      }
    })

    console.log(`Email sent to ${recipient.recipientEmail}: ${personalizedSubject}`)
    return { success: true, messageId: info.messageId }

  } catch (error: any) {
    console.error(`Failed to send email to ${recipient.recipientEmail}:`, error)

    // Log failed send
    await prisma.emailEvent.create({
      data: {
        campaignId: campaign.id,
        stepId: recipient.nextStep?.id,
        recipientEmail: recipient.recipientEmail,
        eventType: 'bounced',
        eventData: JSON.stringify({
          error: error.message,
          stepNumber: recipient.nextStep?.stepNumber
        }),
        timestamp: new Date()
      }
    })

    throw error
  }
}

function personalizeContent(content: string, variables: any): string {
  let personalized = content

  // Replace common personalization tokens
  const replacements = {
    '{{name}}': variables.name || 'there',
    '{{company}}': variables.company || 'your company',
    '{{industry}}': variables.industry || '',
    '{{location}}': variables.location || '',
    '{{custom1}}': variables.custom1 || '',
    '{{custom2}}': variables.custom2 || ''
  }

  for (const [token, value] of Object.entries(replacements)) {
    personalized = personalized.replace(new RegExp(token, 'g'), value)
  }

  return personalized
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function createSMTPTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1 second between emails
    rateLimit: 3 // Max 3 emails per second
  })
}

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

// Webhook handler for email events (opens, clicks, etc.)
export async function PUT(request: NextRequest) {
  try {
    const { campaignId, recipientEmail, eventType, eventData } = await request.json()

    if (!campaignId || !recipientEmail || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Log the event
    await prisma.emailEvent.create({
      data: {
        campaignId,
        recipientEmail,
        eventType,
        eventData,
        timestamp: new Date()
      }
    })

    // Update campaign stats
    const updateData: any = {}
    switch (eventType) {
      case 'opened':
        updateData.totalOpened = { increment: 1 }
        break
      case 'clicked':
        updateData.totalClicked = { increment: 1 }
        break
      case 'replied':
        updateData.totalReplied = { increment: 1 }
        break
      case 'unsubscribed':
        updateData.totalUnsubscribed = { increment: 1 }
        break
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: updateData
      })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Email event logging error:', error)
    return NextResponse.json({ 
      error: 'Failed to log email event',
      details: error.message 
    }, { status: 500 })
  }
}