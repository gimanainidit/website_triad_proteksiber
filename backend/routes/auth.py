from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service import AuthService
from dependencies import get_current_user
from database import get_db
from models import User, AdminSession
from config import settings

router = APIRouter(prefix="/auth")


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    email = form_data.username.strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not AuthService.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_data = AuthService.create_token(user)
    session = AdminSession(
        user_id=user.id,
        token=token_data["access_token"],
        token_expires_at=datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    )
    db.add(session)
    await db.commit()
    return {"access_token": token_data["access_token"], "token_type": "bearer"}


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(AdminSession).where(AdminSession.user_id == current_user.id))
    await db.commit()
    return {"message": "Logged out"}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role.value,
        "full_name": current_user.full_name,
    }
