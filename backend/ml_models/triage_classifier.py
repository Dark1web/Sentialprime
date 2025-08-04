import asyncio
import re
from typing import Dict, List, Optional
from datetime import datetime
import os

class TriageClassifier:
    """
    AI-powered emergency request triage classifier.
    Classifies helpline requests by urgency and required resources.
    """
    
    def __init__(self):
        print("Loading triage classifier...")
        
        # Initialize urgency keywords and patterns
        self._initialize_keywords()
        
        # Initialize location patterns
        self._initialize_locations()
        
        # Initialize medical patterns
        self._initialize_medical_patterns()
        
        # Using rule-based classification instead of ML model
        
        print("Triage classifier loaded successfully!")
    
    def _initialize_keywords(self):
        """Initialize urgency-related keywords and patterns."""
        self.urgency_keywords = {
            "critical": {
                "keywords": [
                    "dying", "unconscious", "bleeding", "trapped", "drowning", 
                    "can't breathe", "chest pain", "heart attack", "stroke",
                    "fire", "explosion", "collapse", "buried", "choking"
                ],
                "score": 1.0
            },
            "high": {
                "keywords": [
                    "injured", "hurt", "pain", "emergency", "urgent", "help",
                    "flooding", "rising water", "evacuation", "dangerous",
                    "broken bone", "severe", "immediate", "quickly"
                ],
                "score": 0.8
            },
            "medium": {
                "keywords": [
                    "need", "require", "assistance", "supply", "food", "water",
                    "shelter", "transportation", "power outage", "communication",
                    "minor injury", "damage", "information"
                ],
                "score": 0.5
            },
            "low": {
                "keywords": [
                    "question", "inquiry", "check", "update", "status",
                    "information", "general", "later", "non-urgent"
                ],
                "score": 0.2
            }
        }
        
        # Time-sensitive indicators
        self.time_indicators = {
            "immediate": ["now", "immediately", "right now", "asap", "urgent"],
            "soon": ["quickly", "fast", "hurry", "rush"],
            "delayed": ["later", "when possible", "not urgent", "eventually"]
        }
    
    def _initialize_locations(self):
        """Initialize location parsing patterns."""
        self.location_patterns = [
            r'\b\d+\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd)\b',
            r'\b[A-Za-z\s]+(?:district|area|zone|sector|neighborhood|locality)\b',
            r'\bnear\s+[A-Za-z\s]+\b',
            r'\bat\s+[A-Za-z\s]+\b',
            r'\bin\s+[A-Za-z\s]+\b'
        ]
    
    def _initialize_medical_patterns(self):
        """Initialize medical emergency detection patterns."""
        self.medical_keywords = [
            "hospital", "doctor", "medical", "medicine", "ambulance",
            "injury", "injured", "pain", "bleeding", "unconscious",
            "breathing", "heart", "chest", "stroke", "attack",
            "pregnant", "diabetic", "allergy", "medication"
        ]
        
        self.resource_keywords = {
            "medical": [
                "doctor", "hospital", "ambulance", "medical", "medicine",
                "first aid", "bandage", "treatment", "injury", "pain"
            ],
            "rescue": [
                "trapped", "stuck", "rescue", "evacuation", "drowning",
                "fire", "collapse", "buried", "emergency rescue"
            ],
            "food_water": [
                "food", "water", "hungry", "thirsty", "supplies",
                "provisions", "rations", "drink", "eat", "starving"
            ],
            "shelter": [
                "shelter", "homeless", "house destroyed", "nowhere to go",
                "accommodation", "temporary housing", "roof", "place to stay"
            ],
            "transportation": [
                "transportation", "vehicle", "car", "bus", "ride",
                "stranded", "stuck", "can't get to", "need ride"
            ],
            "communication": [
                "communication", "phone", "internet", "contact",
                "network", "signal", "connection", "isolated"
            ]
        }
    
    # Removed sklearn-based model methods - using rule-based classification
    
    async def classify_request(self, message: str, location: Optional[str] = None, 
                             additional_info: Optional[str] = None) -> Dict:
        """
        Classify an emergency request and determine triage parameters.
        
        Args:
            message: The emergency message text
            location: Location information (optional)
            additional_info: Additional context (optional)
            
        Returns:
            Dictionary with triage classification results
        """
        # Run analysis in executor to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self._classify_request_sync, message, location, additional_info
        )
    
    def _classify_request_sync(self, message: str, location: Optional[str] = None,
                              additional_info: Optional[str] = None) -> Dict:
        """Synchronous classification function."""
        # Combine all text for analysis
        full_text = message
        if additional_info:
            full_text += " " + additional_info
        
        # Clean and preprocess text
        cleaned_text = self._preprocess_text(full_text)
        
        # Calculate urgency score
        urgency_score = self._calculate_urgency_score(cleaned_text)
        
        # Determine triage level
        triage_level = self._determine_triage_level(urgency_score)
        
        # Identify required resources
        resources = self._identify_resources(cleaned_text)
        
        # Check if medical emergency
        is_medical = self._is_medical_emergency(cleaned_text)
        
        # Parse location
        parsed_location = self._parse_location(location or message)
        
        # Find detected keywords
        keywords = self._find_keywords(cleaned_text)
        
        # Estimate response time
        response_time = self._estimate_response_time(triage_level, is_medical)
        
        # Generate explanation
        explanation = self._generate_explanation(
            urgency_score, triage_level, resources, is_medical, keywords
        )
        
        return {
            "urgency_score": urgency_score,
            "triage_level": triage_level,
            "resource_required": resources,
            "estimated_response_time": response_time,
            "keywords_detected": keywords,
            "location_parsed": parsed_location,
            "medical_emergency": is_medical,
            "explanation": explanation
        }
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess the input text."""
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove special characters but keep alphanumeric and basic punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        return text
    
    def _calculate_urgency_score(self, text: str) -> float:
        """Calculate urgency score based on keywords and patterns."""
        base_score = 0.0
        
        # Keyword-based scoring
        for level, data in self.urgency_keywords.items():
            keyword_count = sum(1 for keyword in data["keywords"] if keyword in text)
            if keyword_count > 0:
                base_score = max(base_score, data["score"])
        
        # Time indicator modifiers
        for time_type, indicators in self.time_indicators.items():
            if any(indicator in text for indicator in indicators):
                if time_type == "immediate":
                    base_score = min(1.0, base_score + 0.2)
                elif time_type == "delayed":
                    base_score = max(0.0, base_score - 0.2)
        
        # Length and urgency language patterns
        exclamation_count = text.count('!')
        caps_words = len([word for word in text.split() if word.isupper() and len(word) > 2])
        
        urgency_modifier = min(0.15, exclamation_count * 0.05 + caps_words * 0.03)
        base_score = min(1.0, base_score + urgency_modifier)
        
        # Using rule-based scoring only (ML model removed for API demo)
        
        return min(1.0, max(0.0, base_score))
    
    def _determine_triage_level(self, urgency_score: float) -> str:
        """Determine triage level based on urgency score."""
        if urgency_score >= 0.8:
            return "CRITICAL"
        elif urgency_score >= 0.6:
            return "HIGH"
        elif urgency_score >= 0.3:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _identify_resources(self, text: str) -> List[str]:
        """Identify required resources based on text analysis."""
        required_resources = []
        
        for resource_type, keywords in self.resource_keywords.items():
            if any(keyword in text for keyword in keywords):
                required_resources.append(resource_type)
        
        # Ensure at least one resource is identified
        if not required_resources:
            # Default based on content analysis
            if any(word in text for word in ["help", "emergency", "urgent"]):
                required_resources.append("rescue")
            else:
                required_resources.append("communication")
        
        return required_resources
    
    def _is_medical_emergency(self, text: str) -> bool:
        """Determine if this is a medical emergency."""
        medical_count = sum(1 for keyword in self.medical_keywords if keyword in text)
        return medical_count > 0
    
    def _parse_location(self, location_text: str) -> Optional[str]:
        """Parse and extract location information."""
        if not location_text:
            return None
        
        location_text = location_text.lower()
        
        # Try to match location patterns
        for pattern in self.location_patterns:
            match = re.search(pattern, location_text, re.IGNORECASE)
            if match:
                return match.group().strip()
        
        # Simple fallback: look for common area descriptors
        area_words = ["district", "area", "zone", "neighborhood", "street", "avenue", "road"]
        words = location_text.split()
        
        for i, word in enumerate(words):
            if any(area in word for area in area_words):
                # Return the word and surrounding context
                start = max(0, i-2)
                end = min(len(words), i+3)
                return " ".join(words[start:end]).title()
        
        return location_text.title() if len(location_text) < 50 else None
    
    def _find_keywords(self, text: str) -> List[str]:
        """Find significant keywords that influenced the classification."""
        found_keywords = []
        
        # Check all urgency keywords
        for level, data in self.urgency_keywords.items():
            for keyword in data["keywords"]:
                if keyword in text:
                    found_keywords.append(keyword)
        
        # Add medical keywords
        for keyword in self.medical_keywords:
            if keyword in text and keyword not in found_keywords:
                found_keywords.append(keyword)
        
        # Limit to most relevant keywords
        return found_keywords[:5]
    
    def _estimate_response_time(self, triage_level: str, is_medical: bool) -> str:
        """Estimate response time based on triage level and type."""
        if triage_level == "CRITICAL":
            return "2-5 minutes" if is_medical else "5-10 minutes"
        elif triage_level == "HIGH":
            return "10-30 minutes" if is_medical else "30-60 minutes"
        elif triage_level == "MEDIUM":
            return "1-4 hours"
        else:
            return "4-24 hours"
    
    def _generate_explanation(self, urgency_score: float, triage_level: str,
                            resources: List[str], is_medical: bool, keywords: List[str]) -> str:
        """Generate human-readable explanation of triage decision."""
        explanation_parts = []
        
        # Urgency explanation
        explanation_parts.append(f"Classified as {triage_level} priority (urgency score: {urgency_score:.2f})")
        
        # Medical emergency flag
        if is_medical:
            explanation_parts.append("Medical emergency detected")
        
        # Resource requirements
        if resources:
            resource_text = ", ".join(resources).replace("_", " ")
            explanation_parts.append(f"Required resources: {resource_text}")
        
        # Key indicators
        if keywords:
            explanation_parts.append(f"Key indicators: {', '.join(keywords[:3])}")
        
        return ". ".join(explanation_parts)