import asyncio
import json

import httpx
import pytest
from openai import AsyncOpenAI

import openai_service
from ai_service import AIContentGenerator
from services.ai_review_service import AIReviewService


@pytest.fixture
def sdk_transport(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("OPENAI_MODEL", "test-model")
    monkeypatch.setattr(openai_service, "load_dotenv", lambda path: None)
    state = {"requests": [], "text": "Keep passwords unique.", "status": 200}

    def handle(request):
        assert str(request.url) == "https://api.openai.com/v1/responses"
        assert request.method == "POST"
        state["requests"].append(json.loads(request.content))
        if state["status"] != 200:
            return httpx.Response(state["status"], json={
                "error": {"message": "Invalid API key", "type": "invalid_request_error",
                          "code": "invalid_api_key"}
            })
        return httpx.Response(200, json={
            "id": "resp_test", "object": "response", "created_at": 0,
            "model": "test-model", "status": "completed",
            "output": [{"id": "msg_test", "type": "message", "role": "assistant",
                        "status": "completed", "content": [{"type": "output_text",
                        "text": state["text"], "annotations": []}]}],
        })

    def client(**kwargs):
        kwargs["max_retries"] = 0
        return AsyncOpenAI(**kwargs, http_client=httpx.AsyncClient(
            transport=httpx.MockTransport(handle)))

    monkeypatch.setattr(openai_service, "AsyncOpenAI", client)
    return state


@pytest.mark.parametrize("workflow", ["material", "resource", "quiz"])
def test_content_workflows_use_openai_and_preserve_results(sdk_transport, workflow):
    async def run():
        generator = AIContentGenerator()
        try:
            if workflow == "material":
                result = await generator.generate_educational_material(
                    "Password training", "checklist", "For administrators", "request-123")
                assert result["session_id"] == "request-123"
                assert result["material_type"] == "checklist"
                assert result["word_count"] == 3
                assert result["content"] == sdk_transport["text"]
                assert "For administrators" in sdk_transport["requests"][0]["input"]
            elif workflow == "resource":
                result = await generator.generate_from_existing_resource(
                    "Use unique passwords", "summary", "Keep it brief")
                assert result["generation_type"] == "summary"
                assert result["source_length"] == 3
                assert result["output_length"] == 3
                assert result["content"] == sdk_transport["text"]
                assert "Use unique passwords" in sdk_transport["requests"][0]["input"]
            else:
                result = await generator.create_quiz_from_content(
                    "Password hygiene", 3, "beginner")
                assert result["quiz_content"] == sdk_transport["text"]
                assert result["question_count"] == 3
                assert result["difficulty"] == "beginner"
                assert "3 beginner-level" in sdk_transport["requests"][0]["input"]
            assert result["success"] is True
            assert result["session_id"]
            request = sdk_transport["requests"][0]
            assert request["model"] == "test-model"
            assert "cybersecurity" in request["instructions"]
        finally:
            await generator.close()

    asyncio.run(run())


def test_document_review_uses_openai_and_limits_input(sdk_transport):
    result = asyncio.run(AIReviewService().review_document("x" * 1200, "Policy"))
    assert result == {"review": sdk_transport["text"]}
    request = sdk_transport["requests"][0]
    assert request["model"] == "test-model"
    assert request["input"] == "Review this document: Policy \n" + "x" * 1000


@pytest.mark.parametrize("failure", ["empty", "authentication"])
def test_generation_reports_provider_failures(sdk_transport, failure):
    if failure == "empty":
        sdk_transport["text"] = "  "
    else:
        sdk_transport["status"] = 401

    async def run():
        generator = AIContentGenerator()
        try:
            return await generator.generate_educational_material("Password training")
        finally:
            await generator.close()

    result = asyncio.run(run())
    assert result["success"] is False
    assert "content" not in result
    assert ("no text content" if failure == "empty" else "Invalid API key") in result["error"]


def test_missing_key_does_not_fall_back_to_emergent(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("EMERGENT_LLM_KEY", "obsolete-test-key")
    monkeypatch.setattr(openai_service, "load_dotenv", lambda path: None)
    with pytest.raises(ValueError, match="OPENAI_API_KEY"):
        AIContentGenerator()


def test_default_model_and_explicit_backend_dotenv(sdk_transport, monkeypatch):
    monkeypatch.delenv("OPENAI_MODEL", raising=False)
    paths = []
    monkeypatch.setattr(openai_service, "load_dotenv", paths.append)

    async def run():
        generator = AIContentGenerator()
        try:
            await generator.generate_educational_material("Password training")
        finally:
            await generator.close()

    asyncio.run(run())
    assert sdk_transport["requests"][0]["model"] == "gpt-5.2"
    assert paths == [openai_service.Path(openai_service.__file__).parent / ".env"]
