"""
FastAPI application for Silicon Sample Simulator
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import experiments
from app.api.v1 import execution
from app.config import settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown
    """
    # Startup
    init_db()
    yield
    # Shutdown
    pass


# Create FastAPI app
app = FastAPI(
    title="Silicon Sample Simulator API",
    description="LLM-based synthetic participant platform for psychology research",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def read_root():
    """
    Root endpoint with API information
    """
    return {
        "name": "Silicon Sample Simulator API",
        "version": "0.1.0",
        "description": "LLM-based synthetic participant platform for psychology research",
        "docs_url": "/docs",
        "environment": settings.app_environment,
    }


# Health check endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "environment": settings.app_environment}


# Include API routers
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["experiments"])
app.include_router(execution.router, prefix="/api/v1/execution", tags=["execution"])
