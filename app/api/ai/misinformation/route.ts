import { NextRequest, NextResponse } from 'next/server'
import { MisinformationAnalysisRequest, MisinformationAnalysisResponse } from '@/types/enhanced-disaster'

// Mock NLP classification service
class MisinformationDetector {
  private suspiciousKeywords = [
    'breaking', 'urgent', 'confirmed dead', 'thousands killed', 'government cover-up',
    'fake news', 'hoax', 'conspiracy', 'they don\'t want you to know',
    'share immediately', 'before it\'s deleted', 'mainstream media won\'t report'
  ]

  private credibleSources = [
    'weather.gov', 'usgs.gov', 'cdc.gov', 'fema.gov', 'noaa.gov',
    'reuters.com', 'ap.org', 'bbc.com', 'npr.org'
  ]

  private emotionalLanguagePatterns = [
    /\b(shocking|devastating|catastrophic|apocalyptic|unprecedented)\b/gi,
    /\b(must see|won't believe|incredible|unbelievable)\b/gi,
    /\b(they|government|media) (don't want|hiding|covering up)\b/gi
  ]

  analyzeText(text: string, source?: string): MisinformationAnalysisResponse {
    let misinformationScore = 0
    let flaggedElements: string[] = []
    let credibilityScore = 0.5 // Base credibility

    // Check for suspicious keywords
    const suspiciousMatches = this.suspiciousKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (suspiciousMatches.length > 0) {
      misinformationScore += suspiciousMatches.length * 0.2
      flaggedElements.push(`Suspicious keywords: ${suspiciousMatches.join(', ')}`)
    }

    // Check for emotional language patterns
    this.emotionalLanguagePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches && matches.length > 0) {
        misinformationScore += matches.length * 0.15
        flaggedElements.push(`Emotional language detected: ${matches.join(', ')}`)
      }
    })

    // Check source credibility
    if (source) {
      const isCredibleSource = this.credibleSources.some(credibleSource => 
        source.toLowerCase().includes(credibleSource)
      )
      
      if (isCredibleSource) {
        credibilityScore = 0.9
        misinformationScore *= 0.3 // Reduce misinformation score for credible sources
      } else if (source.includes('social') || source.includes('twitter') || source.includes('facebook')) {
        credibilityScore = 0.4
        misinformationScore *= 1.2 // Increase misinformation score for social media
      }
    }

    // Check for specific disaster misinformation patterns
    const disasterMisinformationPatterns = [
      /dam (burst|collapsed|breaking)/gi,
      /nuclear (meltdown|explosion|leak)/gi,
      /tsunami (warning|alert) (cancelled|fake)/gi,
      /earthquake (cover.?up|hidden)/gi,
      /evacuation (mandatory|immediate) (fake|hoax)/gi
    ]

    disasterMisinformationPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        misinformationScore += 0.4
        flaggedElements.push(`Disaster misinformation pattern: ${matches[0]}`)
      }
    })

    // Normalize scores
    misinformationScore = Math.min(misinformationScore, 1.0)
    const confidenceScore = Math.min(0.6 + (flaggedElements.length * 0.1), 0.95)

    // Determine verification status
    let verificationStatus = 'verified'
    if (misinformationScore > 0.7) {
      verificationStatus = 'flagged'
    } else if (misinformationScore > 0.4) {
      verificationStatus = 'under_review'
    } else if (misinformationScore > 0.2) {
      verificationStatus = 'partially_verified'
    }

    return {
      is_misinformation: misinformationScore > 0.5,
      confidence_score: confidenceScore,
      flagged_elements: flaggedElements,
      credibility_score: credibilityScore,
      verification_status: verificationStatus
    }
  }
}

const detector = new MisinformationDetector()

export async function POST(request: NextRequest) {
  try {
    const body: MisinformationAnalysisRequest = await request.json()
    
    if (!body.text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    const analysis = detector.analyzeText(body.text, body.source)
    
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Misinformation analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Misinformation Detection API',
    version: '1.0.0',
    capabilities: [
      'Text analysis for misinformation patterns',
      'Source credibility assessment',
      'Emotional language detection',
      'Disaster-specific misinformation patterns'
    ],
    usage: {
      endpoint: '/api/ai/misinformation',
      method: 'POST',
      body: {
        text: 'string (required)',
        source: 'string (optional)',
        timestamp: 'string (optional)'
      }
    }
  })
}
