from typing import Dict, Any, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import models
import database

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Configurações de segurança - carregadas do arquivo .env
SECRET_KEY = os.getenv("SECRET_KEY", "seu_segredo_super_secreto_aqui_troque_depois")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Contexto para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema OAuth2 para autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha em texto plano corresponde ao hash armazenado.
    
    Args:
        plain_password: Senha em texto plano
        hashed_password: Hash da senha armazenado no banco
        
    Returns:
        bool: True se a senha estiver correta, False caso contrário
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Gera o hash de uma senha.
    
    Args:
        password: Senha em texto plano
        
    Returns:
        str: Hash da senha
    """
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any]) -> str:
    """
    Cria um token JWT de acesso.
    
    Args:
        data: Dados a serem codificados no token
        
    Returns:
        str: Token JWT codificado
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(database.get_db)
) -> models.User:
    """
    Obtém o usuário atual a partir do token JWT.
    
    Args:
        token: Token JWT fornecido no header Authorization
        db: Sessão do banco de dados
        
    Returns:
        models.User: Usuário autenticado
        
    Raises:
        HTTPException: Se o token for inválido ou o usuário não for encontrado
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Mapa de hierarquia de papéis - número maior = mais permissões
ROLE_HIERARCHY: Dict[models.UserRole, int] = {
    models.UserRole.USER: 1,
    models.UserRole.ADMIN: 2,
    models.UserRole.MASTER_ADMIN: 3
}

def require_role(required_role: models.UserRole) -> Callable:
    """
    Cria uma dependência que verifica se o usuário tem o papel necessário.
    
    Args:
        required_role: Papel mínimo necessário para acessar o endpoint
        
    Returns:
        Callable: Função de dependência do FastAPI
    """
    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        print(f"DEBUG: Verificando role - Usuário: {current_user.username}, Role atual: {current_user.role}, Role necessário: {required_role}")
        user_role_level = ROLE_HIERARCHY.get(current_user.role, 0)
        required_role_level = ROLE_HIERARCHY.get(required_role, 0)
        print(f"DEBUG: Level atual: {user_role_level}, Level necessário: {required_role_level}")

        if user_role_level < required_role_level:
            print(f"DEBUG: Permissão NEGADA para {current_user.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        print(f"DEBUG: Permissão CONCEDIDA para {current_user.username}")
        return current_user
    return role_checker