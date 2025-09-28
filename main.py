from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import models, schemas, database, auth
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

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
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = auth.create_access_token({"sub": db_user.username})
    refresh_token = auth.create_refresh_token({"sub": db_user.username})
    db.add(models.RefreshToken(user_id=db_user.id, token=refresh_token, expires_at=datetime.utcnow() + timedelta(days=7)))
    db.commit()
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

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
def refresh_token(refresh_token: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = auth.decode_refresh_token(refresh_token.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    username = payload.get("sub")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == refresh_token.refresh_token, models.RefreshToken.user_id == user.id).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired or invalid")

    new_access_token = auth.create_access_token({"sub": user.username})

    return {"access_token": new_access_token, "token_type": "bearer", "refresh_token": refresh_token.refresh_token}