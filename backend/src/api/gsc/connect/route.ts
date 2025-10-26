import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
  try {
    const { userId, code, redirectUri } = await request.json()

    if (!userId || !code) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri || process.env.GOOGLE_REDIRECT_URI
    )

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    
    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.json({ error: 'Failed to obtain access tokens' }, { status: 400 })
    }

    // Set credentials and get verified properties
    oauth2Client.setCredentials(tokens)
    const searchconsole = google.searchconsole('v1')
    
    // Get list of verified sites
    const sitesResponse = await searchconsole.sites.list({
      auth: oauth2Client
    })

    const verifiedSites = sitesResponse.data.siteEntry?.filter(
      site => site.siteUrl && site.permissionLevel === 'siteOwner'
    ) || []

    if (verifiedSites.length === 0) {
      return NextResponse.json({ 
        error: 'No verified Search Console properties found',
        details: 'Please verify at least one property in Google Search Console'
      }, { status: 400 })
    }

    // Store each verified property
    const storedProperties: Array<{
      id: string;
      siteUrl: string;
      propertyId: string;
      isActive: boolean;
      lastSyncAt: Date | null;
    }> = []
    for (const site of verifiedSites) {
      const property = await prisma.searchConsoleProperty.create({
        data: {
          userId,
          siteUrl: site.siteUrl!,
          propertyId: site.siteUrl!.replace(/^(https?:\/\/)?(www\.)?/, ''),
          accessToken: encryptToken(tokens.access_token),
          refreshToken: encryptToken(tokens.refresh_token),
          isActive: true,
          lastSyncAt: new Date()
        }
      })
      storedProperties.push(property)
    }

    // Trigger initial data ingestion for all properties
    await Promise.all(
      storedProperties.map(property => 
        triggerDataIngestion(property.id, oauth2Client)
      )
    )

    return NextResponse.json({
      success: true,
      properties: storedProperties.map(prop => ({
        id: prop.id,
        siteUrl: prop.siteUrl,
        propertyId: prop.propertyId,
        isActive: prop.isActive,
        lastSyncAt: prop.lastSyncAt
      })),
      message: `Successfully connected ${storedProperties.length} Search Console properties`
    })

  } catch (error: any) {
    console.error('GSC connection error:', error)
    return NextResponse.json({ 
      error: 'Failed to connect to Google Search Console',
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

    // Get OAuth URL for user to authorize
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/webmasters'
      ],
      state: userId,
      prompt: 'consent'
    })

    return NextResponse.json({
      authUrl,
      message: 'Navigate to the provided URL to authorize Google Search Console access'
    })

  } catch (error: any) {
    console.error('GSC auth URL error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate authorization URL',
      details: error.message 
    }, { status: 500 })
  }
}

async function triggerDataIngestion(propertyId: string, oauth2Client: any) {
  try {
    const searchconsole = google.searchconsole('v1')
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 35) // Last 35 days

    // Get analytics data for the property
    const analyticsResponse = await searchconsole.searchanalytics.query({
      siteUrl: (await prisma.searchConsoleProperty.findUnique({ where: { id: propertyId } }))?.siteUrl,
      auth: oauth2Client,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['page', 'query', 'date'],
        rowLimit: 5000
      }
    })

    const rows = analyticsResponse.data.rows || []

    // Store metrics in database
    for (const row of rows) {
      if (!row.keys || row.keys.length < 3) {
        console.warn('Skipping row with insufficient keys:', row)
        continue
      }
      
      const page = row.keys[0] || ''
      const query = row.keys[1] || ''
      const date = new Date(row.keys[2] || '')
      
      await prisma.gSCMetricSnapshot.create({
        data: {
          propertyId,
          page,
          query: query || null,
          date,
          impressions: row.impressions || 0,
          clicks: row.clicks || 0,
          ctr: row.ctr || 0,
          position: row.position || 0
        }
      })
    }

    // Update property last sync time
    await prisma.searchConsoleProperty.update({
      where: { id: propertyId },
      data: { lastSyncAt: new Date() }
    })

    console.log(`Ingested ${rows.length} GSC records for property ${propertyId}`)

  } catch (error) {
    console.error(`Data ingestion failed for property ${propertyId}:`, error)
  }
}

function encryptToken(token: string): string {
  // In production, use proper encryption (e.g., crypto.createCipher)
  // For now, return as-is (should implement proper encryption)
  return token
}

function decryptToken(encryptedToken: string): string {
  // In production, use proper decryption
  // For now, return as-is (should implement proper decryption)
  return encryptedToken
}