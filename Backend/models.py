from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Column, Integer, String, Enum as SQLAlchemyEnum, ForeignKey, Text, DateTime, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base
import enum

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

class UserRole(str, enum.Enum):
    """Enum que define os diferentes papéis de usuário no sistema."""
    USER = "USER"
    ADMIN = "ADMIN"
    MASTER_ADMIN = "MASTER_ADMIN"

class AgentStatus(str, enum.Enum):
    """Enum que define os status possíveis para um agente."""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AIModelType(str, enum.Enum):
    """Enum que define os tipos de modelos de IA disponíveis."""
    HYBRID = "HYBRID"  # Sistema híbrido (Llama + Gemini)
    LLAMA_ONLY = "LLAMA_ONLY"  # Apenas Llama
    GEMINI_ONLY = "GEMINI_ONLY"  # Apenas Gemini

class KnowledgeType(str, enum.Enum):
    """Enum que define os tipos de conhecimento."""
    DOCUMENT = "DOCUMENT"  # Documento (PDF, DOCX, TXT)
    LINK = "LINK"  # Link web
    TEXT = "TEXT"  # Texto livre

class KnowledgeStatus(str, enum.Enum):
    """Enum que define os status do conhecimento."""
    PENDING = "PENDING"  # Aguardando aprovação
    APPROVED = "APPROVED"  # Aprovado e ativo
    REJECTED = "REJECTED"  # Rejeitado
    EXPIRED = "EXPIRED"  # Expirado

# Tabela de associação para conhecimentos e agentes
knowledge_agent_association = Table(
    "knowledge_agents",
    Base.metadata,
    Column("knowledge_id", Integer, ForeignKey("knowledge.id"), primary_key=True),
    Column("agent_id", Integer, ForeignKey("agents.id"), primary_key=True)
)

class User(Base):
    """Modelo que representa um usuário no sistema."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(
        SQLAlchemyEnum(UserRole), 
        default=UserRole.ADMIN,
        nullable=False
    )
    created_at = Column(DateTime, server_default=func.now())

    # Relacionamentos
    agents = relationship("Agent", back_populates="owner")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"

class Agent(Base):
    """Modelo que representa um agente de IA no sistema."""
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True)
    description = Column(Text, nullable=True)
    system_prompt = Column(
        Text, 
        default="Você é um assistente prestativo.",
        nullable=False
    )
    logo_url = Column(String(500), nullable=True)
    status = Column(
        SQLAlchemyEnum(AgentStatus), 
        default=AgentStatus.PENDING,
        nullable=False
    )
    created_at = Column(DateTime, server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relacionamentos
    owner = relationship("User", back_populates="agents")
    documents = relationship("Document", back_populates="agent", cascade="all, delete-orphan")
    links = relationship("Link", back_populates="agent", cascade="all, delete-orphan")
    knowledge_items = relationship("Knowledge", secondary=knowledge_agent_association, back_populates="agents")

    def __repr__(self) -> str:
        return f"<Agent(id={self.id}, name='{self.name}', status='{self.status}', owner_id={self.owner_id})>"

class Document(Base):
    """Modelo para documentos carregados na base de conhecimento dos agentes."""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    upload_date = Column(DateTime, server_default=func.now())
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    
    # Relacionamentos
    agent = relationship("Agent", back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document(id={self.id}, filename='{self.filename}', agent_id={self.agent_id})>"

class Link(Base):
    """Modelo para links salvos na base de conhecimento dos agentes."""
    __tablename__ = "links"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(2000), nullable=False)
    title = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    added_date = Column(DateTime, server_default=func.now())
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)

    # Relacionamento
    agent = relationship("Agent", back_populates="links")

class SystemConfig(Base):
    """Modelo para armazenar configurações globais do sistema."""
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relacionamento
    updated_by_user = relationship("User")
    
    def __repr__(self) -> str:
        return f"<SystemConfig(key='{self.key}', value='{self.value}')>"

class Knowledge(Base):
    """Modelo para a base de conhecimento centralizada."""
    __tablename__ = "knowledge"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)  # Para texto livre
    knowledge_type = Column(
        SQLAlchemyEnum(KnowledgeType), 
        default=KnowledgeType.TEXT,
        nullable=False
    )
    status = Column(
        SQLAlchemyEnum(KnowledgeStatus), 
        default=KnowledgeStatus.PENDING,
        nullable=False
    )
    url = Column(String(2000), nullable=True)  # Para links
    file_path = Column(String(500), nullable=True)  # Para documentos
    file_type = Column(String(50), nullable=True)  # Para documentos
    tags = Column(Text, nullable=True)  # Tags separadas por vírgula
    
    # Datas
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime, nullable=True)
    
    # Aprovação
    approved_at = Column(DateTime, nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Relacionamentos
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", foreign_keys=[author_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    agents = relationship("Agent", secondary=knowledge_agent_association, back_populates="knowledge_items")
    
    def __repr__(self) -> str:
        return f"<Knowledge(id={self.id}, title='{self.title}', type='{self.knowledge_type}', author_id={self.author_id})>"