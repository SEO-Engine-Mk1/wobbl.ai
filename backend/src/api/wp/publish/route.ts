import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const { articleId, wpConnectionId } = await request.json()

    if (!articleId || !wpConnectionId) {
      return NextResponse.json({ error: 'Article ID and WordPress connection ID are required' }, { status: 400 })
    }

    // Get article and WordPress connection
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: true,
        claims: true
      }
    })

    const wpConnection = await prisma.wPConnection.findUnique({
      where: { id: wpConnectionId }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (!wpConnection) {
      return NextResponse.json({ error: 'WordPress connection not found' }, { status: 404 })
    }

    if (!wpConnection.isActive) {
      return NextResponse.json({ error: 'WordPress connection is not active' }, { status: 400 })
    }

    // Verify article passes all QA gates
    if (!article.qaPassed) {
      return NextResponse.json({ 
        error: 'Article has not passed all QA gates',
        details: {
          originalityScore: article.originalityScore,
          claimsVerified: article.claimsVerified,
          seoChecked: article.seoChecked,
          serpCoverageChecked: article.serpCoverageChecked
        }
      }, { status: 400 })
    }

    // Prepare WordPress post data
    const postData = prepareWordPressPost(article)

    // Publish to WordPress
    const wpResponse = await publishToWordPress(postData, wpConnection)

    if (!wpResponse.success) {
      return NextResponse.json({ 
        error: 'Failed to publish to WordPress',
        details: wpResponse.error 
      }, { status: 500 })
    }

    // Update article with WordPress details
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        wordpressUrl: wpResponse.postUrl
      }
    })

    // Create social media posts
    await createSocialPosts(updatedArticle)

    return NextResponse.json({
      success: true,
      article: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        status: updatedArticle.status,
        publishedAt: updatedArticle.publishedAt,
        wordpressUrl: updatedArticle.wordpressUrl
      },
      wordpressPost: {
        id: wpResponse.postId,
        url: wpResponse.postUrl,
        status: wpResponse.postStatus
      }
    })

  } catch (error: any) {
    console.error('WordPress publishing error:', error)
    return NextResponse.json({ 
      error: 'Failed to publish to WordPress',
      details: error.message 
    }, { status: 500 })
  }
}

function prepareWordPressPost(article: any) {
  // Convert HTML content to WordPress format
  const content = enhanceContentForWordPress(article)
  
  // Extract categories and tags from content
  const categories = extractCategories(article)
  const tags = extractTags(article)

  // Prepare meta data
  const metaData = {
    yoast_title: article.title,
    yoast_meta: {
      description: article.metaDescription || article.excerpt,
      canonical: article.canonicalUrl,
      'article:author': article.authorName,
      'article:published_time': article.publishedAt || new Date().toISOString(),
    }
  }

  return {
    title: article.title,
    content: content,
    excerpt: article.excerpt,
    status: 'publish',
    categories: categories,
    tags: tags,
    meta: metaData,
    featured_media: null, // Would handle featured image upload here
    author: article.authorName
  }
}

function enhanceContentForWordPress(article: any) {
  let content = article.content

  // Add JSON-LD schema to content
  if (article.jsonLd) {
    const schemaScript = `<script type="application/ld+json">${JSON.stringify(article.jsonLd)}</script>`
    content = schemaScript + content
  }

  // Add table of contents if available
  if (article.tableOfContents && Array.isArray(article.tableOfContents)) {
    const tocHtml = generateTableOfContentsHTML(article.tableOfContents)
    content = tocHtml + content
  }

  // Add FAQ section if available
  if (article.faqSection && Array.isArray(article.faqSection)) {
    const faqHtml = generateFAQHTML(article.faqSection)
    content = content + faqHtml
  }

  // Add author bio section
  if (article.authorBio) {
    const authorHtml = generateAuthorBioHTML(article)
    content = content + authorHtml
  }

  // WordPress specific enhancements
  content = content
    .replace(/<h1/g, '<h1') // Ensure proper H1 tags
    .replace(/class="/g, 'class="') // Clean up class attributes
    .replace(/\n\n/g, '</p><p>') // Convert double line breaks to paragraphs
    .replace(/^/, '<p>') // Add opening p tag
    .replace(/$/, '</p>') // Add closing p tag

  return content
}

function generateTableOfContentsHTML(toc: any[]) {
  const tocItems = toc.map(item => 
    `<li><a href="#${item.anchor}">${item.title}</a></li>`
  ).join('')

  return `
    <div class="post-table-of-contents">
      <h2>Table of Contents</h2>
      <ul>${tocItems}</ul>
    </div>
  `
}

function generateFAQHTML(faqs: any[]) {
  const faqItems = faqs.map(faq => 
    `<div class="faq-item">
      <h3>${faq.question}</h3>
      <p>${faq.answer}</p>
    </div>`
  ).join('')

  return `
    <div class="post-faq-section">
      <h2>Frequently Asked Questions</h2>
      ${faqItems}
    </div>
  `
}

function generateAuthorBioHTML(article: any) {
  return `
    <div class="author-bio-section">
      <h3>About the Author</h3>
      <div class="author-info">
        <p><strong>${article.authorName}</strong></p>
        <p>${article.authorBio}</p>
        ${article.authorExperience ? `<p><em>Experience: ${article.authorExperience}</em></p>` : ''}
        ${article.experienceAnchor ? `<p><strong>${article.experienceAnchor}</strong></p>` : ''}
      </div>
    </div>
  `
}

function extractCategories(article: any) {
  // Extract categories from content and focus keyword
  const categories = ['SEO', 'Content Marketing'] // Default categories
  
  if (article.focusKeyword) {
    categories.push(article.focusKeyword)
  }

  // Would use NLP to extract more relevant categories from content
  return categories.slice(0, 3) // WordPress typically limits to 3 main categories
}

function extractTags(article: any) {
  // Extract tags from content, claims, and entities
  const tags = new Set<string>()
  
  // Add focus keyword as tag
  if (article.focusKeyword) {
    tags.add(article.focusKeyword)
  }

  // Extract tags from claims
  article.claims?.forEach((claim: any) => {
    if (claim.claimType === 'entity') {
      tags.add(claim.claimText)
    }
  })

  // Would use NLP to extract more tags from content
  return Array.from(tags).slice(0, 15) // WordPress typically limits to 15 tags
}

async function publishToWordPress(postData: any, wpConnection: any) {
  try {
    const wpUrl = `${wpConnection.siteUrl}/wp-json/wp/v2/posts`
    
    const auth = Buffer.from(`${wpConnection.username}:${wpConnection.applicationPassword}`).toString('base64')

    const response = await axios.post(wpUrl, postData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    })

    const post = response.data
    
    return {
      success: true,
      postId: post.id,
      postUrl: post.link,
      postStatus: post.status
    }

  } catch (error: any) {
    console.error('WordPress API error:', error)
    
    if (error.response) {
      return {
        success: false,
        error: `WordPress API Error: ${error.response.data.message || error.response.statusText}`
      }
    } else if (error.request) {
      return {
        success: false,
        error: 'WordPress server not responding'
      }
    } else {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

async function createSocialPosts(article: any) {
  try {
    // Generate social media content for each platform
    const platforms = ['linkedin', 'twitter', 'facebook']
    
    for (const platform of platforms) {
      const socialContent = generateSocialContent(article, platform)
      
      await prisma.socialPost.create({
        data: {
          articleId: article.id,
          platform: platform,
          content: socialContent.content,
          status: 'draft',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Schedule for tomorrow
        }
      })
    }

  } catch (error) {
    console.error('Error creating social posts:', error)
    // Don't fail the main publish process for social post creation errors
  }
}

function generateSocialContent(article: any, platform: string) {
  const baseUrl = 'https://yourdomain.com' // Would get from site config
  
  switch (platform) {
    case 'linkedin':
      return {
        content: `📝 New Article Published: ${article.title}

${article.excerpt}

🔍 Key insights:
• E-E-A-T compliant content
• Original research and analysis
• Expert author: ${article.authorName}

Read more: ${article.wordpressUrl || `${baseUrl}/blog/${article.slug}`}

#SEO #ContentMarketing #DigitalMarketing`
      }

    case 'twitter':
      return {
        content: `🚀 Just published: ${article.title}

${article.excerpt?.substring(0, 100)}...

Read the full article 👇
${article.wordpressUrl || `${baseUrl}/blog/${article.slug}`}

#SEO #ContentMarketing @${article.authorName.replace(/\s+/g, '')}`
      }

    case 'facebook':
      return {
        content: `📚 Excited to share our latest article!

${article.title}

${article.excerpt}

Written by ${article.authorName}${article.authorBio ? ` - ${article.authorBio}` : ''}

🔗 Read now: ${article.wordpressUrl || `${baseUrl}/blog/${article.slug}`}

#SEO #ContentStrategy #DigitalMarketing`
      }

    default:
      return {
        content: `New article: ${article.title} - ${article.excerpt}`
      }
  }
}