import asyncio
import re
from typing import Dict, List
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.huggingface_service import HuggingFaceService
from services.news_service import NewsService

class MisinformationDetector:
    """
    AI-powered misinformation detector with emotion analysis and panic scoring.
    Uses BERT/RoBERTa for fake news detection and emotion classification.
    """
    
    def __init__(self):
        print("Initializing misinformation detector with HuggingFace API...")
        
        # Initialize HuggingFace service for real ML inference
        self.hf_service = HuggingFaceService()
        
        # Initialize news service for real-time data
        self.news_service = NewsService()
        
        # Define panic-inducing keywords and patterns
        self.panic_keywords = {
            "high": ["evacuate", "emergency", "breaking", "urgent", "immediately", "danger", "alert", "warning"],
            "medium": ["flooding", "fire", "earthquake", "storm", "disaster", "crisis", "help"],
            "disaster_terms": ["dam burst", "tsunami", "cyclone", "landslide", "building collapse"]
        }
        
        # Emotion to panic score mapping
        self.emotion_panic_weights = {
            "fear": 0.9,
            "anger": 0.7,
            "surprise": 0.6,
            "sadness": 0.4,
            "disgust": 0.3,
            "joy": -0.2,
            "neutral": 0.0
        }
        
        print("Misinformation detector initialized with real API integration!")
    
    async def get_recent_disaster_news(self, limit: int = 20) -> List[Dict]:
        """Get recent disaster-related news for context analysis"""
        try:
            return await self.news_service.fetch_disaster_news(limit)
        except Exception as e:
            print(f"Error fetching recent news: {e}")
            return []
    
    async def analyze_post(self, text: str) -> Dict:
        """
        Analyze a social media post for misinformation and panic scoring.
        
        Args:
            text: The post text to analyze
            
        Returns:
            Dictionary with analysis results
        """
        # Direct async call since _analyze_post_sync is now async
        return await self._analyze_post_sync(text)
    
    async def _analyze_post_sync(self, text: str) -> Dict:
        """Analysis function using real HuggingFace API."""
        # Clean and preprocess text
        cleaned_text = self._preprocess_text(text)
        
        # Use HuggingFace service for real ML analysis
        hf_analysis = await self.hf_service.analyze_misinformation(cleaned_text)
        
        # Extract results from HuggingFace analysis
        is_fake = hf_analysis.get("is_fake", False)
        fake_confidence = hf_analysis.get("confidence", 0.5)
        emotions = hf_analysis.get("emotions", {})
        
        # Calculate panic score using emotions
        panic_score = self._calculate_panic_score(cleaned_text, emotions)
        
        # Identify flagged keywords
        flagged_keywords = self._find_flagged_keywords(cleaned_text)
        
        # Determine risk level
        risk_level = self._determine_risk_level(is_fake, panic_score, fake_confidence)
        
        # Generate explanation
        explanation = self._generate_explanation(is_fake, panic_score, emotions, flagged_keywords)
        
        return {
            "is_fake": is_fake,
            "confidence": fake_confidence,
            "panic_score": panic_score,
            "emotions": emotions,
            "explanation": explanation,
            "risk_level": risk_level,
            "flagged_keywords": flagged_keywords,
            "timestamp": datetime.utcnow().isoformat(),
            "api_method": hf_analysis.get("analysis_method", "huggingface_api")
        }
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess the input text."""
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove excessive punctuation
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        return text
    
    # This method is replaced by HuggingFace service - keeping for fallback
    def _detect_fake_news_fallback(self, text: str) -> tuple:
        """Fallback fake news detection when API fails."""
        return self._rule_based_fake_detection(text)
    
    def _rule_based_fake_detection(self, text: str) -> tuple:
        """Rule-based fake news detection as fallback."""
        text_lower = text.lower()
        
        # Check for common misinformation patterns
        fake_indicators = [
            "breaking" in text_lower and "urgent" in text_lower,
            "immediately" in text_lower and "evacuate" in text_lower,
            text.count("!") > 3,
            "dam burst" in text_lower,
            "tsunami" in text_lower and "alert" in text_lower
        ]
        
        fake_score = sum(fake_indicators) / len(fake_indicators)
        is_fake = fake_score > 0.3
        confidence = min(0.8, fake_score + 0.2)
        
        return is_fake, confidence
    
    def _adjust_fake_confidence(self, text: str, base_confidence: float) -> float:
        """Adjust confidence based on disaster-specific patterns."""
        text_lower = text.lower()
        
        # Boost confidence if disaster-related misinformation patterns found
        if any(term in text_lower for term in self.panic_keywords["disaster_terms"]):
            base_confidence = min(0.95, base_confidence + 0.2)
        
        # Check for excessive urgency language
        urgency_count = sum(1 for word in self.panic_keywords["high"] if word in text_lower)
        if urgency_count > 2:
            base_confidence = min(0.9, base_confidence + 0.1)
        
        return base_confidence
    
    # This method is replaced by HuggingFace service - keeping for fallback
    def _analyze_emotions_fallback(self, text: str) -> Dict:
        """Fallback emotion analysis when API fails."""
        return self._rule_based_emotion_detection(text)
    
    def _rule_based_emotion_detection(self, text: str) -> Dict:
        """Rule-based emotion detection as fallback."""
        text_lower = text.lower()
        
        emotions = {
            "fear": 0.0,
            "anger": 0.0,
            "surprise": 0.0,
            "sadness": 0.0,
            "joy": 0.0,
            "neutral": 0.5
        }
        
        # Fear indicators
        fear_words = ["danger", "warning", "alert", "emergency", "evacuate", "help"]
        emotions["fear"] = min(0.9, sum(0.2 for word in fear_words if word in text_lower))
        
        # Anger indicators
        anger_words = ["outrage", "angry", "furious", "demand"]
        emotions["anger"] = min(0.8, sum(0.25 for word in anger_words if word in text_lower))
        
        # Surprise indicators
        surprise_words = ["breaking", "shocking", "unexpected", "sudden"]
        emotions["surprise"] = min(0.7, sum(0.2 for word in surprise_words if word in text_lower))
        
        # Normalize emotions
        total = sum(emotions.values())
        if total > 0:
            emotions = {k: v/total for k, v in emotions.items()}
        
        return emotions
    
    def _calculate_panic_score(self, text: str, emotions: Dict) -> float:
        """Calculate panic score based on emotions and keywords."""
        # Base panic score from emotions
        emotion_panic = sum(
            score * self.emotion_panic_weights.get(emotion, 0) 
            for emotion, score in emotions.items()
        )
        
        # Keyword-based panic scoring
        text_lower = text.lower()
        
        high_panic_score = sum(0.15 for word in self.panic_keywords["high"] if word in text_lower)
        medium_panic_score = sum(0.1 for word in self.panic_keywords["medium"] if word in text_lower)
        disaster_panic_score = sum(0.2 for term in self.panic_keywords["disaster_terms"] if term in text_lower)
        
        keyword_panic = high_panic_score + medium_panic_score + disaster_panic_score
        
        # Urgency indicators (multiple exclamation marks, all caps words)
        urgency_score = 0
        urgency_score += min(0.2, text.count("!") * 0.05)
        urgency_score += min(0.15, len([word for word in text.split() if word.isupper() and len(word) > 2]) * 0.03)
        
        # Combine scores
        total_panic = emotion_panic + keyword_panic + urgency_score
        
        # Normalize to 0-1 range
        return min(1.0, max(0.0, total_panic))
    
    def _find_flagged_keywords(self, text: str) -> List[str]:
        """Find keywords that triggered flags."""
        text_lower = text.lower()
        flagged = []
        
        for category, keywords in self.panic_keywords.items():
            if category == "disaster_terms":
                flagged.extend([term for term in keywords if term in text_lower])
            else:
                flagged.extend([word for word in keywords if word in text_lower])
        
        return list(set(flagged))
    
    def _determine_risk_level(self, is_fake: bool, panic_score: float, confidence: float) -> str:
        """Determine overall risk level."""
        if is_fake and panic_score > 0.7 and confidence > 0.8:
            return "CRITICAL"
        elif is_fake and panic_score > 0.5:
            return "HIGH"
        elif is_fake or panic_score > 0.6:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_explanation(self, is_fake: bool, panic_score: float, emotions: Dict, flagged_keywords: List[str]) -> str:
        """Generate human-readable explanation of the analysis."""
        explanation_parts = []
        
        if is_fake:
            explanation_parts.append("Content identified as potential misinformation")
        
        if panic_score > 0.7:
            explanation_parts.append(f"High panic score ({panic_score:.2f}) detected")
        elif panic_score > 0.4:
            explanation_parts.append(f"Moderate panic score ({panic_score:.2f}) detected")
        
        # Top emotion
        top_emotion = max(emotions.items(), key=lambda x: x[1])
        if top_emotion[1] > 0.3:
            explanation_parts.append(f"Primary emotion: {top_emotion[0]} ({top_emotion[1]:.2f})")
        
        if flagged_keywords:
            explanation_parts.append(f"Flagged keywords: {', '.join(flagged_keywords[:3])}")
        
        return ". ".join(explanation_parts) if explanation_parts else "No significant issues detected"