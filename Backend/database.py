from typing import Generator
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env localizado na pasta Backend
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# URL de conexão do banco de dados
# Para desenvolvimento local usando SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./edu.db")

def _build_engine(url: str) -> Engine:
    """Cria o engine levando em conta provedores específicos."""

    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )

    engine_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": int(os.getenv("DB_POOL_RECYCLE_SECONDS", "1800")),
    }

    if url.startswith("mssql"):
        # Ajustes recomendados para SQL Server via pyodbc
        connect_args = {
            "timeout": int(os.getenv("DB_LOGIN_TIMEOUT", "30")),
        }

        fast_executemany = os.getenv("DB_FAST_EXECUTEMANY", "true").lower() in {"1", "true", "yes"}
        if fast_executemany:
            engine_kwargs["fast_executemany"] = True

        engine_kwargs["connect_args"] = connect_args

    return create_engine(url, **engine_kwargs)

# Criação do engine do SQLAlchemy
engine: Engine = _build_engine(SQLALCHEMY_DATABASE_URL)

# Factory para sessões do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base para os modelos SQLAlchemy
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency para obter uma sessão de banco de dados.
    Garante que a sessão seja fechada após o uso.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()