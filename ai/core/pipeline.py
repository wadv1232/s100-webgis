"""
AI Auto-Code Pipeline Core Module

This module implements the main pipeline function that orchestrates the entire
AI-driven software development process from requirement to deployment.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import os

from .modules.requirement_normalizer import normalize_requirement
from .modules.planner import ai_plan_modules
from .modules.code_generator import ai_generate_code
from .modules.test_runner import run_tests, get_last_error
from .modules.code_fixer import ai_fix_code
from .modules.integrator import integrate_modules
from .modules.e2e_tester import run_e2e_tests
from .modules.reporter import generate_report
from .modules.github_pusher import push_github
from .utils.logger import setup_logger
from .utils.config import load_config

# Setup logging
logger = setup_logger(__name__)

class Module:
    """Represents a development module with its metadata and code."""
    
    def __init__(self, name: str, description: str, dependencies: List[str] = None):
        self.name = name
        self.description = description
        self.dependencies = dependencies or []
        self.code = ""
        self.tests = []
        self.status = "pending"
        self.error_history = []
        self.fix_attempts = 0
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert module to dictionary for serialization."""
        return {
            "name": self.name,
            "description": self.description,
            "dependencies": self.dependencies,
            "code": self.code,
            "tests": self.tests,
            "status": self.status,
            "error_history": self.error_history,
            "fix_attempts": self.fix_attempts,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Module':
        """Create module from dictionary."""
        module = cls(data["name"], data["description"], data["dependencies"])
        module.code = data["code"]
        module.tests = data["tests"]
        module.status = data["status"]
        module.error_history = data["error_history"]
        module.fix_attempts = data["fix_attempts"]
        module.created_at = datetime.fromisoformat(data["created_at"])
        module.updated_at = datetime.fromisoformat(data["updated_at"])
        return module

def save_code(module_name: str, code: str, output_dir: str = "src") -> None:
    """Save generated code to file system."""
    try:
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Determine file path based on module name
        if module_name.endswith(".py"):
            file_path = os.path.join(output_dir, module_name)
        elif module_name.endswith(".tsx") or module_name.endswith(".ts"):
            file_path = os.path.join(output_dir, module_name)
        else:
            # Default to Python file
            file_path = os.path.join(output_dir, f"{module_name}.py")
        
        # Write code to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        
        logger.info(f"Code saved to {file_path}")
        
    except Exception as e:
        logger.error(f"Failed to save code for module {module_name}: {e}")
        raise

def ai_autocode_pipeline(requirement: str, config_path: str = "ai/config/pipeline.json") -> Dict[str, Any]:
    """
    Main AI auto-code pipeline function.
    
    Args:
        requirement: The development requirement in natural language
        config_path: Path to pipeline configuration file
        
    Returns:
        Dictionary containing pipeline execution results
    """
    # Load configuration
    config = load_config(config_path)
    
    # Initialize pipeline state
    pipeline_start = datetime.now()
    pipeline_result = {
        "requirement": requirement,
        "start_time": pipeline_start.isoformat(),
        "modules": [],
        "success": False,
        "errors": [],
        "report": None
    }
    
    try:
        logger.info(f"Starting AI auto-code pipeline for requirement: {requirement[:100]}...")
        
        # Step 1: Normalize requirement
        logger.info("Step 1: Normalizing requirement...")
        spec = normalize_requirement(requirement)
        logger.info(f"Requirement normalized: {spec}")
        
        # Step 2: Generate development plan
        logger.info("Step 2: Generating development plan...")
        modules_data = ai_plan_modules(spec)
        modules = [Module.from_dict(m) for m in modules_data]
        logger.info(f"Generated {len(modules)} modules for development")
        
        # Step 3: Process each module
        logger.info("Step 3: Processing modules...")
        for i, module in enumerate(modules):
            logger.info(f"Processing module {i+1}/{len(modules)}: {module.name}")
            
            try:
                # Generate code
                logger.info(f"Generating code for {module.name}...")
                code = ai_generate_code(module)
                module.code = code
                module.status = "code_generated"
                
                # Save code
                save_code(module.name, code, config.get("output_dir", "src"))
                
                # Run tests
                logger.info(f"Running tests for {module.name}...")
                if not run_tests(module.tests):
                    logger.warning(f"Tests failed for {module.name}, attempting fix...")
                    error = get_last_error()
                    module.error_history.append(error)
                    
                    # Fix code
                    fix = ai_fix_code(module, error)
                    module.code = fix
                    module.fix_attempts += 1
                    module.status = "fixed"
                    
                    # Save fixed code
                    save_code(module.name, fix, config.get("output_dir", "src"))
                    
                    # Re-run tests
                    if not run_tests(module.tests):
                        logger.error(f"Tests still failing for {module.name} after fix")
                        module.status = "failed"
                        pipeline_result["errors"].append(f"Module {module.name} failed tests")
                    else:
                        logger.info(f"Tests passed for {module.name} after fix")
                        module.status = "completed"
                else:
                    logger.info(f"Tests passed for {module.name}")
                    module.status = "completed"
                
                module.updated_at = datetime.now()
                
            except Exception as e:
                logger.error(f"Error processing module {module.name}: {e}")
                module.status = "error"
                module.error_history.append(str(e))
                pipeline_result["errors"].append(f"Module {module.name} failed: {str(e)}")
        
        # Step 4: Integrate modules
        logger.info("Step 4: Integrating modules...")
        try:
            integrate_modules(modules)
            logger.info("Modules integrated successfully")
        except Exception as e:
            logger.error(f"Module integration failed: {e}")
            pipeline_result["errors"].append(f"Integration failed: {str(e)}")
        
        # Step 5: Run end-to-end tests
        logger.info("Step 5: Running end-to-end tests...")
        try:
            e2e_results = run_e2e_tests()
            logger.info(f"End-to-end tests completed: {e2e_results}")
        except Exception as e:
            logger.error(f"End-to-end tests failed: {e}")
            pipeline_result["errors"].append(f"E2E tests failed: {str(e)}")
        
        # Step 6: Generate report
        logger.info("Step 6: Generating report...")
        try:
            report = generate_report(modules, pipeline_result)
            pipeline_result["report"] = report
            logger.info("Report generated successfully")
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            pipeline_result["errors"].append(f"Report generation failed: {str(e)}")
        
        # Step 7: Push to GitHub (if configured)
        logger.info("Step 7: Pushing to GitHub...")
        try:
            if config.get("auto_push", False):
                push_github()
                logger.info("Changes pushed to GitHub successfully")
            else:
                logger.info("GitHub push skipped (auto_push disabled)")
        except Exception as e:
            logger.error(f"GitHub push failed: {e}")
            pipeline_result["errors"].append(f"GitHub push failed: {str(e)}")
        
        # Update pipeline result
        pipeline_result["modules"] = [m.to_dict() for m in modules]
        pipeline_result["success"] = len(pipeline_result["errors"]) == 0
        pipeline_result["end_time"] = datetime.now().isoformat()
        
        logger.info("AI auto-code pipeline completed successfully")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        pipeline_result["errors"].append(f"Pipeline failed: {str(e)}")
        pipeline_result["end_time"] = datetime.now().isoformat()
    
    # Save pipeline result
    try:
        result_file = os.path.join(config.get("output_dir", "docs"), f"pipeline_result_{pipeline_start.strftime('%Y%m%d_%H%M%S')}.json")
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(pipeline_result, f, indent=2, ensure_ascii=False)
        logger.info(f"Pipeline result saved to {result_file}")
    except Exception as e:
        logger.error(f"Failed to save pipeline result: {e}")
    
    return pipeline_result

async def ai_autocode_pipeline_async(requirement: str, config_path: str = "ai/config/pipeline.json") -> Dict[str, Any]:
    """
    Async version of the AI auto-code pipeline.
    
    Args:
        requirement: The development requirement in natural language
        config_path: Path to pipeline configuration file
        
    Returns:
        Dictionary containing pipeline execution results
    """
    # Run the pipeline in a thread pool to avoid blocking
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, ai_autocode_pipeline, requirement, config_path)

if __name__ == "__main__":
    # Example usage
    if len(sys.argv) > 1:
        requirement = " ".join(sys.argv[1:])
        result = ai_autocode_pipeline(requirement)
        print(f"Pipeline completed with success: {result['success']}")
    else:
        print("Usage: python pipeline.py <requirement>")