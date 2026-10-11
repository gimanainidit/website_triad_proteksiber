"""Explicit first-time table creation; this does not alter existing schemas."""
import asyncio
from database import engine
from models import Base


async def initialize():
    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(initialize())
    print("Missing tables created; existing schema was not migrated.")
