from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ProductRead(BaseModel):
    id: int
    name: str
    category: str
    description: str
    price: float

class ProductCreate(BaseModel):
    name: str
    category: str
    description: str
    price: float
