"""
AI Planner Module

This module generates development plans by breaking down requirements
into manageable modules with dependencies and implementation order.
"""

import json
import logging
from typing import Dict, List, Any, Optional, Set
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class DevelopmentModule:
    """Represents a module in the development plan."""
    
    def __init__(self, 
                 name: str,
                 description: str,
                 type: str,
                 technologies: List[str] = None,
                 dependencies: List[str] = None,
                 estimated_complexity: str = "medium",
                 estimated_time: str = "1-2 hours",
                 files: List[str] = None,
                 tests: List[str] = None):
        self.name = name
        self.description = description
        self.type = type
        self.technologies = technologies or []
        self.dependencies = dependencies or []
        self.estimated_complexity = estimated_complexity
        self.estimated_time = estimated_time
        self.files = files or []
        self.tests = tests or []
        self.created_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert module to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "technologies": self.technologies,
            "dependencies": self.dependencies,
            "estimated_complexity": self.estimated_complexity,
            "estimated_time": self.estimated_time,
            "files": self.files,
            "tests": self.tests,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DevelopmentModule':
        """Create module from dictionary."""
        module = cls(
            name=data["name"],
            description=data["description"],
            type=data["type"],
            technologies=data.get("technologies", []),
            dependencies=data.get("dependencies", []),
            estimated_complexity=data.get("estimated_complexity", "medium"),
            estimated_time=data.get("estimated_time", "1-2 hours"),
            files=data.get("files", []),
            tests=data.get("tests", [])
        )
        module.created_at = datetime.fromisoformat(data["created_at"])
        return module

class DevelopmentPlan:
    """Represents a complete development plan."""
    
    def __init__(self, requirement_spec: Dict[str, Any]):
        self.requirement_spec = requirement_spec
        self.modules: List[DevelopmentModule] = []
        self.execution_order: List[str] = []
        self.total_estimated_time: str = ""
        self.created_at = datetime.now()
    
    def add_module(self, module: DevelopmentModule) -> None:
        """Add a module to the plan."""
        self.modules.append(module)
    
    def calculate_execution_order(self) -> None:
        """Calculate the optimal execution order based on dependencies."""
        # Topological sort
        module_names = [m.name for m in self.modules]
        dependencies = {m.name: set(m.dependencies) for m in self.modules}
        
        # Find modules with no dependencies
        no_deps = [name for name, deps in dependencies.items() if not deps]
        execution_order = []
        
        while no_deps:
            # Get the next module to process
            current = no_deps.pop(0)
            execution_order.append(current)
            
            # Remove current module from other modules' dependencies
            for name, deps in dependencies.items():
                if current in deps:
                    deps.remove(current)
                    if not deps:
                        no_deps.append(name)
        
        # Check for circular dependencies
        if len(execution_order) != len(module_names):
            logger.warning("Circular dependencies detected, using fallback order")
            execution_order = module_names
        
        self.execution_order = execution_order
    
    def calculate_total_time(self) -> None:
        """Calculate total estimated time for the plan."""
        time_mapping = {
            "30 minutes": 0.5,
            "1 hour": 1,
            "1-2 hours": 1.5,
            "2-3 hours": 2.5,
            "3-4 hours": 3.5,
            "4-6 hours": 5,
            "6-8 hours": 7,
            "1-2 days": 12,
            "2-3 days": 24,
            "3-5 days": 40
        }
        
        total_hours = 0
        for module in self.modules:
            hours = time_mapping.get(module.estimated_time, 1.5)
            total_hours += hours
        
        # Convert to readable format
        if total_hours < 1:
            self.total_estimated_time = f"{int(total_hours * 60)} minutes"
        elif total_hours < 8:
            self.total_estimated_time = f"{int(total_hours)} hours"
        elif total_hours < 24:
            days = total_hours / 8
            self.total_estimated_time = f"{int(days)} days"
        else:
            days = total_hours / 8
            self.total_estimated_time = f"{int(days)} days"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert plan to dictionary."""
        return {
            "requirement_spec": self.requirement_spec,
            "modules": [m.to_dict() for m in self.modules],
            "execution_order": self.execution_order,
            "total_estimated_time": self.total_estimated_time,
            "created_at": self.created_at.isoformat()
        }

def generate_web_modules(spec: Dict[str, Any]) -> List[DevelopmentModule]:
    """Generate modules for web applications."""
    modules = []
    
    # Core modules
    if "react" in spec["technologies"] or "nextjs" in spec["technologies"]:
        modules.append(DevelopmentModule(
            name="frontend-setup",
            description="Set up React/Next.js frontend project structure",
            type="frontend",
            technologies=["react", "nextjs", "typescript"],
            dependencies=[],
            estimated_complexity="low",
            estimated_time="30 minutes",
            files=["package.json", "next.config.js", "tsconfig.json", "tailwind.config.js"],
            tests=["setup.test.js"]
        ))
    
    # Authentication module
    if "auth" in spec["description"].lower() or "authentication" in spec["description"].lower():
        modules.append(DevelopmentModule(
            name="authentication",
            description="Implement user authentication system",
            type="backend",
            technologies=["nextauth", "prisma"],
            dependencies=["frontend-setup"],
            estimated_complexity="medium",
            estimated_time="2-3 hours",
            files=["src/lib/auth.ts", "src/pages/api/auth/[...nextauth].ts"],
            tests=["auth.test.js"]
        ))
    
    # Database module
    if "database" in spec["description"].lower() or "data" in spec["description"].lower():
        modules.append(DevelopmentModule(
            name="database-setup",
            description="Set up database schema and connection",
            type="backend",
            technologies=["prisma", "postgresql"],
            dependencies=[],
            estimated_complexity="medium",
            estimated_time="1-2 hours",
            files=["prisma/schema.prisma", "src/lib/db.ts"],
            tests=["db.test.js"]
        ))
    
    # API modules
    if "api" in spec["description"].lower() or "backend" in spec["description"].lower():
        modules.append(DevelopmentModule(
            name="api-routes",
            description="Create REST API routes",
            type="backend",
            technologies=["nextjs", "typescript"],
            dependencies=["database-setup"],
            estimated_complexity="medium",
            estimated_time="2-3 hours",
            files=["src/pages/api/**/*.ts"],
            tests=["api.test.js"]
        ))
    
    # UI Components
    modules.append(DevelopmentModule(
        name="ui-components",
        description="Create reusable UI components",
        type="frontend",
        technologies=["react", "tailwind", "shadcn"],
        dependencies=["frontend-setup"],
        estimated_complexity="medium",
        estimated_time="2-3 hours",
        files=["src/components/**/*.tsx"],
        tests=["components.test.js"]
    ))
    
    # Pages/Routes
    modules.append(DevelopmentModule(
        name="pages",
        description="Create application pages and routes",
        type="frontend",
        technologies=["nextjs", "react"],
        dependencies=["ui-components", "api-routes"],
        estimated_complexity="medium",
        estimated_time="2-3 hours",
        files=["src/pages/**/*.tsx", "src/app/**/*.tsx"],
        tests=["pages.test.js"]
    ))
    
    # Styling
    modules.append(DevelopmentModule(
        name="styling",
        description="Implement styling and responsive design",
        type="frontend",
        technologies=["tailwind", "css"],
        dependencies=["ui-components", "pages"],
        estimated_complexity="low",
        estimated_time="1-2 hours",
        files=["src/styles/**/*.css", "src/**/*.css"],
        tests=["styling.test.js"]
    ))
    
    return modules

def generate_api_modules(spec: Dict[str, Any]) -> List[DevelopmentModule]:
    """Generate modules for API projects."""
    modules = []
    
    # Core API setup
    modules.append(DevelopmentModule(
        name="api-setup",
        description="Set up API project structure",
        type="backend",
        technologies=["fastapi", "python"],
        dependencies=[],
        estimated_complexity="low",
        estimated_time="30 minutes",
        files=["main.py", "requirements.txt", "pyproject.toml"],
        tests=["setup.test.py"]
    ))
    
    # Database models
    modules.append(DevelopmentModule(
        name="database-models",
        description="Define database models and schemas",
        type="backend",
        technologies=["sqlalchemy", "postgresql"],
        dependencies=["api-setup"],
        estimated_complexity="medium",
        estimated_time="1-2 hours",
        files=["models.py", "schemas.py"],
        tests=["models.test.py"]
    ))
    
    # API endpoints
    modules.append(DevelopmentModule(
        name="api-endpoints",
        description="Implement API endpoints",
        type="backend",
        technologies=["fastapi", "python"],
        dependencies=["database-models"],
        estimated_complexity="medium",
        estimated_time="2-3 hours",
        files=["routers/**/*.py"],
        tests=["endpoints.test.py"]
    ))
    
    # Authentication
    modules.append(DevelopmentModule(
        name="auth-middleware",
        description="Implement authentication middleware",
        type="backend",
        technologies=["fastapi", "jwt"],
        dependencies=["api-endpoints"],
        estimated_complexity="medium",
        estimated_time="1-2 hours",
        files=["auth.py", "middleware.py"],
        tests=["auth.test.py"]
    ))
    
    # Documentation
    modules.append(DevelopmentModule(
        name="api-docs",
        description="Generate API documentation",
        type="documentation",
        technologies=["fastapi", "swagger"],
        dependencies=["api-endpoints"],
        estimated_complexity="low",
        estimated_time="30 minutes",
        files=["docs/**/*.md"],
        tests=["docs.test.py"]
    ))
    
    return modules

def generate_mobile_modules(spec: Dict[str, Any]) -> List[DevelopmentModule]:
    """Generate modules for mobile applications."""
    modules = []
    
    # Core setup
    modules.append(DevelopmentModule(
        name="mobile-setup",
        description="Set up React Native project",
        type="mobile",
        technologies=["react native", "typescript"],
        dependencies=[],
        estimated_complexity="low",
        estimated_time="1 hour",
        files=["package.json", "app.json", "tsconfig.json"],
        tests=["setup.test.js"]
    ))
    
    # Navigation
    modules.append(DevelopmentModule(
        name="navigation",
        description="Implement app navigation",
        type="mobile",
        technologies=["react navigation"],
        dependencies=["mobile-setup"],
        estimated_complexity="medium",
        estimated_time="1-2 hours",
        files=["navigation/**/*.tsx"],
        tests=["navigation.test.js"]
    ))
    
    # Screens
    modules.append(DevelopmentModule(
        name="screens",
        description="Create app screens",
        type="mobile",
        technologies=["react native"],
        dependencies=["navigation"],
        estimated_complexity="medium",
        estimated_time="2-3 hours",
        files=["screens/**/*.tsx"],
        tests=["screens.test.js"]
    ))
    
    # Components
    modules.append(DevelopmentModule(
        name="mobile-components",
        description="Create reusable components",
        type="mobile",
        technologies=["react native"],
        dependencies=["mobile-setup"],
        estimated_complexity="medium",
        estimated_time="2-3 hours",
        files=["components/**/*.tsx"],
        tests=["components.test.js"]
    ))
    
    # State management
    modules.append(DevelopmentModule(
        name="state-management",
        description="Implement state management",
        type="mobile",
        technologies=["redux", "zustand"],
        dependencies=["screens"],
        estimated_complexity="medium",
        estimated_time="1-2 hours",
        files=["store/**/*.ts"],
        tests=["state.test.js"]
    ))
    
    return modules

def generate_library_modules(spec: Dict[str, Any]) -> List[DevelopmentModule]:
    """Generate modules for library projects."""
    modules = []
    
    # Core library setup
    modules.append(DevelopmentModule(
        name="library-setup",
        description="Set up library project structure",
        type="library",
        technologies=["typescript"],
        dependencies=[],
        estimated_complexity="low",
        estimated_time="30 minutes",
        files=["package.json", "tsconfig.json", "rollup.config.js"],
        tests=["setup.test.js"]
    ))
    
    # Core functionality
    modules.append(DevelopmentModule(
        name="core-functionality",
        description="Implement core library functionality",
        type="library",
        technologies=["typescript"],
        dependencies=["library-setup"],
        estimated_complexity="medium",
        estimated_time="2-3 hours",
        files=["src/**/*.ts"],
        tests=["core.test.js"]
    ))
    
    # Types and interfaces
    modules.append(DevelopmentModule(
        name="types-interfaces",
        description="Define types and interfaces",
        type="library",
        technologies=["typescript"],
        dependencies=["library-setup"],
        estimated_complexity="low",
        estimated_time="1 hour",
        files=["src/types/**/*.ts"],
        tests=["types.test.js"]
    ))
    
    # Documentation
    modules.append(DevelopmentModule(
        name="library-docs",
        description="Create library documentation",
        type="documentation",
        technologies=["markdown"],
        dependencies=["core-functionality"],
        estimated_complexity="low",
        estimated_time="1-2 hours",
        files=["docs/**/*.md", "README.md"],
        tests=["docs.test.js"]
    ))
    
    # Tests
    modules.append(DevelopmentModule(
        name="library-tests",
        description="Write comprehensive tests",
        type="testing",
        technologies=["jest", "typescript"],
        dependencies=["core-functionality"],
        estimated_complexity="medium",
        estimated_time="2-3 hours",
        files=["tests/**/*.test.ts"],
        tests=["test.test.js"]
    ))
    
    return modules

def ai_plan_modules(spec: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate a development plan based on the requirement specification.
    
    Args:
        spec: The normalized requirement specification
        
    Returns:
        List of module dictionaries
    """
    logger.info(f"Generating development plan for: {spec['title']}")
    
    try:
        # Create development plan
        plan = DevelopmentPlan(spec)
        
        # Generate modules based on project type
        proj_type = spec["type"]
        
        if proj_type == "web":
            modules = generate_web_modules(spec)
        elif proj_type == "api":
            modules = generate_api_modules(spec)
        elif proj_type == "mobile":
            modules = generate_mobile_modules(spec)
        elif proj_type == "library":
            modules = generate_library_modules(spec)
        else:
            # Default to web modules
            modules = generate_web_modules(spec)
        
        # Add modules to plan
        for module in modules:
            plan.add_module(module)
        
        # Calculate execution order and total time
        plan.calculate_execution_order()
        plan.calculate_total_time()
        
        logger.info(f"Generated {len(modules)} modules with execution order: {plan.execution_order}")
        logger.info(f"Total estimated time: {plan.total_estimated_time}")
        
        # Return modules as dictionaries
        return [m.to_dict() for m in plan.modules]
        
    except Exception as e:
        logger.error(f"Failed to generate development plan: {e}")
        # Return basic modules on error
        return [
            DevelopmentModule(
                name="basic-setup",
                description="Basic project setup",
                type="setup",
                technologies=["typescript"],
                dependencies=[],
                estimated_complexity="low",
                estimated_time="30 minutes"
            ).to_dict()
        ]

def save_development_plan(plan: Dict[str, Any], filepath: str = "ai/plans/latest.json") -> None:
    """Save development plan to file."""
    try:
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(plan, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Development plan saved to {filepath}")
    except Exception as e:
        logger.error(f"Failed to save development plan: {e}")

if __name__ == "__main__":
    # Example usage
    test_spec = {
        "title": "React Web Application",
        "description": "Create a React web application with TypeScript and Tailwind CSS that includes user authentication and data visualization.",
        "type": "web",
        "priority": "medium",
        "complexity": "medium",
        "technologies": ["react", "typescript", "tailwind"],
        "features": ["User authentication", "Data visualization", "Responsive design"],
        "constraints": ["Must be mobile responsive", "Use TypeScript"],
        "acceptance_criteria": ["Application should be responsive", "All features should work"]
    }
    
    modules = ai_plan_modules(test_spec)
    print("Generated Development Plan:")
    print(json.dumps(modules, indent=2))