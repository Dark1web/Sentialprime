import asyncio
import re
from typing import Dict, List, Optional
import requests
from datetime import datetime
import random
from bs4 import BeautifulSoup
import time

class FactCheckEngine:
    """
    AI-powered fact-checking engine for disaster-related claims.
    Combines NLP analysis with web scraping for verification.
    """
    
    def __init__(self):
        print("Loading fact-check engine...")
        
        # Initialize trusted sources
        self._initialize_sources()
        
        # Initialize claim patterns
        self._initialize_patterns()
        
        # Initialize risk assessment criteria
        self._initialize_risk_criteria()
        
        print("Fact-check engine loaded successfully!")
    
    def _initialize_sources(self):
        """Initialize trusted sources for verification."""
        self.trusted_sources = {
            "government": [
                "imd.gov.in",
                "ndma.gov.in",
                "pib.gov.in",
                "mha.gov.in"
            ],
            "news": [
                "ptinews.com",
                "aninews.in",
                "pti.in",
                "timesofindia.indiatimes.com",
                "hindustantimes.com",
                "thehindu.com"
            ],
            "research": [
                "iisc.ac.in",
                "iitd.ac.in",
                "nasa.gov",
                "noaa.gov"
            ],
            "international": [
                "who.int",
                "un.org",
                "worldbank.org",
                "usgs.gov"
            ]
        }
        
        # Source reliability scores
        self.source_reliability = {
            "imd.gov.in": 0.95,
            "ndma.gov.in": 0.92,
            "nasa.gov": 0.96,
            "ptinews.com": 0.88,
            "aninews.in": 0.85,
            "who.int": 0.94
        }
    
    def _initialize_patterns(self):
        """Initialize patterns for different types of claims."""
        self.claim_patterns = {
            "weather": {
                "keywords": ["temperature", "rainfall", "cyclone", "storm", "weather", "climate"],
                "indicators": ["°C", "°F", "mm", "mph", "kmph", "inches"]
            },
            "disaster": {
                "keywords": ["earthquake", "flood", "tsunami", "landslide", "fire", "explosion"],
                "indicators": ["magnitude", "richter", "casualties", "affected", "evacuated"]
            },
            "health": {
                "keywords": ["disease", "outbreak", "epidemic", "deaths", "hospital", "medical"],
                "indicators": ["cases", "infected", "mortality", "symptoms"]
            },
            "infrastructure": {
                "keywords": ["bridge", "building", "road", "dam", "power", "communication"],
                "indicators": ["collapsed", "damaged", "restored", "operational"]
            }
        }
        
        # Common misinformation indicators
        self.misinformation_indicators = [
            "breaking news",
            "urgent",
            "immediately",
            "share this",
            "before it's deleted",
            "government hiding",
            "media won't tell you",
            "exclusive footage"
        ]
        
        # Credibility boosters
        self.credibility_boosters = [
            "according to",
            "official statement",
            "confirmed by",
            "government sources",
            "meteorological department",
            "disaster management"
        ]
    
    def _initialize_risk_criteria(self):
        """Initialize risk assessment criteria."""
        self.risk_criteria = {
            "CRITICAL": {
                "keywords": ["immediate evacuation", "life threatening", "emergency", "critical"],
                "impact": ["large population", "major city", "multiple districts"]
            },
            "HIGH": {
                "keywords": ["warning", "alert", "dangerous", "severe"],
                "impact": ["thousands affected", "infrastructure damage"]
            },
            "MEDIUM": {
                "keywords": ["advisory", "caution", "monitor", "watch"],
                "impact": ["localized impact", "minor disruption"]
            },
            "LOW": {
                "keywords": ["normal", "routine", "minor", "isolated"],
                "impact": ["minimal impact", "no immediate threat"]
            }
        }
    
    async def verify_claim(self, claim: str, context: Optional[str] = None,
                          location: Optional[str] = None, urgency: str = "normal") -> Dict:
        """
        Verify a disaster-related claim using multiple sources and AI analysis.
        
        Args:
            claim: The claim to fact-check
            context: Additional context or source information
            location: Location reference in the claim
            urgency: Urgency level for prioritization
            
        Returns:
            Dictionary with verification results
        """
        # Run verification in executor to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self._verify_claim_sync, claim, context, location, urgency
        )
    
    def _verify_claim_sync(self, claim: str, context: Optional[str] = None,
                          location: Optional[str] = None, urgency: str = "normal") -> Dict:
        """Synchronous verification function."""
        start_time = time.time()
        
        # Analyze claim structure and content
        claim_analysis = self._analyze_claim(claim)
        
        # Search for supporting/contradicting sources
        sources_analysis = self._search_sources(claim, location)
        
        # Determine verdict based on analysis
        verdict = self._determine_verdict(claim_analysis, sources_analysis)
        
        # Calculate confidence score
        confidence = self._calculate_confidence(claim_analysis, sources_analysis, verdict)
        
        # Assess risk if claim is true
        risk_assessment = self._assess_risk(claim, location)
        
        # Generate explanation
        explanation = self._generate_explanation(
            claim_analysis, sources_analysis, verdict, confidence
        )
        
        # Compile verification sources
        verification_sources = self._compile_sources(sources_analysis)
        
        # Get related articles
        related_articles = self._get_related_articles(sources_analysis)
        
        processing_time = time.time() - start_time
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "related_articles": related_articles,
            "model_explanation": explanation,
            "risk_assessment": risk_assessment,
            "verification_sources": verification_sources,
            "processing_time": round(processing_time, 2),
            "claim_type": claim_analysis["type"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _analyze_claim(self, claim: str) -> Dict:
        """Analyze the structure and content of the claim."""
        claim_lower = claim.lower()
        
        # Determine claim type
        claim_type = "general"
        for category, patterns in self.claim_patterns.items():
            if any(keyword in claim_lower for keyword in patterns["keywords"]):
                claim_type = category
                break
        
        # Check for misinformation indicators
        misinfo_score = sum(1 for indicator in self.misinformation_indicators 
                           if indicator in claim_lower) / len(self.misinformation_indicators)
        
        # Check for credibility boosters
        credibility_score = sum(1 for booster in self.credibility_boosters 
                               if booster in claim_lower) / len(self.credibility_boosters)
        
        # Analyze language patterns
        urgency_words = ["urgent", "breaking", "immediate", "emergency"]
        urgency_score = sum(1 for word in urgency_words if word in claim_lower) / len(urgency_words)
        
        # Check for specific facts/numbers
        has_numbers = bool(re.search(r'\d+', claim))
        has_locations = bool(re.search(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', claim))
        
        return {
            "type": claim_type,
            "misinfo_score": misinfo_score,
            "credibility_score": credibility_score,
            "urgency_score": urgency_score,
            "has_numbers": has_numbers,
            "has_locations": has_locations,
            "length": len(claim),
            "word_count": len(claim.split())
        }
    
    def _search_sources(self, claim: str, location: Optional[str] = None) -> Dict:
        """Search trusted sources for information about the claim."""
        # In a real implementation, this would perform actual web searches
        # For demo purposes, we'll simulate the search results
        
        sources_found = []
        contradicting_sources = []
        
        # Simulate finding sources based on claim content
        claim_lower = claim.lower()
        
        # Government sources simulation
        if any(word in claim_lower for word in ["weather", "cyclone", "rainfall", "temperature"]):
            sources_found.append({
                "source": "imd.gov.in",
                "title": "Weather Advisory - Current Conditions",
                "relevance": 0.9,
                "supports_claim": True,
                "reliability": 0.95
            })
        
        if any(word in claim_lower for word in ["flood", "evacuation", "disaster"]):
            sources_found.append({
                "source": "ndma.gov.in",
                "title": "Disaster Management Guidelines",
                "relevance": 0.85,
                "supports_claim": True,
                "reliability": 0.92
            })
        
        # News sources simulation
        if "breaking" in claim_lower or "urgent" in claim_lower:
            # Higher chance of misinformation for "breaking" claims
            contradicting_sources.append({
                "source": "ptinews.com",
                "title": "No Official Confirmation of Reported Incident",
                "relevance": 0.8,
                "supports_claim": False,
                "reliability": 0.88
            })
        
        # Simulate random additional sources
        if random.random() < 0.7:  # 70% chance of finding additional sources
            sources_found.append({
                "source": "thehindu.com",
                "title": "Local News Coverage",
                "relevance": 0.75,
                "supports_claim": random.choice([True, False]),
                "reliability": 0.82
            })
        
        return {
            "supporting_sources": sources_found,
            "contradicting_sources": contradicting_sources,
            "total_sources": len(sources_found) + len(contradicting_sources),
            "avg_reliability": 0.87,
            "search_keywords": claim.split()[:5]  # First 5 words as keywords
        }
    
    def _determine_verdict(self, claim_analysis: Dict, sources_analysis: Dict) -> str:
        """Determine the verdict based on analysis results."""
        supporting = len(sources_analysis["supporting_sources"])
        contradicting = len(sources_analysis["contradicting_sources"])
        
        # Calculate weighted support based on source reliability
        weighted_support = sum(
            s["reliability"] * s["relevance"] 
            for s in sources_analysis["supporting_sources"]
        )
        weighted_contradiction = sum(
            s["reliability"] * s["relevance"] 
            for s in sources_analysis["contradicting_sources"]
        )
        
        # Factor in claim analysis
        misinfo_penalty = claim_analysis["misinfo_score"] * 0.3
        credibility_bonus = claim_analysis["credibility_score"] * 0.2
        
        # Calculate overall score
        support_score = weighted_support + credibility_bonus - misinfo_penalty
        contradiction_score = weighted_contradiction + misinfo_penalty
        
        # Determine verdict
        if support_score > contradiction_score * 1.5:
            return "True"
        elif contradiction_score > support_score * 1.5:
            return "False"
        elif support_score > contradiction_score:
            return "Partially True"
        else:
            return "Unverified"
    
    def _calculate_confidence(self, claim_analysis: Dict, sources_analysis: Dict, verdict: str) -> float:
        """Calculate confidence score for the verdict."""
        base_confidence = 0.5
        
        # Source-based confidence
        source_count = sources_analysis["total_sources"]
        avg_reliability = sources_analysis["avg_reliability"]
        
        source_confidence = min(0.9, (source_count * avg_reliability) / 5)
        
        # Claim analysis confidence
        analysis_confidence = 0.7
        if claim_analysis["has_numbers"] and claim_analysis["has_locations"]:
            analysis_confidence += 0.1
        
        if claim_analysis["credibility_score"] > 0.3:
            analysis_confidence += 0.1
        
        if claim_analysis["misinfo_score"] > 0.3:
            analysis_confidence -= 0.2
        
        # Combine confidences
        final_confidence = (source_confidence * 0.6 + analysis_confidence * 0.4)
        
        # Adjust based on verdict certainty
        if verdict in ["True", "False"]:
            final_confidence += 0.1
        elif verdict == "Unverified":
            final_confidence -= 0.2
        
        return min(1.0, max(0.1, final_confidence))
    
    def _assess_risk(self, claim: str, location: Optional[str] = None) -> str:
        """Assess the risk level if the claim is true."""
        claim_lower = claim.lower()
        
        # Check against risk criteria
        for risk_level, criteria in self.risk_criteria.items():
            keyword_match = any(keyword in claim_lower for keyword in criteria["keywords"])
            impact_match = any(impact in claim_lower for impact in criteria["impact"])
            
            if keyword_match or impact_match:
                return risk_level
        
        # Default risk assessment based on claim type
        if any(word in claim_lower for word in ["emergency", "evacuation", "life"]):
            return "HIGH"
        elif any(word in claim_lower for word in ["warning", "alert", "danger"]):
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_explanation(self, claim_analysis: Dict, sources_analysis: Dict, 
                            verdict: str, confidence: float) -> str:
        """Generate human-readable explanation of the verification process."""
        explanation_parts = []
        
        # Verdict explanation
        explanation_parts.append(f"Verdict: {verdict} (confidence: {confidence:.2f})")
        
        # Sources explanation
        total_sources = sources_analysis["total_sources"]
        if total_sources > 0:
            explanation_parts.append(f"Analysis based on {total_sources} sources")
            
            supporting = len(sources_analysis["supporting_sources"])
            contradicting = len(sources_analysis["contradicting_sources"])
            
            if supporting > contradicting:
                explanation_parts.append(f"{supporting} sources support the claim")
            elif contradicting > supporting:
                explanation_parts.append(f"{contradicting} sources contradict the claim")
            else:
                explanation_parts.append("Mixed evidence from sources")
        else:
            explanation_parts.append("Limited sources found for verification")
        
        # Claim analysis insights
        if claim_analysis["misinfo_score"] > 0.3:
            explanation_parts.append("Contains language patterns common in misinformation")
        
        if claim_analysis["credibility_score"] > 0.3:
            explanation_parts.append("Contains credible source references")
        
        if not claim_analysis["has_numbers"] and not claim_analysis["has_locations"]:
            explanation_parts.append("Lacks specific details for verification")
        
        return ". ".join(explanation_parts)
    
    def _compile_sources(self, sources_analysis: Dict) -> List[str]:
        """Compile list of sources used for verification."""
        all_sources = (sources_analysis["supporting_sources"] + 
                      sources_analysis["contradicting_sources"])
        
        return list(set(source["source"] for source in all_sources))
    
    def _get_related_articles(self, sources_analysis: Dict) -> List[Dict]:
        """Get related articles from the sources analysis."""
        articles = []
        
        for source in sources_analysis["supporting_sources"]:
            articles.append({
                "title": source["title"],
                "source": source["source"],
                "relevance": source["relevance"],
                "supports_claim": source["supports_claim"],
                "url": f"https://{source['source']}/article-url",
                "reliability_score": source["reliability"]
            })
        
        for source in sources_analysis["contradicting_sources"]:
            articles.append({
                "title": source["title"],
                "source": source["source"],
                "relevance": source["relevance"],
                "supports_claim": source["supports_claim"],
                "url": f"https://{source['source']}/article-url",
                "reliability_score": source["reliability"]
            })
        
        # Sort by relevance
        articles.sort(key=lambda x: x["relevance"], reverse=True)
        
        return articles[:5]  # Return top 5 most relevant articles