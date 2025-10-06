export interface User {
  id: number;
  username: string;
  role: 'USER' | 'ADMIN' | 'MASTER_ADMIN';
  created_at: string;
}

export interface Document {
  id: number;
  filename: string;
  upload_date: string;
  agent_id: number;
}

export interface Link {
  id: number;
  url: string;
  title?: string;
  description?: string;
  added_date: string;
  agent_id: number;
}

export interface Agent {
  id: number;
  name: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  owner_id: number;
  system_prompt?: string;
  logo_url?: string;
  documents?: Document[];
  links?: Link[];
  expertise?: string[]; // Adicionado para compatibilidade com código existente
}

export interface AgentUpdate {
  name?: string;
  description?: string;
  system_prompt?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  logo_url?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  system_prompt?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'MASTER_ADMIN';
}

export interface AskAgentRequest {
  prompt: string;
}

export interface AskAgentResponse {
  response: string;
  stage_used?: string;
  user: string;
  note?: string;
}

export interface UpdateAgentStatusRequest {
  status: 'APPROVED' | 'REJECTED';
}

export interface DocumentUploadResponse {
  message: string;
  filename: string;
  status: string;
  document_id?: number;
}

export interface LinkCreateRequest {
  url: string;
  title?: string;
  description?: string;
}

export interface LinkCreateResponse {
  status: string;
  message: string;
  id: number;
  title: string;
}

export interface LogoUploadResponse {
  status: string;
  message: string;
  logo_url: string;
}

export type Role = 'USER' | 'ADMIN' | 'MASTER_ADMIN';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
