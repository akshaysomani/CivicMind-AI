from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    email: EmailStr
    phone: str = Field(..., max_length=20)
    role: str = Field(..., description="Citizen, Government, NGO, Admin")
    sub_role: Optional[str] = Field(None, max_length=50)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)
    organization: Optional[str] = Field(None, max_length=100)

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    organization: Optional[str] = Field(None, max_length=100)
    sub_role: Optional[str] = Field(None, max_length=50)

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, description="Must be at least 8 characters")

class UserResponse(UserBase):
    id: int
    profile_image: Optional[str] = None
    address: Optional[str] = None
    email_verified: bool
    account_status: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
