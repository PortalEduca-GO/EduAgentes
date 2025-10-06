#!/usr/bin/env python3
"""
Arquivo de inicialização otimizado para IIS - Produção
Este arquivo tenta diferentes configurações para garantir funcionamento
"""

import os
import sys
import logging
import socket
from pathlib import Path

# Adicionar o diretório atual ao PYTHONPATH
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Criar diretório de logs se não existir
log_dir = current_dir / "logs"
log_dir.mkdir(exist_ok=True)

# Configurar logging robusto
log_handlers = [logging.StreamHandler(sys.stdout)]

# Tentar adicionar log de arquivo se possível
try:
    file_handler = logging.FileHandler(log_dir / 'app_production.log', encoding='utf-8')
    log_handlers.append(file_handler)
except:
    pass

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=log_handlers
)

logger = logging.getLogger(__name__)

def check_port_available(port):
    """Verifica se uma porta está disponível"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('0.0.0.0', port))
            return True
    except:
        return False

def main():
    try:
        logger.info("=== INICIANDO APLICAÇÃO FASTAPI PARA IIS (PRODUÇÃO) ===")
        logger.info(f"Diretório atual: {current_dir}")
        logger.info(f"Python version: {sys.version}")
        
        # Tentar importar o app FastAPI
        try:
            logger.info("Tentando importar main_production...")
            from main_production import app
            logger.info("✅ FastAPI app importado com sucesso (main_production)")
        except ImportError as e:
            logger.warning(f"Falha ao importar main_production: {e}")
            try:
                logger.info("Tentando importar main_simple como fallback...")
                from main_simple import app
                logger.info("✅ FastAPI app importado com sucesso (main_simple)")
            except ImportError as e2:
                logger.error(f"Falha ao importar qualquer app: {e2}")
                raise
        
        # Configurar porta - tentar diferentes opções
        port_env = int(os.environ.get("PORT", 8000))
        port_options = [
            8000,  # Porta preferida para backend
            8001,
            8002,
            8080,
            8081,
            8082,
            8083,
        ]

        if port_env not in port_options:
            port_options.append(port_env)
        
        selected_port = None
        for port in port_options:
            if check_port_available(port):
                selected_port = port
                break
            else:
                logger.warning(f"Porta {port} já está em uso")
        
        if not selected_port:
            logger.error("Nenhuma porta disponível encontrada!")
            sys.exit(1)
        
        logger.info(f"✅ Porta selecionada: {selected_port}")
        
        # Configurar variáveis de ambiente para produção
        os.environ.setdefault("ENVIRONMENT", "production")
        os.environ.setdefault("DEBUG", "false")
        
        # Inicializar uvicorn
        import uvicorn
        logger.info("🚀 Iniciando servidor uvicorn para produção...")
        
        # Configuração otimizada para produção
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=selected_port,
            log_level="info",
            access_log=True,
            use_colors=False,  # Melhor para logs do IIS
            reload=False,  # Nunca reload em produção
            workers=1,  # IIS gerencia os processos
            timeout_keep_alive=300,  # 5 minutos
            timeout_graceful_shutdown=30,
            limit_concurrency=1000,
            limit_max_requests=10000,
        )
        
    except Exception as e:
        logger.error(f"❌ ERRO CRÍTICO ao iniciar aplicação: {e}")
        logger.exception("Detalhes do erro:")
        
        # Tentar executar um servidor HTTP simples como último recurso
        try:
            logger.info("🔧 Tentando iniciar servidor HTTP simples como fallback...")
            from http.server import HTTPServer, BaseHTTPRequestHandler
            import json
            
            class FallbackHandler(BaseHTTPRequestHandler):
                def do_GET(self):
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    response = {
                        "status": "error",
                        "message": "Servidor em modo de emergência",
                        "error": str(e),
                        "timestamp": "2025-09-29"
                    }
                    
                    self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
            emergency_port = int(os.environ.get("PORT", 8000))
            server = HTTPServer(('0.0.0.0', emergency_port), FallbackHandler)
            logger.info(f"⚠️ Servidor de emergência rodando na porta {emergency_port}")
            server.serve_forever()
            
        except Exception as e2:
            logger.error(f"❌ Falha total - nem servidor de emergência funcionou: {e2}")
            sys.exit(1)

if __name__ == "__main__":
    main()