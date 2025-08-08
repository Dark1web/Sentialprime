import { MisinformationRequest, MisinformationResponse } from '@/types';
import { config } from '@/lib/config';

export class MisinformationService {
  private suspiciousPatterns = [
    'BREAKING', 'URGENT', 'SHARE IMMEDIATELY', 'FAKE NEWS',
    '100% TRUE', 'GOVERNMENT HIDING', 'MEDIA WON\'T SHOW',
    'THEY DON\'T WANT YOU TO KNOW', 'SHOCKING TRUTH',
    'MUST WATCH', 'VIRAL', 'EXPOSED'
  ];

  private crediblePatterns = [
    'witnessed', 'saw', 'happening now', 'at location',
    'need help', 'emergency', 'please assist', 'confirmed by',
    'official statement', 'authorities say', 'according to'
  ];

  private panicKeywords = [
    'panic', 'chaos', 'disaster', 'catastrophe', 'apocalypse',
    'end of world', 'mass death', 'everyone will die', 'run for your life',
    'total destruction', 'no escape', 'doomed', 'hopeless'
  ];

  async analyze(text: string): Promise<MisinformationResponse> {
    try {
      // If ML models are enabled, use external API
      if (config.features.enableMLModels && config.apis.huggingFaceToken) {
        return await this.analyzeWithML(text);
      }
      
      // Fallback to rule-based analysis
      return this.analyzeWithRules(text);
    } catch (error) {
      console.error('Misinformation analysis failed:', error);
      // Fallback to rule-based analysis
      return this.analyzeWithRules(text);
    }
  }

  private async analyzeWithML(text: string): Promise<MisinformationResponse> {
    try {
      // Call Hugging Face API for sentiment analysis and fake news detection
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${config.models.huggingFaceModels.misinformationDetection}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apis.huggingFaceToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!response.ok) {
        throw new Error('Hugging Face API request failed');
      }

      const result = await response.json();
      
      // Process ML model results
      const confidence = result[0]?.score || 0.5;
      const label = result[0]?.label || 'NEGATIVE';
      
      const isFake = label === 'NEGATIVE' && confidence > config.models.confidenceThreshold;
      const panicScore = this.calculatePanicScore(text);
      
      return {
        is_fake: isFake,
        confidence: confidence,
        panic_score: panicScore,
        reasoning: `ML model analysis: ${label} with ${(confidence * 100).toFixed(1)}% confidence`
      };
    } catch (error) {
      console.error('ML analysis failed, falling back to rules:', error);
      return this.analyzeWithRules(text);
    }
  }

  private analyzeWithRules(text: string): Promise<MisinformationResponse> {
    const textUpper = text.toUpperCase();
    
    // Calculate suspicion score
    const suspicionScore = this.suspiciousPatterns.reduce((score, pattern) => {
      return score + (textUpper.includes(pattern) ? 1 : 0);
    }, 0);
    
    // Calculate credible score
    const credibleScore = this.crediblePatterns.reduce((score, pattern) => {
      return score + (textUpper.includes(pattern.toUpperCase()) ? 1 : 0);
    }, 0);
    
    // Calculate panic score
    const panicScore = this.calculatePanicScore(text);
    
    // Basic length and coherence check
    let baseCredibility = 0.7; // Default credibility
    
    if (text.length < 10) {
      baseCredibility = 0.3; // Too short
    } else if (text.length > 1000) {
      baseCredibility = 0.4; // Potentially spam
    }
    
    // Adjust based on patterns
    let finalCredibility = baseCredibility;
    finalCredibility -= (suspicionScore * 0.15);
    finalCredibility += (credibleScore * 0.1);
    finalCredibility = Math.max(0.0, Math.min(1.0, finalCredibility));
    
    const isFake = finalCredibility < 0.5 || suspicionScore > 2;
    const confidence = Math.abs(finalCredibility - 0.5) * 2; // Convert to 0-1 confidence
    
    const reasoning = `Rule-based analysis: ${suspicionScore} suspicious patterns, ${credibleScore} credible indicators, panic score: ${panicScore.toFixed(2)}`;
    
    return Promise.resolve({
      is_fake: isFake,
      confidence: Math.max(0.6, confidence), // Minimum confidence for rule-based
      panic_score: panicScore,
      reasoning
    });
  }

  private calculatePanicScore(text: string): number {
    const textLower = text.toLowerCase();
    
    let panicScore = 0;
    
    // Check for panic keywords
    const panicMatches = this.panicKeywords.reduce((count, keyword) => {
      return count + (textLower.includes(keyword) ? 1 : 0);
    }, 0);
    
    panicScore += panicMatches * 0.2;
    
    // Check for excessive capitalization
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.3) {
      panicScore += 0.3;
    }
    
    // Check for excessive exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    panicScore += Math.min(exclamationCount * 0.1, 0.4);
    
    // Check for urgency words
    const urgencyWords = ['urgent', 'immediately', 'now', 'quickly', 'hurry', 'fast'];
    const urgencyMatches = urgencyWords.reduce((count, word) => {
      return count + (textLower.includes(word) ? 1 : 0);
    }, 0);
    
    panicScore += urgencyMatches * 0.1;
    
    return Math.min(panicScore, 1.0); // Cap at 1.0
  }

  async batchAnalyze(texts: string[]): Promise<MisinformationResponse[]> {
    const results = await Promise.all(
      texts.map(text => this.analyze(text))
    );
    
    return results;
  }
}

export const misinformationService = new MisinformationService();
