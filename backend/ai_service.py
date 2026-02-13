import asyncio
import os
import uuid
from typing import Dict, List, Optional, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

class AIContentGenerator:
    """AI service for generating educational materials"""
    
    def __init__(self):
        load_dotenv()
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
    
    async def generate_educational_material(
        self,
        prompt: str,
        material_type: str = "guide",
        context: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate educational material based on prompt
        
        Args:
            prompt: User's content generation request
            material_type: Type of material (guide, checklist, template, etc.)
            context: Optional context from existing resources
            session_id: Optional session ID for conversation tracking
            
        Returns:
            Dictionary containing generated content and metadata
        """
        try:
            # Create session ID if not provided
            if not session_id:
                session_id = f"content_gen_{uuid.uuid4()}"
            
            # System message based on material type
            system_messages = {
                "guide": "You are an expert cybersecurity educator creating comprehensive guides. Create detailed, structured, and practical educational content.",
                "checklist": "You are a cybersecurity consultant creating actionable checklists. Focus on clear, step-by-step items that can be easily followed.",
                "template": "You are a cybersecurity documentation expert creating professional templates. Ensure the format is practical and reusable.",
                "whitepaper": "You are a cybersecurity researcher writing authoritative whitepapers. Create in-depth, well-researched content with proper structure.",
                "report": "You are a cybersecurity analyst creating professional reports. Structure the content with clear sections, findings, and recommendations."
            }
            
            system_message = system_messages.get(material_type, system_messages["guide"])
            
            # Enhanced prompt based on material type and context
            enhanced_prompt = self._enhance_prompt(prompt, material_type, context)
            
            # Initialize LLM chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-5.2")
            
            # Create user message
            user_message = UserMessage(text=enhanced_prompt)
            
            # Generate content
            response = await chat.send_message(user_message)
            
            return {
                "success": True,
                "content": response,
                "material_type": material_type,
                "session_id": session_id,
                "prompt": prompt,
                "word_count": len(response.split()),
                "generated_at": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "material_type": material_type,
                "session_id": session_id,
                "prompt": prompt
            }
    
    async def generate_from_existing_resource(
        self,
        resource_content: str,
        generation_type: str,
        specific_prompt: str
    ) -> Dict[str, Any]:
        """
        Generate new content based on existing resource
        
        Args:
            resource_content: Existing resource text
            generation_type: Type of generation (summary, quiz, expanded_guide, etc.)
            specific_prompt: Specific user request
            
        Returns:
            Generated content based on existing resource
        """
        try:
            session_id = f"resource_gen_{uuid.uuid4()}"
            
            # System message for resource-based generation
            system_message = """You are an expert cybersecurity educator who can transform existing educational materials into different formats. 
            You can create summaries, quizzes, expanded guides, checklists, and other educational materials from source content."""
            
            # Create enhanced prompt with context
            context_prompt = f"""
            Based on the following existing resource content, please {generation_type}:
            
            EXISTING RESOURCE CONTENT:
            {resource_content}
            
            SPECIFIC REQUEST:
            {specific_prompt}
            
            Please create high-quality educational material that builds upon the existing content.
            """
            
            # Initialize chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-5.2")
            
            # Generate response
            user_message = UserMessage(text=context_prompt)
            response = await chat.send_message(user_message)
            
            return {
                "success": True,
                "content": response,
                "generation_type": generation_type,
                "session_id": session_id,
                "source_length": len(resource_content.split()),
                "output_length": len(response.split()),
                "generated_at": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "generation_type": generation_type,
                "specific_prompt": specific_prompt
            }
    
    async def create_quiz_from_content(
        self, 
        content: str, 
        question_count: int = 5,
        difficulty: str = "intermediate"
    ) -> Dict[str, Any]:
        """Generate quiz questions from educational content"""
        try:
            session_id = f"quiz_gen_{uuid.uuid4()}"
            
            system_message = """You are an expert cybersecurity educator creating assessment questions. 
            Create engaging, practical quiz questions that test understanding and application of concepts."""
            
            quiz_prompt = f"""
            Create {question_count} {difficulty}-level quiz questions based on this content:
            
            {content}
            
            For each question, provide:
            1. The question
            2. 4 multiple choice options (A, B, C, D)
            3. The correct answer
            4. A brief explanation of why the answer is correct
            
            Focus on practical understanding and real-world application of cybersecurity concepts.
            """
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-5.2")
            
            response = await chat.send_message(UserMessage(text=quiz_prompt))
            
            return {
                "success": True,
                "quiz_content": response,
                "question_count": question_count,
                "difficulty": difficulty,
                "session_id": session_id,
                "generated_at": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "question_count": question_count,
                "difficulty": difficulty
            }
    
    def _enhance_prompt(self, prompt: str, material_type: str, context: Optional[str] = None) -> str:
        """Enhance user prompt with structure and context"""
        
        structure_guides = {
            "guide": """
            Create a comprehensive guide with:
            1. Clear introduction and objectives
            2. Step-by-step instructions
            3. Best practices and tips
            4. Common pitfalls to avoid
            5. Conclusion with key takeaways
            """,
            "checklist": """
            Create an actionable checklist with:
            1. Clear, concise action items
            2. Checkboxes for easy tracking
            3. Priority levels if applicable
            4. Brief explanations where needed
            5. Resources or references
            """,
            "template": """
            Create a professional template with:
            1. Structured format with clear sections
            2. Placeholder text and instructions
            3. Professional language and tone
            4. Reusable components
            5. Usage guidelines
            """,
            "whitepaper": """
            Create an authoritative whitepaper with:
            1. Executive summary
            2. Problem statement
            3. Analysis and findings
            4. Recommendations
            5. Conclusion and next steps
            """,
            "report": """
            Create a professional report with:
            1. Executive summary
            2. Methodology or approach
            3. Key findings and analysis
            4. Recommendations
            5. Appendices if needed
            """
        }
        
        structure = structure_guides.get(material_type, structure_guides["guide"])
        
        enhanced_prompt = f"""
        USER REQUEST: {prompt}
        
        MATERIAL TYPE: {material_type}
        
        STRUCTURE TO FOLLOW:
        {structure}
        
        CONTEXT (if applicable):
        {context if context else "No additional context provided"}
        
        Please create high-quality, professional educational material that follows cybersecurity best practices and industry standards.
        """
        
        return enhanced_prompt