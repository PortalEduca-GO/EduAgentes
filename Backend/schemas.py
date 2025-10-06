from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from models import UserRole, AgentStatus, KnowledgeType, KnowledgeStatus

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserCreateByMaster(UserCreate):
    role: UserRole = Field(default=UserRole.USER)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None

class User(BaseModel):
    id: int
    username: str
    role: UserRole
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class Document(BaseModel):
    id: int
    filename: str
    upload_date: datetime
    agent_id: int
    model_config = ConfigDict(from_attributes=True)

class Link(BaseModel):
    id: int
    url: str
    added_date: datetime
    agent_id: int
    model_config = ConfigDict(from_attributes=True)

class AgentBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    system_prompt: Optional[str] = "Você é um assistente prestativo."

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=500)
    system_prompt: Optional[str] = None

class Agent(AgentBase):
    id: int
    logo_url: Optional[str] = None
    owner_id: int
    status: AgentStatus
    created_at: datetime
    documents: List[Document] = []
    links: List[Link] = []
    model_config = ConfigDict(from_attributes=True)

class AgentStatusUpdate(BaseModel):
    status: AgentStatus

class PromptRequest(BaseModel):
    prompt: str

class AgentResponse(BaseModel):
    response: str
    user: str
    note: Optional[str] = None
    stage_used: Optional[str] = None

class LogoUploadResponse(BaseModel):
    status: str
    message: str
    logo_url: str

class UrlScrapeRequest(BaseModel):
    url: str

class UrlScrapeResponse(BaseModel):
    status: str
    message: str
    url: str
    title: str
    content_length: int
    chunks_processed: int

class LinkCreateRequest(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None

class LinkCreate(LinkCreateRequest):
    pass

class LinkCreateResponse(BaseModel):
    status: str
    message: str
    id: int
    title: str

class DocumentUploadResponse(BaseModel):
    message: str
    filename: str
    status: str
    document_id: Optional[int] = None

# ==================== SYSTEM CONFIG SCHEMAS ====================

class AIModelConfigUpdate(BaseModel):
    ai_model_type: str  # HYBRID, LLAMA_ONLY, GEMINI_ONLY

class SystemConfigResponse(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    updated_at: datetime
    updated_by_username: str
    model_config = ConfigDict(from_attributes=True)

# ==================== KNOWLEDGE BASE SCHEMAS ====================

class KnowledgeBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    content: Optional[str] = None
    knowledge_type: KnowledgeType = KnowledgeType.TEXT
    url: Optional[str] = None
    tags: Optional[str] = None
    expires_at: Optional[datetime] = None
    agent_ids: List[int] = []

class KnowledgeCreate(KnowledgeBase):
    pass

class KnowledgeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=500)
    content: Optional[str] = None
    status: Optional[KnowledgeStatus] = None
    url: Optional[str] = None
    tags: Optional[str] = None
    expires_at: Optional[datetime] = None
    agent_ids: Optional[List[int]] = None

class KnowledgeAgent(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class KnowledgeAuthor(BaseModel):
    id: int
    username: str
    role: UserRole
    model_config = ConfigDict(from_attributes=True)

class KnowledgeApprover(BaseModel):
    id: int
    username: str
    model_config = ConfigDict(from_attributes=True)

class Knowledge(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    knowledge_type: KnowledgeType
    status: KnowledgeStatus
    url: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    author: KnowledgeAuthor
    approved_by: Optional[KnowledgeApprover] = None
    agents: List[KnowledgeAgent] = []
    model_config = ConfigDict(from_attributes=True)

class KnowledgeUploadResponse(BaseModel):
    status: str
    message: str
    knowledge_id: int
    filename: Optional[str] = None

class KnowledgeApprovalRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")  # "approve" ou "reject"
    rejection_reason: Optional[str] = None

class KnowledgeApprovalResponse(BaseModel):
    status: str
    message: str
    knowledge_id: int
