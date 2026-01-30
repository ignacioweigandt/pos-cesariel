"""
Router de Autenticación - Endpoints de Auth.

Gestiona login, logout y obtención de datos del usuario actual.
Protección contra brute force con rate limiting.

Endpoints:
    POST /auth/login: Login con OAuth2PasswordRequestForm (form-data)
    POST /auth/login-json: Login con JSON body
    GET /auth/me: Obtiene datos del usuario autenticado
    POST /auth/logout: Logout (client-side, invalida token)

Seguridad:
    - Rate limit: 5 intentos/minuto por IP
    - JWT tokens con expiración de 8 horas
    - Autenticación vía bcrypt
    - Validación de usuario activo

Dependencias:
    - authenticate_user(): Valida username/password
    - create_access_token(): Genera JWT
    - get_current_active_user(): Extrae user desde token
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from auth_compat import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user
from app.schemas import Token, UserLogin, User
from app.models import User as UserModel
from config.rate_limit import limiter, RateLimits

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=Token)
@limiter.limit(RateLimits.AUTH_LOGIN)  # 5 requests per minute
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint with rate limiting to prevent brute force attacks.
    
    Rate limit: 5 attempts per minute per IP address.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
@limiter.limit(RateLimits.AUTH_LOGIN)  # 5 requests per minute
async def login_json(request: Request, user_login: UserLogin, db: Session = Depends(get_db)):
    """
    JSON login endpoint with rate limiting to prevent brute force attacks.
    
    Rate limit: 5 attempts per minute per IP address.
    """
    user = authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user


@router.post("/logout")
async def logout():
    """
    Logout endpoint.
    Since JWT tokens are stateless, the actual logout is handled client-side
    by removing the token from storage. This endpoint just returns success.
    """
    return {"message": "Successfully logged out", "success": True}