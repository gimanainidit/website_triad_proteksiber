from typing import Dict, Optional

from openai_service import OpenAITextGenerator


class AIReviewService:
    async def review_document(self, text: str, template_name: Optional[str] = None) -> Dict[str, str]:
        prompt = f"Review this document: {template_name or 'no template'} \n{text[:1000]}"
        generator = OpenAITextGenerator()
        async with generator.client:
            response = await generator.generate(prompt)
        return {"review": response}
