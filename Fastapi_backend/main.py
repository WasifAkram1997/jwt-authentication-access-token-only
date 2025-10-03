from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Header, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database, auth
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# ✅ Allowed origins (React dev server)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # list of allowed origins
    allow_credentials=True,         # required for cookies (refresh token)
    allow_methods=["*"],            # allow all HTTP methods
    allow_headers=["*"],            # allow all headers (Authorization, Content-Type, etc.)
)


# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token({"sub": db_user.username})
    refresh_token = auth.create_refresh_token({"sub": db_user.username})

    # Save refresh token in DB
    db.add(models.RefreshToken(user_id=db_user.id, token=refresh_token, expires_at=datetime.utcnow() + timedelta(days=7)))
    db.commit()

    # Set refresh token in HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,        # set True in production (https)
        samesite="lax",     # or "strict" depending on your case
        max_age=7*24*60*60
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me")
def read_me(authorization: str = Header(...), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    
    token = authorization.split(" ")[1]
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    username = payload.get("sub")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user.id, "username": user.username}

@app.post("/refresh", response_model=schemas.Token)
def refresh_token(request: Request, db: Session = Depends(get_db)):
    # Read refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    payload = auth.decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    username = payload.get("sub")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == refresh_token, models.RefreshToken.user_id == user.id).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired or invalid")

    new_access_token = auth.create_access_token({"sub": user.username})

    return {"access_token": new_access_token, "token_type": "bearer"}

@app.get("/products", response_model=List[schemas.ProductRead])
def get_products(category: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] =None,  db : Session = Depends(get_db)):
    query = db.query(models.Products)
    if category:
        query = query.filter(models.Products.category == category)
    if min_price:
        query = query.filter(models.Products.price >= min_price)
    if max_price:
        query = query.filter(models.Products.price <= max_price)

    products_list = query.all()

    return products_list

@app.get("/products/{id}", response_model=schemas.ProductRead)
def get_product(id, db: Session = Depends(get_db)):
    product = db.query(models.Products).filter(models.Products.id == id ).first()
    return product

@app.post("/products", response_model=schemas.ProductRead)
def create(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Products).filter(models.Products.name == product.name).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product already exists")
    new_product = models.Products(name=product.name,category=product.category,description=product.description,price=product.price)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return
#
# @app.get("/products/maal", response_model=List[schemas.ProductRead])
#
# def get_product(category:str , db: Session = Depends(get_db)):
#     product_list = db.query(models.Products).filter(models.Products.category == category ).all()
#     return product_list