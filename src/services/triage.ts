import { TriageRequest, TriageResponse } from '@/types';
import { config } from '@/lib/config';

export class TriageService {
  private criticalKeywords = [
    'dying', 'death', 'dead', 'unconscious', 'not breathing',
    'severe bleeding', 'heart attack', 'stroke', 'choking',
    'trapped', 'building collapse', 'fire spreading', 'explosion'
  ];

  private highUrgencyKeywords = [
    'injured', 'bleeding', 'broken bone', 'can\'t move',
    'severe pain', 'difficulty breathing', 'chest pain',
    'drowning', 'stuck', 'help needed urgently', 'emergency'
  ];

  private mediumUrgencyKeywords = [
    'hurt', 'pain', 'need help', 'assistance required',
    'minor injury', 'lost', 'stranded', 'property damage',
    'power outage', 'water shortage'
  ];

  private medicalKeywords = [
    'medical', 'hospital', 'doctor', 'ambulance', 'medicine',
    'treatment', 'surgery', 'medication', 'health', 'illness'
  ];

  private fireKeywords = [
    'fire', 'smoke', 'burning', 'flames', 'heat', 'evacuation'
  ];

  private floodKeywords = [
    'flood', 'water', 'drowning', 'river', 'rain', 'storm', 'tsunami'
  ];

  private earthquakeKeywords = [
    'earthquake', 'shaking', 'tremor', 'building damage', 'aftershock'
  ];

  async classify(text: string, location?: string): Promise<TriageResponse> {
    try {
      // If ML models are enabled, use external API
      if (config.features.enableMLModels && config.apis.huggingFaceToken) {
        return await this.classifyWithML(text, location);
      }
      
      // Fallback to rule-based classification
      return this.classifyWithRules(text, location);
    } catch (error) {
      console.error('Triage classification failed:', error);
      // Fallback to rule-based classification
      return this.classifyWithRules(text, location);
    }
  }

  private async classifyWithML(text: string, location?: string): Promise<TriageResponse> {
    try {
      // For now, use rule-based as ML model integration would require specific training
      // In production, this would call a fine-tuned model for emergency classification
      return this.classifyWithRules(text, location);
    } catch (error) {
      console.error('ML classification failed, falling back to rules:', error);
      return this.classifyWithRules(text, location);
    }
  }

  private classifyWithRules(text: string, location?: string): Promise<TriageResponse> {
    const textLower = text.toLowerCase();
    
    // Calculate urgency scores
    const criticalScore = this.criticalKeywords.reduce((score, keyword) => {
      return score + (textLower.includes(keyword) ? 1 : 0);
    }, 0);
    
    const highScore = this.highUrgencyKeywords.reduce((score, keyword) => {
      return score + (textLower.includes(keyword) ? 1 : 0);
    }, 0);
    
    const mediumScore = this.mediumUrgencyKeywords.reduce((score, keyword) => {
      return score + (textLower.includes(keyword) ? 1 : 0);
    }, 0);
    
    // Determine urgency level and score
    let urgencyLevel: string;
    let urgencyScore: number;
    let responseTime: string;
    let resourceRequired: string;
    
    if (criticalScore > 0) {
      urgencyLevel = 'CRITICAL';
      urgencyScore = 0.9 + (criticalScore * 0.02);
      responseTime = '2-5 minutes';
      resourceRequired = 'Emergency Response Team + Medical';
    } else if (highScore > 0) {
      urgencyLevel = 'HIGH';
      urgencyScore = 0.7 + (highScore * 0.05);
      responseTime = '5-15 minutes';
      resourceRequired = 'Emergency Response Team';
    } else if (mediumScore > 0) {
      urgencyLevel = 'MEDIUM';
      urgencyScore = 0.5 + (mediumScore * 0.05);
      responseTime = '15-30 minutes';
      resourceRequired = 'Standard Support Team';
    } else {
      urgencyLevel = 'LOW';
      urgencyScore = 0.3;
      responseTime = '30-60 minutes';
      resourceRequired = 'Community Support';
    }
    
    // Adjust based on disaster type
    const disasterType = this.detectDisasterType(textLower);
    if (disasterType) {
      switch (disasterType) {
        case 'fire':
          urgencyScore = Math.min(urgencyScore + 0.2, 1.0);
          resourceRequired += ' + Fire Department';
          break;
        case 'flood':
          urgencyScore = Math.min(urgencyScore + 0.15, 1.0);
          resourceRequired += ' + Water Rescue';
          break;
        case 'earthquake':
          urgencyScore = Math.min(urgencyScore + 0.25, 1.0);
          resourceRequired += ' + Search & Rescue';
          break;
        case 'medical':
          urgencyScore = Math.min(urgencyScore + 0.1, 1.0);
          resourceRequired += ' + Medical Team';
          break;
      }
    }
    
    // Location-based adjustments
    if (location) {
      // In a real system, this would check against known high-risk areas
      const highRiskAreas = ['downtown', 'industrial', 'coastal', 'mountain'];
      const isHighRisk = highRiskAreas.some(area => 
        location.toLowerCase().includes(area)
      );
      
      if (isHighRisk) {
        urgencyScore = Math.min(urgencyScore + 0.1, 1.0);
        responseTime = this.adjustResponseTime(responseTime, -0.2);
      }
    }
    
    // Ensure urgency score is capped at 1.0
    urgencyScore = Math.min(urgencyScore, 1.0);
    
    // Re-evaluate urgency level based on final score
    if (urgencyScore >= 0.8) {
      urgencyLevel = 'CRITICAL';
    } else if (urgencyScore >= 0.6) {
      urgencyLevel = 'HIGH';
    } else if (urgencyScore >= 0.4) {
      urgencyLevel = 'MEDIUM';
    } else {
      urgencyLevel = 'LOW';
    }
    
    return Promise.resolve({
      urgency_score: urgencyScore,
      triage_level: urgencyLevel,
      resource_required: resourceRequired,
      estimated_response_time: responseTime
    });
  }

  private detectDisasterType(textLower: string): string | null {
    if (this.fireKeywords.some(keyword => textLower.includes(keyword))) {
      return 'fire';
    }
    if (this.floodKeywords.some(keyword => textLower.includes(keyword))) {
      return 'flood';
    }
    if (this.earthquakeKeywords.some(keyword => textLower.includes(keyword))) {
      return 'earthquake';
    }
    if (this.medicalKeywords.some(keyword => textLower.includes(keyword))) {
      return 'medical';
    }
    return null;
  }

  private adjustResponseTime(responseTime: string, factor: number): string {
    // Simple response time adjustment logic
    const timeMap: Record<string, string> = {
      '2-5 minutes': factor < 0 ? '1-3 minutes' : '3-7 minutes',
      '5-15 minutes': factor < 0 ? '3-10 minutes' : '7-20 minutes',
      '15-30 minutes': factor < 0 ? '10-25 minutes' : '20-40 minutes',
      '30-60 minutes': factor < 0 ? '20-45 minutes' : '45-90 minutes',
    };
    
    return timeMap[responseTime] || responseTime;
  }

  async batchClassify(requests: TriageRequest[]): Promise<TriageResponse[]> {
    const results = await Promise.all(
      requests.map(request => this.classify(request.text, request.location))
    );
    
    return results;
  }
}

export const triageService = new TriageService();
