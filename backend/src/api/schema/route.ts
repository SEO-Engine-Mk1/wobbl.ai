import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { articleId, schemaTypes } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article details
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        authorProfile: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Generate enhanced schema
    const enhancedSchema = await generateEnhancedSchema(article, schemaTypes || [], zai)

    // Update article with new schema
    await prisma.article.update({
      where: { id: articleId },
      data: {
        jsonLd: enhancedSchema
      }
    })

    return NextResponse.json({
      success: true,
      schema: enhancedSchema,
      message: 'Schema enrichment completed successfully'
    })

  } catch (error: any) {
    console.error('Schema enrichment error:', error)
    return NextResponse.json({ 
      error: 'Failed to enrich schema',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    const validateOnly = searchParams.get('validate') === 'true'

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article with current schema
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        authorProfile: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (validateOnly && article.jsonLd) {
      // Validate existing schema
      const validation = await validateSchema(article.jsonLd)
      return NextResponse.json({
        success: true,
        validation,
        currentSchema: article.jsonLd
      })
    }

    // Analyze content for schema opportunities
    const zai = await ZAI.create()
    const analysis = await analyzeContentForSchema(article, zai)

    return NextResponse.json({
      success: true,
      analysis,
      currentSchema: article.jsonLd
    })

  } catch (error: any) {
    console.error('Schema analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze schema',
      details: error.message 
    }, { status: 500 })
  }
}

async function generateEnhancedSchema(article: any, schemaTypes: string[], zai: any) {
  const baseSchema = article.jsonLd || {}
  const enhancedSchema = { ...baseSchema }

  // Always ensure Article schema exists
  if (!enhancedSchema['@type'] || !Array.isArray(enhancedSchema['@type'])) {
    enhancedSchema['@type'] = ['Article']
  } else if (!enhancedSchema['@type'].includes('Article')) {
    enhancedSchema['@type'].push('Article')
  }

  // Generate HowTo schema if requested or if content suggests it
  if (schemaTypes.includes('HowTo') || shouldIncludeHowToSchema(article)) {
    const howToSchema = await generateHowToSchema(article, zai)
    if (howToSchema) {
      enhancedSchema.howTo = howToSchema
    }
  }

  // Generate VideoObject schema if content suggests video
  if (schemaTypes.includes('VideoObject') || shouldIncludeVideoSchema(article)) {
    const videoSchema = await generateVideoObjectSchema(article, zai)
    if (videoSchema) {
      enhancedSchema.video = videoSchema
    }
  }

  // Generate Person schema for author
  if (schemaTypes.includes('Person') || article.authorProfile) {
    const personSchema = await generatePersonSchema(article, zai)
    if (personSchema) {
      enhancedSchema.author = personSchema
    }
  }

  // Add FAQ schema if FAQ section exists
  if (article.faqSection && Array.isArray(article.faqSection)) {
    enhancedSchema.faqPage = {
      '@type': 'FAQPage',
      mainEntity: article.faqSection.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  }

  // Add breadcrumb schema if table of contents exists
  if (article.tableOfContents && Array.isArray(article.tableOfContents)) {
    enhancedSchema.breadcrumbList = {
      '@type': 'BreadcrumbList',
      itemListElement: article.tableOfContents.map((toc, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: toc.title,
        item: `${article.wordpressUrl || '#'}${toc.anchor}`
      }))
    }
  }

  return enhancedSchema
}

async function generateHowToSchema(article: any, zai: any) {
  const prompt = `Analyze this article for step-by-step instructions or processes:

Title: ${article.title}
Content: ${article.content.substring(0, 2000)}...

If this article contains instructions, steps, or a process, extract:
1. A clear "how to" title
2. Step-by-step instructions (3-10 steps)
3. Required tools/materials if mentioned
4. Estimated time if mentioned

If no clear process is found, respond with "NO_HOW_TO"

Otherwise, respond in JSON format:
{
  "name": "How to [accomplish task]",
  "description": "Brief description of what the user will learn",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Tool or material name"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Step title",
      "text": "Detailed instruction",
      "image": "https://example.com/image.jpg"
    }
  ]
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    const result = response.choices[0].message.content.trim()
    if (result === 'NO_HOW_TO') {
      return null
    }
    return JSON.parse(result)
  } catch {
    return null
  }
}

async function generateVideoObjectSchema(article: any, zai: any) {
  const prompt = `Analyze this article for video content references:

Title: ${article.title}
Content: ${article.content.substring(0, 1500)}...

Look for:
1. Mentions of videos, tutorials, or demonstrations
2. Video embeds or links
3. "Watch this video" type instructions
4. Visual learning references

If video content is referenced, extract details. If not, respond with "NO_VIDEO"

Otherwise, respond in JSON format:
{
  "name": "Video title",
  "description": "Video description",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "uploadDate": "2024-01-15",
  "duration": "PT5M30S",
  "contentUrl": "https://example.com/video.mp4",
  "embedUrl": "https://example.com/embed/video"
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  })

  try {
    const result = response.choices[0].message.content.trim()
    if (result === 'NO_VIDEO') {
      return null
    }
    return JSON.parse(result)
  } catch {
    return null
  }
}

async function generatePersonSchema(article: any, zai: any) {
  const authorData = article.authorProfile || {
    name: article.authorName,
    bio: article.authorBio,
    credentials: article.authorExperience
  }

  const prompt = `Create a Person schema for this author:

Author Name: ${authorData.name}
Bio: ${authorData.bio || 'No bio available'}
Credentials: ${authorData.credentials || 'No credentials specified'}
Experience: ${article.authorExperience || 'No experience specified'}

Generate a comprehensive Person schema in JSON format:
{
  "@type": "Person",
  "name": "Author Name",
  "jobTitle": "Professional Title",
  "description": "Professional description",
  "url": "https://author-website.com",
  "sameAs": [
    "https://linkedin.com/in/author",
    "https://twitter.com/author"
  ],
  "knowsAbout": ["topic1", "topic2", "topic3"],
  "award": ["Award name"],
  "alumniOf": {
    "@type": "Organization",
    "name": "University Name"
  }
}

If information is not available, use reasonable defaults or omit the field.`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch {
    // Fallback basic schema
    return {
      '@type': 'Person',
      name: authorData.name,
      description: authorData.bio || `Professional writer and expert in their field`
    }
  }
}

function shouldIncludeHowToSchema(article: any) {
  const howToKeywords = [
    'how to', 'step by step', 'tutorial', 'guide', 'instructions',
    'process', 'method', 'way to', 'learn to', 'master'
  ]

  const content = (article.title + ' ' + article.content).toLowerCase()
  return howToKeywords.some(keyword => content.includes(keyword))
}

function shouldIncludeVideoSchema(article: any) {
  const videoKeywords = [
    'video', 'watch', 'tutorial video', 'demonstration', 'visual',
    'embed', 'youtube', 'vimeo', 'watch this'
  ]

  const content = (article.title + ' ' + article.content).toLowerCase()
  return videoKeywords.some(keyword => content.includes(keyword))
}

async function analyzeContentForSchema(article: any, zai: any) {
  const prompt = `Analyze this article for schema markup opportunities:

Title: ${article.title}
Content: ${article.content.substring(0, 1000)}...

Identify which schema types would be most beneficial:
1. Article (always included)
2. HowTo - for instructional content
3. VideoObject - for video content
4. Person - for author information
5. FAQPage - for FAQ sections
6. BreadcrumbList - for navigation structure
7. Review - for product/service reviews
8. Event - for event-related content

Respond in JSON format:
{
  "recommendedSchemas": ["HowTo", "Person", "FAQPage"],
  "confidence": {
    "HowTo": 0.85,
    "Person": 0.90,
    "FAQPage": 0.75
  },
  "reasoning": {
    "HowTo": "Article contains step-by-step instructions",
    "Person": "Strong author expertise demonstrated",
    "FAQPage": "FAQ section already present"
  },
  "missingOpportunities": [
    "Could add Review schema for product mentions",
    "Consider Event schema if discussing upcoming events"
  ]
}`

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch {
    return {
      recommendedSchemas: ['Article'],
      confidence: { Article: 1.0 },
      reasoning: { Article: 'Base article schema' },
      missingOpportunities: []
    }
  }
}

async function validateSchema(schema: any) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  }

  try {
    // Check for required fields in Article schema
    if (schema['@type'] && schema['@type'].includes('Article')) {
      if (!schema.headline) {
        validation.errors.push('Article schema missing required "headline" field' as never)
        validation.isValid = false
      }
      if (!schema.author) {
        validation.warnings.push('Article schema missing "author" field' as never)
      }
      if (!schema.datePublished) {
        validation.warnings.push('Article schema missing "datePublished" field' as never)
      }
    }

    // Check FAQ schema structure
    if (schema.faqPage && schema.faqPage.mainEntity) {
      schema.faqPage.mainEntity.forEach((faq: any, index: number) => {
        if (!faq.name || !faq.acceptedAnswer) {
          validation.errors.push(`FAQ item ${index + 1} missing required fields` as never)
          validation.isValid = false
        }
      })
    }

    // Check HowTo schema structure
    if (schema.howTo && schema.howTo.step) {
      if (schema.howTo.step.length < 2) {
        validation.warnings.push('HowTo schema should have at least 2 steps' as never)
      }
    }

    // General suggestions
    if (!schema.image) {
      validation.suggestions.push('Add image property for better rich snippets' as never)
    }
    if (!schema.publisher) {
      validation.suggestions.push('Add publisher property for authority signals' as never)
    }

  } catch (error) {
    validation.isValid = false
    validation.errors.push('Schema validation failed: ' + String(error) as never)
  }

  return validation
}