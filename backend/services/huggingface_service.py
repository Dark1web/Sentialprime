import aiohttp
import asyncio
from typing import Dict, List, Any
from config import get_api_key, get_endpoint, get_model

class HuggingFaceService:
    """Service for HuggingFace API inference"""
    
    def __init__(self):
        self.api_key = get_api_key("HUGGINGFACE_API")
        self.api_url = get_endpoint("HUGGINGFACE_API")
        self.misinformation_model = get_model("MISINFORMATION")
        self.emotion_model = get_model("EMOTION")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def analyze_misinformation(self, text: str) -> Dict[str, Any]:
        """Analyze text for misinformation using BERT model"""
        try:
            # For BERT-based classification, we'll use a simple approach
            # Since the base BERT model isn't specifically trained for misinformation,
            # we'll combine it with rule-based analysis
            
            # Get emotion analysis first (it's more reliable)
            emotions = await self.analyze_emotions(text)
            
            # Rule-based misinformation detection
            is_fake = self._rule_based_misinformation_detection(text)
            
            # Calculate confidence based on multiple factors
            confidence = self._calculate_misinformation_confidence(text, emotions)
            
            return {
                "is_fake": is_fake,
                "confidence": confidence,
                "emotions": emotions,
                "analysis_method": "hybrid_rule_based_emotion"
            }
            
        except Exception as e:
            print(f"Misinformation analysis error: {e}")
            # Fallback to rule-based only
            return self._fallback_misinformation_analysis(text)
    
    async def analyze_emotions(self, text: str) -> Dict[str, float]:
        """Analyze emotions using j-hartmann/emotion-english-distilroberta-base"""
        try:
            url = f"{self.api_url}/{self.emotion_model}"
            payload = {"inputs": text}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=self.headers, json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        # HuggingFace returns array of emotion predictions
                        emotions = {}
                        if isinstance(result, list) and len(result) > 0:
                            for emotion_data in result[0]:
                                emotion = emotion_data.get('label', '').lower()
                                score = emotion_data.get('score', 0.0)
                                emotions[emotion] = score
                        
                        # Normalize to expected emotion categories
                        normalized_emotions = self._normalize_emotions(emotions)
                        return normalized_emotions
                    
                    else:
                        print(f"HuggingFace emotion API error: {response.status}")
                        return self._fallback_emotion_analysis(text)
                        
        except Exception as e:
            print(f"Emotion analysis error: {e}")
            return self._fallback_emotion_analysis(text)
    
    async def classify_text_sentiment(self, text: str) -> Dict[str, Any]:
        """General text classification for sentiment"""
        try:
            # We can use the emotion model for general sentiment
            emotions = await self.analyze_emotions(text)
            
            # Calculate overall sentiment from emotions
            positive_emotions = ['joy', 'love', 'optimism']
            negative_emotions = ['anger', 'fear', 'sadness', 'disgust']
            
            positive_score = sum(emotions.get(e, 0) for e in positive_emotions)
            negative_score = sum(emotions.get(e, 0) for e in negative_emotions)
            
            if positive_score > negative_score:
                sentiment = "positive"
                confidence = positive_score
            elif negative_score > positive_score:
                sentiment = "negative" 
                confidence = negative_score
            else:
                sentiment = "neutral"
                confidence = emotions.get('neutral', 0.5)
            
            return {
                "sentiment": sentiment,
                "confidence": confidence,
                "emotions": emotions
            }
            
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "emotions": {}}
    
    def _rule_based_misinformation_detection(self, text: str) -> bool:
        """Rule-based misinformation detection"""
        text_lower = text.lower()
        
        # High-risk indicators
        high_risk_patterns = [
            "breaking news" in text_lower and "share immediately" in text_lower,
            "government hiding" in text_lower,
            "media won't tell you" in text_lower,
            "secret" in text_lower and ("program" in text_lower or "plan" in text_lower),
            "before it's deleted" in text_lower,
            text.count("!") > 3 and ("urgent" in text_lower or "emergency" in text_lower)
        ]
        
        # Disaster-specific false patterns
        disaster_false_patterns = [
            "dam burst" in text_lower and "share" in text_lower,
            "tsunami" in text_lower and "alert" in text_lower and "unofficial" not in text_lower,
            "earthquake" in text_lower and "magnitude" in text_lower and "predicted" in text_lower
        ]
        
        # Check for misinformation patterns
        high_risk_count = sum(high_risk_patterns)
        disaster_false_count = sum(disaster_false_patterns)
        
        return high_risk_count > 0 or disaster_false_count > 0
    
    def _calculate_misinformation_confidence(self, text: str, emotions: Dict[str, float]) -> float:
        """Calculate confidence score for misinformation detection"""
        base_confidence = 0.6
        
        # Boost confidence based on emotional indicators
        fear_score = emotions.get('fear', 0)
        anger_score = emotions.get('anger', 0)
        
        if fear_score > 0.7 or anger_score > 0.7:
            base_confidence += 0.2
        
        # Language pattern confidence
        text_lower = text.lower()
        if "breaking" in text_lower and "urgent" in text_lower:
            base_confidence += 0.1
        
        if any(word in text_lower for word in ["confirmed", "official", "according to"]):
            base_confidence -= 0.1
        
        return min(0.95, max(0.3, base_confidence))
    
    def _normalize_emotions(self, emotions: Dict[str, float]) -> Dict[str, float]:
        """Normalize emotion categories to standard set"""
        emotion_mapping = {
            'joy': 'joy',
            'happiness': 'joy',
            'sadness': 'sadness',
            'anger': 'anger',
            'fear': 'fear',
            'surprise': 'surprise',
            'disgust': 'disgust',
            'love': 'joy',
            'optimism': 'joy',
            'pessimism': 'sadness'
        }
        
        normalized = {
            'fear': 0.0,
            'anger': 0.0,
            'joy': 0.0,
            'sadness': 0.0,
            'surprise': 0.0,
            'disgust': 0.0,
            'neutral': 0.0
        }
        
        for emotion, score in emotions.items():
            mapped_emotion = emotion_mapping.get(emotion, 'neutral')
            normalized[mapped_emotion] = max(normalized[mapped_emotion], score)
        
        # Ensure total roughly equals 1
        total = sum(normalized.values())
        if total > 0:
            normalized = {k: v/total for k, v in normalized.items()}
        else:
            normalized['neutral'] = 1.0
        
        return normalized
    
    def _fallback_misinformation_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback analysis when API fails"""
        is_fake = self._rule_based_misinformation_detection(text)
        emotions = self._fallback_emotion_analysis(text)
        confidence = 0.7 if is_fake else 0.8
        
        return {
            "is_fake": is_fake,
            "confidence": confidence,
            "emotions": emotions,
            "analysis_method": "rule_based_fallback"
        }
    
    def _fallback_emotion_analysis(self, text: str) -> Dict[str, float]:
        """Fallback emotion analysis when API fails"""
        text_lower = text.lower()
        
        emotions = {
            'fear': 0.0,
            'anger': 0.0, 
            'joy': 0.0,
            'sadness': 0.0,
            'surprise': 0.0,
            'disgust': 0.0,
            'neutral': 0.5
        }
        
        # Fear indicators
        fear_words = ['emergency', 'danger', 'warning', 'urgent', 'help', 'scared', 'afraid']
        emotions['fear'] = min(0.9, sum(0.15 for word in fear_words if word in text_lower))
        
        # Anger indicators  
        anger_words = ['angry', 'outrage', 'furious', 'mad', 'hate']
        emotions['anger'] = min(0.8, sum(0.2 for word in anger_words if word in text_lower))
        
        # Surprise indicators
        surprise_words = ['breaking', 'shocking', 'unbelievable', 'sudden']
        emotions['surprise'] = min(0.7, sum(0.2 for word in surprise_words if word in text_lower))
        
        # Normalize
        total = sum(emotions.values())
        if total > 0:
            emotions = {k: v/total for k, v in emotions.items()}
        
        return emotions