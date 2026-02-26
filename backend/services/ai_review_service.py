from typing import Dict, Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

from config import settings


class AIReviewService:
    async def review_document(self, text: str, template_name: Optional[str] = None) -> Dict[str, str]:
        prompt = f"Review this document: {template_name or 'no template'} \n{text[:1000]}"
        chat = LlmChat(api_key=settings.EMERGENT_LLM_KEY, session_id="ai-review").with_model("openai", "gpt-5.2")
        response = await chat.send_message(UserMessage(text=prompt))
        return {"review": response}
