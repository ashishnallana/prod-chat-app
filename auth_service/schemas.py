from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None

class ProfileResponse(BaseModel):
    user_id: int
    name: Optional[str]
    bio: Optional[str]
    profile_picture_url: Optional[str]

class UserSearchResponse(BaseModel):
    id: int
    email: EmailStr
