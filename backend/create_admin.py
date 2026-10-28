"""Create the superadmin login, or reset its password if the email already exists.

Usage: python create_admin.py EMAIL   (password is read from stdin, never from argv)
"""
import asyncio
import getpass
import sys

from sqlalchemy import select

from auth_service import AuthService
from database import AsyncSessionLocal, engine
from models import User, UserRole


async def upsert_admin(db, email: str, password: str) -> User:
    email = email.strip().lower()
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if user is None:
        user = User(email=email)
        db.add(user)
    user.password_hash = AuthService.hash_password(password)
    user.role = UserRole.SUPERADMIN
    user.is_active = True
    await db.commit()
    return user


async def main(email: str, password: str) -> None:
    try:
        async with AsyncSessionLocal() as db:
            await upsert_admin(db, email, password)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    password = getpass.getpass("Password: ") if sys.stdin.isatty() else sys.stdin.readline().rstrip("\n")
    if len(password) < 12:
        sys.exit("Password must be at least 12 characters")
    if len(password.encode()) > 72:
        sys.exit("Password must be at most 72 bytes (bcrypt limit)")
    asyncio.run(main(sys.argv[1], password))
    print(f"Superadmin {sys.argv[1]} is ready.")
