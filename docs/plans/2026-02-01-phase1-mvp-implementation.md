# Silicon Sample Simulator - Phase 1 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimum viable product that enables researchers to create simple surveys, generate synthetic participants with specified demographics, execute experiments using LLMs, and analyze basic results.

**Architecture:**
- **Backend**: FastAPI + Python 3.11+ with PostgreSQL for data storage
- **Frontend**: React + TypeScript + Vite with TailwindCSS
- **LLM Integration**: OpenAI SDK (extendable to other providers)
- **Analysis**: pandas for basic descriptive statistics

**Tech Stack:**
- Backend: FastAPI, SQLAlchemy, Pydantic, OpenAI, psycopg3, pytest
- Frontend: React, TypeScript, Vite, TailwindCSS, React Query, Axios
- Database: PostgreSQL 15+
- Development: Docker Compose for local PostgreSQL

---

## Task 1: Initialize Project Structure

**Files:**
- Create: `README.md`
- Create: `docker-compose.yml`
- Create: `backend/requirements.txt`
- Create: `backend/pyproject.toml`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `backend/.env.example`
- Create: `frontend/.env.example`
- Create: `.gitignore`

**Step 1: Create project README**

```markdown
# Silicon Sample Simulator

LLM-based synthetic participant platform for psychology research.

## Quick Start

1. Start PostgreSQL:
```bash
docker-compose up -d
```

2. Backend setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn app.main:app --reload
```

3. Frontend setup:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Development

Backend runs on http://localhost:8000
Frontend runs on http://localhost:5173
API docs: http://localhost:8000/docs
```

**Step 2: Create Docker Compose for PostgreSQL**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: silicon_sample_db
    environment:
      POSTGRES_USER: silicon_user
      POSTGRES_PASSWORD: silicon_pass
      POSTGRES_DB: silicon_samples
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Step 3: Create backend requirements.txt**

Create `backend/requirements.txt`:

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg[binary]==3.1.16
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
openai==1.10.0
pandas==2.2.0
numpy==1.26.3
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0
```

**Step 4: Create backend pyproject.toml**

Create `backend/pyproject.toml`:

```toml
[project]
name = "silicon-sample-simulator"
version = "0.1.0"
description = "LLM-based synthetic participant platform"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.25",
    "psycopg[binary]>=3.1.16",
    "pydantic>=2.5.3",
    "pydantic-settings>=2.1.0",
    "python-dotenv>=1.0.0",
    "openai>=1.10.0",
    "pandas>=2.2.0",
    "numpy>=1.26.3",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
asyncio_mode = "auto"
```

**Step 5: Create frontend package.json**

Create `frontend/package.json`:

```json
{
  "name": "silicon-sample-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "@tanstack/react-query": "^5.17.19",
    "axios": "^1.6.5",
    "lucide-react": "^0.309.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
```

**Step 6: Create frontend TypeScript config**

Create `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 7: Create frontend Vite config**

Create `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 8: Create backend .env.example**

Create `backend/.env.example`:

```env
# Database
DATABASE_URL=postgresql://silicon_user:silicon_pass@localhost:5432/silicon_samples

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# OpenAI (user-provided)
# OPENAI_API_KEY=your_key_here
```

**Step 9: Create frontend .env.example**

Create `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

**Step 10: Create .gitignore**

Create `.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
.env
*.egg-info/

# Node
node_modules/
dist/
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

**Step 11: Start PostgreSQL**

Run: `docker-compose up -d`
Expected: PostgreSQL container starts on port 5432

**Step 12: Commit**

```bash
git add .
git commit -m "chore: initialize project structure and dependencies"
```

---

## Task 2: Backend Database Models and Configuration

**Files:**
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/app/database.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/experiment.py`
- Create: `backend/app/models/participant.py`
- Create: `backend/app/models/response.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/experiment.py`

**Step 1: Create backend app package**

Create `backend/app/__init__.py` (empty file):

```python
# This file makes the directory a Python package
```

**Step 2: Write configuration test**

Create `tests/test_config.py`:

```python
import os
from app.config import settings

def test_settings_loaded():
    assert settings.DATABASE_URL
    assert settings.API_PORT == 8000

def test_database_url_format():
    assert "postgresql://" in settings.DATABASE_URL
    assert "silicon_samples" in settings.DATABASE_URL
```

**Step 3: Run test to verify it fails**

Run: `cd backend && pytest tests/test_config.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app'"

**Step 4: Implement configuration module**

Create `backend/app/config.py`:

```python
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://silicon_user:silicon_pass@localhost:5432/silicon_samples"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

**Step 5: Run test to verify it passes**

Run: `cd backend && pytest tests/test_config.py -v`
Expected: PASS

**Step 6: Write database connection test**

Create `tests/test_database.py`:

```python
import pytest
from app.database import get_db_engine, Base
from sqlalchemy import text

def test_database_connects():
    engine = get_db_engine()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1

def test_base_metadata_exists():
    assert hasattr(Base, 'metadata')
```

**Step 7: Run test to verify it fails**

Run: `cd backend && pytest tests/test_database.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app.database'"

**Step 8: Implement database module**

Create `backend/app/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = get_db_engine = lambda: create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine())

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Step 9: Run test to verify it passes**

Run: `cd backend && pytest tests/test_database.py -v`
Expected: PASS

**Step 10: Write experiment model test**

Create `tests/test_models.py`:

```python
from app.models.experiment import Experiment
from datetime import datetime

def test_experiment_model_creation():
    exp = Experiment(
        name="Test Experiment",
        description="A test experiment",
        status="draft",
        sample_config={"age_range": [18, 65]},
        experiment_config={"questions": []},
    )
    assert exp.name == "Test Experiment"
    assert exp.status == "draft"
    assert isinstance(exp.created_at, datetime)
```

**Step 11: Run test to verify it fails**

Run: `cd backend && pytest tests/test_models.py::test_experiment_model_creation -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app.models'"

**Step 12: Implement experiment model**

Create `backend/app/models/__init__.py`:

```python
from .experiment import Experiment
from .participant import Participant
from .response import Response
```

Create `backend/app/models/experiment.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="draft", nullable=False)
    sample_config = Column(JSON, nullable=True)
    experiment_config = Column(JSON, nullable=True)
    execution_settings = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Step 13: Run test to verify it passes**

Run: `cd backend && pytest tests/test_models.py::test_experiment_model_creation -v`
Expected: PASS

**Step 14: Implement participant model**

Create `backend/app/models/participant.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    participant_number = Column(Integer, nullable=False)
    profile = Column(JSON, nullable=False)
    validation_flags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    experiment = relationship("Experiment", back_populates="participants")
```

**Step 15: Implement response model**

Create `backend/app/models/response.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    question_id = Column(String(255), nullable=False)
    raw_response = Column(Text, nullable=False)
    coded_response = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    quality_flags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participant = relationship("Participant", back_populates="responses")
```

**Step 16: Update experiment model with relationships**

Edit `backend/app/models/experiment.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="draft", nullable=False)
    sample_config = Column(JSON, nullable=True)
    experiment_config = Column(JSON, nullable=True)
    execution_settings = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    participants = relationship("Participant", back_populates="experiment", cascade="all, delete-orphan")
```

**Step 17: Update participant model with relationships**

Edit `backend/app/models/participant.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    participant_number = Column(Integer, nullable=False)
    profile = Column(JSON, nullable=False)
    validation_flags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    experiment = relationship("Experiment", back_populates="participants")
    responses = relationship("Response", back_populates="participant", cascade="all, delete-orphan")
```

**Step 18: Implement Pydantic schemas**

Create `backend/app/schemas/__init__.py`:

```python
from .experiment import ExperimentCreate, ExperimentResponse, ExperimentUpdate
```

Create `backend/app/schemas/experiment.py`:

```python
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class ExperimentBase(BaseModel):
    name: str
    description: Optional[str] = None
    sample_config: Optional[Dict[str, Any]] = None
    experiment_config: Optional[Dict[str, Any]] = None
    execution_settings: Optional[Dict[str, Any]] = None


class ExperimentCreate(ExperimentBase):
    pass


class ExperimentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    sample_config: Optional[Dict[str, Any]] = None
    experiment_config: Optional[Dict[str, Any]] = None
    execution_settings: Optional[Dict[str, Any]] = None


class ExperimentResponse(ExperimentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

**Step 19: Write test for database schema creation**

Create `tests/test_schema.py`:

```python
from app.database import engine, Base
from app.models import Experiment, Participant, Response

def test_create_tables():
    Base.metadata.create_all(bind=engine)
    # If this runs without error, tables were created successfully
    assert True
```

**Step 20: Run schema test**

Run: `cd backend && pytest tests/test_schema.py -v`
Expected: PASS (creates tables in PostgreSQL)

**Step 21: Commit**

```bash
git add backend/
git commit -m "feat: implement database models and configuration"
```

---

## Task 3: FastAPI Application with CRUD Endpoints

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/deps.py`
- Create: `backend/app/api/v1/__init__.py`
- Create: `backend/app/api/v1/experiments.py`
- Create: `backend/app/main.py` (overwrite)
- Modify: `tests/test_api.py` (new)

**Step 1: Write API dependency test**

Create `tests/test_api_deps.py`:

```python
from app.api.deps import get_db
from sqlalchemy.orm import Session

def test_get_db_returns_session():
    gen = get_db()
    db = next(gen)
    assert isinstance(db, Session)
    db.close()
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_api_deps.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app.api'"

**Step 3: Implement API dependencies**

Create `backend/app/api/__init__.py` (empty):

Create `backend/app/api/deps.py`:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db as get_db_session


def get_db(db: Session = Depends(get_db_session)) -> Session:
    return db
```

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_api_deps.py -v`
Expected: PASS

**Step 5: Write experiment CRUD test**

Create `tests/test_experiments_api.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base, get_db
from sqlalchemy.orm import Session

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

def test_create_experiment(client):
    response = client.post(
        "/api/v1/experiments",
        json={
            "name": "Test Survey",
            "description": "A test survey",
            "sample_config": {"sample_size": 10},
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Survey"
    assert "id" in data

def test_list_experiments(client):
    # Create an experiment first
    client.post(
        "/api/v1/experiments",
        json={"name": "Test Survey"}
    )
    response = client.get("/api/v1/experiments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_get_experiment(client):
    create_response = client.post(
        "/api/v1/experiments",
        json={"name": "Test Survey"}
    )
    experiment_id = create_response.json()["id"]
    response = client.get(f"/api/v1/experiments/{experiment_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == experiment_id
```

**Step 6: Run tests to verify they fail**

Run: `cd backend && pytest tests/test_experiments_api.py -v`
Expected: FAIL with "422 Unprocessable Entity" or endpoints not found

**Step 7: Implement experiment CRUD endpoints**

Create `backend/app/api/v1/__init__.py` (empty):

Create `backend/app/api/v1/experiments.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.experiment import ExperimentCreate, ExperimentResponse, ExperimentUpdate
from app.models.experiment import Experiment as ExperimentModel

router = APIRouter()


@router.post("/", response_model=ExperimentResponse, status_code=201)
def create_experiment(
    experiment: ExperimentCreate,
    db: Session = Depends(get_db)
):
    db_experiment = ExperimentModel(**experiment.model_dump())
    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)
    return db_experiment


@router.get("/", response_model=List[ExperimentResponse])
def list_experiments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    experiments = db.query(ExperimentModel).offset(skip).limit(limit).all()
    return experiments


@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    experiment = db.query(ExperimentModel).filter(
        ExperimentModel.id == experiment_id
    ).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment


@router.put("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: int,
    experiment_update: ExperimentUpdate,
    db: Session = Depends(get_db)
):
    experiment = db.query(ExperimentModel).filter(
        ExperimentModel.id == experiment_id
    ).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    update_data = experiment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(experiment, field, value)

    db.commit()
    db.refresh(experiment)
    return experiment


@router.delete("/{experiment_id}", status_code=204)
def delete_experiment(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    experiment = db.query(ExperimentModel).filter(
        ExperimentModel.id == experiment_id
    ).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    db.delete(experiment)
    db.commit()
    return None
```

**Step 8: Implement main FastAPI application**

Overwrite `backend/app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.v1 import experiments

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Silicon Sample Simulator",
    description="LLM-based synthetic participant platform for psychology research",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["experiments"])


@app.get("/")
def root():
    return {
        "message": "Silicon Sample Simulator API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**Step 9: Run tests to verify they pass**

Run: `cd backend && pytest tests/test_experiments_api.py -v`
Expected: PASS for all tests

**Step 10: Test API manually**

Run: `cd backend && uvicorn app.main:app --reload`
Expected: Server starts on http://localhost:8000

Visit: http://localhost:8000/docs
Expected: Interactive API documentation with experiment endpoints

**Step 11: Commit**

```bash
git add backend/
git commit -m "feat: implement experiment CRUD endpoints"
```

---

## Task 4: Participant Profile Generator

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/participant_generator.py`
- Create: `tests/test_participant_generator.py`

**Step 1: Write profile generation test**

Create `tests/test_participant_generator.py`:

```python
from app.services.participant_generator import ParticipantGenerator

def test_generate_single_profile():
    generator = ParticipantGenerator()
    config = {
        "sample_size": 1,
        "age_range": [18, 65],
        "gender_distribution": {"male": 0.5, "female": 0.5}
    }
    profiles = generator.generate(config)
    assert len(profiles) == 1
    assert "age" in profiles[0]
    assert "gender" in profiles[0]
    assert 18 <= profiles[0]["age"] <= 65

def test_generate_multiple_profiles():
    generator = ParticipantGenerator()
    config = {
        "sample_size": 10,
        "age_range": [25, 45],
        "gender_distribution": {"male": 0.4, "female": 0.6}
    }
    profiles = generator.generate(config)
    assert len(profiles) == 10
    for profile in profiles:
        assert 25 <= profile["age"] <= 45
        assert profile["gender"] in ["male", "female"]

def test_profile_has_required_fields():
    generator = ParticipantGenerator()
    config = {"sample_size": 1, "age_range": [18, 65]}
    profiles = generator.generate(config)
    profile = profiles[0]
    required_fields = ["age", "gender", "country", "education"]
    for field in required_fields:
        assert field in profile
```

**Step 2: Run tests to verify they fail**

Run: `cd backend && pytest tests/test_participant_generator.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app.services'"

**Step 3: Implement participant generator service**

Create `backend/app/services/__init__.py` (empty):

Create `backend/app/services/participant_generator.py`:

```python
import random
from typing import List, Dict, Any
import numpy as np


class ParticipantGenerator:
    """Generate synthetic participant profiles with specified demographics."""

    EDUCATION_LEVELS = [
        "high_school",
        "some_college",
        "bachelor",
        "master",
        "doctorate"
    ]

    COUNTRIES = [
        "United States", "United Kingdom", "Canada", "Australia",
        "Germany", "France", "Netherlands", "Sweden",
        "China", "Japan", "India", "Singapore",
        "Brazil", "Mexico", "Argentina"
    ]

    GENDERS = ["male", "female", "non_binary", "prefer_not_to_say"]

    def generate(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate participant profiles based on configuration.

        Args:
            config: Dictionary with sample parameters
                - sample_size: Number of profiles to generate
                - age_range: [min, max] age
                - gender_distribution: Dict mapping gender to proportion
                - countries: List of allowed countries (optional)
                - education_levels: List of allowed education levels (optional)

        Returns:
            List of participant profile dictionaries
        """
        sample_size = config.get("sample_size", 10)
        age_range = config.get("age_range", [18, 65])
        gender_dist = config.get("gender_distribution", {
            "male": 0.5, "female": 0.5
        })

        profiles = []
        for i in range(sample_size):
            profile = self._generate_single_profile(
                i + 1,
                age_range,
                gender_dist,
                config.get("countries", self.COUNTRIES),
                config.get("education_levels", self.EDUCATION_LEVELS)
            )
            profiles.append(profile)

        return profiles

    def _generate_single_profile(
        self,
        participant_number: int,
        age_range: List[int],
        gender_dist: Dict[str, float],
        countries: List[str],
        education_levels: List[str]
    ) -> Dict[str, Any]:
        """Generate a single participant profile."""

        age = random.randint(age_range[0], age_range[1])
        gender = self._weighted_random(gender_dist)
        country = random.choice(countries)
        education = self._age_appropriate_education(age, education_levels)

        profile = {
            "participant_number": participant_number,
            "age": age,
            "gender": gender,
            "country": country,
            "education": education,
        }

        # Add contextual attributes
        profile["language"] = self._infer_language(country)
        profile["life_stage"] = self._infer_life_stage(age, education)

        return profile

    def _weighted_random(self, distribution: Dict[str, float]) -> str:
        """Select a key from weighted distribution."""
        choices = list(distribution.keys())
        weights = list(distribution.values())
        return random.choices(choices, weights=weights, k=1)[0]

    def _age_appropriate_education(self, age: int, available_levels: List[str]) -> str:
        """Generate education level appropriate for age."""
        # Filter by age constraints
        appropriate = []
        for level in available_levels:
            if level == "high_school" and age >= 18:
                appropriate.append(level)
            elif level in ["some_college", "bachelor"] and age >= 20:
                appropriate.append(level)
            elif level == "master" and age >= 23:
                appropriate.append(level)
            elif level == "doctorate" and age >= 26:
                appropriate.append(level)
            elif level not in self.EDUCATION_LEVELS:
                appropriate.append(level)

        # Fallback to what's available
        if not appropriate:
            appropriate = available_levels

        return random.choice(appropriate)

    def _infer_language(self, country: str) -> str:
        """Infer primary language from country."""
        language_map = {
            "United States": "English",
            "United Kingdom": "English",
            "Canada": "English",
            "Australia": "English",
            "Germany": "German",
            "France": "French",
            "Netherlands": "Dutch",
            "Sweden": "Swedish",
            "China": "Chinese",
            "Japan": "Japanese",
            "India": "English",
            "Singapore": "English",
            "Brazil": "Portuguese",
            "Mexico": "Spanish",
            "Argentina": "Spanish"
        }
        return language_map.get(country, "English")

    def _infer_life_stage(self, age: int, education: str) -> str:
        """Infer life stage from age and education."""
        if age < 22:
            return "student"
        elif age < 30:
            return "early_career"
        elif age < 50:
            return "mid_career"
        else:
            return "senior"
```

**Step 4: Run tests to verify they pass**

Run: `cd backend && pytest tests/test_participant_generator.py -v`
Expected: PASS for all tests

**Step 5: Test with more complex scenario**

Add to `tests/test_participant_generator.py`:

```python
def test_generate_with_specific_countries():
    generator = ParticipantGenerator()
    config = {
        "sample_size": 5,
        "age_range": [18, 65],
        "countries": ["United States", "Canada"]
    }
    profiles = generator.generate(config)
    assert len(profiles) == 5
    for profile in profiles:
        assert profile["country"] in ["United States", "Canada"]

def test_gender_distribution_approximate():
    generator = ParticipantGenerator()
    config = {
        "sample_size": 100,
        "age_range": [18, 65],
        "gender_distribution": {"male": 0.7, "female": 0.3}
    }
    profiles = generator.generate(config)
    male_count = sum(1 for p in profiles if p["gender"] == "male")
    male_ratio = male_count / len(profiles)
    # Allow some variance due to randomness
    assert 0.6 <= male_ratio <= 0.8
```

**Step 6: Run all tests**

Run: `cd backend && pytest tests/test_participant_generator.py -v`
Expected: PASS for all tests

**Step 7: Commit**

```bash
git add backend/
git commit -m "feat: implement participant profile generator"
```

---

## Task 5: LLM Integration and Experiment Execution

**Files:**
- Create: `backend/app/services/llm_executor.py`
- Create: `backend/app/schemas/execution.py`
- Create: `backend/app/api/v1/execution.py`
- Modify: `backend/app/main.py`
- Create: `tests/test_llm_executor.py`

**Step 1: Write LLM executor test**

Create `tests/test_llm_executor.py`:

```python
import pytest
from app.services.llm_executor import LLMExecutor

def test_build_prompt():
    executor = LLMExecutor(api_key="test-key")
    profile = {
        "age": 30,
        "gender": "female",
        "country": "United States",
        "education": "bachelor"
    }
    questions = ["What is your age?", "On a scale of 1-5, how happy are you?"]
    prompt = executor._build_prompt(profile, questions)
    assert "30-year-old" in prompt
    assert "female" in prompt
    assert "United States" in prompt
    assert "What is your age?" in prompt

def test_parse_response():
    executor = LLMExecutor(api_key="test-key")
    response = "1. 30\n2. 4"
    questions = ["q1", "q2"]
    parsed = executor._parse_response(response, questions)
    assert len(parsed) == 2
    # Parse the numeric response
```

**Step 2: Run tests to verify they fail**

Run: `cd backend && pytest tests/test_llm_executor.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app.services.llm_executor'"

**Step 3: Implement LLM executor service**

Create `backend/app/services/llm_executor.py`:

```python
from openai import OpenAI
from typing import List, Dict, Any
import os


class LLMExecutor:
    """Execute experiments using LLMs."""

    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def execute_participant(
        self,
        profile: Dict[str, Any],
        questions: List[str]
    ) -> Dict[str, Any]:
        """
        Execute experiment for a single participant.

        Args:
            profile: Participant demographic profile
            questions: List of survey questions

        Returns:
            Dictionary with raw_response, coded_response, metadata
        """
        prompt = self._build_prompt(profile, questions)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a research participant. Answer questions honestly and realistically based on your demographic profile."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,
                max_tokens=1000
            )

            raw_response = response.choices[0].message.content
            coded_responses = self._parse_response(raw_response, questions)

            return {
                "raw_response": raw_response,
                "coded_responses": coded_responses,
                "metadata": {
                    "model": self.model,
                    "tokens_used": response.usage.total_tokens,
                    "cost": self._calculate_cost(response.usage.total_tokens)
                }
            }

        except Exception as e:
            return {
                "error": str(e),
                "raw_response": "",
                "coded_responses": {},
                "metadata": {"error": True}
            }

    def _build_prompt(self, profile: Dict[str, Any], questions: List[str]) -> str:
        """Build prompt with persona and questions."""
        persona = f"""You are a {profile['age']}-year-old {profile['gender']} from {profile['country']} with a {profile['education']} level of education.
Your primary language is {profile.get('language', 'English')}.
You are currently in the {profile.get('life_stage', 'adult')} life stage.

Please answer the following questions as realistically as possible based on your background and experiences.
Respond to each question with a number or short answer on a new line, like this:
1. [your answer]
2. [your answer]
etc.

Questions:"""

        questions_text = "\n".join(
            f"{i+1}. {q}" for i, q in enumerate(questions)
        )

        return f"{persona}\n\n{questions_text}"

    def _parse_response(self, response: str, questions: List[str]) -> Dict[str, str]:
        """Parse LLM response into structured data."""
        lines = response.strip().split("\n")
        parsed = {}

        for i, line in enumerate(lines):
            # Remove numbering (e.g., "1. ", "2) ")
            cleaned = line.strip()
            for prefix in [f"{i+1}. ", f"{i+1}) ", f"{i+1} "]:
                if cleaned.startswith(prefix):
                    cleaned = cleaned[len(prefix):]
                    break

            if i < len(questions):
                parsed[questions[i]] = cleaned

        return parsed

    def _calculate_cost(self, tokens: int) -> float:
        """Calculate cost based on token usage (approximate)."""
        # GPT-4o pricing (approximate)
        cost_per_1k_tokens = 0.005
        return (tokens / 1000) * cost_per_1k_tokens


class LLMExecutorFactory:
    """Factory for creating LLM executors with different providers."""

    @staticmethod
    def create(provider: str, api_key: str, model: str = None) -> LLMExecutor:
        """Create an executor for the specified provider."""
        if provider == "openai":
            return LLMExecutor(api_key=api_key, model=model or "gpt-4o")
        else:
            raise ValueError(f"Unsupported provider: {provider}")
```

**Step 4: Run tests to verify they pass**

Run: `cd backend && pytest tests/test_llm_executor.py -v`
Expected: PASS for prompt building test

**Step 5: Create execution schemas**

Create `backend/app/schemas/execution.py`:

```python
from pydantic import BaseModel
from typing import Optional, Dict, Any


class ExecutionRequest(BaseModel):
    experiment_id: int
    api_key: str
    provider: str = "openai"
    model: Optional[str] = None


class ExecutionResponse(BaseModel):
    experiment_id: int
    status: str
    participants_completed: int
    participants_total: int
    total_cost: float
    message: str
```

**Step 6: Create execution API endpoint**

Create `backend/app/api/v1/execution.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.execution import ExecutionRequest, ExecutionResponse
from app.models.experiment import Experiment as ExperimentModel
from app.models.participant import Participant
from app.models.response import Response
from app.services.participant_generator import ParticipantGenerator
from app.services.llm_executor import LLMExecutorFactory

router = APIRouter()


@router.post("/execute", response_model=ExecutionResponse)
async def execute_experiment(
    request: ExecutionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Execute an experiment with LLM-generated participants."""

    # Get experiment
    experiment = db.query(ExperimentModel).filter(
        ExperimentModel.id == request.experiment_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if not experiment.experiment_config or "questions" not in experiment.experiment_config:
        raise HTTPException(
            status_code=400,
            detail="Experiment must have questions defined"
        )

    # Generate participants
    generator = ParticipantGenerator()
    sample_config = experiment.sample_config or {}
    sample_config["sample_size"] = sample_config.get("sample_size", 10)

    profiles = generator.generate(sample_config)

    # Store participants
    participants = []
    for profile in profiles:
        participant = Participant(
            experiment_id=experiment.id,
            participant_number=profile["participant_number"],
            profile=profile
        )
        db.add(participant)
        participants.append(participant)

    db.commit()

    # Execute in background
    background_tasks.add_task(
        _run_experiment,
        experiment.id,
        participants,
        experiment.experiment_config["questions"],
        request.api_key,
        request.provider,
        request.model,
        db
    )

    return ExecutionResponse(
        experiment_id=experiment.id,
        status="running",
        participants_completed=0,
        participants_total=len(participants),
        total_cost=0.0,
        message="Experiment execution started"
    )


async def _run_experiment(
    experiment_id: int,
    participants: list[Participant],
    questions: list[str],
    api_key: str,
    provider: str,
    model: str,
    db: Session
):
    """Background task to execute experiment for all participants."""

    executor = LLMExecutorFactory.create(provider, api_key, model)
    total_cost = 0.0

    for participant in participants:
        result = executor.execute_participant(participant.profile, questions)

        if "error" not in result["metadata"]:
            # Store responses
            for question, answer in result["coded_responses"].items():
                response = Response(
                    experiment_id=experiment_id,
                    participant_id=participant.id,
                    question_id=question,
                    raw_response=result["raw_response"],
                    coded_response={"answer": answer},
                    metadata=result["metadata"]
                )
                db.add(response)

            total_cost += result["metadata"].get("cost", 0.0)

    # Update experiment status
    experiment = db.query(ExperimentModel).filter(
        ExperimentModel.id == experiment_id
    ).first()
    experiment.status = "completed"
    db.commit()
```

**Step 7: Update main app with execution router**

Edit `backend/app/main.py`:

Add import:
```python
from app.api.v1 import experiments, execution
```

Add router:
```python
app.include_router(execution.router, prefix="/api/v1/execution", tags=["execution"])
```

**Step 8: Test execution endpoint (manual integration test)**

Run backend: `cd backend && uvicorn app.main:app --reload`

Use curl or API docs at http://localhost:8000/docs to:
1. Create an experiment
2. Execute it with your OpenAI API key

**Step 9: Commit**

```bash
git add backend/
git commit -m "feat: implement LLM execution service"
```

---

## Task 6: Basic Analysis Service

**Files:**
- Create: `backend/app/services/analyzer.py`
- Create: `backend/app/schemas/analysis.py`
- Create: `backend/app/api/v1/analysis.py`
- Create: `tests/test_analyzer.py`

**Step 1: Write analyzer test**

Create `tests/test_analyzer.py`:

```python
import pytest
from app.services.analyzer import Analyzer

def test_calculate_descriptive_stats():
    analyzer = Analyzer()
    data = {"question1": [1, 2, 3, 4, 5]}
    stats = analyzer.descriptive_statistics(data)
    assert "question1" in stats
    assert stats["question1"]["mean"] == 3.0
    assert stats["question1"]["count"] == 5

def test_calculate_frequency_table():
    analyzer = Analyzer()
    data = {"question1": ["a", "b", "a", "c", "a"]}
    freq = analyzer.frequency_table(data["question1"])
    assert freq["a"] == 3
    assert freq["b"] == 1
    assert freq["c"] == 1
```

**Step 2: Run tests to verify they fail**

Run: `cd backend && pytest tests/test_analyzer.py -v`
Expected: FAIL with module not found

**Step 3: Implement analyzer service**

Create `backend/app/services/analyzer.py`:

```python
import pandas as pd
import numpy as np
from typing import Dict, List, Any


class Analyzer:
    """Statistical analysis for experiment results."""

    def descriptive_statistics(
        self,
        data: Dict[str, List[Any]]
    ) -> Dict[str, Dict[str, float]]:
        """
        Calculate descriptive statistics for numeric data.

        Args:
            data: Dictionary mapping question IDs to response lists

        Returns:
            Dictionary with statistics per question
        """
        stats = {}

        for question, responses in data.items():
            # Convert to numeric, drop non-numeric
            numeric_responses = []
            for r in responses:
                try:
                    numeric_responses.append(float(r))
                except (ValueError, TypeError):
                    pass

            if not numeric_responses:
                stats[question] = {"error": "No numeric responses"}
                continue

            series = pd.Series(numeric_responses)

            stats[question] = {
                "count": len(series),
                "mean": float(series.mean()),
                "median": float(series.median()),
                "std": float(series.std()),
                "min": float(series.min()),
                "max": float(series.max()),
                "q25": float(series.quantile(0.25)),
                "q75": float(series.quantile(0.75))
            }

        return stats

    def frequency_table(self, responses: List[Any]) -> Dict[str, int]:
        """Calculate frequency counts for categorical data."""
        return pd.Series(responses).value_counts().to_dict()

    def summarize_experiment(
        self,
        experiment_id: int,
        responses: List[Dict]
    ) -> Dict[str, Any]:
        """
        Generate summary statistics for an experiment.

        Args:
            experiment_id: Experiment ID
            responses: List of response dictionaries with question_id and coded_response

        Returns:
            Summary with descriptive stats and frequency tables
        """
        # Group by question
        question_data = {}
        for response in responses:
            q_id = response["question_id"]
            answer = response.get("coded_response", {}).get("answer")

            if q_id not in question_data:
                question_data[q_id] = []
            question_data[q_id].append(answer)

        # Calculate statistics
        summary = {
            "experiment_id": experiment_id,
            "total_responses": len(responses),
            "questions_analyzed": len(question_data),
            "descriptive_stats": self.descriptive_statistics(question_data),
            "frequency_tables": {}
        }

        # Frequency tables for categorical data
        for q_id, responses in question_data.items():
            # Try to determine if categorical or numeric
            try:
                [float(r) for r in responses if r]
                # Numeric - already in descriptive_stats
            except (ValueError, TypeError):
                # Categorical
                summary["frequency_tables"][q_id] = self.frequency_table(responses)

        return summary
```

**Step 4: Run tests to verify they pass**

Run: `cd backend && pytest tests/test_analyzer.py -v`
Expected: PASS

**Step 5: Create analysis schemas**

Create `backend/app/schemas/analysis.py`:

```python
from pydantic import BaseModel
from typing import Optional, Dict, Any


class AnalysisRequest(BaseModel):
    experiment_id: int


class AnalysisResponse(BaseModel):
    experiment_id: int
    total_responses: int
    questions_analyzed: int
    descriptive_stats: Dict[str, Dict[str, float]]
    frequency_tables: Dict[str, Dict[str, int]]
```

**Step 6: Create analysis API endpoint**

Create `backend/app/api/v1/analysis.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.models.experiment import Experiment as ExperimentModel
from app.models.response import Response
from app.services.analyzer import Analyzer

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_experiment(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """Generate statistical analysis for experiment results."""

    # Verify experiment exists
    experiment = db.query(ExperimentModel).filter(
        ExperimentModel.id == request.experiment_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Get all responses for this experiment
    responses = db.query(Response).filter(
        Response.experiment_id == request.experiment_id
    ).all()

    if not responses:
        raise HTTPException(
            status_code=400,
            detail="No responses found for this experiment"
        )

    # Convert to dict format
    response_dicts = [
        {
            "question_id": r.question_id,
            "coded_response": r.coded_response or {}
        }
        for r in responses
    ]

    # Run analysis
    analyzer = Analyzer()
    summary = analyzer.summarize_experiment(
        request.experiment_id,
        response_dicts
    )

    return AnalysisResponse(**summary)


@router.get("/experiments/{experiment_id}/results")
def get_experiment_results(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    """Get all responses for an experiment."""

    responses = db.query(Response).filter(
        Response.experiment_id == experiment_id
    ).all()

    return {
        "experiment_id": experiment_id,
        "response_count": len(responses),
        "responses": [
            {
                "participant_id": r.participant_id,
                "question_id": r.question_id,
                "answer": r.coded_response.get("answer") if r.coded_response else None,
                "raw_response": r.raw_response
            }
            for r in responses
        ]
    }
```

**Step 7: Update main app**

Edit `backend/app/main.py`:

Add import:
```python
from app.api.v1 import experiments, execution, analysis
```

Add router:
```python
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
```

**Step 8: Commit**

```bash
git add backend/
git commit -m "feat: implement basic statistical analysis"
```

---

## Task 7: Frontend - Project Setup and Routing

**Files:**
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/lib/utils.ts`
- Create: `frontend/src/components/ui/`
- Create: `frontend/src/pages/`
- Create: `frontend/src/api/`

**Step 1: Create HTML entry point**

Create `frontend/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Silicon Sample Simulator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2: Create main entry point**

Create `frontend/src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 3: Create global styles**

Create `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

**Step 4: Create Tailwind config**

Create `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `frontend/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 5: Create utility functions**

Create `frontend/src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 6: Create API client**

Create `frontend/src/api/client.ts`:

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
```

Create `frontend/src/api/experiments.ts`:

```typescript
import api from './client'

export interface Experiment {
  id: number
  name: string
  description?: string
  status: string
  sample_config?: any
  experiment_config?: any
  execution_settings?: any
  created_at: string
  updated_at?: string
}

export interface ExperimentCreate {
  name: string
  description?: string
  sample_config?: any
  experiment_config?: any
  execution_settings?: any
}

export const experimentsApi = {
  list: async (): Promise<Experiment[]> => {
    const response = await api.get('/api/v1/experiments')
    return response.data
  },

  get: async (id: number): Promise<Experiment> => {
    const response = await api.get(`/api/v1/experiments/${id}`)
    return response.data
  },

  create: async (data: ExperimentCreate): Promise<Experiment> => {
    const response = await api.post('/api/v1/experiments', data)
    return response.data
  },

  update: async (id: number, data: Partial<ExperimentCreate>): Promise<Experiment> => {
    const response = await api.put(`/api/v1/experiments/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/experiments/${id}`)
  },
}
```

**Step 7: Create App component with routing**

Create `frontend/src/App.tsx`:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ExperimentsList from './pages/ExperimentsList'
import CreateExperiment from './pages/CreateExperiment'
import ExperimentDetail from './pages/ExperimentDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Silicon Sample Simulator
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<ExperimentsList />} />
            <Route path="/experiments/new" element={<CreateExperiment />} />
            <Route path="/experiments/:id" element={<ExperimentDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
```

**Step 8: Create ExperimentsList page**

Create `frontend/src/pages/ExperimentsList.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { experimentsApi, Experiment } from '../api/experiments'

export default function ExperimentsList() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExperiments()
  }, [])

  async function loadExperiments() {
    try {
      const data = await experimentsApi.list()
      setExperiments(data)
    } catch (error) {
      console.error('Failed to load experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Experiments</h2>
        <Link
          to="/experiments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Experiment
        </Link>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No experiments yet</p>
          <Link
            to="/experiments/new"
            className="text-blue-600 hover:text-blue-700"
          >
            Create your first experiment →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {experiments.map((exp) => (
            <Link
              key={exp.id}
              to={`/experiments/${exp.id}`}
              className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {exp.name}
                  </h3>
                  {exp.description && (
                    <p className="text-gray-600 mt-1">{exp.description}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  exp.status === 'completed' ? 'bg-green-100 text-green-800' :
                  exp.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {exp.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 9: Create CreateExperiment page**

Create `frontend/src/pages/CreateExperiment.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { experimentsApi } from '../api/experiments'

export default function CreateExperiment() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sampleSize, setSampleSize] = useState(10)
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(65)
  const [questions, setQuestions] = useState([''])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const experiment = await experimentsApi.create({
        name,
        description,
        sample_config: {
          sample_size: sampleSize,
          age_range: [ageMin, ageMax],
        },
        experiment_config: {
          questions: questions.filter(q => q.trim()),
        },
      })

      navigate(`/experiments/${experiment.id}`)
    } catch (error) {
      console.error('Failed to create experiment:', error)
      alert('Failed to create experiment')
    } finally {
      setLoading(false)
    }
  }

  function addQuestion() {
    setQuestions([...questions, ''])
  }

  function updateQuestion(index: number, value: string) {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Create Experiment</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experiment Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Well-being Survey Pilot"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Briefly describe your experiment..."
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Sample Configuration</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Size
              </label>
              <input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Age
              </label>
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(parseInt(e.target.value) || 18)}
                min="18"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Age
              </label>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(parseInt(e.target.value) || 65)}
                min="18"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Survey Questions</h3>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Question
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !name}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Experiment'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

**Step 10: Create ExperimentDetail page (basic version)**

Create `frontend/src/pages/ExperimentDetail.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { experimentsApi, Experiment } from '../api/experiments'
import api from '../api/client'

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    if (id) {
      loadExperiment(parseInt(id))
    }
  }, [id])

  async function loadExperiment(id: number) {
    try {
      const data = await experimentsApi.get(id)
      setExperiment(data)
    } catch (error) {
      console.error('Failed to load experiment:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleExecute(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !apiKey) return

    setExecuting(true)

    try {
      await api.post('/api/v1/execution/execute', {
        experiment_id: parseInt(id),
        api_key: apiKey,
        provider: 'openai',
      })

      // Reload experiment to see updated status
      await loadExperiment(parseInt(id))
      alert('Experiment started! Check back in a few minutes.')
    } catch (error) {
      console.error('Failed to execute experiment:', error)
      alert('Failed to start experiment')
    } finally {
      setExecuting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!experiment) {
    return <div className="text-center py-12">Experiment not found</div>
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          ← Back to experiments
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{experiment.name}</h2>
            {experiment.description && (
              <p className="text-gray-600 mt-2">{experiment.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            experiment.status === 'completed' ? 'bg-green-100 text-green-800' :
            experiment.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {experiment.status}
          </span>
        </div>

        {experiment.sample_config && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Sample Configuration</h4>
            <p>Sample Size: {experiment.sample_config.sample_size || 'Not specified'}</p>
            <p>Age Range: {experiment.sample_config.age_range?.join(' - ') || 'Not specified'}</p>
          </div>
        )}

        {experiment.experiment_config?.questions && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Questions ({experiment.experiment_config.questions.length})</h4>
            <ol className="list-decimal list-inside space-y-1">
              {experiment.experiment_config.questions.map((q: string, i: number) => (
                <li key={i} className="text-gray-700">{q}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {experiment.status === 'draft' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Execute Experiment</h3>

          <form onSubmit={handleExecute}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key *
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="sk-..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Your API key is used for this execution only and not stored.
              </p>
            </div>

            <button
              type="submit"
              disabled={executing || !apiKey}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {executing ? 'Starting...' : 'Start Experiment'}
            </button>
          </form>
        </div>
      )}

      {experiment.status === 'completed' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Results</h3>
          <p className="text-gray-600">
            Experiment completed! Analysis and result viewing will be added soon.
          </p>
        </div>
      )}
    </div>
  )
}
```

**Step 11: Install frontend dependencies and test**

Run:
```bash
cd frontend
npm install
npm run dev
```

Expected: Frontend runs on http://localhost:5173

**Step 12: Commit**

```bash
git add frontend/
git commit -m "feat: implement frontend UI with routing"
```

---

## Completion Checklist

Phase 1 MVP is complete when:

- [ ] PostgreSQL running via Docker Compose
- [ ] Backend API running on http://localhost:8000
- [ ] API documentation accessible at http://localhost:8000/docs
- [ ] Frontend running on http://localhost:5173
- [ ] Can create experiment via UI
- [ ] Can execute experiment with OpenAI API key
- [ ] Can view experiment results
- [ ] Basic statistical analysis working
- [ ] All tests passing: `pytest tests/`

---

## Testing the Complete Flow

1. Start PostgreSQL: `docker-compose up -d`
2. Start backend: `cd backend && uvicorn app.main:app --reload`
3. Start frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173
5. Create experiment with sample questions
6. Execute with your OpenAI API key
7. View results when complete

---

## Next Steps (Phase 2)

- Add Cronbach's alpha analysis
- Implement additional LLM providers (DeepSeek, Claude)
- Add visualization dashboard
- Export to SPSS/R formats
- Scenario and recall experiment types
- Quality validation checks

---

**Generated:** 2026-02-01
**Status:** Ready for implementation
**Estimated Time:** 20-30 hours for Phase 1 MVP
