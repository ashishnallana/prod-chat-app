from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from shared.database.postgres import get_db_session
from shared.kafka.producer import send_message
from shared.auth.jwt import create_access_token
from auth_service import models, schemas, utils

router = APIRouter()

@router.post("/signup", response_model=dict)
async def signup(user: schemas.UserCreate, db: AsyncSession = Depends(get_db_session)):
    # Check if user exists
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = utils.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Generate OTP and Store in Redis
    otp = utils.generate_otp()
    await utils.store_otp(user.email, otp)
    
    # Emit Kafka Event for OTP
    await send_message("otp_requested", {"email": user.email, "otp": otp})

    return {"message": "User created. OTP sent to email."}

@router.post("/verify-otp")
async def verify_otp(payload: schemas.OTPVerify, db: AsyncSession = Depends(get_db_session)):
    is_valid = await utils.verify_otp_from_redis(payload.email, payload.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    result = await db.execute(select(models.User).filter(models.User.email == payload.email))
    user = result.scalars().first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
         
    user.is_verified = True
    
    # Create an empty profile for the verified user
    profile = models.Profile(user_id=user.id)
    db.add(profile)
    
    await db.commit()
    return {"message": "Email verified successfully."}

@router.post("/login", response_model=schemas.Token)
async def login(payload: schemas.UserLogin, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(models.User).filter(models.User.email == payload.email))
    user = result.scalars().first()
    
    if not user or not utils.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/search", response_model=list[schemas.UserSearchResponse])
async def search_users(email: str, db: AsyncSession = Depends(get_db_session)):
    query = select(models.User).filter(models.User.email.ilike(f"%{email}%")).limit(20)
    result = await db.execute(query)
    users = result.scalars().all()
    return [{"id": u.id, "email": u.email} for u in users]
