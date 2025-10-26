import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article with claims and SERP analysis
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        claims: true,
        serpAnalysis: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Step 1: Verify each claim
    const verifiedClaims = await Promise.all(
      article.claims.map(claim => verifyClaim(claim, article.serpAnalysis, zai))
    )

    // Step 2: Update claims with verification results
    await Promise.all(
      verifiedClaims.map(verifiedClaim =>
        prisma.claim.update({
          where: { id: verifiedClaim.id },
          data: {
            verified: verifiedClaim.verified,
            sourceUrl: verifiedClaim.sourceUrl,
            confidence: verifiedClaim.confidence,
            verificationNotes: verifiedClaim.verificationNotes
          }
        })
      )
    )

    // Step 3: Calculate overall verification status
    const totalClaims = verifiedClaims.length
    const verifiedClaimsCount = verifiedClaims.filter(c => c.verified).length
    const verificationRate = totalClaims > 0 ? (verifiedClaimsCount / totalClaims) * 100 : 100

    const allClaimsVerified = totalClaims === 0 || verifiedClaimsCount === totalClaims

    // Step 4: Update article verification status
    await prisma.article.update({
      where: { id: articleId },
      data: {
        claimsVerified: allClaimsVerified,
        qaPassed: allClaimsVerified && 
                  article.originalityScore !== null && article.originalityScore >= 85 && 
                  article.seoChecked
      }
    })

    // Step 5: Generate verification report
    const verificationReport = generateVerificationReport(verifiedClaims, verificationRate)

    return NextResponse.json({
      success: true,
      verificationRate,
      totalClaims,
      verifiedClaims: verifiedClaimsCount,
      allClaimsVerified,
      report: verificationReport,
      claims: verifiedClaims.map(claim => ({
        id: claim.id,
        claimText: claim.claimText,
        claimType: claim.claimType,
        verified: claim.verified,
        confidence: claim.confidence,
        sourceUrl: claim.sourceUrl,
        verificationNotes: claim.verificationNotes
      }))
    })

  } catch (error: any) {
    console.error('Claim verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to verify claims',
      details: error.message 
    }, { status: 500 })
  }
}

async function verifyClaim(claim: any, serpAnalysis: any, zai: any) {
  // If claim already has a source URL, verify it
  if (claim.sourceUrl) {
    return await verifyClaimWithSource(claim, zai)
  }

  // Otherwise, search for verification sources
  return await searchAndVerifyClaim(claim, serpAnalysis, zai)
}

async function verifyClaimWithSource(claim: any, zai: any) {
  const prompt = `Verify this claim using the provided source:

Claim: ${claim.claimText}
Source URL: ${claim.sourceUrl}

Please:
1. Check if the source actually supports this claim
2. Assess the credibility of the source
3. Determine if the claim is accurately represented
4. Assign a confidence score (1-100)

Respond in JSON format:
{
  "verified": true/false,
  "confidence": 85,
  "verificationNotes": "Source confirms the claim with specific data...",
  "sourceAssessment": "Highly credible academic source"
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  })

  try {
    const result = JSON.parse(response.choices[0].message.content)
    return {
      ...claim,
      verified: result.verified,
      confidence: result.confidence,
      verificationNotes: result.verificationNotes
    }
  } catch {
    return {
      ...claim,
      verified: false,
      confidence: 0,
      verificationNotes: 'Failed to verify claim with source'
    }
  }
}

async function searchAndVerifyClaim(claim: any, _serpAnalysis: any, zai: any) {
  // Search for claim verification
  const searchQuery = `"${claim.claimText}" fact check OR statistics OR research`
  
  try {
    const searchResults = await zai.functions.invoke("web_search", {
      query: searchQuery,
      num: 5
    })

    if (!searchResults || !Array.isArray(searchResults)) {
      return {
        ...claim,
        verified: false,
        confidence: 0,
        verificationNotes: 'No verification sources found'
      }
    }

    // Analyze search results for claim verification
    const prompt = `Analyze these search results to verify the claim:

Claim: ${claim.claimText}
Claim Type: ${claim.claimType}

Search Results:
${searchResults.map((r, i) => `${i + 1}. ${r.title} - ${r.snippet} (${r.url})`).join('\n')}

Please:
1. Determine if any sources support or contradict this claim
2. Assess the credibility of supporting sources
3. Provide the best source URL if verification is possible
4. Assign a confidence score (1-100)
5. Add verification notes

Respond in JSON format:
{
  "verified": true/false,
  "confidence": 75,
  "sourceUrl": "https://credible-source.com/data",
  "verificationNotes": "Multiple academic sources support this statistic...",
  "sourceAssessment": "Government statistics agency"
}`

    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })

    try {
      const result = JSON.parse(response.choices[0].message.content)
      return {
        ...claim,
        verified: result.verified,
        sourceUrl: result.sourceUrl,
        confidence: result.confidence,
        verificationNotes: result.verificationNotes
      }
    } catch {
      return {
        ...claim,
        verified: false,
        confidence: 0,
        verificationNotes: 'Unable to verify claim from search results'
      }
    }

  } catch (error) {
    return {
      ...claim,
      verified: false,
      confidence: 0,
      verificationNotes: 'Search failed for claim verification'
    }
  }
}

function generateVerificationReport(claims: any[], verificationRate: number) {
  const verifiedClaims = claims.filter(c => c.verified)
  const unverifiedClaims = claims.filter(c => !c.verified)
  
  const claimTypes = claims.reduce((acc, claim) => {
    acc[claim.claimType] = (acc[claim.claimType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const avgConfidence = claims.length > 0 
    ? claims.reduce((sum, claim) => sum + (claim.confidence || 0), 0) / claims.length 
    : 0

  return {
    summary: {
      totalClaims: claims.length,
      verifiedClaims: verifiedClaims.length,
      unverifiedClaims: unverifiedClaims.length,
      verificationRate: verificationRate.toFixed(1),
      averageConfidence: avgConfidence.toFixed(1)
    },
    claimTypeBreakdown: claimTypes,
    recommendations: generateRecommendations(verificationRate, unverifiedClaims.length),
    status: verificationRate >= 100 ? 'passed' : verificationRate >= 80 ? 'warning' : 'failed'
  }
}

function generateRecommendations(verificationRate: number, unverifiedCount: number) {
  const recommendations: any[] = []

  if (verificationRate >= 100) {
    recommendations.push({
      type: 'success',
      message: 'All claims have been verified. Content meets fact-checking standards.'
    })
  } else if (verificationRate >= 80) {
    recommendations.push({
      type: 'warning',
      message: `${unverifiedCount} claims need verification before publication.`
    })
  } else {
    recommendations.push({
      type: 'critical',
      message: `High number of unverified claims (${unverifiedCount}). Content not ready for publication.`
    })
  }

  if (unverifiedCount > 0) {
    recommendations.push({
      type: 'action',
      message: 'Add credible sources for unverified claims or remove unsupported statements.'
    })
  }

  return recommendations
}