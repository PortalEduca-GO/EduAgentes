"""Camada de produção que expõe o app principal sob o prefixo /api."""

import os
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from sqlalchemy.exc import SQLAlchemyError

import database
import main as legacy_module

load_dotenv()

legacy_app = legacy_module.app

STATIC_PATH = Path(__file__).parent / "static"
STATIC_PATH.mkdir(parents=True, exist_ok=True)

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://teamsbot.dev.educacao.go.gov.br",
]

allowed_origins = os.getenv("API_ALLOWED_ORIGINS", "").split(",")
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]
if not allowed_origins:
    allowed_origins = DEFAULT_ALLOWED_ORIGINS + ["*"]

app = FastAPI(
    title="Edu API",
    description="Gateway de produção para a plataforma Edu",
    version="2.0.0",
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")

# Monta a aplicação principal (com middlewares e handlers originais) sob /api
app.mount("/api", legacy_app)


@app.get("/")
async def root() -> Dict[str, Any]:
    return {
        "message": "API Edu - camada de produção",
        "status": "online",
        "version": "2.0.0",
        "docs": {
            "openapi": "/docs",
            "legacy": "/api/docs"
        },
    }


@app.get("/health")
async def health() -> Dict[str, Any]:
    db_status = "connected"
    db_error = None
    try:
        db = next(database.get_db())
        db.execute("SELECT 1")
    except SQLAlchemyError as exc:
        db_status = "error"
        db_error = str(exc)
    except StopIteration:
        db_status = "error"
        db_error = "Database dependency not available"
    else:
        try:
            db.close()
        except Exception:
            pass

    gemini_status = "configured" if os.getenv("GOOGLE_API_KEY") else "missing"
    ollama_status = "available" if legacy_module._ollama_available() else "unavailable"  # type: ignore[attr-defined]

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": {
            "status": db_status,
            "error": db_error,
        },
        "integrations": {
            "gemini": gemini_status,
            "ollama": ollama_status,
        },
    }


@app.get("/health/database")
async def health_database() -> Dict[str, Any]:
    try:
        db = next(database.get_db())
        result = db.execute("SELECT 1 AS ok").scalar()
        db.close()
        return {"status": "connected", "result": result}
    except Exception as exc:  # pragma: no cover - monitoramento
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}")