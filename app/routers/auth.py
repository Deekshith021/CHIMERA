from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.utils.db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

# =========================
# REGISTER (SIGN UP)
# =========================
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    data: UserCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}

# =========================
# LOGIN
# =========================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user or not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=ACCESS_TOKEN_EXPIRE_MINUTES,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
