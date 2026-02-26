from datetime import datetime, timedelta
from typing import Dict

import bcrypt
import jwt

from fastapi import HTTPException
from config import settings
from models import User, UserRole


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode(), hashed.encode())

    @staticmethod
    def create_token(user: User) -> Dict[str, str]:
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
        }
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": settings.JWT_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    def verify_token(token: str) -> Dict:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
