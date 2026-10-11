# Backend AI configuration

AI content generation, resource transformation, quizzes, and document reviews use
the official OpenAI Python SDK and the Responses API.

Install `requirements.txt` in your Python environment. Copy `.env.example` to
`.env` in this directory without overwriting existing configuration, and set
`OPENAI_API_KEY` to your own OpenAI API key. `OPENAI_MODEL` defaults to `gpt-5.2`
and can select another Responses API compatible model available to your account.
Process environment variables take precedence over `.env`. The frontend must
never receive this key.

The CMS still requires its existing PostgreSQL, Supabase, JWT, and n8n settings.
Session IDs in AI results are request metadata; they do not store conversation
history in OpenAI.

Run the isolated AI SDK tests from the repository root with:

```sh
PYTHONPATH=backend python -m pytest tests/test_openai_services.py
```

These tests exercise SDK requests with a simulated HTTP transport and do not
require credentials or make paid API calls.
