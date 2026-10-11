"""Shared text generation using the official OpenAI SDK."""
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import AsyncOpenAI


class OpenAITextGenerator:
    def __init__(self):
        load_dotenv(Path(__file__).parent / ".env")
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables or backend/.env")
        self.model = os.environ.get("OPENAI_MODEL") or "gpt-5.2"
        self.client = AsyncOpenAI(api_key=api_key, timeout=120.0, max_retries=2)

    async def generate(self, prompt: str, system_message: str = "") -> str:
        response = await self.client.responses.create(
            model=self.model,
            instructions=system_message,
            input=prompt,
        )
        if not response.output_text.strip():
            raise ValueError("OpenAI returned no text content")
        return response.output_text
