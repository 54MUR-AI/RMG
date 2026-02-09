# How-to: FastAPI Backend Development

**Category:** Backend  
**Difficulty:** Intermediate  
**Tags:** #fastapi #python #api #backend #rest

---

## Overview

FastAPI is a modern, high-performance Python web framework for building APIs. It's used in RMG projects like SCRP for its speed, automatic documentation, and type safety. This guide covers setup, patterns, and best practices.

## What You'll Learn

- FastAPI project setup and structure
- Route definitions and path operations
- Request/response models with Pydantic
- Dependency injection
- Authentication and middleware
- Database integration
- Error handling and validation
- Deployment strategies

---

## Prerequisites

- Python 3.8+ installed
- Basic Python knowledge
- Understanding of REST APIs
- Familiarity with async/await

---

## Installation

```bash
pip install fastapi uvicorn[standard] python-multipart
```

---

## Basic Setup

### Minimal Application

```python
# main.py
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    description="API description",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Run with: uvicorn main:app --reload
```

### Project Structure

```
my-api/
├── api/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── routes/           # Route handlers
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── items.py
│   ├── models/           # Pydantic models
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services/         # Business logic
│   │   └── user_service.py
│   └── dependencies.py   # Dependency injection
├── requirements.txt
└── .env
```

---

## Route Operations

### Basic CRUD

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Item(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float

# In-memory storage (use database in production)
items_db = {}

@app.post("/items/", response_model=Item, status_code=201)
async def create_item(item: Item):
    if item.id in items_db:
        raise HTTPException(status_code=400, detail="Item already exists")
    items_db[item.id] = item
    return item

@app.get("/items/", response_model=List[Item])
async def list_items():
    return list(items_db.values())

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: Item):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    items_db[item_id] = item
    return item

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    del items_db[item_id]
    return {"message": "Item deleted"}
```

### Path and Query Parameters

```python
from typing import Optional

@app.get("/items/{item_id}")
async def get_item(
    item_id: int,                    # Path parameter
    q: Optional[str] = None,         # Optional query parameter
    skip: int = 0,                   # Query parameter with default
    limit: int = 10
):
    result = {"item_id": item_id}
    if q:
        result["q"] = q
    return result

# Example: GET /items/5?q=search&skip=0&limit=20
```

---

## Request/Response Models

### Pydantic Models

```python
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_strength(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain a number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain an uppercase letter')
        return v

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool

    class Config:
        orm_mode = True  # For SQLAlchemy models

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
```

### Using Models

```python
@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user in database
    db_user = {
        "id": generate_id(),
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.now(),
        "is_active": True
    }
    
    # Return response (password excluded automatically)
    return db_user
```

---

## Dependency Injection

### Basic Dependencies

```python
from fastapi import Depends, Header, HTTPException

async def get_token_header(x_token: str = Header(...)):
    if x_token != "secret-token":
        raise HTTPException(status_code=400, detail="Invalid token")
    return x_token

@app.get("/protected/")
async def protected_route(token: str = Depends(get_token_header)):
    return {"message": "Access granted", "token": token}
```

### Database Dependency

```python
from sqlalchemy.orm import Session
from database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Current User Dependency

```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@app.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

---

## Authentication

### JWT Authentication

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
```

---

## Middleware

### CORS Middleware

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourapp.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Custom Middleware

```python
from fastapi import Request
import time

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

---

## Error Handling

### Custom Exception Handlers

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class CustomException(Exception):
    def __init__(self, name: str, detail: str):
        self.name = name
        self.detail = detail

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=400,
        content={"error": exc.name, "detail": exc.detail}
    )

@app.get("/trigger-error")
async def trigger_error():
    raise CustomException(name="CustomError", detail="Something went wrong")
```

### Validation Error Handling

```python
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body}
    )
```

---

## Background Tasks

```python
from fastapi import BackgroundTasks

def send_email(email: str, message: str):
    # Simulate sending email
    print(f"Sending email to {email}: {message}")

@app.post("/send-notification/")
async def send_notification(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email, email, "Welcome!")
    return {"message": "Notification sent in the background"}
```

---

## File Upload

```python
from fastapi import File, UploadFile
from typing import List

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    # Process file
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }

@app.post("/upload-multiple/")
async def upload_multiple(files: List[UploadFile] = File(...)):
    return [{"filename": file.filename} for file in files]
```

---

## WebSocket Support

```python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message received: {data}")
    except Exception as e:
        print(f"WebSocket error: {e}")
```

---

## Testing

```python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_item():
    response = client.post(
        "/items/",
        json={"id": 1, "name": "Test", "price": 10.5}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test"
```

---

## RMG Project Pattern: SCRP API

```python
# SCRP scraping endpoint
from pydantic import BaseModel, HttpUrl

class ScrapeRequest(BaseModel):
    url: HttpUrl
    summarize: bool = True
    provider: str = "huggingface"
    api_key: str | None = None
    model: str | None = None

class ScrapeResponse(BaseModel):
    success: bool
    summary: dict | None = None
    error: str | None = None

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_url(request: ScrapeRequest):
    try:
        # Scrape content
        content = await scrape_website(str(request.url))
        
        # Summarize if requested
        if request.summarize:
            summary = await summarize_content(
                content,
                provider=request.provider,
                api_key=request.api_key,
                model=request.model
            )
            return ScrapeResponse(success=True, summary=summary)
        
        return ScrapeResponse(success=True, summary={"content": content})
    
    except Exception as e:
        return ScrapeResponse(success=False, error=str(e))
```

---

## Best Practices

1. **Use Pydantic models** - Type safety and validation
2. **Implement proper error handling** - Return meaningful errors
3. **Use dependency injection** - Keep code modular and testable
4. **Add API documentation** - FastAPI auto-generates it
5. **Validate all inputs** - Use Pydantic validators
6. **Use async/await** - Better performance for I/O operations
7. **Implement rate limiting** - Protect your API
8. **Log everything** - Use structured logging
9. **Version your API** - `/api/v1/` prefix
10. **Write tests** - Use TestClient

---

## Deployment

### With Uvicorn

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### With Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### With Gunicorn

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Pydantic Documentation](https://docs.pydantic.dev)
- [Uvicorn Documentation](https://www.uvicorn.org)

---

**Questions?** Drop a reply below or check out our other backend guides!
