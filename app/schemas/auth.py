from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserResponse

class UserRegister(BaseModel):
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    email: EmailStr
    phone: str = Field(..., max_length=20)
    password: str = Field(..., min_length=8)
    role: str = Field(..., description="Citizen, Government, NGO, Admin")
    sub_role: Optional[str] = Field(None, max_length=50)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)
    organization: Optional[str] = Field(None, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class VerifyEmailRequest(BaseModel):
    token: str

class MessageResponse(BaseModel):
    message: str
