"""
Requirement Normalizer Module

This module handles the normalization of natural language requirements
into structured specifications that can be used by the AI pipeline.
"""

import re
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class RequirementSpec:
    """Represents a normalized requirement specification."""
    
    def __init__(self, 
                 title: str,
                 description: str,
                 type: str,
                 priority: str = "medium",
                 complexity: str = "medium",
                 technologies: List[str] = None,
                 features: List[str] = None,
                 constraints: List[str] = None,
                 acceptance_criteria: List[str] = None):
        self.title = title
        self.description = description
        self.type = type
        self.priority = priority
        self.complexity = complexity
        self.technologies = technologies or []
        self.features = features or []
        self.constraints = constraints or []
        self.acceptance_criteria = acceptance_criteria or []
        self.normalized_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert specification to dictionary."""
        return {
            "title": self.title,
            "description": self.description,
            "type": self.type,
            "priority": self.priority,
            "complexity": self.complexity,
            "technologies": self.technologies,
            "features": self.features,
            "constraints": self.constraints,
            "acceptance_criteria": self.acceptance_criteria,
            "normalized_at": self.normalized_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RequirementSpec':
        """Create specification from dictionary."""
        spec = cls(
            title=data["title"],
            description=data["description"],
            type=data["type"],
            priority=data.get("priority", "medium"),
            complexity=data.get("complexity", "medium"),
            technologies=data.get("technologies", []),
            features=data.get("features", []),
            constraints=data.get("constraints", []),
            acceptance_criteria=data.get("acceptance_criteria", [])
        )
        spec.normalized_at = datetime.fromisoformat(data["normalized_at"])
        return spec

def extract_technologies(text: str) -> List[str]:
    """Extract technology mentions from requirement text."""
    tech_keywords = {
        "react": ["react", "reactjs", "react.js", "jsx", "tsx"],
        "nextjs": ["nextjs", "next.js", "next"],
        "typescript": ["typescript", "ts", "tsx"],
        "python": ["python", "py"],
        "fastapi": ["fastapi", "fast api"],
        "django": ["django"],
        "flask": ["flask"],
        "postgresql": ["postgresql", "postgres", "psql"],
        "mongodb": ["mongodb", "mongo"],
        "redis": ["redis"],
        "docker": ["docker", "container"],
        "kubernetes": ["kubernetes", "k8s", "kube"],
        "aws": ["aws", "amazon web services"],
        "azure": ["azure", "microsoft azure"],
        "gcp": ["gcp", "google cloud", "gcs"],
        "tailwind": ["tailwind", "tailwindcss"],
        "shadcn": ["shadcn", "shadcn/ui"],
        "prisma": ["prisma"],
        "nextauth": ["nextauth", "next auth"],
        "zustand": ["zustand"],
        "tanstack": ["tanstack", "react query"],
        "framer": ["framer", "framer motion"],
        "socket": ["socket", "socket.io", "websocket"]
    }
    
    found_techs = []
    text_lower = text.lower()
    
    for tech, keywords in tech_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                found_techs.append(tech)
                break
    
    return list(set(found_techs))

def extract_features(text: str) -> List[str]:
    """Extract feature descriptions from requirement text."""
    # Common feature patterns
    feature_patterns = [
        r'(?:feature|functionality|capability|should|need to|must)\s*[:\-]?\s*([^.!?]+)',
        r'(?:create|build|develop|implement|add)\s+([^.!?]+)',
        r'(?:user|admin|system)\s+(?:can|should|will)\s+([^.!?]+)',
        r'(?:support|enable|allow)\s+([^.!?]+)'
    ]
    
    features = []
    
    for pattern in feature_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            # Clean up the match
            feature = match.strip().capitalize()
            if len(feature) > 10:  # Minimum length threshold
                features.append(feature)
    
    # Remove duplicates and limit to reasonable number
    return list(set(features))[:10]

def extract_constraints(text: str) -> List[str]:
    """Extract constraints from requirement text."""
    constraint_patterns = [
        r'(?:constraint|limitation|restriction|must not|cannot|should not)\s*[:\-]?\s*([^.!?]+)',
        r'(?:only|just|exclusively)\s+([^.!?]+)',
        r'(?:maximum|minimum|at least|at most)\s+([^.!?]+)',
        r'(?:security|performance|scalability|reliability)\s+(?:requirement|constraint)\s*[:\-]?\s*([^.!?]+)'
    ]
    
    constraints = []
    
    for pattern in constraint_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            constraint = match.strip().capitalize()
            if len(constraint) > 10:
                constraints.append(constraint)
    
    return list(set(constraints))[:5]

def determine_priority(text: str) -> str:
    """Determine priority from requirement text."""
    high_priority_keywords = ["urgent", "critical", "asap", "immediately", "high priority", "must have"]
    low_priority_keywords = ["nice to have", "optional", "low priority", "when possible", "eventually"]
    
    text_lower = text.lower()
    
    if any(keyword in text_lower for keyword in high_priority_keywords):
        return "high"
    elif any(keyword in text_lower for keyword in low_priority_keywords):
        return "low"
    else:
        return "medium"

def determine_complexity(text: str) -> str:
    """Determine complexity from requirement text."""
    high_complexity_keywords = ["complex", "advanced", "sophisticated", "enterprise", "large scale", "distributed"]
    low_complexity_keywords = ["simple", "basic", "straightforward", "easy", "small", "minimal"]
    
    text_lower = text.lower()
    
    if any(keyword in text_lower for keyword in high_complexity_keywords):
        return "high"
    elif any(keyword in text_lower for keyword in low_complexity_keywords):
        return "low"
    else:
        return "medium"

def determine_type(text: str) -> str:
    """Determine project type from requirement text."""
    type_keywords = {
        "web": ["web", "website", "web application", "frontend", "ui", "interface"],
        "api": ["api", "rest", "graphql", "backend", "service", "microservice"],
        "mobile": ["mobile", "app", "ios", "android", "react native"],
        "desktop": ["desktop", "application", "software", "program"],
        "library": ["library", "package", "module", "component", "sdk"],
        "script": ["script", "automation", "batch", "tool", "utility"]
    }
    
    text_lower = text.lower()
    
    for proj_type, keywords in type_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            return proj_type
    
    return "web"  # Default to web

def generate_acceptance_criteria(spec: Dict[str, Any]) -> List[str]:
    """Generate acceptance criteria based on specification."""
    criteria = []
    
    # Basic criteria based on type
    type_criteria = {
        "web": [
            "The application should be responsive and work on mobile devices",
            "All user interactions should provide appropriate feedback",
            "The application should handle errors gracefully"
        ],
        "api": [
            "All endpoints should return proper HTTP status codes",
            "API should handle authentication and authorization",
            "Response times should be under 500ms for 90% of requests"
        ],
        "mobile": [
            "The app should work on both iOS and Android platforms",
            "Offline functionality should be available where applicable",
            "The app should follow platform-specific design guidelines"
        ],
        "desktop": [
            "The application should install without dependencies",
            "The UI should be intuitive and follow platform conventions",
            "Performance should be acceptable on minimum system requirements"
        ]
    }
    
    criteria.extend(type_criteria.get(spec["type"], type_criteria["web"]))
    
    # Add criteria based on features
    if spec["features"]:
        criteria.append(f"All specified features should be implemented and functional")
    
    # Add criteria based on technologies
    if "react" in spec["technologies"] or "nextjs" in spec["technologies"]:
        criteria.append("Components should be reusable and follow React best practices")
    
    if "typescript" in spec["technologies"]:
        criteria.append("TypeScript types should be properly defined and used")
    
    if "testing" in spec["technologies"] or "test" in spec["description"].lower():
        criteria.append("Unit tests should be provided for core functionality")
    
    return criteria[:5]  # Limit to 5 criteria

def normalize_requirement(requirement: str) -> Dict[str, Any]:
    """
    Normalize a natural language requirement into a structured specification.
    
    Args:
        requirement: The natural language requirement text
        
    Returns:
        Dictionary containing the normalized specification
    """
    logger.info(f"Normalizing requirement: {requirement[:100]}...")
    
    try:
        # Extract information from requirement
        technologies = extract_technologies(requirement)
        features = extract_features(requirement)
        constraints = extract_constraints(requirement)
        priority = determine_priority(requirement)
        complexity = determine_complexity(requirement)
        proj_type = determine_type(requirement)
        
        # Create specification
        spec = RequirementSpec(
            title=requirement.split('.')[0].strip()[:50] + "..." if len(requirement) > 50 else requirement,
            description=requirement,
            type=proj_type,
            priority=priority,
            complexity=complexity,
            technologies=technologies,
            features=features,
            constraints=constraints
        )
        
        # Generate acceptance criteria
        spec.acceptance_criteria = generate_acceptance_criteria(spec.to_dict())
        
        logger.info(f"Requirement normalized successfully: {spec.title}")
        return spec.to_dict()
        
    except Exception as e:
        logger.error(f"Failed to normalize requirement: {e}")
        # Return basic specification on error
        return RequirementSpec(
            title="Unknown Requirement",
            description=requirement,
            type="web",
            priority="medium",
            complexity="medium"
        ).to_dict()

def validate_specification(spec: Dict[str, Any]) -> bool:
    """Validate that a specification meets minimum requirements."""
    required_fields = ["title", "description", "type"]
    
    for field in required_fields:
        if field not in spec or not spec[field]:
            logger.error(f"Missing required field in specification: {field}")
            return False
    
    return True

def save_specification(spec: Dict[str, Any], filepath: str = "ai/specifications/latest.json") -> None:
    """Save specification to file."""
    try:
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(spec, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Specification saved to {filepath}")
    except Exception as e:
        logger.error(f"Failed to save specification: {e}")

if __name__ == "__main__":
    # Example usage
    test_requirement = "Create a React web application with TypeScript and Tailwind CSS that includes user authentication, data visualization charts, and real-time updates using WebSockets. The application should be responsive and work on mobile devices."
    
    spec = normalize_requirement(test_requirement)
    print("Normalized Specification:")
    print(json.dumps(spec, indent=2))
    
    save_specification(spec)